import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Editing a specific, owner-only listing — no public/SEO value. Shell has
// generic text only; the actual listing data loads client-side after auth.
export const metadata = {
  title: 'Edit Your Listing | A1Plot',
  description: 'Update the details of your listed property on A1Plot.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/list_property">
      <FullAppMount />
    </SiteChrome>
  );
}
