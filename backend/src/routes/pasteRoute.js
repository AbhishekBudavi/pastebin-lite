const express = require('express');
const {
  createPasteHandler,
  getPastePreviewHandler,
  getPasteHandler,
  healthCheckHandler,
} = require('../controllers/pasteController');

const router = express.Router();

/**
 * Paste routes
 */

// POST /api/paste - Create a new paste
router.post('/paste', createPasteHandler);

// GET /api/paste/preview/:id - Get paste without decrementing views
router.get('/paste/preview/:id', getPastePreviewHandler);

// GET /api/paste/:id - Get paste and decrement views
router.get('/paste/:id', getPasteHandler);

// GET /api/health - Health check
router.get('/health', healthCheckHandler);

module.exports = router;
