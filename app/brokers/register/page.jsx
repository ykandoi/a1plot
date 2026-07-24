import SiteChrome from '../../../src/components/site/SiteChrome';
import { jsonLdHtml } from '../../../src/lib/jsonld';
import FeatureMount from '../../../src/components/islands/FeatureMount';

export const metadata = {
  title: 'Register as a Real Estate Broker | A1Plot',
  description: 'Join the A1Plot broker network free. Register your agency, choose the cities you cover, and instantly see buyers actively looking to purchase land and property in your area.',
  keywords: 'register as broker, real estate broker India, property broker leads, broker signup, buyer leads for brokers, A1Plot brokers',
  alternates: { canonical: 'https://a1plot.com/brokers/register' },
  openGraph: {
    title: 'Register as a Real Estate Broker | A1Plot',
    description: 'Register your agency and get buyer leads in the cities you cover — free on A1Plot.',
    url: 'https://a1plot.com/brokers/register',
    type: 'website',
  },
};

const FAQS = [
  { q: 'How much does it cost to register as a broker?', a: 'Registering as a broker on A1Plot is completely free. You only invest your time in reaching out to buyers whose requirements match the cities you cover.' },
  { q: 'How do I get buyer leads?', a: 'When you register you select the cities you work in. Every buyer who posts a requirement in those cities appears on your broker dashboard, along with their budget and property preferences.' },
  { q: 'Which cities can I cover?', a: 'You can cover any city or town in India — for example Jaipur, Kota, Ajmer, Bikaner or any other location. You can update your covered cities any time.' },
];

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Register as a Real Estate Broker | A1Plot',
        url: 'https://a1plot.com/brokers/register',
        description: metadata.description,
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  };

  return (
    <SiteChrome active="/broker-dashboard">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Register as a Broker</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Join A1Plot's broker network for free. Tell us which cities you work in and you'll instantly see buyers
            actively looking to purchase land and property in those areas.
          </p>
        </div>
      </section>

      {/* Interactive registration form (client island) */}
      <FeatureMount feature="broker-register" />

      {/* Server-rendered SEO content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>How the A1Plot Broker Network Works</h2>
          <ol style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 640, margin: '1rem auto', fontSize: '1rem' }}>
            <li><strong>Register your profile</strong> — add your name, agency, phone and the cities you cover.</li>
            <li><strong>See buyer requirements</strong> — every buyer looking in your cities appears on your dashboard with their budget and property type.</li>
            <li><strong>Contact buyers directly</strong> — reveal their contact details and help them find the right property.</li>
          </ol>

          <h2 className="section-title" style={{ textAlign: 'center', marginTop: '2.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: 700, margin: '1rem auto 0' }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.4rem', color: 'var(--text-main)' }}>{f.q}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>{f.a}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Are you a buyer instead? <a href="/post-requirement" style={{ color: 'var(--primary)', fontWeight: 600 }}>Post your property requirement</a> or{' '}
            <a href="/search" style={{ color: 'var(--primary)', fontWeight: 600 }}>search verified listings</a>.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
