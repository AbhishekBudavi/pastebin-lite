import { Pool } from '@vercel/postgres';

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getPool();
  const result = await db.query(sql, params);
  return result;
}

export async function queryWithTransaction(callback) {
  const db = getPool();
  const client = await db.connect();
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

export default { query, queryWithTransaction };
