import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml } from '../../src/lib/jsonld';

export const metadata = {
  title: 'About A1Plot | Democratizing Land Investment in India',
  description: 'A1Plot combines satellite intelligence with ironclad legal assurance to bring stock-market velocity, liquidity and transparency to Indian land investment. Meet our founders and principles.',
  keywords: 'about A1Plot, land investment company India, real estate platform, RERA compliant, verified plots',
  alternates: { canonical: 'https://a1plot.com/about_us' },
  openGraph: { title: 'About A1Plot', description: 'Democratizing land investment in India with satellite intelligence and legal assurance.', url: 'https://a1plot.com/about_us', type: 'website' },
};

// Inline SVG icons (server-safe; avoids pulling a client icon lib into RSC).
const IconShield = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>);
const IconTrend = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></svg>);
const IconPin = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>);
const IconLinkedIn = () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>);

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About A1Plot',
    url: 'https://a1plot.com/about_us',
    description: metadata.description,
  };
  return (
    <SiteChrome active="/about_us">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <section className="section bg-white" style={{ paddingBottom: '2rem' }}>
        <div className="about-hero">
          <div className="container">
            <h1 className="about-hero-title">About Us</h1>
            <p className="about-hero-subtitle">
              We are on a mission to democratize land investment in India, combining state-of-the-art satellite intelligence with ironclad legal assurance.
            </p>
          </div>
        </div>

        <div className="container">
          <div className="about-intro-grid">
            <div className="about-intro-text">
              <h2>Revolutionizing Land Ownership</h2>
              <p>
                Founded with the goal of bringing stock-market velocity, liquidity, and absolute transparency to physical property acquisitions, <strong>A1Plot</strong> bridges the gap between ambitious land seekers and authenticated sellers.
              </p>
              <p>
                We bypass traditional brokerages, eliminate asymmetric information, and secure transactions through rigorous 50-point due-diligence legal checks, digital layout mappings, and authenticated authority registries.
              </p>
            </div>
            <div className="about-intro-stats">
              <div className="about-intro-stat-card"><div className="about-intro-stat-num">500+</div><div className="about-intro-stat-label">Verified Plots</div></div>
              <div className="about-intro-stat-card"><div className="about-intro-stat-num">₹500Cr+</div><div className="about-intro-stat-label">Asset Value Listed</div></div>
              <div className="about-intro-stat-card"><div className="about-intro-stat-num">0%</div><div className="about-intro-stat-label">Brokerage Fee</div></div>
              <div className="about-intro-stat-card"><div className="about-intro-stat-num">100%</div><div className="about-intro-stat-label">RERA Compliant</div></div>
            </div>
          </div>
        </div>

        <div className="founders-section">
          <div className="container">
            <div className="section-header" style={{ marginBottom: '3rem' }}>
              <h2 className="section-title">Meet Our Founders</h2>
              <p className="text-muted">The visionary minds and industry specialists behind A1Plot's growth and trust.</p>
            </div>
            <div className="founders-grid">
              <div className="founder-card">
                <div className="founder-avatar-wrapper">
                  <img src="/assets/yash_profile.jpg" alt="Yash Kandoi" className="founder-avatar-img" />
                  <div className="founder-avatar">YK</div>
                </div>
                <h3 className="founder-name">Yash Kandoi</h3>
                <div className="founder-role">Founder &amp; CEO</div>
                <p className="founder-bio">
                  An alumnus of the prestigious IIT Kharagpur, Yash is a technologist and product builder. He designed the high-velocity trade engine, satellite polygon mapping, and digital dashboard integrations that form the core of A1Plot's unique frictionless platform.
                </p>
                <div className="founder-socials">
                  <a href="https://www.linkedin.com/in/yash-kandoi-85b612184/" target="_blank" rel="noopener noreferrer" className="founder-social" title="Connect on LinkedIn"><IconLinkedIn /></a>
                </div>
              </div>
              <div className="founder-card">
                <div className="founder-avatar-wrapper">
                  <img src="/assets/ashok_profile.png" alt="Ashok Kandoi" className="founder-avatar-img" />
                  <div className="founder-avatar">AK</div>
                </div>
                <h3 className="founder-name">Ashok Kandoi</h3>
                <div className="founder-role">Co-Founder &amp; Director</div>
                <p className="founder-bio">
                  Ashok brings over three decades of unparalleled hands-on real estate expertise, land acquisitions foresight, and municipal regulatory knowledge. He spearheads A1Plot's strict 50-point land validation protocols and local registry compliance processes.
                </p>
                <div className="founder-socials">
                  <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="founder-social" title="Connect on LinkedIn"><IconLinkedIn /></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="about-values-section">
          <div className="container">
            <div className="section-header" style={{ marginBottom: '3rem' }}>
              <h2 className="section-title">Our Grounding Principles</h2>
              <p className="text-muted">How we ensure every plot is as secure as a blue-chip stock.</p>
            </div>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon"><IconShield /></div>
                <h3 className="value-title">Absolute Legal Security</h3>
                <p className="value-desc">We handle title deeds, EC check pipelines, and layout plans with absolute rigor so you invest with peace of mind.</p>
              </div>
              <div className="value-card">
                <div className="value-icon"><IconTrend /></div>
                <h3 className="value-title">Liquidity &amp; Exit Strategy</h3>
                <p className="value-desc">By maintaining a digitized portfolio tracker and automated matching systems, we bring secondary market capabilities to land.</p>
              </div>
              <div className="value-card">
                <div className="value-icon"><IconPin /></div>
                <h3 className="value-title">High-Growth Geospatial Focus</h3>
                <p className="value-desc">We prioritize high-appreciating corridors with SEZ access, highway proximity, and commercial authorizations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
