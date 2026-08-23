import SiteChrome from '../src/components/site/SiteChrome';
import { jsonLdHtml, priceOffer } from '../src/lib/jsonld';
import ChartMount from '../src/components/islands/ChartMount';
import { fetchPublicPlots } from '../src/lib/fetchPlots';

export const revalidate = 3600;

export const metadata = {
  alternates: { canonical: 'https://a1plot.com/' },
};

// Inline SVG icons (server-safe).
const I = {
  trend: (s = 16) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></svg>),
  arrow: (s = 18) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle' }}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>),
  check: (s = 20) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-green"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>),
  search: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>),
  shield: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>),
  phone: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" /></svg>),
  building: (s = 32) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></svg>),
  clock: (s = 32) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>),
  pin: (s = 14) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'text-top' }}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>),
  chevron: (s = 16) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle' }}><path d="m9 18 6-6-6-6" /></svg>),
  heart: (s = 16) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>),
};

export default async function Page() {
  const plots = await fetchPublicPlots();

  // Only the listings. The WebSite and organisation entities are emitted once,
  // site-wide, from app/layout.jsx — declaring a second #website here gave two
  // nodes the same @id on one page, which leaves Google picking between
  // conflicting definitions of the same entity.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList', '@id': 'https://a1plot.com/#property-listings', name: 'A1Plot Active Verified Properties', numberOfItems: plots.length,
        isPartOf: { '@id': 'https://a1plot.com/#website' },
        itemListElement: plots.slice(0, 25).map((p, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: { '@type': 'RealEstateListing', name: p.title, url: `https://a1plot.com/property?id=${p.id}`, ...(priceOffer(p.price) ? { offers: priceOffer(p.price) } : {}), address: { '@type': 'PostalAddress', addressLocality: p.city || p.location || '', addressRegion: p.state || 'Rajasthan', addressCountry: 'IN' } },
        })),
      },
    ],
  };

  return (
    <SiteChrome active="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content text-center">
            <div className="hero-badge">{I.trend(16)}<span>Real Estate, Simplified</span></div>
            <h1 className="hero-title">Invest in Lands <br /><span className="text-primary">Like You Invest in Stocks</span></h1>
            <p className="hero-subtitle">Verified, branded land parcels. Transparent pricing. Instant digital booking. <br />Build your real estate portfolio without the friction of traditional brokers.</p>
            <div className="flex justify-center gap-4">
              <a className="btn btn-primary" href="/buyer_map">Explore Plots {I.arrow(18)}</a>
              <a className="btn btn-secondary" href="/list_property">List Your Land</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item"><h4>500+</h4><p>Verified Plots</p></div>
              <div className="stat-item"><h4>₹500Cr+</h4><p>Asset Value</p></div>
              <div className="stat-item"><h4>0%</h4><p>Brokerage</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="dashboard-preview">
        <div className="container">
          <div className="dashboard-container">
            <div className="dashboard-text">
              <h2>Your Real Estate Portfolio, Digitized.</h2>
              <p>Trade the messy file folders for a clean, modern dashboard. Track the real-time valuation of your land investments just like your mutual funds or stocks.</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
                <li className="flex items-center gap-4">{I.check(20)} <span>Real-time local price indexing</span></li>
                <li className="flex items-center gap-4">{I.check(20)} <span>All legal documents in a centralized vault</span></li>
                <li className="flex items-center gap-4">{I.check(20)} <span>Instant exit/resale capabilities</span></li>
              </ul>
              <a className="btn btn-accent" href="/interests">See My Interests {I.arrow(18)}</a>
            </div>
            <div className="dashboard-mockup">
              <div className="mockup-header"><div className="font-semibold">My Portfolio</div><div className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Export</div></div>
              <div className="mockup-portfolio">
                <div className="text-muted mb-2">Total Current Value</div>
                <div className="flex items-center gap-4"><div className="mockup-value">₹1,24,50,000</div><div className="mockup-gain">{I.trend(18)} +18.2%</div></div>
              </div>
              <div style={{ height: '200px' }}><ChartMount /></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="section bg-white">
        <div className="container">
          <div className="section-header"><h2 className="section-title">Zero Friction Investing</h2><p className="text-muted">Skip the endless negotiations and site visits. We have digitized the entire process.</p></div>
          <div className="steps-grid">
            <div className="step-card"><div className="step-icon">{I.search(24)}</div><h3 className="step-title">1. Discover &amp; Analyze</h3><p className="step-desc">Browse exclusively curated, RERA-approved land parcels. Compare pricing, location metrics, and expected appreciation.</p></div>
            <div className="step-card"><div className="step-icon">{I.shield(24)}</div><h3 className="step-title">2. Due Diligence Done</h3><p className="step-desc">Every plot undergoes 50+ legal checks. Access all digital property documents instantly.</p></div>
            <div className="step-card"><div className="step-icon">{I.phone(24)}</div><h3 className="step-title">3. Instant Booking</h3><p className="step-desc">Complete your digital KYC, sign the agreement online, and pay the token amount directly.</p></div>
          </div>
        </div>
      </section>

      {/* All Properties — server-rendered listing grid */}
      <section id="explore" className="section bg-light">
        <div className="container">
          <div className="flex items-center justify-between mb-12" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>All Properties</h2>
              <p className="text-muted">Explore our complete portfolio of high-growth land investments.</p>
            </div>
          </div>
          <div className="plots-grid">
            {plots.map((plot) => (
              <a key={plot.id} href={`/property?id=${plot.id}`} className="plot-card" style={{ position: 'relative', color: 'inherit', textDecoration: 'none', display: 'block' }}>
                <div className="plot-image">
                  <div className="plot-badge">{plot.badge || 'Listed'}</div>
                  <span className="plot-favorite-btn" aria-hidden="true">{I.heart(16)}</span>
                  <img src={plot.image} alt={plot.title} loading="lazy" decoding="async" width="340" height="220" />
                </div>
                <div className="plot-content">
                  <div className="plot-location">{I.pin(14)} {plot.location}</div>
                  <h3 className="plot-title">{plot.title}</h3>
                  <div className="plot-metrics">
                    <div className="metric"><h5>Expected CAGR</h5><p className="metric-up">{I.trend(16)} {plot.cagr}</p></div>
                    <div className="metric"><h5>Plot Size</h5><p>{plot.size}</p></div>
                    <div className="metric"><h5>Seller</h5><p>A1Plot Verified Seller</p></div>
                    <div className="metric"><h5>Status</h5><p className="text-green font-semibold">{plot.status}</p></div>
                  </div>
                  <div className="plot-footer">
                    <div><span className="price-label">Total Price</span><div className="plot-price">{plot.price}</div></div>
                    <span className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>View Details {I.chevron(16)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section trust-section">
        <div className="container">
          <div className="section-header"><h2 className="section-title">Built on Absolute Trust</h2><p className="text-muted">Real estate is risky. We remove the risk by only listing bank-approved, heavily vetted properties along with fully transparent agreements.</p></div>
          <div className="trust-badges">
            <div className="trust-badge"><div className="trust-icon">{I.building(32)}</div><h3 className="font-semibold mb-2">RERA Registered</h3><p className="text-muted" style={{ fontSize: '0.875rem' }}>100% compliance with local authority laws.</p></div>
            <div className="trust-badge"><div className="trust-icon">{I.shield(32)}</div><h3 className="font-semibold mb-2">50-Point Legal Check</h3><p className="text-muted" style={{ fontSize: '0.875rem' }}>Title verification by top tier law firms.</p></div>
            <div className="trust-badge"><div className="trust-icon">{I.clock(32)}</div><h3 className="font-semibold mb-2">Seamless Exits</h3><p className="text-muted" style={{ fontSize: '0.875rem' }}>Built-in secondary marketplace.</p></div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
