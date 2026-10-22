"use client";
import dynamic from 'next/dynamic';

const PriceTrendsIsland = dynamic(() => import('./PriceTrendsIsland'), {
  ssr: false,
  loading: () => (
    <div className="pt-shell pt-shell-center">
      <div className="pt-spinner" />
      <p>Loading map…</p>
    </div>
  ),
});

export default function PriceTrendsMount() {
  return <PriceTrendsIsland />;
}
