"use client";

import { useEffect } from 'react';

// The dedicated /sell landing page has been consolidated into the listing
// tool. Anyone landing on /sell is sent straight to /quick-list, carrying
// any UTM params along so ad attribution is preserved.
export default function SellPage() {
  useEffect(() => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    window.location.replace('/quick-list' + search);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#64748b',
        fontSize: '0.95rem',
      }}
    >
      Taking you to the listing form…
    </div>
  );
}
