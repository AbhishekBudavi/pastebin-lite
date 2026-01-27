const { query } = require('./pool');

/**
 * Initialize database schema
 * Called on application startup
 */
async function initializeSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS pastes (
      id VARCHAR(10) PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      view_limit INTEGER,
      views_remaining INTEGER
    )`,
    
    `CREATE INDEX IF NOT EXISTS idx_created_at ON pastes(created_at)`,
    
    `CREATE INDEX IF NOT EXISTS idx_expires_at ON pastes(expires_at)`,
    
    `CREATE TABLE IF NOT EXISTS paste_views (
      id SERIAL PRIMARY KEY,
      paste_id VARCHAR(10) NOT NULL REFERENCES pastes(id) ON DELETE CASCADE,
      viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const stmt of statements) {
    try {
      await query(stmt);
    } catch (err) {
      // Ignore "already exists" errors
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }
  }
}

/**
 * Reset database (WARNING: Deletes all data)
 */
async function resetDatabase() {
  const resetSQL = `
    DROP TABLE IF EXISTS paste_views;
    DROP TABLE IF EXISTS pastes;
  `;

  const statements = resetSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    await query(stmt);
  }

  // Reinitialize schema
  await initializeSchema();
}

module.exports = {
  initializeSchema,
  resetDatabase
};
