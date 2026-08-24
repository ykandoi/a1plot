// SiteChrome — a pure SERVER component (no "use client", zero client JS).
// It renders a real, crawlable header + footer around server-rendered page
// content so search engines and AI bots receive actual HTML — not an empty
// client-side-rendered shell. Interactive Firebase widgets are mounted
// separately as client islands.
//
// Header follows the IndiaMART pattern: logo + one prominent central search
// bar (the marketplace's core action) + a primary "post your need" CTA,
// instead of a long row of nav links. Secondary links live in the hamburger.
import React from 'react';
import AuthNavMount from '../islands/AuthNavMount';
import BrokerNavLinkMount from '../islands/BrokerNavLinkMount';
import { fetchPublicPlots } from '../../lib/fetchPlots';
import { groupPlotsByPlace } from '../../lib/slug';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const BuyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></svg>
);
const SellIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>
);
const BrokerIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
);

// Location links for the footer, derived from live inventory so a city appears
// the moment its first plot is published and vanishes with its last.
//
// These exist because a crawl of the site found every /land-for-sale/<city>
// page ORPHANED: they were in the sitemap and cross-linked to each other, but
// nothing on the site linked INTO that cluster, so they received no internal
// link equity at all. Putting them in the footer gives every page a path in.
//
// Failure here must never break the shell — an empty list just omits the
// column, which is also what happens before the first listing exists.
async function footerPlaces() {
  try {
    return groupPlotsByPlace(await fetchPublicPlots()).slice(0, 6);
  } catch (_) {
    return [];
  }
}

export default async function SiteChrome({ active, searchDefault = '', hideFooter = false, children }) {
  const places = hideFooter ? [] : await footerPlaces();
  return (
    <>
      <nav className="navbar sc-navbar">
        <div className="container sc-navbar-inner">
          <a href="/" className="navbar-brand sc-brand" aria-label="A1Plot home">
            <img src="/assets/logo.webp" alt="A1Plot Logo" className="logo-img" width="120" height="52" />
          </a>

          {/* Central search — the primary action, like IndiaMART's header search */}
          <form action="/search" method="get" className="sc-header-search" role="search">
            <div className="sc-header-search-box">
              <SearchIcon />
              <input type="text" name="q" defaultValue={searchDefault} placeholder="Search property…" aria-label="Search properties by city or location" />
              <button type="submit">Search</button>
            </div>
          </form>

          <div className="sc-text-links">
            <a href="/buyer_map" className={`nav-link ${active === '/buyer_map' ? 'active' : ''}`} title="Buy or Rent Land"><BuyIcon /> Buy</a>
            <a href="/list_property" className="nav-link" title="Sell Your Land"><SellIcon /> Sell</a>
            <BrokerNavLinkMount className="nav-link" icon={<BrokerIcon />} />
          </div>

          <div className="sc-nav-actions">
            <a className="btn btn-accent sc-cta-post" href="/post-requirement">Post Requirement</a>
            {/* Owns the ENTIRE mobile menu trigger too — hamburger when signed
                out, avatar when signed in, decided in React (see AuthNavIsland). */}
            <AuthNavMount />
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {!hideFooter && (
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="navbar-brand footer-brand">
                <img src="/assets/logo.webp" alt="A1Plot Logo" className="logo-img" width="120" height="52" />
              </div>
              <p className="footer-desc">
                Bringing stock-market velocity, liquidity, and transparency to Indian real estate investments.
              </p>
            </div>
            <div className="footer-links">
              <h2>Platform</h2>
              <ul>
                <li><a href="/buyer_map">Browse Plots</a></li>
                <li><a href="/search">Search Properties</a></li>
                <li><a href="/post-requirement">Post a Requirement</a></li>
                <li><a href="/brokers/register">Register as a Broker</a></li>
                <li><a href="/broker-dashboard">Broker Dashboard</a></li>
              </ul>
            </div>
            {places.length > 0 && (
              <div className="footer-links">
                <h2>Land for Sale</h2>
                <ul>
                  {places.map(p => (
                    <li key={p.slug}><a href={`/land-for-sale/${p.slug}`}>Land in {p.name}</a></li>
                  ))}
                </ul>
              </div>
            )}
            <div className="footer-links">
              <h2>Company</h2>
              <ul>
                <li><a href="/about_us">About Us</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h2>Legal</h2>
              <ul>
                <li><a href="/privacy_policy">Privacy Policy</a></li>
                <li><a href="/terms_of_service">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      )}
    </>
  );
}
