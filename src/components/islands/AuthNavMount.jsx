"use client";
import dynamic from 'next/dynamic';

// Reserve the avatar's footprint while the island's chunk downloads, so the
// header doesn't shift when the profile picture appears (and it reads as a
// loading avatar rather than an empty gap).
const AuthNavIsland = dynamic(() => import('./AuthNavIsland'), {
  ssr: false,
  loading: () => <div className="sc-auth-skeleton" aria-hidden="true" />,
});

export default function AuthNavMount() {
  return <AuthNavIsland />;
}
