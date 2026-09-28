/**
 * Saytdan keladigan arizalar (lead'lar): saqlash va admin ro'yxati.
 * Route: routes/leads.js. Validatsiya: leadValidation.js. Telegram: leadNotify.js.
 */
const db = require('../db');
const { STATUSES } = require('./leadValidation');

function createLead(v) {
  const info = db
    .prepare(
      `INSERT INTO leads (name, phone, product, country, comment, tariff, source_path, locale)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(v.name, v.phone, v.product, v.country, v.comment, v.tariff, v.sourcePath, v.locale);
  return Number(info.lastInsertRowid);
}

function markTelegramSent(id) {
  db.prepare('UPDATE leads SET telegram_sent = 1 WHERE id = ?').run(id);
}

function listLeads({ page = 1, limit = 50, status } = {}) {
  const l = Math.min(100, Math.max(1, Number(limit) || 50));
  const p = Math.max(1, Number(page) || 1);
  const where = STATUSES.includes(status) ? 'WHERE status = ?' : '';
  const args = where ? [status] : [];
  const rows = db
    .prepare(`SELECT * FROM leads ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, l, (p - 1) * l);
  const { count } = db.prepare(`SELECT COUNT(*) AS count FROM leads ${where}`).get(...args);
  return { data: rows, pagination: { total: count, page: p, limit: l, totalPages: Math.ceil(count / l) } };
}

function updateLeadStatus(id, status) {
  if (!STATUSES.includes(status)) return false;
  return db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, Number(id)).changes > 0;
}

module.exports = { createLead, markTelegramSent, listLeads, updateLeadStatus };
