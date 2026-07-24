import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Admin-only — see app/admin/page.jsx for the access-control note.
export const metadata = {
  title: 'Admin | A1Plot',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/admin">
      <FullAppMount />
    </SiteChrome>
  );
}
