'use client';

import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ClipboardList, 
  Search, 
  Users, 
  Banknote, 
  Scale, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  ArrowRight,
  LandPlot
} from 'lucide-react';
import './tailwind.css';

export default function SellPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    propertyType: '',
    state: '',
    city: '',
    plotSize: '',
    plotSizeUnit: 'Sq. Ft.',
    expectedPrice: '',
    additionalDetails: ''
  });

  const [utms, setUtms] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('listing-form');
    if (formElement) {
      const y = formElement.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.fullName || !formData.mobileNumber || !formData.emailAddress || 
        !formData.propertyType || !formData.state || !formData.city || 
        !formData.plotSize || !formData.expectedPrice) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (db) {
        await addDoc(collection(db, 'seller_leads'), {
          ...formData,
          ...utms,
          status: 'New',
          createdAt: serverTimestamp()
        });
      }

      if (typeof window !== 'undefined') {
        if (window.fbq) window.fbq('track', 'Lead');
        if (window.gtag) {
          window.gtag('event', 'generate_lead', {
            event_category: 'Seller',
            event_label: 'Property Listing Submission'
          });
        } else if (window.dataLayer) {
          window.dataLayer.push({ event: 'generate_lead' });
        }
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const faqs = [
    { q: "Is listing really free?", a: "Yes. Listing your land on A1Plot is 100% free. We charge zero commission and zero brokerage." },
    { q: "How long does verification take?", a: "Our team completes the 50-point legal check within 24 hours of submission." },
    { q: "What types of land can I list?", a: "Agricultural land, residential plots, commercial plots, farm land, and industrial plots across India." },
    { q: "Will brokers contact me?", a: "No. Only verified buyers on the A1Plot platform can reach out to you directly." },
    { q: "What happens after I submit the form?", a: "Our team contacts you within 24 hours to collect documents, complete verification, and publish your listing." }
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50 py-4 px-6 flex justify-between items-center z-50 sticky top-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-1.5 rounded shadow-sm">
              <LandPlot className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">A1Plot</span>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-emerald-50 rounded-full p-8 mb-6 animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Success!</h1>
          <p className="text-xl text-slate-600 mb-10 max-w-lg">
            Your listing request has been received. Our team will contact you within 24 hours to verify and publish your land.
          </p>
          <a 
            href="https://wa.me/918306041133" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">Chat with Us on WhatsApp</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 1. Navigation Bar */}
      <nav className="w-full bg-white/90 backdrop-blur-lg py-4 px-6 md:px-12 flex justify-between items-center z-50 sticky top-0 shadow-sm border-b border-slate-200/60 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 text-white p-1.5 rounded-lg shadow-sm">
            <LandPlot className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">A1Plot</span>
        </div>
        <button 
          onClick={scrollToForm}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium transition-all text-sm md:text-base shadow-md hover:shadow-lg flex items-center gap-2"
        >
          List Your Land Free <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* 2. Hero Section - Ultra Premium */}
      <section className="relative bg-[#0B1121] py-24 md:py-36 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {/* Glowing orb effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            For Property Owners
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
            List Your Land <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">Free</span>.<br /> 
            <span className="text-slate-300 font-bold">Reach Verified Buyers.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-light leading-relaxed">
            No brokers. No commission. Just serious buyers across India ready to purchase your land directly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12 w-full">
            <button 
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 flex justify-center items-center gap-2"
            >
              Start Listing For Free <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-4 py-2 rounded-lg border border-slate-700/50">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>50-Point Legal Check</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-4 py-2 rounded-lg border border-slate-700/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>RERA Verified Listings</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Strip - Fintech Style */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-slate-100">
            <div className="px-4 text-center">
              <div className="text-slate-900 font-extrabold text-3xl md:text-4xl mb-1 tracking-tight">0%</div>
              <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Brokerage</div>
            </div>
            <div className="px-4 text-center border-l border-slate-100">
              <div className="text-slate-900 font-extrabold text-3xl md:text-4xl mb-1 tracking-tight">50</div>
              <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Point Legal Check</div>
            </div>
            <div className="px-4 text-center border-l border-slate-100">
              <div className="text-slate-900 font-extrabold text-3xl md:text-4xl mb-1 tracking-tight">Free</div>
              <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Listing</div>
            </div>
            <div className="px-4 text-center border-l border-slate-100">
              <div className="text-slate-900 font-extrabold text-3xl md:text-4xl mb-1 tracking-tight">10k+</div>
              <div className="text-slate-500 font-medium uppercase text-xs tracking-wider">Buyer Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Sell Your Land in 3 Steps</h2>
            <p className="text-lg text-slate-500">The fastest, most secure way to connect with real buyers.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 transition-transform group-hover:-translate-y-1">
                <ClipboardList className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. Fill the form</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed max-w-xs">Enter your property details in our secure form. Takes less than 2 minutes.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 transition-transform group-hover:-translate-y-1">
                <Search className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. We verify your land</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed max-w-xs">Our legal team runs a 50-point check and publishes your listing within 24 hours.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center group">
              <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 text-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 transition-transform group-hover:-translate-y-1">
                <Users className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. Buyers reach you</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed max-w-xs">Verified buyers contact you directly. You pay zero brokerage or commission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Listing Form - Premium Glass/Clean Look */}
      <section id="listing-form" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            
            <div className="w-full md:w-5/12 pt-4">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                List Your Property in <span className="text-emerald-500">2 Minutes</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                Submit your land details today. Our team will verify and publish your listing to thousands of active buyers within 24 hours.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-2 rounded-lg mt-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">100% Secure</h4>
                    <p className="text-sm text-slate-500 mt-1">Your data is encrypted and never shared with third-party marketers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-2 rounded-lg mt-1">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Always Free</h4>
                    <p className="text-sm text-slate-500 mt-1">We don't charge any upfront listing fees or back-end commissions.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
              
              {error && (
                <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="utm_source" value={utms.utm_source} />
                <input type="hidden" name="utm_medium" value={utms.utm_medium} />
                <input type="hidden" name="utm_campaign" value={utms.utm_campaign} />

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Mobile Number *</label>
                    <div className="flex relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-500 select-none">+91</span>
                      <input 
                        type="tel" 
                        name="mobileNumber" 
                        value={formData.mobileNumber} 
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                        placeholder="9876543210"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email Address *</label>
                  <input 
                    type="email" 
                    name="emailAddress" 
                    value={formData.emailAddress} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Property Type *</label>
                    <div className="relative">
                      <select 
                        name="propertyType" 
                        value={formData.propertyType} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none pr-10"
                        required
                      >
                        <option value="" disabled>Select Type</option>
                        <option value="Agricultural Land">Agricultural Land</option>
                        <option value="Residential Plot">Residential Plot</option>
                        <option value="Commercial Plot">Commercial Plot</option>
                        <option value="Farm Land">Farm Land</option>
                        <option value="Industrial Plot">Industrial Plot</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Expected Price (₹) *</label>
                    <input 
                      type="number" 
                      name="expectedPrice" 
                      value={formData.expectedPrice} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="e.g. 5000000"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">State *</label>
                    <div className="relative">
                      <select 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none pr-10"
                        required
                      >
                        <option value="" disabled>Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">City / District *</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="e.g. Jaipur"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Plot Size *</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      name="plotSize" 
                      value={formData.plotSize} 
                      onChange={handleChange}
                      className="w-2/3 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                      placeholder="e.g. 1500"
                      required
                    />
                    <div className="relative w-1/3">
                      <select 
                        name="plotSizeUnit" 
                        value={formData.plotSizeUnit} 
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none pr-8 font-medium text-slate-700"
                      >
                        <option value="Sq. Ft.">Sq. Ft.</option>
                        <option value="Sq. Mt.">Sq. Mt.</option>
                        <option value="Bigha">Bigha</option>
                        <option value="Acres">Acres</option>
                        <option value="Guntha">Guntha</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Additional Details (Optional)</label>
                  <textarea 
                    name="additionalDetails" 
                    value={formData.additionalDetails} 
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Describe road access, water availability, nearby landmarks..."
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Securely Submitting...
                      </>
                    ) : (
                      'Submit My Property for Free Listing'
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Why A1Plot */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Why Sell with A1Plot?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
                <Banknote className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">No Middlemen</h3>
              <p className="text-slate-500 leading-relaxed">
                Connect directly with verified buyers. Keep 100% of your sale price without paying any brokerage fees.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Legally Verified</h3>
              <p className="text-slate-500 leading-relaxed">
                Every listing goes through our 50-point legal check. Buyers trust verified listings more, leading to faster sales.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Free Forever</h3>
              <p className="text-slate-500 leading-relaxed">
                Listing your property on A1Plot is completely free. No hidden charges, no subscription fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${activeFaq === idx ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-md bg-white' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h4 className={`font-bold pr-4 text-lg ${activeFaq === idx ? 'text-slate-900' : 'text-slate-700'}`}>{faq.q}</h4>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeFaq === idx ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {activeFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed text-lg">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0B1121] py-16 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-500 text-white p-1.5 rounded-md shadow-lg shadow-emerald-500/20">
              <LandPlot className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">A1Plot</span>
          </div>
          <p className="text-slate-400 text-base mb-10 max-w-md leading-relaxed">
            India's most trusted platform for verified premium land parcels, commercial plots, and agricultural land.
          </p>
          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>
          <div className="text-slate-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} A1Plot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
