// Rasterizes the real A1Plot logo mark into the PNG sizes a PWA manifest
// needs to be installable.
//
// Source: public/assets/favicon_logo_Svg.svg — a proper vector export of the
// arrow mark (added after the icons were first built from a low-res 98x93
// PNG upscale). Being vector, it renders crisp at any target size instead of
// softening like the PNG did.
//
// NOTE: public/favicon.svg (deleted) was an unrelated placeholder/template
// asset (an abstract purple/blue shape), not the actual A1Plot brand mark —
// if a file by that name ever reappears, do not source icons from it.
//
// Re-run this (`npm run generate:pwa-icons`) any time the logo changes. If
// you do, also bump CACHE_VERSION in public/sw.js — these icon filenames
// are fixed, not content-hashed, so the service worker's cache-first
// strategy for /assets/ won't pick up a same-name file change otherwise
// (this bit us once already).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets');
const SOURCE = path.join(ROOT, 'public', 'assets', 'favicon_logo_Svg.svg');
const SOURCE_VIEWBOX_PX = 98; // the SVG's own viewBox is 0 0 98 93 — used to pick a rasterization density high enough that no target size below is ever upscaled from a blurry raster
const BG = { r: 255, g: 255, b: 255 }; // matches how the mark is shown everywhere else on the site
const svg = fs.readFileSync(SOURCE);

async function rasterizeAt(size) {
  // Render the vector directly at roughly the target resolution (density in
  // DPI, where the SVG's own units are assumed 72dpi) rather than rasterizing
  // at the source's native small size and upscaling a raster.
  const density = Math.ceil(72 * (size / SOURCE_VIEWBOX_PX)) + 50; // small margin for the resize/contain step below
  return sharp(svg, { density });
}

async function makeIcon(size, outPath, { maskableSafeZone } = {}) {
  if (maskableSafeZone) {
    // Maskable icons get clipped to a circle/squircle/etc by the OS, so the
    // logo must sit inside a safe zone (here: the inner ~66%) with the
    // background colour filling all the way to the edge.
    const logoSize = Math.round(size * (1 - maskableSafeZone * 2));
    const logoBuf = await (await rasterizeAt(logoSize))
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: logoBuf, gravity: 'center' }])
      .png()
      .toFile(outPath);
  } else {
    await (await rasterizeAt(size))
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(outPath);
  }
  console.log('wrote', outPath);
}

(async () => {
  try {
    if (!fs.existsSync(SOURCE)) {
      throw new Error(`Source logo not found at ${SOURCE}`);
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    await makeIcon(192, path.join(OUT_DIR, 'pwa-icon-192.png'));
    await makeIcon(512, path.join(OUT_DIR, 'pwa-icon-512.png'));
    await makeIcon(512, path.join(OUT_DIR, 'pwa-icon-maskable-512.png'), { maskableSafeZone: 0.17 });
  } catch (err) {
    console.error('Icon generation failed:', err.message);
    process.exit(1);
  }
})();
