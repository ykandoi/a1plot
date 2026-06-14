"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/firebase';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Search,
  Banknote,
  Users,
  Lock,
  ArrowRight,
  MessageCircle,
  Map,
  ChevronDown,
  Clock,
  BadgeCheck,
  IndianRupee
} from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/918306041133?text=Hi%20A1Plot%20team,%20I%20just%20submitted%20my%20land%20for%20a%20free%20listing.';
const QUICK_LIST_URL = 'https://a1plot.com/quick-list';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const FAQS = [
  { q: "Is listing really free?", a: "Yes. Listing your land on A1Plot is 100% free. We charge zero commission and zero brokerage — you keep your entire sale price." },
  { q: "How long does verification take?", a: "Our team completes the 50-point legal check within 24 hours of submission, then publishes your listing to verified buyers." },
  { q: "What types of land can I list?", a: "Agricultural land, residential plots, commercial plots, farm land, and industrial plots — anywhere across India." },
  { q: "Will brokers contact me?", a: "No. Only verified buyers on the A1Plot platform can reach out to you directly. Your details are protected from broker spam." },
  { q: "What happens after I submit the form?", a: "Our team contacts you within 24 hours to collect documents, complete verification, and publish your listing live on the buyer network." }
];

export default function SellPage() {
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', emailAddress: '',
    propertyType: '', state: '', city: '',
    plotSize: '', plotSizeUnit: 'Sq. Ft.', expectedPrice: '', additionalDetails: ''
  });
  const [utms, setUtms] = useState({ utm_source: '', utm_medium: '', utm_campaign: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeFaq, setActiveFaq] = useState(0);

  // Capture UTM parameters from the ad URL into hidden fields
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setUtms({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || ''
    });
  }, []);

  // Load Google Analytics (GA4) — scoped to this landing page only so the
  // generate_lead event can fire. Kept off the global layout to avoid
  // touching the rest of the site.
  useEffect(() => {
    if (typeof window === 'undefined' || window.gtag) return;
    const GA_ID = 'G-B7Y33BBVGX';
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const scrollToForm = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('listing-form');
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Please enter your full name.';
    if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim())) e.mobileNumber = 'Enter a valid 10-digit mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress.trim())) e.emailAddress = 'Enter a valid email address.';
    if (!formData.propertyType) e.propertyType = 'Select a property type.';
    if (!formData.state) e.state = 'Select your state.';
    if (!formData.city.trim()) e.city = 'Enter your city / district.';
    if (!formData.plotSize.trim()) e.plotSize = 'Enter the plot size.';
    if (!formData.expectedPrice.trim()) e.expectedPrice = 'Enter your expected price.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      const first = document.querySelector('.has-error');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, 'seller_leads'), {
          ...formData, ...utms, status: 'New', createdAt: serverTimestamp()
        });
      }
      if (typeof window !== 'undefined') {
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'Seller', event_label: 'Sell Landing Page' });
      }
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError('Something went wrong. Please try again, or reach us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

    /* Form */
    .sell-form-wrap { max-width:760px; margin:0 auto; }
    .sell-page .form-group { margin-bottom:1.4rem; }
    .sell-page .form-input { font-size:0.98rem; }
    .sell-req { color:var(--accent-red); }
    .form-error { color:#dc2626; font-size:0.82rem; margin-top:0.4rem; display:block; }
    .form-input.has-error { border-color:#ef4444; background:#fff7f7; }
    select.form-input { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 0.9rem center; padding-right:2.5rem; }
    .sell-phone { position:relative; }
    .sell-phone-prefix { position:absolute; left:1rem; top:50%; transform:translateY(-50%); font-weight:600; color:var(--text-muted); pointer-events:none; }
    .sell-phone .form-input { padding-left:3rem; }
    .sell-size-row { display:flex; gap:0.75rem; }
    .sell-size-row .form-input:first-child { flex:1; }
    .sell-unit { width:140px; flex-shrink:0; }
    .sell-submit { width:100%; padding:1.05rem; font-size:1.05rem; margin-top:0.5rem; }
    .sell-note { text-align:center; font-size:0.83rem; color:var(--text-muted); margin-top:1.1rem; display:flex; align-items:center; justify-content:center; gap:0.45rem; }
    .sell-alt { text-align:center; font-size:0.92rem; color:var(--text-muted); margin-top:1.25rem; padding-top:1.25rem; border-top:1px solid var(--border-color); }
    .sell-alt a { color:var(--accent-green); font-weight:700; }
    .sell-form-error-banner { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:0.9rem 1.1rem;
      border-radius:var(--radius-md); font-size:0.9rem; font-weight:500; margin-bottom:1.5rem; }

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

    /* CTA band */
    .sell-final { text-align:center; }
    .sell-final h2 { color:#fff; font-size:2.25rem; font-weight:800; margin-bottom:1rem; letter-spacing:-0.02em; }
    .sell-final p { color:#94a3b8; font-size:1.05rem; max-width:560px; margin:0 auto 2rem; }

    /* Success */
    .sell-success { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
      text-align:center; padding:2rem; background:linear-gradient(135deg,#0f172a 0%,#0b1121 60%,#0f172a 100%); color:#fff; }
    .sell-success-ico { width:96px; height:96px; border-radius:50%; background:rgba(16,185,129,0.12);
      display:flex; align-items:center; justify-content:center; margin-bottom:2rem; }
    .sell-success h1 { font-size:2.5rem; font-weight:800; margin-bottom:1rem; letter-spacing:-0.02em; }
    .sell-success p { color:#94a3b8; font-size:1.1rem; max-width:560px; line-height:1.7; margin-bottom:2.5rem; }
    .sell-success-btns { display:flex; flex-wrap:wrap; gap:1rem; justify-content:center; }
    .sell-success-btns a { display:inline-flex; align-items:center; justify-content:center; gap:0.6rem;
      padding:1rem 1.75rem; border-radius:var(--radius-md); font-weight:700; font-size:1.02rem; transition:var(--transition); }
    .sell-wa { background:#25D366; color:#fff; }
    .sell-wa:hover { background:#20bd5a; transform:translateY(-1px); }

    @media (max-width:768px) {
      .sell-strip-grid { grid-template-columns:1fr 1fr; gap:2rem 1.5rem; }
      .sell-size-row { flex-direction:column; }
      .sell-unit { width:100%; }
      .sell-final h2 { font-size:1.75rem; }
      .sell-success h1 { font-size:2rem; }
    }
  `;

  if (isSuccess) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="sell-success">
          <div className="sell-success-ico"><CheckCircle2 size={52} color="#10b981" /></div>
          <h1>Thank you!</h1>
          <p>
            Our team will contact you within 24 hours to complete your listing, including the
            50-point legal check before we publish it to verified buyers. Want it live faster?
            Add your full property details now.
          </p>
          <div className="sell-success-btns">
            <a href={QUICK_LIST_URL} className="btn btn-accent">
              <Map size={20} /> Complete Detailed Listing
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="sell-wa">
              <MessageCircle size={20} /> Chat with Us on WhatsApp
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="sell-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* 1. Navbar — single seller CTA, no distractions */}
      <nav className="navbar">
        <div className="container flex items-center justify-between">
          <a href="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
            <img src="/assets/logo.png" alt="A1Plot Logo" className="logo-img" />
          </a>
          <button className="btn btn-accent sell-nav-cta" onClick={scrollToForm}>
            List Your Land Free <ArrowRight size={16} />
          </button>
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
              <button className="btn btn-accent sell-cta-lg" onClick={scrollToForm}>
                Start Listing — Free <ArrowRight size={18} />
              </button>
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
            <p className="text-muted">From form to live listing — we handle the heavy lifting for you.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon"><Clock size={24} /></div>
              <h3 className="step-title">1. Fill the Form</h3>
              <p className="step-desc">Share a few details about your land. Takes about 2 minutes — no documents needed to start.</p>
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

      {/* 5. Listing Form */}
      <section id="listing-form" className="section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">List Your Property in 2 Minutes</h2>
            <p className="text-muted">Our team will verify and publish your listing within 24 hours.</p>
          </div>

          <div className="sell-form-wrap">
            <form className="listing-form" onSubmit={handleSubmit} noValidate>
              {submitError && <div className="sell-form-error-banner">{submitError}</div>}

              <input type="hidden" name="utm_source" value={utms.utm_source} />
              <input type="hidden" name="utm_medium" value={utms.utm_medium} />
              <input type="hidden" name="utm_campaign" value={utms.utm_campaign} />

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name <span className="sell-req">*</span></label>
                  <input className={`form-input ${errors.fullName ? 'has-error' : ''}`} type="text" name="fullName"
                    value={formData.fullName} onChange={handleChange} placeholder="e.g. Rahul Sharma" />
                  {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label>Mobile Number <span className="sell-req">*</span></label>
                  <div className="sell-phone">
                    <span className="sell-phone-prefix">+91</span>
                    <input className={`form-input ${errors.mobileNumber ? 'has-error' : ''}`} type="tel" name="mobileNumber"
                      value={formData.mobileNumber} onChange={handleChange} placeholder="9876543210" maxLength={10} inputMode="numeric" />
                  </div>
                  {errors.mobileNumber && <span className="form-error">{errors.mobileNumber}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Email Address <span className="sell-req">*</span></label>
                <input className={`form-input ${errors.emailAddress ? 'has-error' : ''}`} type="email" name="emailAddress"
                  value={formData.emailAddress} onChange={handleChange} placeholder="name@example.com" />
                {errors.emailAddress && <span className="form-error">{errors.emailAddress}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Property Type <span className="sell-req">*</span></label>
                  <select className={`form-input ${errors.propertyType ? 'has-error' : ''}`} name="propertyType"
                    value={formData.propertyType} onChange={handleChange}>
                    <option value="">Select type</option>
                    <option>Agricultural Land</option>
                    <option>Residential Plot</option>
                    <option>Commercial Plot</option>
                    <option>Farm Land</option>
                    <option>Other</option>
                  </select>
                  {errors.propertyType && <span className="form-error">{errors.propertyType}</span>}
                </div>
                <div className="form-group">
                  <label>Expected Price (₹) <span className="sell-req">*</span></label>
                  <input className={`form-input ${errors.expectedPrice ? 'has-error' : ''}`} type="number" name="expectedPrice"
                    value={formData.expectedPrice} onChange={handleChange} placeholder="e.g. 5000000" min="0" />
                  {errors.expectedPrice && <span className="form-error">{errors.expectedPrice}</span>}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>State <span className="sell-req">*</span></label>
                  <select className={`form-input ${errors.state ? 'has-error' : ''}`} name="state"
                    value={formData.state} onChange={handleChange}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <span className="form-error">{errors.state}</span>}
                </div>
                <div className="form-group">
                  <label>City / District <span className="sell-req">*</span></label>
                  <input className={`form-input ${errors.city ? 'has-error' : ''}`} type="text" name="city"
                    value={formData.city} onChange={handleChange} placeholder="e.g. Jaipur" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Plot Size <span className="sell-req">*</span></label>
                <div className="sell-size-row">
                  <input className={`form-input ${errors.plotSize ? 'has-error' : ''}`} type="number" name="plotSize"
                    value={formData.plotSize} onChange={handleChange} placeholder="e.g. 1500" min="0" />
                  <select className="form-input sell-unit" name="plotSizeUnit" value={formData.plotSizeUnit} onChange={handleChange}>
                    <option>Sq. Ft.</option>
                    <option>Sq. Mt.</option>
                    <option>Bigha</option>
                    <option>Acres</option>
                    <option>Guntha</option>
                  </select>
                </div>
                {errors.plotSize && <span className="form-error">{errors.plotSize}</span>}
              </div>

              <div className="form-group">
                <label>Additional Details <span className="text-muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                <textarea className="form-input" name="additionalDetails" rows={3}
                  value={formData.additionalDetails} onChange={handleChange}
                  placeholder="Describe road access, water availability, nearby landmarks..." />
              </div>

              <button type="submit" className="btn btn-accent sell-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : <>Submit My Property for Free Listing <ArrowRight size={18} /></>}
              </button>

              <p className="sell-note"><Lock size={14} /> Your details are safe. We never share your data with third parties.</p>

              <p className="sell-alt">
                Prefer to add full property details yourself?{' '}
                <a href={QUICK_LIST_URL}>List your property directly →</a>
              </p>
            </form>
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
            <button className="btn btn-accent sell-cta-lg" onClick={scrollToForm}>
              List Your Land Free <ArrowRight size={18} />
            </button>
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
                <li><a onClick={scrollToForm} style={{ cursor: 'pointer' }}>List Your Land</a></li>
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
