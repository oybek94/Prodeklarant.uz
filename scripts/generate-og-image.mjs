// 1200x630 ijtimoiy tarmoq (OG/Twitter) muqova rasmini generatsiya qiladi.
// Brend fon + accent chiziq + oq logotip + tagline. Natija: public/og-cover.jpg
// Ishga tushirish: node scripts/generate-og-image.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', 'public');

const W = 1200;
const H = 630;
const BRAND_DARK = '#003A70';
const BRAND = '#004E98';
const ACCENT = '#E8A838';

// Fon + matn (SVG). Logotip alohida composite qilinadi.
const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND_DARK}"/>
      <stop offset="1" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="${H - 12}" width="${W}" height="12" fill="${ACCENT}"/>
  <rect x="80" y="360" width="90" height="8" rx="4" fill="${ACCENT}"/>
  <text x="80" y="430" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="#FFFFFF">Meva va sabzavot eksporti uchun</text>
  <text x="80" y="490" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="700" fill="#FFFFFF">bojxona rasmiylashtiruv xizmatlari</text>
  <text x="80" y="552" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="400" fill="#CBD5E1">GTD • Sertifikatlar • Logistika — Farg'ona viloyati</text>
</svg>`;

const logoWidth = 520;
const logo = await sharp(path.join(PUBLIC, 'Logo white.png'))
  .resize({ width: logoWidth })
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: 80, top: 90 }])
  .jpeg({ quality: 88 })
  .toFile(path.join(PUBLIC, 'og-cover.jpg'));

console.log('✓ public/og-cover.jpg yaratildi (1200x630)');
