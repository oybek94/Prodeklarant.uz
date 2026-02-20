/**
 * Generates WebP versions of logo and partner images at display-appropriate sizes
 * to reduce payload (~969 KiB savings). Run before build: npm run optimize-images
 */
import { readdir, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const LOGO_MAX_WIDTH = 672;   // 2x display ~336px
const PARTNER_MAX_WIDTH = 224; // 2x display ~111–221px

async function run() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('Optional: install sharp (npm i -D sharp) and re-run to generate WebP images.');
    process.exit(0);
  }

  const created = [];

  // Logo: public/logo.png -> public/logo.webp
  const logoPath = join(publicDir, 'logo.png');
  try {
    await sharp(logoPath)
      .resize(LOGO_MAX_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(publicDir, 'logo.webp'));
    created.push('logo.webp');
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }

  // Partners: public/partners/*.png -> public/partners/*.webp
  const partnersDir = join(publicDir, 'partners');
  try {
    await mkdir(partnersDir, { recursive: true });
  } catch (_) {}
  let names = [];
  try {
    names = (await readdir(partnersDir)).filter((n) => n.endsWith('.png'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  for (const name of names) {
    const base = name.replace(/\.png$/i, '');
    try {
      await sharp(join(partnersDir, name))
        .resize(PARTNER_MAX_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(join(partnersDir, `${base}.webp`));
      created.push(`partners/${base}.webp`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }

  if (created.length) console.log('Optimized images:', created.join(', '));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
