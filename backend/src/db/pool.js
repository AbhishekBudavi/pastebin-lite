const pg = require('pg');
const path = require('path');

const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pastebin_lite',
  password: process.env.DB_PASS || '0707',
  port: parseInt(process.env.DB_PORT || '5432'),
};

const pool = new pg.Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

async function queryWithTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getConnection() {
  return await pool.connect();
}

async function releaseConnection(client) {
  client.release();
}

async function closePool() {
  await pool.end();
}

module.exports = {
  query,
  queryWithTransaction,
  getConnection,
  releaseConnection,
  closePool,
  pool: pool
};
