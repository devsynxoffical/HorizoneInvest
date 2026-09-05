/**
 * Re-sync active investments to each plan's payout_daily_return_percent.
 * Fixes rows locked at display rate (e.g. 3.5%) after admin set payout to 1%.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  const hasPlanColumn = await knex.schema.hasColumn("investment_plans", "payout_daily_return_percent");
  const hasInvColumn = await knex.schema.hasColumn("investments", "payout_daily_return_percent");
  if (!hasPlanColumn || !hasInvColumn) return;

  await knex.raw(`
    UPDATE investments i
    INNER JOIN investment_plans p ON p.id = i.plan_id
    SET i.payout_daily_return_percent = p.payout_daily_return_percent
    WHERE i.status = 'active'
      AND p.payout_daily_return_percent IS NOT NULL
      AND p.payout_daily_return_percent > 0
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down() {
  // no-op: cannot restore previous per-investment payout values
};
