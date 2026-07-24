import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Per-user saved properties — no public/SEO value. Shell has generic text
// only; the actual saved list loads client-side after auth.
export const metadata = {
  title: 'My Interests | A1Plot',
  description: 'Properties you have saved and expressed interest in on A1Plot.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/interests">
      <FullAppMount />
    </SiteChrome>
  );
}
