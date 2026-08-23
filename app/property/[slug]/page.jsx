import SiteChrome from '../../../src/components/site/SiteChrome';
import { jsonLdHtml, priceOffer, parseLotSize } from '../../../src/lib/jsonld';
import { plotSlug, idFromSlug } from '../../../src/lib/slug';
import { permanentRedirect } from 'next/navigation';
import PropertyMount from '../../../src/components/islands/PropertyMount';
import PropertyResolverMount from '../../../src/components/islands/PropertyResolverMount';
import { fetchPlotById } from '../../../src/lib/fetchPlots';

export const revalidate = 3600;

const L = ({ children }) => (
  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{children}</span>
);
const V = ({ children, cap }) => (
  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', ...(cap ? { textTransform: 'capitalize' } : {}) }}>{children}</span>
);

const CONSTRUCTED_SUBTYPES = {
  flat: 'Flat / Apartment', independent_house_villa: 'Independent House / Villa', high_rise_apartment: 'High-rise Apartment',
  g_plus_building: 'G+ Building', residential_plot: 'Residential Plot', commercial_plot: 'Commercial Plot',
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  const plot = id ? await fetchPlotById(id) : null;
  if (!plot) return { title: 'Property | A1Plot', robots: { index: false } };
  const title = `${plot.title}${plot.location ? ' in ' + plot.location : ''} | A1Plot`;
  const description = `${plot.title} — ${plot.price || ''} · ${plot.size || ''} in ${plot.location || plot.city || 'India'}. ${plot.features || 'Verified land & property listing on A1Plot.'}`.slice(0, 300);
  const image = plot.image || (plot.media && plot.media[0]);
  return {
    title, description,
    alternates: { canonical: `https://a1plot.com/property/${plotSlug(plot)}` },
    openGraph: { title, description, url: `https://a1plot.com/property/${plotSlug(plot)}`, type: 'website', ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const id = idFromSlug(slug);

  if (!id) {
    return <SiteChrome active=""><PropertyResolverMount /></SiteChrome>;
  }

  const plot = await fetchPlotById(id);

  // One canonical URL per listing. If the descriptive half of the slug has
  // drifted — the title was edited, or someone linked with a hand-written
  // slug — send them to the current spelling rather than serving the same
  // content at two addresses.
  if (plot) {
    const canonical = plotSlug(plot);
    if (canonical && canonical !== slug) permanentRedirect(`/property/${canonical}`);
  }
  if (!plot) {
    return (
      <SiteChrome active="">
        <section className="section"><div className="container" style={{ textAlign: 'center', maxWidth: 560 }}>
          <h1 className="section-title">Property not found</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>This listing may have been removed or is no longer available.</p>
          <a className="btn btn-primary" href="/buyer_map">Explore Other Plots</a>
        </div></section>
      </SiteChrome>
    );
  }

  const images = plot.media && plot.media.length > 0 ? plot.media : (plot.image ? [plot.image] : []);
  const docs = (plot.documentsAvailable || []).filter(d => d && d.trim() !== '' && d.includes('.'));
  const status = plot.status || 'Verified';
  const isConstructed = plot.propertyType === 'constructed';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: plot.title,
    description: plot.features || plot.title,
    url: `https://a1plot.com/property/${plotSlug(plot)}`,
    ...(images[0] ? { image: images } : {}),
    ...(priceOffer(plot.price) ? { offers: priceOffer(plot.price) } : {}),
    ...(plot.lat && plot.lng ? { geo: { '@type': 'GeoCoordinates', latitude: plot.lat, longitude: plot.lng } } : {}),
    ...(parseLotSize(plot.size) ? { lotSize: parseLotSize(plot.size) } : {}),
    address: { '@type': 'PostalAddress', addressLocality: plot.city || plot.location || '', addressRegion: plot.state || 'Rajasthan', addressCountry: 'IN' },
    // Ties every listing back to the single organisation node declared in
    // app/layout.jsx, so Google reads them as one business's inventory.
    provider: { '@id': 'https://a1plot.com/#organization' },
  };

  return (
    <SiteChrome active="">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section bg-light" style={{ paddingTop: '2rem', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <a className="btn btn-outline mb-6" href="/buyer_map" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white' }}>← Back to Explore</a>

          <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            {images.length > 0 && (
              <div style={{ height: '400px', width: '100%', overflowX: 'auto', display: 'flex', gap: '2px', background: '#0f172a' }}>
                {images.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%', minWidth: images.length === 1 ? '100%' : '60%' }}>
                    <img src={img} alt={`${plot.title} — photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" fetchPriority={i === 0 ? 'high' : 'auto'} style={{ height: '100%', width: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                  </a>
                ))}
              </div>
            )}

            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`admin-status admin-status-${String(status).toLowerCase().replace(/\s+/g, '-')}`}>{status === 'Verified' ? '✓ Verified' : status}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {plot.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{plot.title}</h1>
                    <PropertyMount slot="like" plot={plot} />
                  </div>
                  {plot.features && <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>{plot.features}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1' }}>{plot.price}</div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Size: {plot.size}</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)', textAlign: 'left' }}>
                <div><L>City Location</L><V>{plot.city || 'Not Specified'}</V></div>
                <div><L>Transaction Type</L><V>{plot.transactionType === 'lease' ? 'Lease' : 'Outright Purchase'}</V></div>
                <div><L>Property Classification</L><V>{isConstructed ? 'Constructed Property' : 'Land Parcel'}</V></div>
                {isConstructed ? (
                  <>
                    <div><L>Property Subtype</L><V>{CONSTRUCTED_SUBTYPES[plot.constructedType] || plot.constructedType || 'Constructed'}</V></div>
                    <div><L>Construction Status</L><V>{plot.constructionStatus === 'under-construction' ? 'Under Construction' : 'Constructed / Ready'}</V></div>
                  </>
                ) : (
                  <>
                    <div><L>Land Classification</L><V>{plot.landType === 'agriculture' ? 'Agriculture Land' : 'Land Converted'}</V></div>
                    <div><L>Land Zoning / Use</L><V cap>{plot.landUse || 'Residential'}</V></div>
                  </>
                )}
                <div><L>Budget / Asking Range</L><V>{plot.budgetRange || plot.price}</V></div>
                <div><L>Facing Direction</L><V>{plot.facingDirection || 'East'} Facing</V></div>
                {(plot.cornerProperty || plot.parkFacing || plot.roadFacing) && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <L>Property Tags</L>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {plot.cornerProperty && <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600 }}>📐 Corner Property</span>}
                      {plot.parkFacing && <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600 }}>🌳 Park Facing</span>}
                      {plot.roadFacing && <span style={{ background: '#fdf2f8', color: '#c01574', border: '1px solid #fbcfe8', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600 }}>🛣️ Road Facing</span>}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Property Location</h2>
                  <div style={{ height: '300px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <PropertyMount slot="map" plot={plot} />
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Available Documents</h2>
                  {docs.length > 0 ? (
                    <div className="doc-file-list">
                      {docs.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <div className="doc-file-item" style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '1.5rem' }}>📄</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, color: '#334155' }}>{plot.title} {plot.badge ? `(${plot.badge})` : ''}</div>
                              <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Click to Open ↗</div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>Documents not uploaded</div>
                  )}

                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>Interested in this property?</h3>
                    <p style={{ fontSize: '0.9rem', color: '#15803d', marginBottom: '1rem' }}>Register your interest to notify the seller and request a call back.</p>
                    <PropertyMount slot="interest" plot={plot} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
