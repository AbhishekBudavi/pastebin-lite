import { sql } from '@vercel/postgres';

export async function query(queryString, params = []) {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  
  try {
    let result;
    if (params.length > 0) {
      result = await sql.unsafe(queryString, params);
    } else {
      result = await sql(queryString);
    }
    return { rows: result.rows, rowCount: result.rows.length };
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export async function queryWithTransaction(callback) {
  // @vercel/postgres doesn't support transactions in serverless
  // Just execute the callback without transaction wrapping
  try {
    return await callback({
      query: (queryString, params) => query(queryString, params),
    });
  } catch (err) {
    console.error('Transaction error:', err);
    throw err;
  }
}

export async function closePool() {
  // @vercel/postgres handles connections automatically
  // No manual closing needed
}

export default { query, queryWithTransaction, closePool };
