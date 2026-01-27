const { query, queryWithTransaction } = require('./pool');

/**
 * Create a new paste in the database
 * Returns the paste ID
 */
async function createPaste(pasteId, content, expiresAt, viewLimit) {
  const result = await query(
    `INSERT INTO pastes (id, content, expires_at, view_limit, views_remaining)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [pasteId, content, expiresAt, viewLimit, viewLimit]
  );
  return result.rows[0];
}

/**
 * Get a paste by ID
 * Returns null if not found or expired
 */
async function getPaste(pasteId, testNowTime = null) {
  // Support deterministic time for testing
  const now = testNowTime ? new Date(testNowTime) : new Date();

  const result = await query(
    `SELECT id, content, expires_at, view_limit, views_remaining, created_at
     FROM pastes
     WHERE id = $1`,
    [pasteId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const paste = result.rows[0];

  // Check if expired
  if (paste.expires_at && new Date(paste.expires_at) < now) {
    return null;
  }

  // Check if views exhausted
  if (paste.views_remaining !== null && paste.views_remaining <= 0) {
    return null;
  }

  return paste;
}

/**
 * Decrement the views_remaining counter safely
 * Uses atomic transaction to prevent race conditions
 * Returns true if successful, false if views already exhausted
 */
async function decrementViews(pasteId) {
  return await queryWithTransaction(async (client) => {
    // Lock row for update to prevent race conditions
    const selectResult = await client.query(
      `SELECT views_remaining FROM pastes WHERE id = $1 FOR UPDATE`,
      [pasteId]
    );

    if (selectResult.rows.length === 0) {
      return false;
    }

    const currentViews = selectResult.rows[0].views_remaining;

    // If view_limit is null (unlimited), don't decrement
    if (currentViews === null) {
      return true;
    }

    // If already exhausted, return false
    if (currentViews <= 0) {
      return false;
    }

    // Decrement safely
    await client.query(
      `UPDATE pastes SET views_remaining = views_remaining - 1 WHERE id = $1`,
      [pasteId]
    );

    return true;
  });
}

/**
 * Delete a paste by ID
 */
async function deletePaste(pasteId) {
  const result = await query(`DELETE FROM pastes WHERE id = $1`, [pasteId]);
  return result.rowCount > 0;
}

/**
 * Get all pastes (for testing)
 */
async function getAllPastes() {
  const result = await query(`SELECT * FROM pastes ORDER BY created_at DESC`);
  return result.rows;
}

module.exports = {
  createPaste,
  getPaste,
  decrementViews,
  deletePaste,
  getAllPastes,
};
