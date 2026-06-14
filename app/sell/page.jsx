"use client";

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Search,
  Banknote,
  Users,
  Lock,
  ArrowRight,
  Map,
  ChevronDown,
  Clock,
  BadgeCheck,
  IndianRupee
} from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/918306041133?text=Hi%20A1Plot%20team,%20I%20want%20to%20list%20my%20land%20for%20free.';
const QUICK_LIST_URL = 'https://a1plot.com/quick-list';

const FAQS = [
  { q: "Is listing really free?", a: "Yes. Listing your land on A1Plot is 100% free. We charge zero commission and zero brokerage — you keep your entire sale price." },
  { q: "How long does verification take?", a: "Our team completes the 50-point legal check within 24 hours of submission, then publishes your listing to verified buyers." },
  { q: "What types of land can I list?", a: "Agricultural land, residential plots, commercial plots, farm land, and industrial plots — anywhere across India." },
  { q: "Will brokers contact me?", a: "No. Only verified buyers on the A1Plot platform can reach out to you directly. Your details are protected from broker spam." },
  { q: "What happens after I list?", a: "Our team contacts you within 24 hours to collect documents, complete verification, and publish your listing live on the buyer network." }
];

export default function SellPage() {
  // Forward any UTM params from the ad URL onto the quick-list link so ad
  // attribution carries through to the actual listing tool.
  const [listHref, setListHref] = useState(QUICK_LIST_URL);
  const [activeFaq, setActiveFaq] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const search = window.location.search;
    if (search && search.length > 1) setListHref(QUICK_LIST_URL + search);
  }, []);

  const styles = `
    .sell-page { background-color: var(--bg-color); }
    .sell-nav-cta { padding: 0.6rem 1.25rem; }

    /* Hero trust pills */
    .sell-badges { display:flex; flex-wrap:wrap; justify-content:center; gap:0.75rem; margin-bottom:2.75rem; }
    .sell-pill { display:inline-flex; align-items:center; gap:0.5rem; background:#fff; border:1px solid var(--border-color);
      padding:0.6rem 1.1rem; border-radius:var(--radius-full); font-weight:600; font-size:0.9rem; color:var(--text-main); box-shadow:var(--shadow-sm); }
    .sell-pill svg { color: var(--accent-green); }
    .sell-cta-lg { padding:1rem 2.25rem; font-size:1.1rem; }

    /* Dark trust strip — mirrors the home dashboard-preview band */
    .sell-strip { background-color:#0b1121; color:#fff; padding:4rem 0;
      border-top:1px solid rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.05); }
    .sell-strip-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2rem; }
    .sell-strip-stat { text-align:center; display:flex; flex-direction:column; align-items:center; gap:0.85rem; }
    .sell-strip-ico { width:54px; height:54px; border-radius:1rem; display:flex; align-items:center; justify-content:center;
      background:rgba(16,185,129,0.12); color:#10b981; }
    .sell-strip-stat h4 { font-size:1.35rem; font-weight:800; color:#fff; letter-spacing:-0.01em; }
    .sell-strip-stat p { color:#94a3b8; font-size:0.82rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }

    /* List CTA card (replaces the embedded form) */
    .sell-cta-card { max-width:620px; margin:0 auto; background:#fff; border:1px solid var(--border-color);
      border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); padding:3rem 2.5rem; text-align:center; position:relative; overflow:hidden; }
    .sell-cta-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:5px;
      background:linear-gradient(90deg, var(--primary), var(--accent-green)); }
    .sell-cta-steps { display:flex; flex-direction:column; gap:0.85rem; text-align:left; max-width:380px; margin:2rem auto 2.25rem; }
    .sell-cta-step { display:flex; align-items:center; gap:0.75rem; color:var(--text-main); font-weight:600; font-size:0.95rem; }
    .sell-cta-step svg { color:var(--accent-green); flex-shrink:0; }
    .sell-note { font-size:0.83rem; color:var(--text-muted); margin-top:1.1rem; display:flex; align-items:center; justify-content:center; gap:0.45rem; }

    /* Why cards icon */
    .sell-why-icon { width:56px; height:56px; border-radius:1rem; background:rgba(16,185,129,0.1); color:var(--accent-green);
      display:flex; align-items:center; justify-content:center; margin-bottom:1.75rem; }

    /* FAQ accordion */
    .sell-faq { max-width:780px; margin:0 auto; display:flex; flex-direction:column; gap:1rem; }
    .sell-faq-item { background:#fff; border:1px solid var(--border-color); border-radius:var(--radius-lg); overflow:hidden; transition:var(--transition); }
    .sell-faq-item.open { border-color:var(--primary); box-shadow:var(--shadow-md); }
    .sell-faq-q { display:flex; justify-content:space-between; align-items:center; gap:1rem; width:100%; text-align:left;
      padding:1.3rem 1.5rem; cursor:pointer; font-weight:700; color:var(--text-main); font-size:1.02rem; background:none; border:none; font-family:inherit; }
    .sell-faq-ico { flex-shrink:0; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      background:#f1f5f9; color:var(--text-muted); transition:var(--transition); }
    .sell-faq-item.open .sell-faq-ico { background:rgba(16,185,129,0.12); color:var(--accent-green); transform:rotate(180deg); }
    .sell-faq-a { max-height:0; overflow:hidden; transition:max-height 0.3s ease, padding 0.3s ease; color:var(--text-muted); line-height:1.7; font-size:0.95rem; padding:0 1.5rem; }
    .sell-faq-item.open .sell-faq-a { max-height:320px; padding:0 1.5rem 1.4rem; }

    /* Final CTA band */
    .sell-final { text-align:center; }
    .sell-final h2 { color:#fff; font-size:2.25rem; font-weight:800; margin-bottom:1rem; letter-spacing:-0.02em; }
    .sell-final p { color:#94a3b8; font-size:1.05rem; max-width:560px; margin:0 auto 2rem; }

    @media (max-width:768px) {
      .sell-strip-grid { grid-template-columns:1fr 1fr; gap:2rem 1.5rem; }
      .sell-final h2 { font-size:1.75rem; }
      .sell-cta-card { padding:2.25rem 1.5rem; }
    }
  `;

  return (
    <div className="sell-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* 1. Navbar — single seller CTA, no distractions */}
      <nav className="navbar">
        <div className="container flex items-center justify-between">
          <a href="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.png" alt="A1Plot Logo" className="logo-img" />
          </a>
          <a href={listHref} className="btn btn-accent sell-nav-cta">
            List Your Land Free <ArrowRight size={16} />
          </a>
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <TrendingUp size={16} />
              <span>Direct Owner Channel — Zero Brokerage</span>
            </div>
            <h1 className="hero-title">
              List Your Land Free. <br />
              <span className="text-primary">Reach Verified Buyers Across India.</span>
            </h1>
            <p className="hero-subtitle">
              No brokers. No commission. Just serious buyers ready to buy your land — backed by a
              50-point legal check on every listing.
            </p>

            <div className="sell-badges">
              <span className="sell-pill"><Lock size={16} /> 50-Point Legal Check</span>
              <span className="sell-pill"><BadgeCheck size={16} /> RERA Verified Listings</span>
            </div>

            <div className="flex justify-center gap-4">
              <a href={listHref} className="btn btn-accent sell-cta-lg">
                Start Listing — Free <ArrowRight size={18} />
              </a>
            </div>

            <div className="hero-stats">
              <div className="stat-item"><h4>0%</h4><p>Brokerage</p></div>
              <div className="stat-item"><h4>24 Hrs</h4><p>Verification</p></div>
              <div className="stat-item"><h4>Pan-India</h4><p>Buyer Network</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">List in 3 Simple Steps</h2>
            <p className="text-muted">From listing to live — we handle the heavy lifting for you.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon"><Clock size={24} /></div>
              <h3 className="step-title">1. Add Your Details</h3>
              <p className="step-desc">Share a few details about your land on our listing tool. Takes about 2 minutes to get started.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><Search size={24} /></div>
              <h3 className="step-title">2. We Verify Your Land</h3>
              <p className="step-desc">Our legal desk runs a 50-point check within 24 hours and prepares your listing for publishing.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><Users size={24} /></div>
              <h3 className="step-title">3. Buyers Reach You</h3>
              <p className="step-desc">Verified buyers contact you directly. Zero brokerage, zero commission — you keep 100%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust strip (dark) */}
      <section className="sell-strip">
        <div className="container">
          <div className="sell-strip-grid">
            <div className="sell-strip-stat">
              <div className="sell-strip-ico"><Banknote size={26} /></div>
              <h4>Zero Brokerage</h4><p>Keep 100% of your price</p>
            </div>
            <div className="sell-strip-stat">
              <div className="sell-strip-ico"><ShieldCheck size={26} /></div>
              <h4>50-Point Check</h4><p>Legal verification</p>
            </div>
            <div className="sell-strip-stat">
              <div className="sell-strip-ico"><BadgeCheck size={26} /></div>
              <h4>Free Listing</h4><p>No hidden charges</p>
            </div>
            <div className="sell-strip-stat">
              <div className="sell-strip-ico"><Users size={26} /></div>
              <h4>Pan-India</h4><p>Verified buyer network</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. List CTA (replaces the embedded form → routes to /quick-list) */}
      <section id="list-cta" className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">List Your Property in 2 Minutes</h2>
            <p className="text-muted">Add your land on our secure listing tool. Our team verifies and publishes it within 24 hours.</p>
          </div>

          <div className="sell-cta-card">
            <div className="sell-why-icon" style={{ margin: '0 auto 0.5rem' }}><Map size={26} /></div>
            <h3 className="step-title" style={{ fontSize: '1.5rem' }}>Start Your Free Listing</h3>
            <div className="sell-cta-steps">
              <div className="sell-cta-step"><BadgeCheck size={18} /> 100% free — zero brokerage, zero commission</div>
              <div className="sell-cta-step"><ShieldCheck size={18} /> 50-point legal verification within 24 hours</div>
              <div className="sell-cta-step"><Users size={18} /> Reach verified buyers directly across India</div>
            </div>
            <a href={listHref} className="btn btn-accent sell-cta-lg" style={{ width: '100%' }}>
              List My Property — Free <ArrowRight size={18} />
            </a>
            <p className="sell-note"><Lock size={14} /> Your details are safe. We never share your data with third parties.</p>
          </div>
        </div>
      </section>

      {/* 6. Why A1Plot */}
      <section className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Sell on A1Plot</h2>
            <p className="text-muted">Built to get owners the best price — without the middlemen.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="sell-why-icon"><Banknote size={26} /></div>
              <h3 className="step-title">No Middlemen</h3>
              <p className="step-desc">Connect directly with verified buyers and keep 100% of your sale price. No commission, ever.</p>
            </div>
            <div className="step-card">
              <div className="sell-why-icon"><ShieldCheck size={26} /></div>
              <h3 className="step-title">Legally Verified</h3>
              <p className="step-desc">Every listing passes our 50-point legal check. Verified listings earn more buyer trust and sell faster.</p>
            </div>
            <div className="step-card">
              <div className="sell-why-icon"><IndianRupee size={26} /></div>
              <h3 className="step-title">Free Forever</h3>
              <p className="step-desc">Listing your property on A1Plot is completely free. No listing fees and no hidden charges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="text-muted">Everything you need to know about listing your land.</p>
          </div>
          <div className="sell-faq">
            {FAQS.map((f, i) => (
              <div key={i} className={`sell-faq-item ${activeFaq === i ? 'open' : ''}`}>
                <button type="button" className="sell-faq-q" onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}>
                  <span>{f.q}</span>
                  <span className="sell-faq-ico"><ChevronDown size={18} /></span>
                </button>
                <div className="sell-faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA band */}
      <section className="dashboard-preview">
        <div className="container">
          <div className="sell-final">
            <h2>Ready to list your land?</h2>
            <p>Join thousands of owners selling directly to verified buyers — with zero brokerage and full legal verification.</p>
            <a href={listHref} className="btn btn-accent sell-cta-lg">
              List Your Land Free <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="navbar-brand footer-brand">
                <img src="/assets/logo.png" alt="A1Plot Logo" className="logo-img" />
              </div>
              <p className="footer-desc">
                Bringing stock-market velocity, liquidity, and transparency to Indian real estate investments.
              </p>
            </div>
            <div className="footer-links">
              <h4>For Sellers</h4>
              <ul>
                <li><a href={listHref}>List Your Land</a></li>
                <li><a href={QUICK_LIST_URL}>Interactive Listing</a></li>
                <li><a href="/">Browse Plots</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li><a href="/about_us">About Us</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Get in Touch</h4>
              <ul>
                <li><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp Us</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} A1Plot.com. All rights reserved. Zero brokerage. Verified listings.
          </div>
        </div>
      </footer>
    </div>
  );
}
