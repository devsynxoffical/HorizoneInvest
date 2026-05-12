const bcrypt = require("bcryptjs");

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function seed(knex) {
  await knex("audit_logs").del();
  await knex("admin_actions").del();
  await knex("chat_messages").del();
  await knex("chat_rooms").del();
  await knex("notifications").del();
  await knex("commissions").del();
  await knex("referral_relations").del();
  await knex("referral_links").del();
  await knex("referral_codes").del();
  await knex("transactions").del();
  await knex("withdrawals").del();
  await knex("deposits").del();
  await knex("investments").del();
  await knex("investment_plans").del();
  await knex("wallet_ledger").del();
  await knex("wallets").del();
  await knex("settings").del();
  await knex("two_factor").del();
  await knex("sessions").del();
  await knex("users").del();
  await knex("roles").del();

  await knex("roles").insert([{ id: 1, name: "user" }, { id: 2, name: "admin" }]);

  const password = await bcrypt.hash("Admin@12345", 10);
  await knex("users").insert([
    {
      id: 1,
      role_id: 2,
      name: "Admin User",
      email: "admin@horizoneinvest.com",
      phone: "+92 300 0000000",
      password_hash: password,
      is_verified: true,
      country: "Pakistan",
    },
  ]);

  await knex("wallets").insert([{ user_id: 1, balance: 0, locked_balance: 0 }]);

  await knex("settings").insert([
    { user_id: 1, email_notifications: true, sms_notifications: false, investment_updates: true, referral_activity: true },
  ]);

  await knex("investment_plans").insert([
    {
      slug: "starter",
      name: "Starter Plan",
      min_amount: 100,
      max_amount: 999,
      duration_days: 30,
      daily_return_percent: 2,
      total_return_percent: 60,
      features: JSON.stringify(["24/7 tracking", "Fast activation", "Basic analytics", "Referral eligible"]),
    },
    {
      slug: "professional",
      name: "Professional Plan",
      min_amount: 1000,
      max_amount: 4999,
      duration_days: 60,
      daily_return_percent: 3,
      total_return_percent: 180,
      features: JSON.stringify(["Priority support", "Weekly reports", "Higher referral bonus"]),
    },
    {
      slug: "elite",
      name: "Elite Plan",
      min_amount: 5000,
      max_amount: null,
      duration_days: 90,
      daily_return_percent: 4,
      total_return_percent: 360,
      features: JSON.stringify(["VIP support", "Premium analytics", "Unlimited allocation"]),
    },
  ]);
};
