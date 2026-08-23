// Safely serialize a JSON-LD object for embedding inside a <script> tag via
// dangerouslySetInnerHTML. JSON.stringify does NOT escape <, so a DB-sourced
// field containing </script> (e.g. a malicious listing title) would close the
// script element early and allow HTML/script injection (stored XSS). Escaping
// <, >, & and the U+2028/U+2029 line separators keeps the payload valid JSON
// while making script-breakout impossible.
export function jsonLdHtml(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// ── Listing field parsers ─────────────────────────────────────────────────────
// Price and size are free text typed by whoever created the listing: "1cr",
// "₹7.25 Crore", "2000sq ft", "18,000 m²". Structured data needs real numbers,
// and a WRONG number is worse than none — a ₹1 crore plot published to Google
// as "1" both misrepresents the listing and makes rich results nonsense. Both
// helpers therefore return null on anything they cannot read confidently, and
// callers omit the field entirely in that case.

// Floor below which a "price" is treated as a data-entry error rather than a
// real figure. A listing whose price field reads "1.10" almost certainly means
// 1.10 crore, but assuming that would be inventing data — and publishing the
// literal ₹1 to Google is worse than publishing no price at all, both for rich
// results and for structured-data compliance. So anything implausibly low is
// omitted instead, and the listing is left to be corrected at the source.
const MIN_PLAUSIBLE_INR = 10000;

const PRICE_MULTIPLIERS = [
  [/^(cr|crore|crores)$/, 1e7],
  [/^(l|lac|lakh|lakhs)$/, 1e5],
  [/^(k|thousand)$/, 1e3],
];

/**
 * "1cr" -> "10000000", "₹7.25 Crore" -> "72500000", "5,00,000" -> "500000".
 * Returns a string (schema.org price) or null when unparseable.
 */
export function parsePriceINR(raw) {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).toLowerCase().replace(/[,₹\s]/g, '').replace(/rs\.?/g, '');
  const m = s.match(/^([\d]+(?:\.[\d]+)?)([a-z]*)$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = m[2];
  let mult = 1;
  if (unit) {
    const hit = PRICE_MULTIPLIERS.find(([re]) => re.test(unit));
    if (!hit) return null;          // unknown suffix — do not guess
    mult = hit[1];
  }
  const value = Math.round(n * mult);
  if (value < MIN_PLAUSIBLE_INR) return null;
  return String(value);
}

/**
 * "2000sq ft" -> { value: 2000, unitText: 'sq ft' }. Returns null when there is
 * no leading number or no unit to attach to it.
 */
export function parseLotSize(raw) {
  if (!raw) return null;
  const m = String(raw).trim().match(/^([\d,]+(?:\.\d+)?)\s*(.+)$/);
  if (!m) return null;
  const value = Number(m[1].replace(/,/g, ''));
  const unitText = m[2].trim();
  if (!Number.isFinite(value) || value <= 0 || !unitText) return null;
  return { '@type': 'QuantitativeValue', value, unitText };
}

/** Shared Offer node, or null when the price cannot be trusted. */
export function priceOffer(raw) {
  const price = parsePriceINR(raw);
  if (!price) return null;
  return { '@type': 'Offer', price, priceCurrency: 'INR', availability: 'https://schema.org/InStock' };
}
