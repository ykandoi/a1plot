import { fetchCatalogWithItems } from '../../src/lib/fetchCatalog';
import CatalogActionsMount from '../../src/components/islands/CatalogActionsMount';

// A catalog is a private document a broker sends to one client — never cached
// (the broker may edit it right after sharing) and never indexed.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const id = sp?.id;
  const data = id ? await fetchCatalogWithItems(id) : null;
  if (!data) return { title: 'Property Catalog | A1Plot', robots: { index: false, follow: false } };
  const { catalog, items } = data;
  const title = catalog.brokerName ? `Properties shared by ${catalog.brokerName}` : 'Property Catalog';
  const description = `${items.length} handpicked propert${items.length === 1 ? 'y' : 'ies'} on A1Plot.`;
  const image = items.find(i => i.image)?.image;
  return {
    title: `${title} | A1Plot`,
    description,
    // Client catalogs must never reach a search engine.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website', ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  };
}

const money = (v) => (v == null || v === '' ? 'Price on request' : String(v));

function PropertyCard({ item, index }) {
  const images = item.media && item.media.length > 0 ? item.media : (item.image ? [item.image] : []);
  const cover = images[0];
  const detailUrl = item.source === 'platform' ? `https://a1plot.com${plotUrl(item)}` : null;

  return (
    <article className="cat-card">
      {cover ? (
        <div className="cat-card-img">
          <img src={cover} alt={item.title || 'Property photo'} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" />
        </div>
      ) : (
        <div className="cat-card-img cat-card-img-empty"><span>No photo</span></div>
      )}

      <div className="cat-card-body">
        <div className="cat-card-head">
          <h3>{item.title || 'Untitled property'}</h3>
          <span className="cat-price">{money(item.price)}</span>
        </div>

        {(item.location || item.city) && (
          <p className="cat-loc">📍 {item.location || item.city}</p>
        )}

        <dl className="cat-specs">
          {item.size && <div><dt>Size</dt><dd>{item.size}</dd></div>}
          {item.city && item.location !== item.city && <div><dt>City</dt><dd>{item.city}</dd></div>}
          {item.facingDirection && <div><dt>Facing</dt><dd>{item.facingDirection}</dd></div>}
          {item.landUse && <div><dt>Land use</dt><dd style={{ textTransform: 'capitalize' }}>{item.landUse}</dd></div>}
        </dl>

        {(item.features || item.description) && (
          <p className="cat-desc">{item.features || item.description}</p>
        )}

        {(item.cornerProperty || item.parkFacing || item.roadFacing) && (
          <div className="cat-tags">
            {item.cornerProperty && <span>Corner</span>}
            {item.parkFacing && <span>Park facing</span>}
            {item.roadFacing && <span>Road facing</span>}
          </div>
        )}

        {detailUrl && (
          <a className="cat-link" href={detailUrl} target="_blank" rel="noopener noreferrer">
            View full details ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const id = sp?.id;
  const data = id ? await fetchCatalogWithItems(id) : null;

  if (!data) {
    return (
      <main className="cat-wrap">
        <div className="cat-empty">
          <h1>Catalog not found</h1>
          <p>This catalog may have been removed by the broker, or the link is incorrect.</p>
          <a className="cat-btn cat-btn-primary" href="https://a1plot.com">Go to A1Plot</a>
        </div>
        <CatalogStyles />
      </main>
    );
  }

  const { catalog, items } = data;
  // `catalog.title` is an internal label ("3 properties · 21 Aug") used to tell
  // catalogs apart in the broker's own list — never shown to the client.
  const title = catalog.brokerName
    ? `Properties shared by ${catalog.brokerName}`
    : 'Properties for you';
  const phoneHref = String(catalog.brokerPhone || '').replace(/[^\d+]/g, '');
  const waHref = phoneHref.replace(/^\+/, '');

  return (
    <main className="cat-wrap">
      <header className="cat-header">
        <div className="cat-brand">
          <span className="cat-logo">A1Plot</span>
          <span className="cat-count">{items.length} propert{items.length === 1 ? 'y' : 'ies'}</span>
        </div>

        <h1>{title}</h1>

        {(catalog.brokerName || catalog.brokerPhone) && (
          <section className="cat-broker">
            <div>
              <span className="cat-broker-label">Shared by</span>
              <strong>{catalog.brokerName || 'Your agent'}</strong>
              {catalog.brokerAgency && <span className="cat-agency">{catalog.brokerAgency}</span>}
            </div>
            <div className="cat-broker-actions">
              {phoneHref && <a className="cat-btn cat-btn-primary" href={`tel:${phoneHref}`}>Call</a>}
              {waHref && <a className="cat-btn cat-btn-wa" href={`https://wa.me/${waHref}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              {catalog.brokerEmail && <a className="cat-btn" href={`mailto:${catalog.brokerEmail}`}>Email</a>}
            </div>
          </section>
        )}

        <CatalogActionsMount title={title} />
      </header>

      {items.length === 0 ? (
        <div className="cat-empty"><p>This catalog doesn't have any properties in it yet.</p></div>
      ) : (
        <div className="cat-grid">
          {items.map((item, i) => <PropertyCard key={item.id || i} item={item} index={i} />)}
        </div>
      )}

      <footer className="cat-footer">
        <p>Shared via <a href="https://a1plot.com">A1Plot</a> — verified land &amp; property across India.</p>
        <p className="cat-disclaimer">Prices and availability are indicative and subject to change. Please confirm with your agent before making any commitment.</p>
      </footer>

      <CatalogStyles />
    </main>
  );
}

// Scoped to this page. Kept inline rather than in index.css so the shared
// client-facing document can't be disturbed by app-wide style changes, and so
// the print rules (which turn this into the PDF) live next to the markup.
function CatalogStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .cat-wrap { max-width: 960px; margin: 0 auto; padding: 1.25rem 1rem 3rem; color: #1e293b;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .cat-header { margin-bottom: 1.75rem; }
      .cat-brand { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
      .cat-logo { font-weight: 800; font-size: 1.15rem; color: #3b7a76; letter-spacing: -0.01em; }
      .cat-count { font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 0.25rem 0.7rem; border-radius: 999px; }
      .cat-header h1 { font-size: 1.6rem; line-height: 1.25; margin: 0 0 0.4rem; font-weight: 800; color: #0f172a; }
      .cat-client { margin: 0 0 0.6rem; color: #475569; font-size: 0.98rem; }
      .cat-note { margin: 0 0 1rem; color: #475569; line-height: 1.6; white-space: pre-wrap; }

      .cat-broker { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.9rem 1.1rem; margin-bottom: 1rem; }
      .cat-broker-label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
      .cat-broker strong { font-size: 1.02rem; color: #0f172a; }
      .cat-agency { display: block; font-size: 0.85rem; color: #64748b; }
      .cat-broker-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }

      .cat-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
        padding: 0.5rem 0.95rem; border-radius: 8px; font-size: 0.88rem; font-weight: 600;
        border: 1px solid #cbd5e1; background: #fff; color: #334155; text-decoration: none; cursor: pointer; }
      .cat-btn-primary { background: #3b7a76; border-color: #3b7a76; color: #fff; }
      .cat-btn-wa { background: #25d366; border-color: #25d366; color: #fff; }

      .cat-grid { display: grid; grid-template-columns: 1fr; gap: 1.1rem; }
      @media (min-width: 700px) { .cat-grid { grid-template-columns: 1fr 1fr; } }

      .cat-card { border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05); break-inside: avoid; }
      .cat-card-img { height: 190px; background: #0f172a; }
      .cat-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cat-card-img-empty { display: flex; align-items: center; justify-content: center; background: #f1f5f9; color: #94a3b8; font-size: 0.85rem; }
      .cat-card-body { padding: 1rem 1.1rem 1.15rem; }
      .cat-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.4rem; }
      .cat-card-head h3 { font-size: 1.05rem; margin: 0; font-weight: 700; color: #0f172a; line-height: 1.3; }
      .cat-price { font-weight: 800; color: #3b7a76; white-space: nowrap; font-size: 0.98rem; }
      .cat-loc { margin: 0 0 0.7rem; color: #64748b; font-size: 0.88rem; }
      .cat-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 0.9rem; margin: 0 0 0.75rem; }
      .cat-specs dt { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8; font-weight: 600; }
      .cat-specs dd { margin: 0; font-size: 0.9rem; font-weight: 600; color: #1e293b; }
      .cat-desc { margin: 0 0 0.7rem; font-size: 0.88rem; color: #475569; line-height: 1.55; }
      .cat-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.7rem; }
      .cat-tags span { font-size: 0.72rem; font-weight: 600; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 0.15rem 0.55rem; border-radius: 999px; }
      .cat-link { font-size: 0.85rem; font-weight: 600; color: #3b7a76; text-decoration: none; }

      .cat-empty { text-align: center; padding: 3rem 1rem; color: #64748b; }
      .cat-empty h1 { color: #0f172a; font-size: 1.4rem; margin-bottom: 0.5rem; }
      .cat-footer { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.85rem; color: #64748b; }
      .cat-footer a { color: #3b7a76; font-weight: 600; }
      .cat-disclaimer { font-size: 0.76rem; color: #94a3b8; margin-top: 0.5rem; }

      /* "Download PDF" is the browser's own print-to-PDF, so the print layout
         IS the PDF: drop the interactive chrome and let cards flow onto pages. */
      @media print {
        .cat-wrap { max-width: none; padding: 0; }
        .cat-actions, .cat-broker-actions, .cat-link { display: none !important; }
        .cat-card { box-shadow: none; page-break-inside: avoid; }
        .cat-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .cat-card-img { height: 150px; }
        a[href]:after { content: none !important; }
      }
    ` }} />
  );
}
