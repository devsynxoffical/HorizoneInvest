const { adjustWalletBalance } = require("./walletService");
const { getOrCreateWallet } = require("./walletService");

const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function getCompletedDays(startDate, durationDays) {
  const duration = Math.max(1, toNumber(durationDays, 1));
  const elapsed = Math.max(0, Date.now() - new Date(startDate).getTime());
  const completed = Math.floor(elapsed / DAY_MS);
  return Math.max(0, Math.min(duration, completed));
}

async function creditPendingDailyProfits(db, userId, trx = null) {
  const q = trx || db;
  const investments = await q("investments")
    .join("investment_plans", "investments.plan_id", "investment_plans.id")
    .select(
      "investments.id",
      "investments.user_id as userId",
      "investments.amount",
      "investments.expected_return as expectedReturn",
      "investments.start_date as startDate",
      "investments.claimed_earning as claimedEarning",
      "investment_plans.duration_days as durationDays",
      "investment_plans.daily_return_percent as dailyReturnPercent",
      "investment_plans.total_return_percent as totalReturnPercent",
      "investment_plans.name as planName",
    )
    .where("investments.status", "active")
    .andWhere("investments.user_id", userId);

  if (!investments.length) return { credited: 0, entries: 0 };

  const rows = await q("investment_daily_profits")
    .whereIn(
      "investment_id",
      investments.map((item) => item.id),
    )
    .select("investment_id as investmentId", "day_index as dayIndex", "amount");

  const byInvestment = new Map();
  for (const row of rows) {
    const current = byInvestment.get(row.investmentId) || { paidSum: 0, days: new Set() };
    current.paidSum += toNumber(row.amount);
    current.days.add(Number(row.dayIndex));
    byInvestment.set(row.investmentId, current);
  }

  let totalCredited = 0;
  let totalEntries = 0;

  for (const item of investments) {
    const amount = toNumber(item.amount);
    const expectedReturn = toNumber(item.expectedReturn);
    const durationDays = Math.max(1, toNumber(item.durationDays, 1));
    const dailyPct = toNumber(item.dailyReturnPercent);
    const totalReturnPct = toNumber(item.totalReturnPercent);
    // Match advertised daily %: profit = principal × (daily% / 100) × duration (same as daily% × duration = total% when admin keeps them aligned).
    let totalProfit = 0;
    if (dailyPct > 0) {
      totalProfit = Number((amount * (dailyPct / 100) * durationDays).toFixed(4));
    } else if (totalReturnPct > 0) {
      totalProfit = Number((amount * (totalReturnPct / 100)).toFixed(4));
    } else {
      totalProfit = Math.max(0, Number((expectedReturn - amount).toFixed(4)));
    }
    const completedDays = getCompletedDays(item.startDate, durationDays);
    if (completedDays <= 0 || totalProfit <= 0) continue;

    const meta = byInvestment.get(item.id) || { paidSum: 0, days: new Set() };
    let paidSum = toNumber(meta.paidSum);
    let insertedCount = 0;
    let insertedAmount = 0;
    const baseDaily =
      dailyPct > 0
        ? Number((amount * (dailyPct / 100)).toFixed(4))
        : Number((totalProfit / durationDays).toFixed(4));

    for (let dayIndex = 1; dayIndex <= completedDays; dayIndex += 1) {
      if (meta.days.has(dayIndex)) continue;
      const remainingProfit = Math.max(0, Number((totalProfit - paidSum).toFixed(4)));
      if (remainingProfit <= 0) break;
      const creditAmount = dayIndex === durationDays ? remainingProfit : Math.min(remainingProfit, baseDaily);
      if (creditAmount <= 0) continue;

      const reference = `INV-DP-${item.id}-${dayIndex}`;
      await q("investment_daily_profits").insert({
        investment_id: item.id,
        user_id: item.userId,
        day_index: dayIndex,
        amount: creditAmount,
        reference,
      });
      await adjustWalletBalance(
        db,
        {
          userId: item.userId,
          delta: creditAmount,
          reason: "investment_daily_profit",
          reference,
        },
        q,
      );
      await q("transactions").insert({
        user_id: item.userId,
        type: "earning",
        amount: creditAmount,
        status: "completed",
        method: `${item.planName} daily profit`,
        reference,
      });

      paidSum = Number((paidSum + creditAmount).toFixed(4));
      insertedCount += 1;
      insertedAmount = Number((insertedAmount + creditAmount).toFixed(4));
      totalEntries += 1;
      totalCredited = Number((totalCredited + creditAmount).toFixed(4));
    }

    if (insertedCount > 0) {
      await q("investments")
        .where({ id: item.id })
        .update({ claimed_earning: paidSum, updated_at: q.fn.now() });
      await q("notifications").insert({
        user_id: item.userId,
        title: "Daily investment profit added",
        message: `${insertedCount} day(s) profit totaling $${insertedAmount.toFixed(4)} added from ${item.planName}.`,
      });
    }
  }

  return { credited: totalCredited, entries: totalEntries };
}

async function creditPendingDailyProfitsForAllUsers(db) {
  const rows = await db("investments")
    .where("status", "active")
    .distinct("user_id as userId");
  let totalUsers = 0;
  let totalCredited = 0;
  let totalEntries = 0;
  for (const row of rows) {
    const userId = Number(row.userId);
    if (!userId) continue;
    const result = await creditPendingDailyProfits(db, userId);
    totalUsers += 1;
    totalCredited = Number((totalCredited + Number(result.credited || 0)).toFixed(4));
    totalEntries += Number(result.entries || 0);
  }
  return { usersProcessed: totalUsers, credited: totalCredited, entries: totalEntries };
}

async function settleMaturedPrincipalsForAllUsers(db) {
  const matured = await db("investments")
    .join("investment_plans", "investments.plan_id", "investment_plans.id")
    .where("investments.status", "active")
    .whereRaw("TIMESTAMPDIFF(DAY, investments.start_date, NOW()) >= investment_plans.duration_days")
    .select(
      "investments.id",
      "investments.user_id as userId",
      "investments.amount",
      "investment_plans.name as planName",
    );
  let settledCount = 0;
  const userIds = [...new Set(matured.map((row) => Number(row.userId)).filter(Boolean))];
  let firstByUser = new Map();
  if (userIds.length) {
    const firstRows = await db("investments")
      .select("user_id as userId", db.raw("MIN(id) as firstInvestmentId"))
      .whereIn("user_id", userIds)
      .groupBy("user_id");
    firstByUser = new Map(firstRows.map((r) => [Number(r.userId), Number(r.firstInvestmentId)]));
  }
  for (const item of matured) {
    await db.transaction(async (trx) => {
      const fresh = await trx("investments").where({ id: item.id }).forUpdate().first();
      if (!fresh || fresh.status !== "active") return;
      const principal = Number(fresh.amount || 0);
      const firstInvId = firstByUser.get(Number(fresh.user_id));
      const skipPrincipalReturn = firstInvId === Number(fresh.id);

      if (!skipPrincipalReturn) {
        const reference = `INV-AUTO-CLM-${fresh.id}-${Date.now()}`;
        await adjustWalletBalance(
          db,
          {
            userId: fresh.user_id,
            delta: principal,
            reason: "investment_principal_return",
            reference,
          },
          trx,
        );
        const wallet = await getOrCreateWallet(db, fresh.user_id, trx);
        const lockedRow = await trx("wallets").where({ id: wallet.id }).forUpdate().first();
        await trx("wallets")
          .where({ id: wallet.id })
          .update({
            locked_balance: Number((Number(lockedRow.locked_balance || 0) + principal).toFixed(2)),
            updated_at: trx.fn.now(),
          });
      }

      await trx("investments")
        .where({ id: fresh.id })
        .update({ status: "completed", end_date: trx.fn.now(), updated_at: trx.fn.now() });
      await trx("notifications").insert({
        user_id: fresh.user_id,
        title: "Investment completed",
        message: skipPrincipalReturn
          ? `${item.planName} term completed. Initial principal stays in the program and is not returned to your wallet.`
          : `Principal $${principal.toFixed(2)} from ${item.planName} returned automatically and locked for reinvestment.`,
      });
    });
    settledCount += 1;
  }
  return { settledCount };
}

module.exports = { creditPendingDailyProfits, creditPendingDailyProfitsForAllUsers, settleMaturedPrincipalsForAllUsers };
