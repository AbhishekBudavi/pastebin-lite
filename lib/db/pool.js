import { sql } from '@vercel/postgres';

export async function query(queryString, params = []) {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  
  try {
    let result;
    
    // Build the query with parameters injected safely
    if (params.length > 0) {
      // Replace $1, $2, $3... with actual values
      let query = queryString;
      params.forEach((param, index) => {
        const placeholder = `$${index + 1}`;
        // Properly escape string values
        const value = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
        query = query.replace(placeholder, value);
      });
      result = await sql`${sql.raw(query)}`;
    } else {
      result = await sql`${sql.raw(queryString)}`;
    }
    
    return { rows: result.rows || [], rowCount: (result.rows || []).length };
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
