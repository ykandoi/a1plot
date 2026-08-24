import { parsePriceINR } from './jsonld';
import { groupPlotsByPlace } from './slug';

// Real inventory figures, derived from the same live plot data that feeds the
// sitemap, the homepage listings and llms.txt.
//
// These replace hardcoded hero stats that claimed "500+ Verified Plots" and
// "₹500Cr+ Asset Value" while the site had six listings worth ₹51.75 Cr —
// overstated roughly 80x and 10x, presented as fact rather than illustration.
// Anything shown to a visitor as a number about this business now comes from
// here, so it cannot drift from reality again.

/** "₹51.75 Cr", "₹9.4 Lakh", "₹8,500". Indian numbering, not thousands/millions. */
export function formatINR(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1e7) {
    const cr = value / 1e7;
    return '₹' + (cr >= 100 ? Math.round(cr) : Number(cr.toFixed(2))) + ' Cr';
  }
  if (value >= 1e5) {
    const l = value / 1e5;
    return '₹' + (l >= 100 ? Math.round(l) : Number(l.toFixed(2))) + ' Lakh';
  }
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

/**
 * Aggregates for a set of public plots.
 *
 * `pricedCount` is deliberately separate from `count`: a listing whose price
 * field cannot be parsed confidently (one currently reads "1.10" with no unit)
 * contributes to the listing count but not to the total, so the value shown is
 * never inflated by a guess.
 */
export function inventoryStats(plots) {
  const list = Array.isArray(plots) ? plots : [];
  let totalValue = 0;
  let pricedCount = 0;
  for (const p of list) {
    const v = parsePriceINR(p?.price);
    if (v) { totalValue += Number(v); pricedCount++; }
  }
  const places = groupPlotsByPlace(list);
  return {
    count: list.length,
    pricedCount,
    totalValue,
    totalValueLabel: formatINR(totalValue),
    places,
    locationCount: places.length,
  };
}
