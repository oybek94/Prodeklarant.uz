const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Markazlashtirilgan konfiguratsiya + env validatsiyasi.
// Maqsad: production'da xavfsiz bo'lmagan default qiymatlar bilan ishga
// TUSHMASLIK (fail-fast). Lokal dev'da esa qulaylik uchun ogohlantirish bilan
// dev-default'larga ruxsat beramiz.

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

// Hech qachon production'da ishlatilmasligi kerak bo'lgan qiymatlar
const INSECURE_PASSWORDS = ['admin123', 'password', 'changeme', '123456'];
const INSECURE_SECRETS = ['default-secret', 'your-secret-key-change-in-production', 'secret'];

const DEV_PASSWORD = 'dev-admin123';
const DEV_SECRET = 'dev-only-insecure-secret-do-not-use-in-prod';

function fail(msg) {
  console.error(`\n[config] FATAL: ${msg}\n`);
  process.exit(1);
}

let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let JWT_SECRET = process.env.JWT_SECRET;

if (IS_PROD) {
  // Production: hammasi to'g'ri sozlangan bo'lishi shart
  const missing = [];
  if (!ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (!JWT_SECRET) missing.push('JWT_SECRET');
  if (missing.length) {
    fail(`Quyidagi majburiy env o'zgaruvchilar yo'q: ${missing.join(', ')}. server/.env faylida sozlang.`);
  }

  const insecure = [];
  if (INSECURE_PASSWORDS.includes(ADMIN_PASSWORD)) insecure.push('ADMIN_PASSWORD (default/zaif qiymat)');
  if (INSECURE_SECRETS.includes(JWT_SECRET)) insecure.push('JWT_SECRET (default/zaif qiymat)');
  if (JWT_SECRET.length < 24) insecure.push('JWT_SECRET (kamida 24 belgi bo\'lishi kerak)');
  if (insecure.length) {
    fail(`Xavfsiz bo'lmagan sozlama(lar): ${insecure.join(', ')}. Production uchun mustahkam qiymat tanlang.`);
  }
} else {
  // Development: yo'q bo'lsa dev-default + baland ovozli ogohlantirish
  if (!ADMIN_PASSWORD) {
    ADMIN_PASSWORD = DEV_PASSWORD;
    console.warn(`[config] WARNING: ADMIN_PASSWORD sozlanmagan — dev-default ishlatilmoqda ("${DEV_PASSWORD}"). Production'da bu ISHLAMAYDI.`);
  }
  if (!JWT_SECRET) {
    JWT_SECRET = DEV_SECRET;
    console.warn('[config] WARNING: JWT_SECRET sozlanmagan — dev-default ishlatilmoqda. Production\'da bu ISHLAMAYDI.');
  }
}

module.exports = {
  NODE_ENV,
  IS_PROD,
  PORT: process.env.PORT || 3001,
  SITE_URL: process.env.SITE_URL || 'https://prodeklarant.uz',
  ADMIN_PASSWORD,
  JWT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
