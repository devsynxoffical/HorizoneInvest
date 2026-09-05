/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable("investment_plans", (table) => {
    table.decimal("payout_daily_return_percent", 8, 2).nullable();
  });

  await knex.schema.alterTable("investments", (table) => {
    table.decimal("payout_daily_return_percent", 8, 2).nullable();
  });

  await knex.schema.alterTable("chat_rooms", (table) => {
    table.timestamp("admin_last_read_at").nullable();
  });

  await knex("investment_plans").update({
    payout_daily_return_percent: knex.ref("daily_return_percent"),
  });

  await knex.raw(`
    UPDATE investments i
    INNER JOIN investment_plans p ON p.id = i.plan_id
    SET i.payout_daily_return_percent = COALESCE(p.payout_daily_return_percent, p.daily_return_percent)
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable("chat_rooms", (table) => {
    table.dropColumn("admin_last_read_at");
  });

  await knex.schema.alterTable("investments", (table) => {
    table.dropColumn("payout_daily_return_percent");
  });

  await knex.schema.alterTable("investment_plans", (table) => {
    table.dropColumn("payout_daily_return_percent");
  });
};
