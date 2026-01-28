const express = require('express');
const {
  createPasteHandler,
  getPastePreviewHandler,
  getPasteHandler,
  healthCheckHandler,
} = require('../controllers/pasteController');

const router = express.Router();

router.post('/paste', createPasteHandler);

router.get('/paste/preview/:id', getPastePreviewHandler);

router.get('/paste/:id', getPasteHandler);


router.get('/health', healthCheckHandler);

module.exports = router;
