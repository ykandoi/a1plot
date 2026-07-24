"use client";
import dynamic from 'next/dynamic';

// Loads FeatureIsland client-side only (ssr:false) so all Firebase code stays
// off the server. The SEO content around it is server-rendered separately, so
// keeping the interactive widget client-only costs nothing for crawlers.
const FeatureIsland = dynamic(() => import('./FeatureIsland'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>Loading…</div>
  ),
});

export default function FeatureMount(props) {
  return <FeatureIsland {...props} />;
}
