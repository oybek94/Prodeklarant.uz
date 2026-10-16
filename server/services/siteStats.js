const config = require('../config');

/**
 * Bosh sahifadagi "Raqamlarda" bloki uchun jamlangan statistika.
 *
 * Manba: Prodeklarant CRM (app.prodeklarant.uz) — GET /api/public/site-stats.
 * Landing CRM bazasiga ulanmaydi; faqat shu endpoint bilan, umumiy sir (CRM_STATS_KEY)
 * orqali gaplashadi. Kalit brauzerga CHIQMAYDI: brauzer faqat shu serverning /api/stats
 * yo'lidan tayyor jamlangan javobni oladi.
 *
 * Ishonchlilik: CRM javob bermasa, oxirgi muvaffaqiyatli javob STALE_MS gacha beriladi;
 * undan keyin null (blok saytda ko'rinmaydi) — to'qilgan yoki eskirgan raqam ko'rsatilmaydi.
 */

const FRESH_MS = 60 * 60 * 1000; // 1 soat
const STALE_MS = 24 * 60 * 60 * 1000; // CRM ishlamasa 24 soatgacha oxirgi javob
const TIMEOUT_MS = 4000;
const RETRY_AFTER_FAIL_MS = 60 * 1000; // xato bo'lsa 1 daqiqa CRM'ni bezovta qilmaymiz

let cache = null; // { data, at }
let inflight = null;
let blockedUntil = 0;

function isValid(d) {
  return Boolean(
    d &&
    typeof d === 'object' &&
    d.declarations &&
    Number.isFinite(d.declarations.total) &&
    Array.isArray(d.declarations.monthly) &&
    d.cargo &&
    Number.isFinite(d.cargo.tonnes) &&
    d.destinations &&
    Array.isArray(d.destinations.byCountry) &&
    d.clients &&
    Number.isFinite(d.clients.active)
  );
}

async function fetchFromCrm() {
  const res = await fetch(config.CRM_STATS_URL, {
    headers: { 'x-site-stats-key': config.CRM_STATS_KEY, accept: 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`CRM stats HTTP ${res.status}`);
  const data = await res.json();
  if (!isValid(data)) throw new Error('CRM stats: kutilmagan javob shakli');
  return data;
}

/** @returns {Promise<object|null>} jamlangan statistika yoki null (sozlanmagan / mavjud emas) */
async function getSiteStats() {
  if (!config.CRM_STATS_URL || !config.CRM_STATS_KEY) return null;

  const now = Date.now();
  if (cache && now - cache.at < FRESH_MS) return cache.data;
  if (now < blockedUntil) return cache && now - cache.at < STALE_MS ? cache.data : null;

  if (!inflight) {
    inflight = fetchFromCrm()
      .then((data) => {
        cache = { data, at: Date.now() };
        return data;
      })
      .catch((err) => {
        blockedUntil = Date.now() + RETRY_AFTER_FAIL_MS;
        console.error('[stats] CRM dan olib bo\'lmadi:', err && err.message);
        return cache && Date.now() - cache.at < STALE_MS ? cache.data : null;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Testlar uchun */
function _reset() {
  cache = null;
  inflight = null;
  blockedUntil = 0;
}

module.exports = { getSiteStats, isValid, _reset };
