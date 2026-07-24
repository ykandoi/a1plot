import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Admin-only. The server NEVER fetches or renders any listing/broker data —
// this shell is intentionally content-free. The actual admin panel (listings
// table, broker approval queue) only loads client-side, and only after
// Firebase confirms the signed-in email is an admin (see ADMIN_EMAILS /
// firestore.rules isAdmin()) — that check, not this noindex tag, is the real
// access-control boundary.
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
