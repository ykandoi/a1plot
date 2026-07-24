import ClientWrapper from '../ClientWrapper';

export default function Page() {
  return <ClientWrapper />;
}

export const metadata = { robots: { index: false, follow: false } };
