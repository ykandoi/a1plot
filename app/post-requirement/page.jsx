import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml } from '../../src/lib/jsonld';
import FeatureMount from '../../src/components/islands/FeatureMount';

export const metadata = {
  title: 'Post Your Property Requirement | A1Plot',
  description: 'Tell us what land or property you want to buy — city, budget and type. Verified brokers covering your area bring matching options directly to you. Free for buyers on A1Plot.',
  keywords: 'post property requirement, buyer requirement, want to buy land, property wanted India, tell brokers what I want, A1Plot',
  alternates: { canonical: 'https://a1plot.com/post-requirement' },
  openGraph: {
    title: 'Post Your Property Requirement | A1Plot',
    description: 'Post what you want to buy and let verified brokers in your city bring you matching properties.',
    url: 'https://a1plot.com/post-requirement',
    type: 'website',
  },
};

const FAQS = [
  { q: 'How does posting a requirement work?', a: 'You tell us the city, your budget and the type of property you want to buy. Registered brokers who cover that city then see your requirement and reach out to you with matching options.' },
  { q: 'Is it free for buyers?', a: 'Yes. Posting a property requirement on A1Plot is completely free for buyers.' },
  { q: 'What if there are no listings in my city yet?', a: 'That is exactly when posting a requirement helps most — brokers active in your area will contact you directly even if nothing is listed online yet.' },
];

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: metadata.title, url: 'https://a1plot.com/post-requirement', description: metadata.description },
      { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  };

  return (
    <SiteChrome active="/post-requirement">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />

      <section className="section" style={{ paddingBottom: '1.5rem' }}>
        <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
          <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>Tell Us What You're Looking For</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Can't find the right plot? Post your requirement and let verified brokers in your city bring the
            right property to you. It's free for buyers.
          </p>
        </div>
      </section>

      <FeatureMount feature="post-requirement" />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Why Post a Requirement?</h2>
          <ul style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 640, margin: '1rem auto', fontSize: '1rem' }}>
            <li>Reach every verified broker working in your city at once.</li>
            <li>Get matched to plots, agricultural land, houses and commercial property in your budget.</li>
            <li>Save time — brokers come to you instead of you calling around.</li>
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

          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Prefer to browse first? <a href="/search" style={{ color: 'var(--primary)', fontWeight: 600 }}>Search verified listings</a>.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
