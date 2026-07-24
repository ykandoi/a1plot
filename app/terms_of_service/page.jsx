import SiteChrome from '../../src/components/site/SiteChrome';

export const metadata = {
  title: 'Terms of Service | A1Plot',
  description: 'The terms governing use of the A1Plot land investment platform, listing visibility, verification, platform exclusivity and user responsibilities.',
  alternates: { canonical: 'https://a1plot.com/terms_of_service' },
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
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
            <p className="text-muted">Last Updated: May 20, 2026</p>
          </div>
          <div style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem' }}>
            <P><>Welcome to <strong>A1Plot</strong>. By accessing or using our platform, website, interactive mapping services, or dashboard features, you agree to be bound by these Terms of Service. Please read them carefully.</></P>
            <H>1. Platform Objective</H>
            <P>A1Plot functions as a modern real estate investment platform designed to bring liquidity, verification, and transparency to Indian land investments. The website serves working professionals looking to manage verified land holdings and buy/sell parcels safely.</P>
            <H>2. Platform Exclusivity Agreement &amp; Legal Violations</H>
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ fontWeight: 600, color: '#b45309', margin: 0, fontSize: '0.95rem' }}>⚠️ CRITICAL PROVISION FOR BUYERS &amp; SELLERS:</p>
              <p style={{ fontSize: '0.9rem', color: '#78350f', marginTop: '0.5rem', marginBottom: 0 }}>
                All buyer leads generated on A1Plot, and all document requests initiated via our platform, must be transacted <strong>exclusively under the facilitation of A1Plot</strong>. Users are strictly prohibited from bypassing the platform to engage directly after learning of a property listing here. Any bypass or attempt to circumvent the platform to complete a transaction privately to avoid platform support or commission is a material breach of contract, resulting in legal repercussions, project suspension, and a penalty fee.
              </p>
            </div>
            <H>3. Listing Visibility &amp; Verification Checklist</H>
            <P>Sellers listing properties can set visibility options to:</P>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>Public:</strong> Properties are visible on the map and featured grids. Note: Properties must have their document verification approved by an A1Plot admin before they can be showcased publicly.</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>Private:</strong> Properties are restricted to the seller's personal portfolio dashboard and will not be displayed to the public or on the map.</li>
            </ul>
            <H>4. Accuracy of Information</H>
            <P>While A1Plot performs manual verification of upload files (such as EC and Title Deeds), we advise all users to execute their own independent land registry and local municipal checks. We explicitly leave direct government registration automated checks as an additional due-diligence step.</P>
            <H>5. Not Financial Advice</H>
            <P>All portfolio growth rates, historic valuations, and estimated return visualisations shown on the dashboard represent hypothetical historical data and estimates. A1Plot does not supply official, registered financial, legal, or investment advice.</P>
            <H>6. Termination of Access</H>
            <P>We reserve the right to suspend accounts or reject listings that violate our verification criteria, input false location coordinates, list assets they do not own, or act in bad faith.</P>
          </div>
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
            <a className="btn btn-primary" href="/">Return to Explore</a>
            <a className="btn btn-outline" href="/privacy_policy">View Privacy Policy</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
