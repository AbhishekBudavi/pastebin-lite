import express from 'express';
import {
  generatePasteId,
  parseTTL,
  parseViewLimit,
  calculateExpiryTime,
  validateContent,
} from '../utils/helpers.js';
import {
  createPaste,
  getPaste,
  decrementViews,
} from '../db/operations.js';

const router = express.Router();

router.post('/paste', async (req, res, next) => {
  try {
    const { content, ttl, view_limit } = req.body;
    if (!validateContent(content)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Content is required and cannot be empty',
      });
    }


    const ttlSeconds = parseTTL(ttl);
    const viewLimit = parseViewLimit(view_limit);

    const pasteId = generatePasteId();

    const expiresAt = calculateExpiryTime(ttlSeconds, req.testNow);

    const result = await createPaste(pasteId, content, expiresAt, viewLimit);
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const pasteUrl = `${baseUrl}/paste/${result.id}`;

    res.status(201).json({
      id: result.id,
      url: pasteUrl,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/paste/preview/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const paste = await getPaste(id, req.testNow);

    if (!paste) {
      return res.status(404).json({
        error: 'Not found',
        message: 'The requested paste does not exist or has expired',
      });
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
});

router.get('/paste/:id', async (req, res, next) => {
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
});

/**
 * GET /api/health
 * Health check endpoint
 * Confirms database connectivity
 */
router.get('/health', async (req, res, next) => {
  try {
    const result = await import('../db/pool.js').then(m => 
      m.query('SELECT 1 as status')
    );

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
    });
  }
});

export default router;
