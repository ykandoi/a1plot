"use client";

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Map, 
  Lock, 
  Zap, 
  LandPlot,
  ArrowRight,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import './tailwind.css';

export default function SellPage() {
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', emailAddress: '',
    propertyType: '', expectedPrice: '', state: '', city: '',
    plotSize: '', plotSizeUnit: 'Sq. Ft.', additionalDetails: ''
  });

  const [utms, setUtms] = useState({ utm_source: '', utm_medium: '', utm_campaign: '' });
  const [propertyValue, setPropertyValue] = useState(100); // In Lakhs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUtms({
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || ''
      });
    }
  }, []);

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

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
  };

  const brokerFee = propertyValue * 100000 * 0.02; // 2% in Rupees
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.fullName || !formData.mobileNumber || !formData.propertyType || !formData.expectedPrice || !formData.state) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (db) {
        await addDoc(collection(db, 'seller_leads'), {
          ...formData, ...utms, status: 'New', createdAt: serverTimestamp()
        });
      }
      if (typeof window !== 'undefined') {
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) window.gtag('event', 'generate_lead', { event_category: 'Seller' });
      }
      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center p-6 text-center text-white">
        <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 font-outfit">Listing Submitted!</h1>
        <p className="text-lg text-slate-400 mb-8 max-w-xl font-jakarta">
          We've received your request. Our team will contact you within 24 hours to begin the 50-point legal vetting. Want to skip the wait? List directly on the map now.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <a href="https://a1plot.com/quick-list" className="bg-emerald-500 hover:bg-emerald-400 w-full px-6 py-4 rounded-xl font-bold font-outfit text-white text-lg transition-all shadow-lg flex items-center justify-center gap-2">
            <Map className="w-5 h-5" /> Interactive Listing
          </a>
          <a href="https://wa.me/918306041133" className="bg-[#25D366] hover:bg-[#20bd5a] w-full px-6 py-4 rounded-xl font-bold font-outfit text-white text-lg transition-all shadow-lg flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5 fill-white stroke-none" /> WhatsApp Us
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .custom-range { -webkit-appearance: none; width: 100%; height: 8px; border-radius: 999px; background: #e2e8f0; outline: none; }
        .custom-range::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #10b981; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.4); cursor: pointer; }
        .bg-grid-pattern { background-image: linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px); background-size: 30px 30px; }
      `}} />

      <nav className="w-full bg-white/90 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center z-50 sticky top-0 shadow-sm border-b border-slate-200">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-slate-900 text-white p-2 rounded-xl"><LandPlot className="w-5 h-5" /></div>
          <span className="text-2xl font-extrabold text-slate-900 font-outfit">A1Plot</span>
          <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 ml-2">Seller Hub</span>
        </a>
        <a href="https://a1plot.com/quick-list" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 font-outfit shadow-md shadow-emerald-500/20">
          <Map className="w-4 h-4 hidden sm:block" /> Direct Listing
        </a>
      </nav>

      <section className="bg-[#0B132B] relative pt-20 pb-32 px-6 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 font-outfit uppercase tracking-widest">
            <span className="flex h-2.5 w-2.5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span></span>
            Direct Owner Channel
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-8 font-outfit tracking-tight">
            List Your Land Free.<br />
            <span className="text-emerald-400">Reach Verified Buyers.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl font-jakarta font-light leading-relaxed">
            Skip broker networks and 2% commission fees. Access 10,000+ verified buyers looking for agricultural, commercial, and residential plots.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full max-w-xl mx-auto">
            <a href="https://a1plot.com/quick-list" className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 font-outfit shadow-lg shadow-emerald-500/20 flex-1">
              <Map className="w-5 h-5" /> Quick List (Map)
            </a>
            <button onClick={() => document.getElementById('lead-form').scrollIntoView({behavior: 'smooth'})} className="border border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all flex justify-center items-center font-outfit flex-1">
              Request Callback
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-emerald-600 uppercase tracking-widest font-outfit">Brokerage Estimator</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-4 font-outfit tracking-tight">See Your Savings</h2>
            <p className="text-lg text-slate-500 font-jakarta">Brokers typically charge 2%. Keep that money by listing directly.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
            <div className="flex-1 bg-slate-50 border border-slate-200 p-6 sm:p-10 rounded-3xl shadow-sm">
              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider font-outfit">Estimated Value</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-outfit">{formatCurrency(propertyValue * 100000)}</span>
              </div>
              <input type="range" min="10" max="1000" step="5" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} className="custom-range mb-4" />
              <div className="flex justify-between text-xs text-slate-400 font-semibold mb-8 font-jakarta">
                <span>₹10L</span><span>₹5Cr</span><span>₹10Cr</span>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex justify-between text-sm sm:text-base text-slate-600 font-jakarta">
                  <span>Traditional Commission (2%):</span>
                  <span className="font-bold text-rose-500 line-through">{formatCurrency(brokerFee)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-slate-600 font-jakarta">
                  <span>A1Plot Platform Fee:</span>
                  <span className="font-bold text-emerald-600">₹0 (Free)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#0B132B] text-white p-6 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase rounded-full mb-6 font-outfit tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Extra Cash Saved
                </div>
                <p className="text-slate-400 font-medium text-sm font-jakarta mb-2">Money saved by avoiding brokers</p>
                <div className="text-5xl sm:text-6xl font-extrabold text-white font-outfit mb-8">{formatCurrency(brokerFee)}</div>
                <a href="https://a1plot.com/quick-list" className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all font-outfit text-lg shadow-lg">
                  Save This Money Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-100 px-6 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 font-outfit tracking-tight">The Real Difference</h2>
            <p className="text-lg text-slate-500 font-jakarta">Why thousands of owners are switching to A1Plot.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6"><HelpCircle className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">Traditional Broker</h3>
              <ul className="space-y-5 font-jakarta">
                <li className="flex gap-4"><span className="text-rose-500 font-bold">✕</span><div><strong className="block text-slate-800">2-5% Commission</strong><span className="text-slate-500 text-sm">Lose a huge chunk of your sale value.</span></div></li>
                <li className="flex gap-4"><span className="text-rose-500 font-bold">✕</span><div><strong className="block text-slate-800">Spam Calls</strong><span className="text-slate-500 text-sm">Endless calls with low-ball offers.</span></div></li>
                <li className="flex gap-4"><span className="text-rose-500 font-bold">✕</span><div><strong className="block text-slate-800">Vague Boundaries</strong><span className="text-slate-500 text-sm">No digital maps leading to disputes.</span></div></li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-500 relative">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold py-1.5 px-4 rounded-bl-xl tracking-wider font-outfit">Recommended</div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6"><Zap className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 font-outfit">The A1Plot Way</h3>
              <ul className="space-y-5 font-jakarta">
                <li className="flex gap-4"><span className="text-emerald-500 font-bold">✓</span><div><strong className="block text-slate-800">0% Brokerage</strong><span className="text-slate-500 text-sm">Keep 100% of your property's value.</span></div></li>
                <li className="flex gap-4"><span className="text-emerald-500 font-bold">✓</span><div><strong className="block text-slate-800">Verified Buyers</strong><span className="text-slate-500 text-sm">Direct connection to HNIs and institutions.</span></div></li>
                <li className="flex gap-4"><span className="text-emerald-500 font-bold">✓</span><div><strong className="block text-slate-800">Satellite Cadastral Map</strong><span className="text-slate-500 text-sm">Draw exact boundaries to build trust instantly.</span></div></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 font-outfit tracking-tight">Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <Map className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">Interactive Maps</h3>
              <p className="text-slate-500 text-sm font-jakarta">Draw precise polygon shapes of your land directly on satellite imagery.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">50-Point Check</h3>
              <p className="text-slate-500 text-sm font-jakarta">We verify Jamabandi and RERA records to build immense buyer trust.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
              <Lock className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">Secure Vault</h3>
              <p className="text-slate-500 text-sm font-jakarta">Share sensitive title deeds securely only with serious, verified buyers.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="lead-form" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 font-outfit tracking-tight">Request a Callback</h2>
            <p className="text-lg text-slate-500 font-jakarta">Or <a href="https://a1plot.com/quick-list" className="text-emerald-600 font-bold underline">list directly on the map</a> right now.</p>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-jakarta text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Mobile Number *</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10-digit mobile" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Email (Optional)</label>
                <input type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Property Type *</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta appearance-none">
                    <option value="" disabled>Select Type</option>
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Expected Price (₹) *</label>
                  <input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-outfit">Plot Size (Optional)</label>
                <div className="flex gap-2">
                  <input type="number" name="plotSize" value={formData.plotSize} onChange={handleChange} className="w-2/3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta" />
                  <select name="plotSizeUnit" value={formData.plotSizeUnit} onChange={handleChange} className="w-1/3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-jakarta font-semibold appearance-none">
                    <option value="Sq. Ft.">Sq. Ft.</option>
                    <option value="Sq. Mt.">Sq. Mt.</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Acres">Acres</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all font-outfit text-lg mt-4 shadow-lg disabled:opacity-70">
                {isSubmitting ? 'Submitting...' : 'Request Callback'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-[#080d1e] py-12 px-6 text-center text-slate-500">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-emerald-500 text-white p-1 rounded-md"><LandPlot className="w-4 h-4" /></div>
          <span className="text-xl font-bold text-white font-outfit tracking-tight">A1Plot</span>
        </div>
        <p className="text-sm font-jakarta mb-6">India's most trusted platform for verified premium land parcels.</p>
        <p className="text-xs font-jakarta uppercase tracking-wider text-slate-600">&copy; {new Date().getFullYear()} A1Plot. All rights reserved.</p>
      </footer>
    </div>
  );
}
