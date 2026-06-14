"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

/**
 * AppLoader — shown for the ~1s while ClientApp.jsx dynamically loads.
 * A clean branded splash keeps users from seeing the raw SEO skeleton.
 * SEO content is handled separately via JSON-LD in layout.jsx.
 */
const AppLoader = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Logo mark */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '44px', height: '44px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
        }}>
          {/* Land/plot icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span style={{
          fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px',
          color: '#ffffff',
        }}>A1Plot</span>
      </div>

      {/* Spinner ring */}
      <div style={{ position: 'relative', width: '48px', height: '48px', marginBottom: '20px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid rgba(16,185,129,0.15)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid transparent',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'a1spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes a1spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <p style={{ color: '#64748b', fontSize: '14px', letterSpacing: '0.5px' }}>
        Loading{dots}
      </p>
    </div>
  );
};

const ClientApp = dynamic(() => import('../src/ClientApp'), {
  ssr: false,
  loading: () => <AppLoader />,
});

export default function ClientWrapper() {
  return <ClientApp />;
}
