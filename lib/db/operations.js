import { query, queryWithTransaction } from './pool';

export async function createPaste(pasteId, content, expiresAt, viewLimit) {
  const result = await query(
    `INSERT INTO pastes (id, content, expires_at, view_limit, views_remaining)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [pasteId, content, expiresAt, viewLimit, viewLimit]
  );
  return result.rows[0];
}

export async function getPaste(pasteId, testNowTime = null) {
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

  if (paste.expires_at && new Date(paste.expires_at) < now) {
    return null;
  }

  if (paste.views_remaining !== null && paste.views_remaining <= 0) {
    return null;
  }

  return paste;
}

export async function decrementViews(pasteId) {
  return await queryWithTransaction(async (client) => {
    const selectResult = await client.query(
      `SELECT views_remaining FROM pastes WHERE id = $1 FOR UPDATE`,
      [pasteId]
    );

    if (selectResult.rows.length === 0) {
      return false;
    }

    const currentViews = selectResult.rows[0].views_remaining;

    if (currentViews === null) {
      return true;
    }

    if (currentViews <= 0) {
      return false;
    }

    await client.query(
      `UPDATE pastes SET views_remaining = views_remaining - 1 WHERE id = $1`,
      [pasteId]
    );

    return true;
  });
}

export async function deletePaste(pasteId) {
  const result = await query(`DELETE FROM pastes WHERE id = $1`, [pasteId]);
  return result.rowCount > 0;
}

export async function getAllPastes() {
  const result = await query(`SELECT * FROM pastes ORDER BY created_at DESC`);
  return result.rows;
}

export default {
  createPaste,
  getPaste,
  decrementViews,
  deletePaste,
  getAllPastes,
};
