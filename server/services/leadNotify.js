/**
 * Yangi ariza haqida Telegram xabari. Token va chat ID faqat server/.env'dan:
 * TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID. Test: server/test/leads.test.js (fetch stub).
 */
const config = require('../config');
const UZ = require('../../src/i18n/locales/uz.json');

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatPhone(p) {
  const m = String(p).match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : p;
}

/** Telegram HTML xabari (foydalanuvchi kiritmasi escape qilinadi). */
function telegramText(id, v) {
  const productLabel = (UZ.leadForm && UZ.leadForm.products && UZ.leadForm.products[v.product]) || v.product;
  const tariffLabel = v.tariff ? (UZ.home.tariffs[v.tariff] && UZ.home.tariffs[v.tariff].name) || v.tariff : null;
  const lines = [
    `\u{1F195} <b>YANGI ARIZA #${id}</b> (sayt)`,
    '',
    `\u{1F464} <b>Ism:</b> ${escapeHtml(v.name)}`,
    `\u{1F4DE} <b>Tel:</b> ${escapeHtml(formatPhone(v.phone))}`,
    `\u{1F4E6} <b>Mahsulot:</b> ${escapeHtml(productLabel)}`,
  ];
  if (v.country) lines.push(`\u{1F30D} <b>Davlat:</b> ${escapeHtml(v.country)}`);
  if (tariffLabel) lines.push(`\u{1F4BC} <b>Tarif:</b> ${escapeHtml(tariffLabel)}`);
  if (v.comment) lines.push(`\u{1F4DD} <b>Izoh:</b> ${escapeHtml(v.comment)}`);
  lines.push(`\u{1F517} ${escapeHtml(v.sourcePath || '/')} (${v.locale})`);
  return lines.join('\n');
}

/** Telegram'ga yuboradi. Xato tashlamaydi — yuborildimi (true/false) qaytaradi. */
async function notifyTelegram(id, v) {
  const token = config.TELEGRAM_BOT_TOKEN;
  const chatId = config.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[leads] TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan — ariza faqat DB\'ga yozildi', id);
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: telegramText(id, v), parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error('[leads] Telegram xatosi', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[leads] Telegram so\'rovi bajarilmadi', err && err.message);
    return false;
  }
}

module.exports = { telegramText, notifyTelegram };
