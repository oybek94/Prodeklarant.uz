const express = require('express');
const { contactLimiter } = require('../middleware/rateLimit');
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = require('../config');
const router = express.Router();

// Token endi FAQAT serverda (server/.env) — client bundle'ga tushmaydi.
const BOT_TOKEN = TELEGRAM_BOT_TOKEN;
const CHAT_ID = TELEGRAM_CHAT_ID;

// HTML parse_mode uchun foydalanuvchi kiritmasini xavfsizlash (injection/buzilishni oldini olish)
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

router.post('/', contactLimiter, async (req, res) => {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Contact: TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan');
      return res.status(500).json({ error: 'Server sozlanmagan. Keyinroq urinib koring.' });
    }

    let { name, phone, message } = req.body || {};
    name = String(name || '').trim();
    phone = String(phone || '').trim();
    message = String(message || '').trim();

    if (!name || !phone) {
      return res.status(400).json({ error: 'Ism va telefon majburiy.' });
    }
    if (name.length > 100 || phone.length > 40 || message.length > 2000) {
      return res.status(400).json({ error: 'Maydon(lar) juda uzun.' });
    }

    const text =
      `\u{1F4EC} <b>SAYTDAN YANGI XABAR</b>\n\n` +
      `\u{1F464} <b>Ism:</b> ${escapeHtml(name)}\n` +
      `\u{1F4DE} <b>Tel:</b> ${escapeHtml(phone)}\n` +
      `\u{1F4DD} <b>Xabar:</b> ${escapeHtml(message) || '—'}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });

    if (!tgRes.ok) {
      const errText = await tgRes.text().catch(() => '');
      console.error('Contact: Telegram xatosi', tgRes.status, errText);
      return res.status(502).json({ error: 'Xabar yuborilmadi. Keyinroq urinib koring.' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Contact: server xatosi', err);
    res.status(500).json({ error: 'Server xatosi. Keyinroq urinib koring.' });
  }
});

module.exports = router;
