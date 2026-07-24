import SiteChrome from '../../src/components/site/SiteChrome';
import FullAppMount from '../../src/components/islands/FullAppMount';

export const metadata = {
  title: 'Log In or Sign Up | A1Plot',
  description: 'Sign in to A1Plot to manage your listed properties, saved interests, and broker profile.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <SiteChrome active="/login" hideFooter>
      <FullAppMount />
    </SiteChrome>
  );
}
