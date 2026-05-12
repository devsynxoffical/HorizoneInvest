const knex = require("knex");
const env = require("../config/env");
const knexConfig = require("../../knexfile");

const nodeEnv = env.nodeEnv || "development";
const config = knexConfig[nodeEnv] || knexConfig.development;

const db = knex(config);

module.exports = db;
