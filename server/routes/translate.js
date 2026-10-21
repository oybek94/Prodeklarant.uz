const express = require('express');
const authMiddleware = require('../middleware/auth');
const { translateLimiter } = require('../middleware/rateLimit');
const { translateFields } = require('../services/translate');
const router = express.Router();

router.post('/', translateLimiter, authMiddleware, async (req, res) => {
  try {
    const { sourceLang, title, excerpt, body, category } = req.body;
    res.json(await translateFields({ sourceLang, title, excerpt, body, category }));
  } catch (err) {
    console.error('Translate error:', err);
    res.status(err.status || 500).json({ error: err?.message || 'Tarjima xatosi' });
  }
});

module.exports = router;
