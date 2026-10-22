// One-time: geocodes each area in valuation-rates-source.json (area name only,
// no coordinates) into lat/lng via the Google Geocoding API, then writes the
// result to src/data/valuationRatesSeed.json. Re-run whenever
// valuation-rates-source.json gains new areas; existing entries' history/notes
// are never touched by this script, only looked up for their coordinates.
//
// Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env (same key already used
// client-side for Maps JS — the Geocoding API must be enabled for it, and it
// must not be restricted to browser referrers only, or server-side calls
// like this one will be rejected).
const fs = require('fs');
const path = require('path');

// No dotenv dependency for a one-off script — parse the handful of KEY=value
// lines we need directly instead of adding a new package for it.
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv(path.join(__dirname, '..', '.env'));

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SOURCE = path.join(__dirname, 'valuation-rates-source.json');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');
const OUT_FILE = path.join(OUT_DIR, 'valuationRatesSeed.json');

async function geocode(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(`Geocode failed for "${query}": ${data.status} ${data.error_message || ''}`);
  }
  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng, formattedAddress: data.results[0].formatted_address };
}

(async () => {
  if (!API_KEY) {
    console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found in .env');
    process.exit(1);
  }
  const { areas } = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const out = [];
  for (const area of areas) {
    const query = `${area.area}, ${area.city}, ${area.state}, India`;
    try {
      const { lat, lng, formattedAddress } = await geocode(query);
      out.push({ ...area, lat, lng, geocodedAddress: formattedAddress });
      console.log(`✓ ${query} -> ${lat}, ${lng}`);
    } catch (err) {
      console.error(`✗ ${query}: ${err.message}`);
      // Skip areas that fail to geocode rather than writing bad/missing coords.
    }
    // Stay well under Google's rate limits — this is a one-time batch job, not latency-sensitive.
    await new Promise((r) => setTimeout(r, 150));
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${out.length}/${areas.length} geocoded areas to ${OUT_FILE}`);
})();
