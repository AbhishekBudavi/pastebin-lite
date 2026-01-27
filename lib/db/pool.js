import { sql } from '@vercel/postgres';

// In-memory database for local development
const inMemoryDb = new Map();
let tableData = {
  pastes: []
};

const isLocalDev = () => {
  return process.env.POSTGRES_URL?.includes('localhost') || !process.env.POSTGRES_URL;
};

export async function query(queryString, params = []) {
  // For local development without a real database
  if (isLocalDev()) {
    return await queryLocal(queryString, params);
  }
  
  // For Vercel/production - use actual PostgreSQL
  try {
    // Execute query using sql template literal with interpolated values
    let finalQuery = queryString;
    let paramsCopy = [...params];
    
    // Replace $1, $2, $3... with actual values
    paramsCopy.forEach((param, index) => {
      const placeholder = `$${index + 1}`;
      let value;
      
      if (param === null) {
        value = 'NULL';
      } else if (typeof param === 'string') {
        value = `'${param.replace(/'/g, "''")}'`;
      } else if (typeof param === 'boolean') {
        value = param ? 'true' : 'false';
      } else {
        value = String(param);
      }
      
      finalQuery = finalQuery.replace(placeholder, value);
    });
    
    // Execute the interpolated query
    const result = await sql(finalQuery);
    
    return { rows: result.rows || [], rowCount: result.rows ? result.rows.length : 0 };
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

// Simple in-memory database for local development
async function queryLocal(queryString, params = []) {
  try {
    // Parse and execute simple SQL queries
    const upperQuery = queryString.toUpperCase();
    
    if (upperQuery.includes('INSERT')) {
      return handleInsert(queryString, params);
    } else if (upperQuery.includes('SELECT')) {
      return handleSelect(queryString, params);
    } else if (upperQuery.includes('UPDATE')) {
      return handleUpdate(queryString, params);
    } else if (upperQuery.includes('DELETE')) {
      return handleDelete(queryString, params);
    } else if (upperQuery.includes('CREATE')) {
      // For local dev, just acknowledge table creation
      return { rows: [], rowCount: 0 };
    }
    
    return { rows: [], rowCount: 0 };
  } catch (err) {
    console.error('Local database error:', err);
    throw err;
  }
}

function handleInsert(query, params) {
  const matches = query.match(/INSERT INTO (\w+)/i);
  const table = matches ? matches[1] : 'pastes';
  
  if (table === 'pastes') {
    const id = params[0];
    const content = params[1];
    const expiresAt = params[2];
    const viewLimit = params[3];
    const viewsRemaining = params[4];
    
    const paste = {
      id,
      content,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      view_limit: viewLimit,
      views_remaining: viewsRemaining
    };
    
    tableData.pastes.push(paste);
    return { rows: [{ id }], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleSelect(query, params) {
  const idParam = params[0];
  
  const paste = tableData.pastes.find(p => p.id === idParam);
  
  if (paste) {
    return { rows: [paste], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleUpdate(query, params) {
  const idParam = params[0];
  const paste = tableData.pastes.find(p => p.id === idParam);
  
  if (paste && query.includes('views_remaining')) {
    paste.views_remaining -= 1;
    return { rows: [paste], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleDelete(query, params) {
  const idParam = params[0];
  const index = tableData.pastes.findIndex(p => p.id === idParam);
  
  if (index !== -1) {
    tableData.pastes.splice(index, 1);
    return { rows: [], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

export async function queryWithTransaction(callback) {
  try {
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
  // sql handles connections automatically
}

export default { query, queryWithTransaction, closePool };
