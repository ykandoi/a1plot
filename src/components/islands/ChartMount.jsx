"use client";
import dynamic from 'next/dynamic';

// Decorative portfolio chart (recharts) — client-only so the ~0.5MB library
// stays off the server render and the initial payload.
const MiniLineChart = dynamic(() => import('../Charts').then(m => m.MiniLineChart), { ssr: false, loading: () => null });

const chartData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 4500 }, { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 5100 }, { name: 'May', value: 5800 }, { name: 'Jun', value: 6500 },
];

export default function ChartMount() {
  return <MiniLineChart data={chartData} />;
}
