const knex = require("knex");
const env = require("../config/env");
const knexConfig = require("../../knexfile");

const nodeEnv = env.nodeEnv || "development";
const config = knexConfig[nodeEnv] || knexConfig.development;

const timezone = env.mysqlTimezone || "+05:00";

const db = knex({
  ...config,
  pool: {
    ...(config.pool || {}),
    afterCreate(connection, done) {
      connection.query(`SET time_zone = '${timezone.replace(/'/g, "''")}'`, (error) => {
        if (error) {
          // eslint-disable-next-line no-console
          console.warn(`[DB] Failed to set time_zone=${timezone}:`, error.message);
          env.mysqlSessionTimezoneConfigured = false;
        } else {
          env.mysqlSessionTimezoneConfigured = true;
        }
        // Never fail pool creation if timezone set fails — fall back to DATE_ADD offset logic.
        done(null, connection);
      });
    },
  },
});

module.exports = db;
