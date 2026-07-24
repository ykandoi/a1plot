"use client";

import dynamic from 'next/dynamic';

/**
 * AppLoader — shown for the ~1s while ClientApp.jsx dynamically loads.
 * It intentionally renders the EXACT same markup as ClientApp's own
 * global loader (.global-loader-* classes live in src/index.css, which is
 * imported globally in layout.jsx) so the JS-download phase and the
 * data-load phase look like one single, seamless loader instead of two.
 */
const AppLoader = () => (
  <div className="global-loader-container">
    <div className="global-loader-card">
      <div className="logo-spinner-wrapper">
        <div className="spinner-ring"></div>
        <img
          src="/assets/logo.png"
          alt="A1Plot"
          className="spinner-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      <div className="loader-text">Securing Verified Land Plots...</div>
      <div className="loader-subtext">Connecting to registry &amp; satellite imagery data</div>
    </div>
  </div>
);

const ClientApp = dynamic(() => import('../src/ClientApp'), {
  ssr: false,
  loading: () => <AppLoader />,
});

export default function ClientWrapper({ hideChrome = false } = {}) {
  return <ClientApp hideChrome={hideChrome} />;
}
