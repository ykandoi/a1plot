import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Per-buyer document request tied to a specific property — no public/SEO
// value. Shell has generic text only; the actual request context loads
// client-side after auth.
export const metadata = {
  title: 'Request Property Documents | A1Plot',
  description: 'Request verified legal documents for a property you are interested in on A1Plot.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/">
      <FullAppMount />
    </SiteChrome>
  );
}
