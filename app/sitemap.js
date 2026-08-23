import { fetchPublicPlots } from '../src/lib/fetchPlots';
import { plotUrl, groupPlotsByPlace } from '../src/lib/slug';

const BASE = 'https://a1plot.com';

// Dynamic sitemap — regenerated hourly (ISR) so new verified listings and their
// listing pages are automatically discoverable by search engines and AI.
export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/buyer_map`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/search`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/post-requirement`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/brokers/register`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/list_property`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/about_us`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy_policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms_of_service`, changeFrequency: 'yearly', priority: 0.3 },
  ].map(r => ({ ...r, lastModified: now }));

  let plotRoutes = [];
  let placeRoutes = [];
  try {
    const plots = await fetchPublicPlots();
    plotRoutes = plots.map(p => ({
      url: `${BASE}${plotUrl(p)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    // One /land-for-sale/<city> page per place that actually has listings.
    // Derived from the same data as the listings themselves, so a city page
    // appears the moment its first plot is published and disappears with its
    // last — no hand-maintained list to go stale.
    placeRoutes = groupPlotsByPlace(plots).map(g => ({
      url: `${BASE}/land-for-sale/${g.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch (_) {}

  return [...staticRoutes, ...placeRoutes, ...plotRoutes];
}
