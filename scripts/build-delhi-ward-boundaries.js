// One-time: parses the Delhi MCD 2022 ward boundary KML (scripts/gis-source/
// delhi_wards_2022.kml — real public-domain government ward polygons, sourced
// via Wayback since the original data.opencity.in listing has since been
// taken down) and matches each Delhi valuation-rate area to the real ward
// polygon that actually contains its geocoded point (point-in-polygon, not an
// artificial bin). Writes:
//   - src/data/delhiWardBoundaries.json — only the wards actually used, to
//     keep bundle size down (the full file covers all 250 Delhi wards).
//   - updates src/data/valuationRatesSeed.json in place, adding a `ward`
//     field to every Delhi entry (or leaving it null if no ward polygon
//     contains that point, which just means that entry falls back to a
//     plain marker instead of a ward shape).
const fs = require('fs');
const path = require('path');

const KML_PATH = path.join(__dirname, 'gis-source', 'delhi_wards_2022.kml');
const SEED_PATH = path.join(__dirname, '..', 'src', 'data', 'valuationRatesSeed.json');
const WARDS_OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'delhiWardBoundaries.json');

function parseWards(kmlText) {
  const wards = [];
  const placemarks = kmlText.split('<Placemark>').slice(1);
  for (const block of placemarks) {
    const nameMatch = block.match(/<SimpleData name="WardName">([^<]*)<\/SimpleData>/);
    const noMatch = block.match(/<SimpleData name="Ward_No">([^<]*)<\/SimpleData>/);
    const coordsMatch = block.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
    if (!nameMatch || !coordsMatch) continue;
    const boundary = coordsMatch[1]
      .trim()
      .split(/\s+/)
      .map((pair) => {
        const [lng, lat] = pair.split(',').map(Number);
        return { lat, lng };
      })
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (boundary.length < 3) continue;
    wards.push({ ward: nameMatch[1].trim(), wardNo: noMatch ? Number(noMatch[1]) : null, boundary });
  }
  return wards;
}

// Douglas-Peucker line simplification. The raw KML polygons carry far more
// vertices (several thousand per ward) than a web map ever needs to render —
// this keeps the real shape while cutting file size by ~10x, rather than
// naively dropping every Nth point (which can distort sharp corners).
function perpendicularDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(point.lng - lineStart.lng, point.lat - lineStart.lat);
  const t = ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) / lenSq;
  const projLng = lineStart.lng + t * dx;
  const projLat = lineStart.lat + t * dy;
  return Math.hypot(point.lng - projLng, point.lat - projLat);
}
function simplify(points, epsilon) {
  if (points.length < 3) return points;
  let maxDist = 0, maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, maxIdx + 1), epsilon);
    const right = simplify(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

// Standard ray-casting point-in-polygon test.
function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat))
      && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

(async () => {
  if (!fs.existsSync(KML_PATH)) {
    console.error(`KML not found at ${KML_PATH} — download it first.`);
    process.exit(1);
  }
  const kmlText = fs.readFileSync(KML_PATH, 'utf8');
  const wards = parseWards(kmlText);
  console.log(`Parsed ${wards.length} ward polygons from KML.`);

  const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  const usedWards = new Map();
  let matched = 0;
  for (const area of seed) {
    if (area.state !== 'Delhi' || typeof area.lat !== 'number' || typeof area.lng !== 'number') continue;
    const hit = wards.find((w) => pointInPolygon({ lat: area.lat, lng: area.lng }, w.boundary));
    if (hit) {
      area.ward = hit.ward;
      if (!usedWards.has(hit.ward)) usedWards.set(hit.ward, hit);
      matched++;
    } else {
      area.ward = null;
    }
  }
  console.log(`Matched ${matched}/${seed.filter(a => a.state === 'Delhi').length} Delhi areas to a real ward polygon.`);

  fs.writeFileSync(SEED_PATH, JSON.stringify(seed, null, 2));

  // Export ALL parsed wards, not just the ones a seed area happens to fall
  // in — otherwise a Delhi colony added later via the admin panel could
  // never match a ward (its polygon simply wouldn't be in the file), even
  // though the real ward containing it does exist. Matching new entries
  // against this full set happens client-side in ClientApp.jsx's rate form.
  //
  // ~0.00005 degrees ≈ 5.5m at Delhi's latitude — far finer than this map
  // ever renders at, so the simplified shape is visually identical while
  // being a fraction of the file size.
  const EPSILON = 0.00005;
  const simplifiedWards = wards.map((w) => ({ ...w, boundary: simplify(w.boundary, EPSILON) }));
  const beforeCount = wards.reduce((sum, w) => sum + w.boundary.length, 0);
  const afterCount = simplifiedWards.reduce((sum, w) => sum + w.boundary.length, 0);
  console.log(`Simplified boundary vertices: ${beforeCount} -> ${afterCount}`);
  console.log(`(${usedWards.size} of ${wards.length} wards are used by current seed data; the rest are kept so future admin-added Delhi areas can still match a real ward.)`);

  fs.writeFileSync(WARDS_OUT_PATH, JSON.stringify(simplifiedWards, null, 2));
  console.log(`Wrote ${simplifiedWards.length} ward boundaries to ${WARDS_OUT_PATH}`);
})();
