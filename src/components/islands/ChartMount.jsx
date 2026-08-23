"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Decorative portfolio chart (recharts) — client-only so the ~0.5MB library
// stays off the server render and the initial payload.
const MiniLineChart = dynamic(() => import('../Charts').then(m => m.MiniLineChart), { ssr: false, loading: () => null });

const chartData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 4500 }, { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 5100 }, { name: 'May', value: 5800 }, { name: 'Jun', value: 6500 },
];

/**
 * ssr:false alone only kept recharts off the SERVER render — the ~108KB chunk
 * still downloaded the moment the page hydrated, and Lighthouse counted ~53KB
 * of it as unused on load. The chart sits below the fold and is purely
 * decorative, so nothing needs it until someone scrolls there.
 *
 * The IntersectionObserver defers the dynamic import until the placeholder is
 * within 200px of the viewport, which is far enough ahead that the chart is
 * usually painted by the time it's actually on screen.
 */
export default function ChartMount() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    // Old webviews without IntersectionObserver: load it immediately rather
    // than leaving a permanently empty box.
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true);
        io.disconnect();
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  // Fills the 200px-tall box the homepage reserves, so nothing shifts when the
  // chart finally renders into it.
  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {visible ? <MiniLineChart data={chartData} /> : null}
    </div>
  );
}
