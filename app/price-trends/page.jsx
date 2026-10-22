import SiteChrome from '../../src/components/site/SiteChrome';
import PriceTrendsMount from '../../src/components/islands/PriceTrendsMount';
import '../../src/components/islands/priceTrends.css';

export const metadata = {
  title: 'Price Trends — Government Valuation Rates by Area | A1Plot',
  description: 'Explore government-published property valuation rates (DLC rate, circle rate, ready reckoner rate) across India on an interactive map, with real historical trend data per area.',
  alternates: { canonical: 'https://a1plot.com/price-trends' },
  openGraph: { title: 'Price Trends — Government Valuation Rates by Area | A1Plot', description: 'Government-published property valuation rates across India, mapped and tracked over time.', url: 'https://a1plot.com/price-trends', type: 'website' },
};

export default function Page() {
  return (
    <SiteChrome active="/price-trends">
      <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
      <section className="pt-page">
        <div className="pt-wrap">
          <header className="pt-hero">
            <div>
              <h1>Price Trends</h1>
              <p>Government valuation rates — DLC rate, circle rate or ready reckoner rate — by area, with their real revision history.</p>
            </div>
            <details className="pt-about">
              <summary>How this data works</summary>
              <p>
                Every figure comes from an official government notification or portal, with the source linked on each
                area. Areas without verified data aren&apos;t shown rather than filled in with estimates.
              </p>
              <p>
                Shaded shapes are real municipal ward boundaries, used where a ward is confirmed to contain the area —
                no state publishes valuation-zone boundary maps. Dots mark every other area at its real location.
              </p>
            </details>
          </header>
          <PriceTrendsMount />
        </div>
      </section>
    </SiteChrome>
  );
}
