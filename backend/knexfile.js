require("dotenv").config();

const shared = {
  client: "mysql2",
  migrations: {
    directory: "./src/db/migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
  pool: {
    min: 0,
    max: 10,
  },
};

module.exports = {
  development: {
    ...shared,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  },
  production: {
    ...shared,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  },
  test: {
    ...shared,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_TEST_NAME || process.env.DB_NAME,
    },
  },
};
