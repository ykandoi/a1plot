import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

export const metadata = {
  title: 'List Your Land Free | Zero Brokerage | A1Plot',
  description: 'List your land, plot or property on A1Plot for free. Reach verified buyers across India with zero brokerage, a 50-point legal check, and your listing live within 24 hours.',
  keywords: 'list your land, sell land free, list property India, zero brokerage listing, sell plot online, A1Plot',
  alternates: { canonical: 'https://a1plot.com/list_property' },
  openGraph: {
    title: 'List Your Land Free | Zero Brokerage | A1Plot',
    description: 'Reach verified buyers across India with zero brokerage — list your land free on A1Plot.',
    url: 'https://a1plot.com/list_property',
    type: 'website',
  },
};

const FAQS = [
  { q: 'Is it really free to list my land?', a: 'Yes. Listing your land, plot or property on A1Plot is completely free, with zero brokerage charged to sellers.' },
  { q: 'How long until my listing goes live?', a: 'Every listing goes through our 50-point legal verification. Once approved by our team, it goes live and becomes visible to verified buyers — typically within 24 hours.' },
  { q: 'Do I need to create an account?', a: 'No. You can list your property without signing up — just add your email address and phone number so buyers and our verification team can reach you. Creating a free account is optional, and lets you manage your listing and track buyer interest from your dashboard.' },
];

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: metadata.title, url: 'https://a1plot.com/list_property', description: metadata.description },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <SiteChrome active="/list_property">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>List Your Land Free</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            List your land parcel, agricultural land or commercial plot on A1Plot and reach verified buyers across
            India — zero brokerage, a 50-point legal check, and your listing live within 24 hours.
          </p>
        </div>
      </section>

      {/* Interactive listing form (client island — same tested form as always) */}
      <FullAppMount />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Why List With A1Plot?</h2>
          <ul style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 640, margin: '1rem auto', fontSize: '1rem' }}>
            <li><strong>Zero brokerage</strong> — keep 100% of your sale price.</li>
            <li><strong>50-point legal verification</strong> builds buyer trust in your listing.</li>
            <li><strong>Reach verified buyers</strong> actively searching by city and budget.</li>
          </ul>

          <h2 className="section-title" style={{ textAlign: 'center', marginTop: '2.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: 700, margin: '1rem auto 0' }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.4rem', color: 'var(--text-main)' }}>{f.q}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
