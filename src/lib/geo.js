// Standard ray-casting point-in-polygon test. Shared between the one-time
// ward-matching build script (scripts/build-delhi-ward-boundaries.js) and the
// admin "add rate entry" form (src/ClientApp.jsx), so a Delhi colony added
// later through the admin panel gets matched against a real ward exactly the
// same way the original seed data was, rather than always falling back to a
// marker just because it wasn't in the initial batch.
export function pointInPolygon(point, polygon) {
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

export function findContainingWard(point, wards) {
  return wards.find((w) => pointInPolygon(point, w.boundary)) || null;
}
