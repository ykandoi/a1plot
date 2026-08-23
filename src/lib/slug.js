// Human-readable listing URLs.
//
// Listings used to live at /property?id=FlN2EvlvVVsldduolioC — an opaque
// Firestore id with no keywords, on a query string that search engines crawl
// and index less reliably than a real path. They are now
// /property/palada-agriculture-land-palada-FlN2EvlvVVsldduolioC.
//
// The id stays as the final segment ON PURPOSE. It means a lookup is still a
// single getDoc by id — no slug column to backfill, no uniqueness constraint
// when two listings share a title, and no broken URL when someone edits a
// title later (the id still resolves; the route just redirects to the current
// canonical spelling). Firestore auto-ids are alphanumeric with no hyphens,
// which is what makes "everything after the last hyphen" an unambiguous id.

const MAX_TEXT = 60;

export function toSlug(text) {
  if (!text) return '';
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Trim to MAX_TEXT without cutting a word in half. */
function clamp(slug) {
  if (slug.length <= MAX_TEXT) return slug;
  const cut = slug.slice(0, MAX_TEXT);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
}

/**
 * Canonical path segment for a listing. Falls back to the bare id when a
 * listing has no usable title or place, so a URL always exists.
 */
export function plotSlug(plot) {
  if (!plot || !plot.id) return '';
  // `location` is often a full Google Places string ("VPQC+XVC, Jagdamba
  // Nagar, …, India"), so prefer the short city field and let clamp() handle
  // whatever is left.
  const place = plot.city || plot.location || '';
  const text = clamp([toSlug(plot.title), toSlug(place)].filter(Boolean).join('-'));
  return text ? `${text}-${plot.id}` : String(plot.id);
}

/** Inverse of plotSlug: everything after the last hyphen is the Firestore id. */
export function idFromSlug(slug) {
  if (!slug) return '';
  const s = String(slug);
  const i = s.lastIndexOf('-');
  return i === -1 ? s : s.slice(i + 1);
}

/** Full canonical URL for a listing. */
export function plotUrl(plot, base = '') {
  return `${base}/property/${plotSlug(plot)}`;
}

// ── Location grouping (for /land-for-sale/<city> landing pages) ──────────────
// City data is entered by hand and by Google Places autocomplete, so the same
// place arrives as "Jaipur ", "jaipur" and sometimes only inside a full
// address string. Group on a normalised key so one city yields one page, and
// keep the nicest-looking original spelling for display.

/** Best short place name for a plot: prefer `city`, fall back to `location`. */
export function plotPlace(plot) {
  const raw = (plot?.city || plot?.location || '').trim();
  if (!raw) return '';
  // A Places string ("VPQC+XVC, Jagdamba Nagar, …, Jaipur, Rajasthan 302021,
  // India") is not a city name. Only fall back to a location that looks like a
  // plain label — no commas, short enough to be a place.
  if (raw.includes(',') && !plot?.city) return '';
  return raw.replace(/\s+/g, ' ');
}

/** Title Case for display: "sikar road" -> "Sikar Road". */
export function titleCase(text) {
  return String(text || '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**
 * Group plots by normalised place. Returns [{ slug, name, plots }], sorted by
 * listing count then name, skipping anything with no usable place — an empty
 * landing page is worse for SEO than no page at all.
 */
export function groupPlotsByPlace(plots) {
  const groups = new Map();
  for (const p of plots || []) {
    const place = plotPlace(p);
    const slug = toSlug(place);
    if (!slug) continue;
    if (!groups.has(slug)) groups.set(slug, { slug, name: titleCase(place), plots: [] });
    groups.get(slug).plots.push(p);
  }
  return [...groups.values()].sort((a, b) => b.plots.length - a.plots.length || a.name.localeCompare(b.name));
}
