import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml } from '../../src/lib/jsonld';
import FeatureMount from '../../src/components/islands/FeatureMount';

export const metadata = {
  title: 'Broker Dashboard — Buyer Leads in Your Area | A1Plot',
  description: 'See buyer requirements in the cities you cover. A1Plot connects verified real estate brokers with buyers actively looking for land and property so you can reach out and close deals faster.',
  keywords: 'broker dashboard, buyer leads, real estate leads India, property requirements, brokers connect buyers, A1Plot',
  alternates: { canonical: 'https://a1plot.com/broker-dashboard' },
  openGraph: {
    title: 'Broker Dashboard — Buyer Leads in Your Area | A1Plot',
    description: 'See buyers actively looking for property in the cities you cover.',
    url: 'https://a1plot.com/broker-dashboard',
    type: 'website',
  },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metadata.title,
    url: 'https://a1plot.com/broker-dashboard',
    description: metadata.description,
  };

  return (
    <SiteChrome active="/broker-dashboard">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container" style={{ maxWidth: 820, textAlign: 'center' }}>
          <h1 className="section-title">Broker Dashboard</h1>
          {/* Kept purely descriptive (no "register" CTA) — this text is static
              server-rendered copy with no way to know if the viewer already
              has a broker profile. The dashboard below already shows the
              correct status-specific action (register / pending / live
              requirements) once it loads. */}
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: '0.75rem auto 0', maxWidth: 640 }}>
            See buyers who are actively looking for land and property in the cities you cover.
          </p>
        </div>
      </section>

      {/* Live, auth-gated dashboard (client island) */}
      <FeatureMount feature="broker-dashboard" />
    </SiteChrome>
  );
}
