"use client";
import dynamic from 'next/dynamic';

const BuyerMapIsland = dynamic(() => import('./BuyerMapIsland'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8eef0' }}><p style={{ color: '#64748b' }}>Loading map…</p></div>,
});

export default function BuyerMapMount({ plots }) {
  return <BuyerMapIsland plots={plots} />;
}
