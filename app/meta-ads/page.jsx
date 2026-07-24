import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

export const metadata = {
  title: 'List Your Land Free — No Sign-In Required | A1Plot',
  description: 'List your land on A1Plot in minutes, no account required. Zero brokerage, 50-point legal verification, reach verified buyers across India.',
  alternates: { canonical: 'https://a1plot.com/list_property' },
  openGraph: {
    title: 'List Your Land Free — No Sign-In Required | A1Plot',
    description: 'List your land on A1Plot in minutes — zero brokerage, verified buyers across India.',
    url: 'https://a1plot.com/list_property',
    type: 'website',
  },
};

export default function Page() {
  return (
    <SiteChrome active="/list_property">
      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.8rem', borderRadius: 999, marginBottom: '0.75rem' }}>No Sign-In Required to Start</span>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>List Your Land Free</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Reach verified buyers across India — zero brokerage, a 50-point legal check, and your listing live within 24 hours.
          </p>
        </div>
      </section>

      <FullAppMount />
    </SiteChrome>
  );
}
