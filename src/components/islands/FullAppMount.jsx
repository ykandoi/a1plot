"use client";
import dynamic from 'next/dynamic';

// Mounts the full ClientApp (with its own nav/footer suppressed via
// hideChrome) inside a real SSR page shell. Uses a small inline loading
// placeholder rather than ClientApp's own full-viewport loader — that one is
// `position:fixed; inset:0`, which would flash over the real SSR content
// already on screen while this chunk downloads.
const ClientApp = dynamic(() => import('../../ClientApp'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>Loading…</div>
  ),
});

export default function FullAppMount() {
  return <ClientApp hideChrome />;
}
