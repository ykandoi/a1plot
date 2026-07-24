import SiteChrome from '../../src/components/site/SiteChrome';
import { jsonLdHtml } from '../../src/lib/jsonld';
import ContactMount from '../../src/components/islands/ContactMount';

export const metadata = {
  title: 'Contact A1Plot | Talk to a Land Investment Agent',
  description: 'Get in touch with A1Plot. Leave your details and our team gets back within 24 hours to help you buy, sell or invest in verified land and property across India.',
  keywords: 'contact A1Plot, real estate agent India, land investment help, property enquiry',
  alternates: { canonical: 'https://a1plot.com/contact' },
  openGraph: { title: 'Contact A1Plot', description: 'Talk to a land investment agent — we reply within 24 hours.', url: 'https://a1plot.com/contact', type: 'website' },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact A1Plot',
    url: 'https://a1plot.com/contact',
    description: metadata.description,
  };
  return (
    <SiteChrome active="/contact">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }} />
      <section className="section bg-white" style={{ paddingTop: '3rem' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="section-header">
            <h1 className="section-title">Contact Our Agent</h1>
            <p className="text-muted">Leave your details and our team will get back to you within 24 hours.</p>
          </div>
          <ContactMount />
        </div>
      </section>
    </SiteChrome>
  );
}
