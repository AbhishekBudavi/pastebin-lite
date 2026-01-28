const crypto = require('crypto');

function generatePasteId() {
  return crypto
    .randomBytes(6)
    .toString('base64')
    .replace(/[+/=]/g, (c) => {
      const map = { '+': '_', '/': '-', '=': '' };
      return map[c] || c;
    })
    .substring(0, 10);
}

function parseTTL(ttlSeconds) {
  if (!ttlSeconds) return null;
  const seconds = parseInt(ttlSeconds, 10);
  if (isNaN(seconds) || seconds <= 0) return null;
  return seconds;
}

function parseViewLimit(limit) {
  if (!limit) return null;
  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

function calculateExpiryTime(ttlSeconds, testNowTime = null) {
  if (!ttlSeconds) return null;
  const now = testNowTime ? new Date(testNowTime) : new Date();
  const expiryTime = new Date(now.getTime() + ttlSeconds * 1000);
  return expiryTime;
}

function validateContent(content) {
  return content && typeof content === 'string' && content.trim().length > 0;
}

module.exports = {
  generatePasteId,
  parseTTL,
  parseViewLimit,
  calculateExpiryTime,
  validateContent,
};
