"use client";
import dynamic from 'next/dynamic';

// Matches SiteChrome's BrokerIcon exactly, duplicated here rather than passed
// as a prop — next/dynamic's `loading` fallback isn't guaranteed to receive
// the wrapper's props, so this guarantees the icon renders correctly even
// before the real component's chunk has loaded.
const BrokerIconFallback = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
);

// Loading fallback matches the safe default (signed-out) destination exactly,
// so there's no flash/gap while the chunk loads — it just silently upgrades
// to the smart destination once auth + broker profile are known.
const BrokerNavLink = dynamic(() => import('./BrokerNavLink'), {
  ssr: false,
  loading: () => (
    <a href="/login?redirect=/brokers/register" className="nav-link" title="Register Yourself as a Broker"><BrokerIconFallback /> Broker</a>
  ),
});

export default function BrokerNavLinkMount(props) {
  return <BrokerNavLink {...props} />;
}
