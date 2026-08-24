import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml, priceOffer } from '../../src/lib/jsonld';
import { plotUrl, groupPlotsByPlace, toSlug } from '../../src/lib/slug';
import { fetchPublicPlots } from '../../src/lib/fetchPlots';

// Inline SVG (server-component safe — avoids pulling a client icon lib into RSC).
const MapPinIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);

export const revalidate = 3600; // ISR: refresh server-fetched listings hourly

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || sp?.city || '').toString().trim();
  const title = q ? `Land & Property in ${q} | A1Plot` : 'Search Land & Property by City | A1Plot';
  const description = q
    ? `Verified plots, land and property for sale in ${q}. Browse listings or post your requirement and let brokers in ${q} bring matching properties to you.`
    : 'Search verified plots, agricultural land and commercial property by city across India — Jaipur, Kota, Bikaner and more. Find your next land investment on A1Plot.';
  return {
    title,
    description,
    keywords: 'search land, plots by city, property search India, buy plot Jaipur, land for sale, A1Plot search',
    alternates: { canonical: q ? `https://a1plot.com/search?q=${encodeURIComponent(q)}` : 'https://a1plot.com/search' },
    openGraph: { title, description, url: 'https://a1plot.com/search', type: 'website' },
  };
}

const matches = (plot, q) => {
  if (!q) return true;
  const hay = [plot.title, plot.location, plot.city, plot.district, plot.tehsil, plot.village, plot.state, plot.landUse, plot.badge]
    .filter(Boolean).join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
};

const POPULAR = ['Jaipur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Jodhpur'];

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const q = (sp?.q || sp?.city || sp?.location || '').toString().trim();
  const allPlots = await fetchPublicPlots();
  const results = allPlots.filter(p => matches(p, q));
  // Which cities actually have a /land-for-sale/<city> page (same derivation
  // the route itself uses), so chips can link to a real page where one exists.
  const placeSlugs = new Set(groupPlotsByPlace(allPlots).map(g => g.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: q ? `Property listings in ${q}` : 'Verified property listings on A1Plot',
    numberOfItems: results.length,
    itemListElement: results.slice(0, 25).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'RealEstateListing',
        name: p.title,
        url: `https://a1plot.com${plotUrl(p)}`,
        ...(priceOffer(p.price) ? { offers: priceOffer(p.price) } : {}),
      },
    })),
  };

  return (
    <SiteChrome active="/search" searchDefault={q}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 className="section-title">{q ? `Land & Property in ${q}` : 'Search Land & Property by City'}</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 0', maxWidth: 560 }}>
              Find verified plots, land and property by city or location across India.
            </p>
          </div>

          {/* Popular city links. A city that HAS a landing page links to it
              rather than to a search-results URL: /land-for-sale/jaipur is a
              real indexable page with its own H1, copy and canonical, whereas
              /search?q=Jaipur is a results view Google largely ignores. Cities
              with no inventory yet keep the search link so the chip still
              works. */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: 8 }}>Popular:</span>
            {POPULAR.map(city => {
              const slug = toSlug(city);
              const hasPage = placeSlugs.has(slug);
              return (
                <a key={city} href={hasPage ? `/land-for-sale/${slug}` : `/search?q=${encodeURIComponent(city)}`} style={{ display: 'inline-block', margin: '0 6px 8px 0', padding: '0.3rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 999, fontSize: '0.85rem', color: 'var(--primary)' }}>{city}</a>
              );
            })}
          </div>

          {q && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {results.length} {results.length === 1 ? 'property' : 'properties'} found for "{q}".
            </p>
          )}

          {results.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {results.map(plot => (
                <a key={plot.id} href={plotUrl(plot)} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', display: 'block', color: 'inherit' }}>
                  <img src={plot.image || (plot.media && plot.media[0]) || ''} alt={plot.title} loading="lazy" decoding="async" style={{ height: 170, width: '100%', objectFit: 'cover', background: '#eef2f1', display: 'block' }} />
                  <div style={{ padding: '1.1rem' }}>
                    {plot.badge && <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--primary)' }}>{plot.badge}</span>}
                    <h2 style={{ fontSize: '1.05rem', margin: '0.25rem 0 0.5rem', color: 'var(--text-main)' }}>{plot.title}</h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
                      <MapPinIcon /> {plot.location || plot.city || '—'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{plot.price || '—'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{plot.size || '—'}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', maxWidth: 620, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
              <h2 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>{q ? `No listings yet in "${q}"` : 'No listings match your search'}</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                Post your requirement and verified brokers covering this area will bring matching properties directly to you.
              </p>
              <a className="btn btn-primary" href="/post-requirement">Post Your Requirement</a>
            </div>
          )}

          {/* Broker cross-sell */}
          <div style={{ marginTop: '3rem', background: 'rgba(59,122,118,0.06)', border: '1px solid rgba(59,122,118,0.15)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 0.35rem', color: 'var(--text-main)' }}>Are you a broker?</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.1rem' }}>Register to see buyers actively looking for property in your city.</p>
            <a className="btn btn-outline" href="/brokers/register" style={{ background: 'white' }}>Register as a Broker</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
