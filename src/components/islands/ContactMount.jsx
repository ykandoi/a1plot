"use client";
import dynamic from 'next/dynamic';

const ContactFormIsland = dynamic(() => import('./ContactFormIsland'), {
  ssr: false,
  loading: () => <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading form…</div>,
});

export default function ContactMount() {
  return <ContactFormIsland />;
}
