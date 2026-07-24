import SiteChrome from '../../src/components/site/SiteChrome';

export const metadata = {
  title: 'Privacy Policy | A1Plot',
  description: 'How A1Plot collects, processes, secures and shares information for investors, sellers and visitors on our land investment platform.',
  alternates: { canonical: 'https://a1plot.com/privacy_policy' },
};

const H = ({ children }) => <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a' }}>{children}</h2>;
const P = ({ children }) => <p style={{ marginBottom: '1.25rem' }}>{children}</p>;

export default function Page() {
  return (
    <SiteChrome active="">
      <section className="section bg-white" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 700 }}>Legal &amp; Compliance</span>
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
            <p className="text-muted">Last Updated: May 20, 2026</p>
          </div>
          <div style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem' }}>
            <P><>At <strong>A1Plot</strong>, we are committed to safeguarding the privacy and confidentiality of our investors, sellers, and visitors. This Privacy Policy details how we collect, process, secure, and share information on our platform.</></P>
            <H>1. Information We Collect</H>
            <P>To provide a premium real estate transactional experience, we collect information across three main categories:</P>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Personal Details:</strong> Name, verified email address, phone number, and Firebase authentication credentials.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Property &amp; Listing Information:</strong> Ownership status, coordinate data, sizes, prices, layout plans, and legal files such as Title Deeds, Encumbrance Certificates (EC), and Khata Certificates.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Analytics &amp; Cookies:</strong> Geographic coordinates, interactive map zoom selections, and temporary cookies to secure user sessions.</li>
            </ul>
            <H>2. Data Masking &amp; Buyer Engagement</H>
            <P>To protect sellers from unsolicited brokers and maintain listing integrity:</P>
            <P>- All public-facing interfaces (including our Map View and home featured list) completely mask the seller's true name and details, displaying them as <strong>"A1Plot Verified Seller"</strong>.</P>
            <P>- The seller's actual identity is only released to a potential buyer after the buyer registers an interest, requests documentation, and signs our legally binding exclusive transactional commitment checkbox.</P>
            <H>3. How We Use Your Information</H>
            <P>We process your information to:</P>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}>Execute administrative verification of listed land plots.</li>
              <li style={{ marginBottom: '0.5rem' }}>Calculate and present customized portfolio dashboards including historical returns and estimated returns.</li>
              <li style={{ marginBottom: '0.5rem' }}>Render interactive map markers to assist buyers in viewing plot placements.</li>
              <li style={{ marginBottom: '0.5rem' }}>Prevent fraudulent property listings and verify title integrity with local registration systems.</li>
            </ul>
            <H>4. Data Security</H>
            <P>Your profile data is protected via industry-standard Firebase authentication protocols. All sensitive title documents requested are handled securely and shared only with verified platform members who have signed relevant transactional checks.</P>
            <H>5. Cookies &amp; Tracking</H>
            <P>We use functional session management cookies to keep you signed in. We do not use third-party tracking pixels to sell your behavioral browsing data to advertisers.</P>
            <H>6. Your Rights &amp; Deletion</H>
            <P><>Under Indian digital data privacy regulations, you have full rights to request the download or permanent deletion of your account and uploaded properties. You can submit data deletion requests via our <a href="/contact" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Contact Page</a>.</></P>
          </div>
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
            <a className="btn btn-primary" href="/">Return to Explore</a>
            <a className="btn btn-outline" href="/terms_of_service">View Terms of Service</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
