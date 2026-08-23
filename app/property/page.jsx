import { permanentRedirect } from 'next/navigation';
import SiteChrome from '../../src/components/site/SiteChrome';
import PropertyResolverMount from '../../src/components/islands/PropertyResolverMount';
import { fetchPlotById } from '../../src/lib/fetchPlots';
import { plotSlug } from '../../src/lib/slug';

/**
 * Legacy /property?id=<id> — permanently redirected to /property/<slug>-<id>.
 *
 * THIS ROUTE MUST NOT BE DELETED. Every listing was indexed by Google at a
 * ?id= URL, those URLs are in inbound links and in Search Console's history,
 * and the sitemap advertised them for months. The 308 is what transfers that
 * ranking signal to the new path; removing it would strand the lot on 404s.
 *
 * permanentRedirect emits 308 rather than 301. Google treats the two the same
 * for ranking transfer, and 308 additionally guarantees the method is
 * preserved.
 */
export const revalidate = 3600;

export async function generateMetadata() {
  // Never index the redirect shell itself — the destination carries the real
  // metadata and canonical.
  return { robots: { index: false, follow: true } };
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const id = sp?.id;

  // No id at all: an in-app reload that lost its query string. The resolver
  // island recovers the last-viewed listing from localStorage client-side.
  if (!id) {
    return <SiteChrome active=""><PropertyResolverMount /></SiteChrome>;
  }

  const plot = await fetchPlotById(id);

  // Unknown id — hand off to the slug route, which renders the "not found"
  // page. Redirecting keeps a single implementation of that state.
  permanentRedirect(`/property/${plot ? plotSlug(plot) : id}`);
}
