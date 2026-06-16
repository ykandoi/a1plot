'use client';

/* Recharts (~0.5MB) lives here so it can be code-split out of the main
 * ClientApp bundle and lazy-loaded only when a chart actually renders.
 * This keeps the heavy charting library off the critical path for first paint. */
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';

// Homepage "My Portfolio" mockup line chart.
export function MiniLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={12} fill="#64748b" />
        <Tooltip cursor={{ stroke: '#3b7a76', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Portfolio dashboard area chart.
export function PortfolioAreaChart({ data, chartMin, chartMax, investedBase, tooltipFormatter }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} fontSize={11} fill="#94a3b8" interval={'preserveStartEnd'} />
        <YAxis domain={[chartMin, chartMax]} hide />
        <Tooltip
          formatter={tooltipFormatter}
          contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
          itemStyle={{ color: '#10b981' }}
          cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        <ReferenceLine y={investedBase} stroke="#94a3b8" strokeDasharray="6 4" strokeWidth={1} />
        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Small per-holding sparkline.
export function Sparkline({ data, id, isPositive }) {
  return (
    <ResponsiveContainer width={100} height={40}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={1.5} fill={`url(#spark-${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
