import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

// Personal, per-user portfolio data — no public/SEO value, and the actual
// data must never be server-rendered. This shell has generic text only; the
// real listings/portfolio numbers load client-side, after Firebase confirms
// who's signed in.
export const metadata = {
  title: 'My Lands — Seller Dashboard | A1Plot',
  description: 'Track your listed properties, portfolio value and returns in one dashboard.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/dashboard">
      <FullAppMount />
    </SiteChrome>
  );
}
