const express = require('express');
const authMiddleware = require('../middleware/auth');
const { leadsLimiter } = require('../middleware/rateLimit');
const leads = require('../services/leads');
const { validateLead, STATUSES } = require('../services/leadValidation');
const { notifyTelegram } = require('../services/leadNotify');

const router = express.Router();

// Honeypot maydoni: odam ko'rmaydi (CSS bilan yashirin), botlar esa to'ldiradi.
const HONEYPOT_FIELD = 'website';

// POST /api/leads — ommaviy (rate-limit + honeypot)
router.post('/', leadsLimiter, async (req, res) => {
  const body = req.body || {};

  if (String(body[HONEYPOT_FIELD] || '').trim()) {
    // Botga muvaffaqiyat ko'rsatamiz, lekin hech narsa saqlamaymiz
    return res.status(201).json({ ok: true });
  }

  const result = validateLead(body);
  if (!result.ok) {
    return res.status(400).json({ error: 'validation', fields: result.errors });
  }

  let id;
  try {
    id = leads.createLead(result.value);
  } catch (err) {
    console.error('[leads] DB xatosi', err);
    return res.status(500).json({ error: 'server' });
  }

  // Ariza DB'da saqlandi — Telegram ishlamasa ham foydalanuvchiga muvaffaqiyat qaytaramiz
  if (await notifyTelegram(id, result.value)) {
    leads.markTelegramSent(id);
  }
  res.status(201).json({ ok: true, id });
});

// GET /api/leads — admin ro'yxati
router.get('/', authMiddleware, (req, res) => {
  try {
    res.json(leads.listLeads({ page: req.query.page, limit: req.query.limit, status: req.query.status }));
  } catch (err) {
    console.error('[leads] ro\'yxat xatosi', err);
    res.status(500).json({ error: 'server' });
  }
});

// PATCH /api/leads/:id — admin: holatni o'zgartirish (new / contacted / closed)
router.patch('/:id', authMiddleware, (req, res) => {
  const status = req.body && req.body.status;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: 'validation', fields: { status: 'invalid' } });
  }
  if (!leads.updateLeadStatus(req.params.id, status)) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.json({ ok: true });
});

module.exports = router;
