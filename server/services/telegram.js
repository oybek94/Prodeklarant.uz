/** Oddiy Telegram xabari (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID server/.env'dan). Xato tashlamaydi — true/false qaytaradi. */
const config = require('../config');

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(text) {
  const token = config.TELEGRAM_BOT_TOKEN;
  const chatId = config.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (err) {
    console.error('[telegram] yuborilmadi', err && err.message);
    return false;
  }
}

module.exports = { sendTelegram, escapeHtml };
