#!/usr/bin/env node
/**
 * SI orqali blog QORALAMASI yaratadi (saytda ko'rinmaydi — admin panelda tasdiqlanadi).
 *
 *   cd server && npm run generate:post                 # keyingi mavzu bo'yicha 1 ta qoralama
 *   npm run generate:post -- --dry-run                 # DB'ga yozmaydi, natijani chop etadi
 *   npm run generate:post -- --suggest                 # avval SI'dan yangi mavzular ham so'raydi
 *
 * Kerak: server/.env'da OPENAI_API_KEY (majburiy), PIXABAY_API_KEY (ixtiyoriy), TELEGRAM_* (ixtiyoriy).
 * Jadval (crontab) va sozlash: DEPLOY.md → "SI blog generatori".
 */
const path = require('path');
const config = require('../config');
const db = require('../db');
const { getOpenAI } = require('../services/translate');
const { generateDraft } = require('../services/postGenerator');
const { sendTelegram, escapeHtml } = require('../services/telegram');

const args = new Set(process.argv.slice(2));

async function main() {
  if (!config.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY sozlanmagan (server/.env)');
  const dryRun = args.has('--dry-run');

  const result = await generateDraft({
    db,
    client: getOpenAI(),
    topicsFile: path.join(__dirname, '..', 'data', 'topics.json'),
    topicsSeedFile: path.join(__dirname, '..', 'data', 'topics.seed.json'),
    uploadDir: path.join(__dirname, '..', '..', 'public', 'uploads'),
    imageApiKey: config.PIXABAY_API_KEY,
    dryRun,
    suggest: args.has('--suggest'),
  });

  if (result.skipped) {
    console.log(`[generate-post] O'tkazib yuborildi: ${result.skipped}`);
    if (!dryRun) await sendTelegram(`ℹ️ <b>Blog generatori o'tkazib yuborildi</b>\n${escapeHtml(result.skipped)}`);
    return;
  }
  if (dryRun) {
    console.log(JSON.stringify(result.article, null, 2));
    return;
  }

  const url = `${config.SITE_URL}/admin/blog/${result.id}/edit`;
  console.log(`[generate-post] Qoralama yaratildi #${result.id}: ${result.title}\n${url}`);
  await sendTelegram(
    `📝 <b>Yangi blog qoralamasi</b>\n${escapeHtml(result.title)}\n\nKo'rib chiqing va nashr qiling:\n${escapeHtml(url)}`
  );
}

main().catch(async (err) => {
  console.error('[generate-post] XATO:', err);
  if (!args.has('--dry-run')) {
    await sendTelegram(`⚠️ <b>Blog generatori xatosi</b>\n${escapeHtml(err && err.message)}`);
  }
  process.exitCode = 1;
});
