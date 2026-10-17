// Rasterizes the real A1Plot logo mark (public/assets/favicon_logo.png — the
// arrow mark alone, transparent background, no "A1plot.com" text) into the
// PNG sizes a PWA manifest needs to be installable.
//
// NOTE: public/favicon.svg looks like an unrelated placeholder/template
// asset (an abstract purple/blue shape), not the actual A1Plot brand mark —
// do not source icons from it, despite the name. favicon_logo.png is the
// genuine mark, confirmed against the site header's logo.webp/logo.jpg,
// just already cropped to the icon-only mark with no wordmark text.
//
// It's small (98x93) — the only version of the mark that exists pre-cropped
// with transparency — so these icons are an upscale, not a pixel-perfect
// render. Re-run this (`npm run generate:pwa-icons`) if a higher-res or
// vector source of just the mark ever gets added.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets');
const SOURCE = path.join(ROOT, 'public', 'assets', 'favicon_logo.png');
const BG = { r: 255, g: 255, b: 255 }; // matches how the mark is shown everywhere else on the site

async function makeIcon(size, outPath, { maskableSafeZone } = {}) {
  if (maskableSafeZone) {
    // Maskable icons get clipped to a circle/squircle/etc by the OS, so the
    // logo must sit inside a safe zone (here: the inner ~66%) with the
    // background colour filling all the way to the edge.
    const logoSize = Math.round(size * (1 - maskableSafeZone * 2));
    const logoBuf = await sharp(SOURCE).resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: logoBuf, gravity: 'center' }])
      .png()
      .toFile(outPath);
  } else {
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(outPath);
  }
  console.log('wrote', outPath);
}

(async () => {
  try {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    await makeIcon(192, path.join(OUT_DIR, 'pwa-icon-192.png'));
    await makeIcon(512, path.join(OUT_DIR, 'pwa-icon-512.png'));
    await makeIcon(512, path.join(OUT_DIR, 'pwa-icon-maskable-512.png'), { maskableSafeZone: 0.17 });
  } catch (err) {
    console.error('Icon generation failed:', err.message);
    process.exit(1);
  }
})();
