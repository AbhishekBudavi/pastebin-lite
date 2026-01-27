import { neon } from '@vercel/postgres';

export async function query(queryString, params = []) {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }
  
  try {
    const sql = neon(process.env.POSTGRES_URL);
    
    // Use parameterized query
    const result = await sql(queryString, params);
    
    return { rows: result || [], rowCount: result ? result.length : 0 };
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

export async function queryWithTransaction(callback) {
  try {
    // Create a mock client for transaction callback
    const mockClient = {
      query: (queryString, params) => query(queryString, params),
    };
    
    return await callback(mockClient);
  } catch (err) {
    console.error('Transaction error:', err);
    throw err;
  }
}

export async function closePool() {
  // neon handles connections automatically
  // No manual closing needed
}

export default { query, queryWithTransaction, closePool };
