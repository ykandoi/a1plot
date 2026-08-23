import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml, priceOffer } from '../../src/lib/jsonld';
import { plotUrl } from '../../src/lib/slug';
import BuyerMapMount from '../../src/components/islands/BuyerMapMount';
import { fetchPublicPlots } from '../../src/lib/fetchPlots';

export const revalidate = 3600;

export const metadata = {
  title: 'Buy Land — Verified Plots on an Interactive Map | A1Plot',
  description: 'Browse every verified land parcel, plot and property on an interactive satellite map. Filter by location, view prices and sizes, and open full listings across India on A1Plot.',
  keywords: 'buy land India, land on map, verified plots, satellite land map, plots for sale, A1Plot',
  alternates: { canonical: 'https://a1plot.com/buyer_map' },
  openGraph: { title: 'Buy Land — Verified Plots on an Interactive Map | A1Plot', description: 'Browse verified land parcels on an interactive satellite map across India.', url: 'https://a1plot.com/buyer_map', type: 'website' },
};

const Pin = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);

export default async function Page() {
  const plots = await fetchPublicPlots();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'A1Plot verified land listings',
    numberOfItems: plots.length,
    itemListElement: plots.slice(0, 25).map((p, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: { '@type': 'RealEstateListing', name: p.title, url: `https://a1plot.com${plotUrl(p)}`, ...(priceOffer(p.price) ? { offers: priceOffer(p.price) } : {}) },
    })),
  };

  return (
    <SiteChrome active="/buyer_map">
      {/* Preconnect lives here, not in the root layout: this is the one route that
          actually loads the Maps JS API, so warming the handshake pays off. On
          every other page Lighthouse flagged it as an unused preconnect. React
          hoists these into <head>. */}
      <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <section className="section bg-light" style={{ paddingTop: '2rem', paddingBottom: '0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', padding: '0 2rem', maxWidth: '1800px', margin: '0 auto' }}>
          <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem', marginTop: '1rem' }}>
            <h1 className="section-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Buy Land</h1>
            <p className="text-muted">Browse our verified listings and find your perfect plot. Select a property to view on the map.</p>
          </div>
          <div className="buyer-map-layout">
            {/* Left: server-rendered, crawlable listing directory */}
            <div className="buyer-map-list">
              <div className="plots-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {plots.map(plot => (
                  <a key={plot.id} href={plotUrl(plot)} className="plot-card" style={{ border: '1px solid var(--border-color)', position: 'relative', color: 'inherit', textDecoration: 'none', display: 'block' }}>
                    <div className="plot-image" style={{ height: '160px' }}>
                      <div className="plot-badge">{plot.badge || 'Listed'}</div>
                      <img src={plot.image} alt={plot.title} loading="lazy" decoding="async" width="280" height="160" />
                    </div>
                    <div className="plot-content" style={{ padding: '1.25rem' }}>
                      <div className="plot-location" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}><Pin /> {plot.location}</div>
                      <h2 className="plot-title" style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{plot.title}</h2>
                      <div className="plot-metrics" style={{ marginBottom: '1rem', paddingBottom: '1rem', gap: '0.5rem' }}>
                        <div className="metric"><h5 style={{ fontSize: '0.65rem' }}>Price</h5><p style={{ fontSize: '0.95rem' }}>{plot.price}</p></div>
                        <div className="metric"><h5 style={{ fontSize: '0.65rem' }}>Size</h5><p style={{ fontSize: '0.95rem' }}>{plot.size}</p></div>
                      </div>
                      <span className="btn btn-outline" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', display: 'block', textAlign: 'center' }}>View Details</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            {/* Right: interactive map island */}
            <div className="buyer-map-map" style={{ position: 'relative' }}>
              <BuyerMapMount plots={plots} />
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
