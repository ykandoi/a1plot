const GOOGLE_MAPS_API_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '';

// A satellite image of the plot itself, for listings whose owner uploaded no
// photos.
//
// This exists to replace a hardcoded Unsplash stock photo of unrelated
// farmland, which was assigned as `image` whenever a listing had no media. Six
// of eight live listings were showing it — a marketplace that calls its
// listings "Verified" was illustrating them with land that is not the land.
//
// A static map is a real picture of the real coordinates, so it is honest even
// though it is not a photograph. Previously one was only generated when the
// lister drew a boundary polygon; a listing with coordinates but no boundary
// got the stock photo instead, which is the common case.

/**
 * Google's encoded polyline format, implemented here rather than via
 * google.maps.geometry.encoding so a map can be built without the Maps JS API
 * having loaded (server-side, or before the script arrives).
 */
export function encodePath(points) {
  let last = [0, 0];
  let out = '';
  const chunk = (v) => {
    v = v < 0 ? ~(v << 1) : (v << 1);
    let s = '';
    while (v >= 0x20) {
      s += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    return s + String.fromCharCode(v + 63);
  };
  for (const p of points) {
    const lat = Math.round(p.lat * 1e5);
    const lng = Math.round(p.lng * 1e5);
    out += chunk(lat - last[0]) + chunk(lng - last[1]);
    last = [lat, lng];
  }
  return out;
}

/**
 * Static satellite map for a plot. Returns null when there are no usable
 * coordinates — callers must then show an explicit "no image" state rather
 * than substituting a picture of somewhere else.
 *
 * With a boundary polygon the parcel is outlined; with only a point, a marker
 * is dropped at a wider zoom so the surroundings are still legible.
 */
export function plotStaticMapUrl(plot, { width = 600, height = 400 } = {}) {
  if (!GOOGLE_MAPS_API_KEY || !plot) return null;

  const path = Array.isArray(plot.polygonPath) ? plot.polygonPath.filter(p => p && Number.isFinite(p.lat) && Number.isFinite(p.lng)) : [];
  const size = `${width}x${height}`;
  const base = `https://maps.googleapis.com/maps/api/staticmap?size=${size}&maptype=hybrid`;

  if (path.length >= 3) {
    const avgLat = path.reduce((s, p) => s + p.lat, 0) / path.length;
    const avgLng = path.reduce((s, p) => s + p.lng, 0) / path.length;
    const markers = encodeURIComponent(`color:red|${avgLat},${avgLng}`);
    const poly = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodePath(path)}`);
    return `${base}&zoom=19&markers=${markers}&path=${poly}&key=${GOOGLE_MAPS_API_KEY}`;
  }

  const lat = Number(plot.lat);
  const lng = Number(plot.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // Zoom 17 rather than 19: without a drawn boundary the exact extent is
  // unknown, so showing more context is more honest than implying precision.
  const markers = encodeURIComponent(`color:red|${lat},${lng}`);
  return `${base}&zoom=17&markers=${markers}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * The image to display for a listing, in order of how truthful it is:
 * an uploaded photo, then a satellite view of the actual coordinates, then
 * nothing. Never a stock photograph of a different place.
 */
export function plotDisplayImage(plot) {
  if (!plot) return null;
  // Scan every candidate, not just the first: a listing can have a stock image
  // in `image` while carrying a genuine upload further down `media`, and a real
  // photo of the land beats a satellite view of it.
  const candidates = [plot.image, ...(Array.isArray(plot.media) ? plot.media : [])];
  const real = candidates.find(u => u && !isStockPhoto(u));
  return real || plotStaticMapUrl(plot);
}

/**
 * Is this URL a stock image rather than a picture of the actual property?
 *
 * Two kinds ended up on real listings:
 *  - an Unsplash photo of unrelated farmland, written in as a fallback
 *    whenever a listing had no uploads
 *  - /assets/plots/plotN.png, generic countryside shipped in the repo since
 *    May and used by the seed data (one is tropical farmland with red laterite
 *    soil, standing in for a parcel in Rajasthan)
 *
 * Genuine uploads are distinguishable because they go to Firebase Storage, so
 * this can never match a photo a real person supplied.
 */
export function isStockPhoto(url) {
  if (typeof url !== 'string') return false;
  return url.includes('images.unsplash.com') || /\/assets\/plots\/plot\d+\.(png|jpe?g|webp)/i.test(url);
}
