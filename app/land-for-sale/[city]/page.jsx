import { notFound } from 'next/navigation';
import SiteChrome from '../../../src/components/site/SiteChrome';
import { jsonLdHtml, priceOffer } from '../../../src/lib/jsonld';
import { plotUrl, groupPlotsByPlace } from '../../../src/lib/slug';
import { plotDisplayImage } from '../../../src/lib/staticMap';
import { fetchPublicPlots } from '../../../src/lib/fetchPlots';

const BASE = 'https://a1plot.com';

// Location landing pages. Buyers search "land for sale in Jaipur", not a brand
// name, and a search-results page (/search?q=) does not rank the way a real
// indexable page with its own H1, copy and canonical does.
//
// Pages are derived entirely from live plot data — there is no hand-maintained
// list of cities to drift out of sync. groupPlotsByPlace normalises the messy
// input ("Jaipur " and "jaipur" are one place) and drops listings with no
// usable location, so a page exists only where there is something to show.
export const revalidate = 3600;

async function getGroups() {
  try {
    return groupPlotsByPlace(await fetchPublicPlots());
  } catch (_) {
    return [];
  }
}

export async function generateStaticParams() {
  return (await getGroups()).map(g => ({ city: g.slug }));
}

export async function generateMetadata({ params }) {
  const { city } = await params;
  const group = (await getGroups()).find(g => g.slug === city);
  if (!group) return { title: 'Land for Sale | A1Plot', robots: { index: false } };
  const n = group.plots.length;
  const title = `Land for Sale in ${group.name} — ${n} Verified ${n === 1 ? 'Plot' : 'Plots'} | A1Plot`;
  const description = `Browse ${n} verified ${n === 1 ? 'plot' : 'plots'} for sale in ${group.name}. Legally vetted land, agricultural and commercial plots with transparent pricing on A1Plot.`;
  return {
    title,
    description,
    keywords: `land for sale ${group.name}, plots in ${group.name}, buy land ${group.name}, property ${group.name}, agricultural land ${group.name}`,
    alternates: { canonical: `${BASE}/land-for-sale/${group.slug}` },
    openGraph: { title, description, url: `${BASE}/land-for-sale/${group.slug}`, type: 'website' },
  };
}

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

export default async function Page({ params }) {
  const { city } = await params;
  const groups = await getGroups();
  const group = groups.find(g => g.slug === city);

  // No listings for this place — 404 rather than serve an empty page. Thin
  // landing pages actively hurt: a set of near-identical empty results reads
  // as low quality and can drag the rest of the site down with it.
  if (!group) notFound();

  const { name, plots } = group;
  const others = groups.filter(g => g.slug !== group.slug).slice(0, 8);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE}/land-for-sale/${group.slug}#page`,
        name: `Land for Sale in ${name}`,
        url: `${BASE}/land-for-sale/${group.slug}`,
        isPartOf: { '@id': `${BASE}/#website` },
        about: { '@type': 'Place', name },
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE}/land-for-sale/${group.slug}#listings`,
        name: `Verified plots for sale in ${name}`,
        numberOfItems: plots.length,
        itemListElement: plots.slice(0, 25).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'RealEstateListing',
            name: p.title,
            url: `${BASE}${plotUrl(p)}`,
            ...(priceOffer(p.price) ? { offers: priceOffer(p.price) } : {}),
            address: { '@type': 'PostalAddress', addressLocality: name, addressRegion: p.state || 'Rajasthan', addressCountry: 'IN' },
            provider: { '@id': `${BASE}/#organization` },
          },
        })),
      },
    ],
  };

  return (
    <SiteChrome active="" searchDefault={name}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section">
        <div className="container">
          <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <a href="/" style={{ color: 'var(--primary)' }}>Home</a>
            <span aria-hidden="true"> &rsaquo; </span>
            <a href="/search" style={{ color: 'var(--primary)' }}>Search</a>
            <span aria-hidden="true"> &rsaquo; </span>
            <span>Land for Sale in {name}</span>
          </nav>

          <h1 className="section-title" style={{ textAlign: 'left' }}>Land for Sale in {name}</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 680, margin: '0.5rem 0 0' }}>
            {plots.length} verified {plots.length === 1 ? 'property' : 'properties'} currently listed in {name}.
            Every parcel on A1Plot goes through title-deed checks before it is published, and each listing
            shows its size, price and exact location on the map.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
            {plots.map(plot => (
              <a key={plot.id} href={plotUrl(plot)} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'block', color: 'inherit' }}>
                <img src={plotDisplayImage(plot) || ''} alt={plot.title} loading="lazy" decoding="async" width="280" height="170" style={{ height: 170, width: '100%', objectFit: 'cover', background: '#eef2f1', display: 'block' }} />
                <div style={{ padding: '1.1rem' }}>
                  {plot.badge && <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--primary)' }}>{plot.badge}</span>}
                  <h2 style={{ fontSize: '1.05rem', margin: '0.25rem 0 0.5rem', color: 'var(--text-main)' }}>{plot.title}</h2>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
                    <PinIcon /> {plot.location || plot.city || name}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-green-strong)' }}>{plot.price || '—'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{plot.size || ''}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {others.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Land for sale in other locations</h2>
              {others.map(g => (
                <a key={g.slug} href={`/land-for-sale/${g.slug}`} style={{ display: 'inline-block', margin: '0 6px 8px 0', padding: '0.3rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 999, fontSize: '0.85rem', color: 'var(--primary)' }}>
                  {g.name} ({g.plots.length})
                </a>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Looking for something else in {name}?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.9rem' }}>
              Post what you want — city, budget and property type — and brokers covering {name} will contact you directly.
            </p>
            <a className="btn btn-primary" href="/post-requirement">Post a Requirement</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
