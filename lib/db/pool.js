import { sql } from '@vercel/postgres';

// Global cache for local development - persists across requests
let globalCache = {
  pastes: []
};

// Make it truly global by attaching to globalThis
if (typeof globalThis !== 'undefined') {
  if (!globalThis.__pastebin_cache) {
    globalThis.__pastebin_cache = { pastes: [] };
  }
}

function getCache() {
  if (typeof globalThis !== 'undefined' && globalThis.__pastebin_cache) {
    return globalThis.__pastebin_cache;
  }
  return globalCache;
}

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
    const cache = getCache();
    const upperQuery = queryString.toUpperCase();
    
    console.log('📦 Local DB Query:', { 
      type: upperQuery.includes('INSERT') ? 'INSERT' : upperQuery.includes('SELECT') ? 'SELECT' : upperQuery.includes('UPDATE') ? 'UPDATE' : 'OTHER',
      params, 
      pastesStored: cache.pastes.length 
    });
    
    if (upperQuery.includes('INSERT')) {
      return handleInsert(params, cache);
    } else if (upperQuery.includes('SELECT')) {
      return handleSelect(queryString, params, cache);
    } else if (upperQuery.includes('UPDATE')) {
      return handleUpdate(queryString, params, cache);
    } else if (upperQuery.includes('DELETE')) {
      return handleDelete(params, cache);
    } else if (upperQuery.includes('CREATE')) {
      return { rows: [], rowCount: 0 };
    }
    
    return { rows: [], rowCount: 0 };
  } catch (err) {
    console.error('Local database error:', err);
    throw err;
  }
}

function handleInsert(params, cache) {
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
  
  cache.pastes.push(paste);
  console.log('✅ Paste created:', { id, pastesNow: cache.pastes.length });
  
  return { rows: [{ id }], rowCount: 1 };
}

function handleSelect(queryString, params, cache) {
  let idParam = null;
  
  if (params && params.length > 0) {
    idParam = params[0];
  } else {
    const match = queryString.match(/WHERE\s+id\s*=\s*'?([^';\s]+)'?/i);
    if (match) {
      idParam = match[1];
    }
  }
  
  if (!idParam) {
    console.log('❌ No ID found in query');
    return { rows: [], rowCount: 0 };
  }
  
  console.log('🔍 Looking for paste ID:', idParam, 'in', cache.pastes.map(p => p.id));
  
  const paste = cache.pastes.find(p => p.id === idParam);
  
  if (paste) {
    // Check if expired
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      console.log('⏰ Paste expired');
      return { rows: [], rowCount: 0 };
    }
    
    // Check if views exceeded
    if (paste.views_remaining !== null && paste.views_remaining <= 0) {
      console.log('👁️ Views exceeded');
      return { rows: [], rowCount: 0 };
    }
    
    console.log('✅ Paste found:', idParam);
    return { rows: [paste], rowCount: 1 };
  }
  
  console.log('❌ Paste not found:', idParam);
  return { rows: [], rowCount: 0 };
}

function handleUpdate(queryString, params, cache) {
  const idParam = params[0];
  const paste = cache.pastes.find(p => p.id === idParam);
  
  if (paste && queryString.includes('views_remaining')) {
    paste.views_remaining -= 1;
    console.log('✅ Views decremented:', idParam, 'remaining:', paste.views_remaining);
    return { rows: [paste], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

function handleDelete(params, cache) {
  const idParam = params[0];
  const index = cache.pastes.findIndex(p => p.id === idParam);
  
  if (index !== -1) {
    cache.pastes.splice(index, 1);
    console.log('✅ Paste deleted:', idParam);
    return { rows: [], rowCount: 1 };
  }
  
  return { rows: [], rowCount: 0 };
}

export async function queryWithTransaction(callback) {
  try {
    const mockClient = {
      query: async (queryString, params = []) => {
        return await query(queryString, params);
      },
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
