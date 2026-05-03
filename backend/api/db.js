const { Pool } = require("pg");

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10_000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
