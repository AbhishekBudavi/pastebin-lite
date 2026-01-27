const {
  generatePasteId,
  parseTTL,
  parseViewLimit,
  calculateExpiryTime,
  validateContent,
} = require('../utils/helpers');

const {
  createPaste,
  getPaste,
  decrementViews,
} = require('../db/operations');


const createPasteHandler = async (req, res, next) => {
  try {
    const { content, ttl, view_limit } = req.body;

    // Validate content
    if (!validateContent(content)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Content is required and cannot be empty',
      });
    }

    // Parse optional parameters
    const ttlSeconds = parseTTL(ttl);
    const viewLimit = parseViewLimit(view_limit);

    // Generate unique paste ID
    const pasteId = generatePasteId();

    // Calculate expiry time
    const expiresAt = calculateExpiryTime(ttlSeconds, req.testNow);

    // Create paste in database
    const result = await createPaste(pasteId, content, expiresAt, viewLimit);

    // Return response with shareable URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const pasteUrl = `${baseUrl}/paste/${result.id}`;

    res.status(201).json({
      id: result.id,
      url: pasteUrl,
    });
  } catch (err) {
    next(err);
  }
};


const getPastePreviewHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch paste from database (read-only)
    const paste = await getPaste(id, req.testNow);

    if (!paste) {
      return res.status(404).json({
        error: 'Not found',
        message: 'The requested paste does not exist or has expired',
      });
    }

    // Return paste WITHOUT decrementing views
    res.json({
      id: paste.id,
      content: paste.content,
      remaining_views: paste.views_remaining,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get paste and decrement view count
 * GET /api/paste/:id
 */
const getPasteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch paste from database
    const paste = await getPaste(id, req.testNow);

    if (!paste) {
      return res.status(404).json({
        error: 'Not found',
        message: 'The requested paste does not exist or has expired',
      });
    }

    // Decrement views if there's a view limit
    if (paste.views_remaining !== null) {
      const decremented = await decrementViews(id);

      if (!decremented) {
        return res.status(404).json({
          error: 'Not found',
          message: 'The requested paste does not exist or has expired',
        });
      }

      // Fetch updated paste to get new remaining views count
      const updatedPaste = await getPaste(id, req.testNow);
      if (updatedPaste) {
        paste.views_remaining = updatedPaste.views_remaining;
      }
    }

    res.json({
      id: paste.id,
      content: paste.content,
      remaining_views: paste.views_remaining,
      expires_at: paste.expires_at,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Health check endpoint
 * GET /api/health
 */
const healthCheckHandler = async (req, res, next) => {
  try {
    const { query } = require('../db/pool');
    const result = await query('SELECT 1 as status');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPasteHandler,
  getPastePreviewHandler,
  getPasteHandler,
  healthCheckHandler,
};
