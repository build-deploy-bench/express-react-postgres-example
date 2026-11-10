// Environment variables are strings, while Sequelize expects false or a function.
const sqlLogging = (value) => value === "true" ? console.log : false;

/** @type {import('sequelize').Options} */
module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: process.env.DEV_DB_PASSWORD,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    dialect: process.env.DEV_DB_DIALECT,
    logging: sqlLogging(process.env.DEV_DB_LOGGING),
  },
  test: {
    username: process.env.TEST_DB_USERNAME,
    password: process.env.TEST_DB_PASSWORD,
    database: process.env.TEST_DB_NAME,
    host: process.env.TEST_DB_HOSTNAME,
    dialect: process.env.TEST_DB_DIALECT,
    logging: sqlLogging(process.env.TEST_DB_LOGGING),
  },
  production: {
    // Providers that give one connection string (Vercel with Neon, Fly Managed Postgres) set PROD_DB_URL.
    // It overrides the PROD_DB_* parts. sequelize-cli reads the same key.
    use_env_variable: process.env.PROD_DB_URL ? "PROD_DB_URL" : undefined,
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: process.env.PROD_DB_DIALECT,
    logging: sqlLogging(process.env.PROD_DB_LOGGING),
    // For a host that needs TLS when its URL has no sslmode parameter.
    dialectOptions:
      process.env.PROD_DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {},
  },
};
