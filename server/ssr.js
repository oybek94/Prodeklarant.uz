/**
 * React sahifalarini serverda render qilish (SSR).
 *
 * `npm run build` ikkinchi qadamda dist-ssr/entry-server.js ni yaratadi. Bu modul uni
 * yuklaydi va har bir sahifa so'rovida to'liq HTML (matn, H1, havolalar) qaytaradi —
 * shunda Yandex/Google JS'ni ishga tushirmasdan ham kontentni ko'radi.
 *
 * Xavfsizlik to'ri: bundle yo'q bo'lsa, SSR o'chirilgan bo'lsa (SSR=off) yoki render
 * xato bersa — null qaytaramiz va server avvalgidek bo'sh "shell" index.html beradi
 * (sayt ishlashda davom etadi, brauzer o'zi render qiladi).
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const config = require('./config');
const posts = require('./services/posts');

const ENTRY = path.join(__dirname, '..', 'dist-ssr', 'entry-server.js');
const ENABLED = config.SSR_ENABLED;

let loaded = null; // { mtimeMs, render }
let staleWarned = false;

/**
 * Bundle'ni bir marta yuklaydi. ESM modulini "?v=" bilan qayta import qilib bo'lmaydi:
 * lazy chunk'lar entry'ni query'siz import qiladi va React ikki nusxa bo'lib qoladi.
 * Shuning uchun rebuild'dan keyin (mtime o'zgarsa) eskirgan SSR bermaymiz — server
 * restart qilinguncha shell HTML qaytaramiz (brauzer o'zi render qiladi).
 */
async function getRender() {
  let stat;
  try {
    stat = fs.statSync(ENTRY);
  } catch {
    return null;
  }
  if (!loaded) {
    const mod = await import(pathToFileURL(ENTRY).href);
    loaded = { mtimeMs: stat.mtimeMs, render: mod.render };
  } else if (loaded.mtimeMs !== stat.mtimeMs) {
    if (!staleWarned) {
      staleWarned = true;
      console.warn('[ssr] dist-ssr qayta build qilingan — SSR restart\'gacha o\'chirildi (pm2 restart prodeklarant).');
    }
    return null;
  }
  return loaded.render;
}

// Loader'larga beriladigan server ma'lumot manbai (data.ts: DataContext)
const dataContext = {
  listPosts: (limit) => posts.listPosts(limit),
  findPost: (slug) => posts.findPost(slug),
};

/**
 * @returns {Promise<{html: string, status: number} | {redirect: string, status: number} | null>}
 */
async function renderApp({ url, nonce }) {
  if (!ENABLED) return null;
  try {
    const render = await getRender();
    if (!render) return null;
    return await render(url, { data: dataContext, nonce });
  } catch (err) {
    console.error('[ssr] render failed, serving client shell:', url, err && err.message);
    return null;
  }
}

module.exports = { renderApp };
