// Rasterizes the vector logo (public/favicon.svg) into the PNG sizes a PWA
// manifest needs to be installable. Re-run this (`npm run generate:pwa-icons`)
// whenever the logo changes — the existing logo PNGs (98x93, 148x111) are too
// small to upscale cleanly, so the SVG is the only source worth scaling from.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets');
const BG = '#0f172a'; // manifest.json background_color — keeps icons on-brand
const svg = fs.readFileSync(path.join(ROOT, 'public', 'favicon.svg'));

async function makeIcon(size, outPath, { maskableSafeZone } = {}) {
  if (maskableSafeZone) {
    // Maskable icons get clipped to a circle/squircle/etc by the OS, so the
    // logo must sit inside a safe zone (here: the inner 66%) with the
    // background colour filling all the way to the edge.
    const logoSize = Math.round(size * (1 - maskableSafeZone * 2));
    const logoBuf = await sharp(svg, { density: 384 }).resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: logoBuf, gravity: 'center' }])
      .png()
      .toFile(outPath);
  } else {
    await sharp(svg, { density: 384 })
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
