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

/**
 * POST /api/paste
 * Create a new paste
 *
 * Body:
 *   content (string, required): The paste content
 *   ttl (number, optional): Time to live in seconds
 *   view_limit (number, optional): Maximum number of views allowed
 *
 * Response:
 *   {
 *     id: string,
 *     url: string
 *   }
 */
router.post('/paste', async (req, res, next) => {
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
});

/**
 * GET /api/paste/preview/:id
 * Preview paste WITHOUT decrementing views
 * 
 * Used for UI rendering and page reloads
 * Does NOT mutate state
 * 
 * Response:
 *   {
 *     id: string,
 *     content: string,
 *     remaining_views: number | null,
 *     expires_at: timestamp | null
 *   }
 *
 * Returns 404 if:
 *   - Paste doesn't exist
 *   - Paste has expired
 *   - View limit exhausted (but doesn't decrement)
 */
router.get('/paste/preview/:id', async (req, res, next) => {
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
});

/**
 * GET /api/paste/:id
 * CONSUME a paste view (decrements view count)
 * 
 * Use /api/paste/preview/:id for read-only access
 * Use this endpoint only when explicitly consuming a view
 *
 * Headers (optional):
 *   x-test-now: ISO timestamp for testing time-based features
 *
 * Response:
 *   {
 *     id: string,
 *     content: string,
 *     remaining_views: number | null,
 *     expires_at: timestamp | null
 *   }
 *
 * Returns 404 if:
 *   - Paste doesn't exist
 *   - Paste has expired
 *   - View limit exhausted
 *
 * IMPORTANT: This endpoint MUTATES state (decrements views)
 * For UI rendering/reloads, use /api/paste/preview/:id instead
 *   - Paste doesn't exist
 *   - Paste has expired
 *   - View limit exhausted
 *
 * IMPORTANT: View count decrements ONLY once per actual user view
 * Multiple requests from same browser session should NOT decrement
 * (Frontend handles session tracking via sessionStorage)
 */
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
