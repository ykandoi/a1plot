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
  LandPlot,
  TrendingUp,
  Map,
  Lock,
  Zap,
  HelpCircle
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

  // Slider State (in Lakhs) - Default 1 Crore (100 Lakhs)
  const [propertyValue, setPropertyValue] = useState(100);

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

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const calculateSavings = (value) => {
    // value is in Lakhs. Broker commission is typically 2%.
    const brokerFee = value * 0.02; // in Lakhs
    return {
      brokerFee: formatCurrency(brokerFee * 100000),
      savings: formatCurrency(brokerFee * 100000),
    };
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakh`;
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
    { q: "Is listing my land on A1Plot really free?", a: "Yes, 100% free! We do not charge listing fees or commissions. Traditional brokers charge 2% to 5% of the total deal value, but on A1Plot, you keep all of your sale profits." },
    { q: "How does A1Plot verify my land?", a: "Our internal legal experts perform a comprehensive 50-point check. We verify RERA registration status, cross-reference government Land Registry records (Bhulekh), check title clearance, and examine boundary layouts on satellite imagery. This builds immense trust and accelerates buyer decisions." },
    { q: "What types of properties can I list?", a: "You can list any land parcels including agricultural land, residential plots, commercial land, farm land, industrial plots, or institutional plots located anywhere in India." },
    { q: "Will I get spam calls from brokers?", a: "No. A1Plot is a direct buyer-to-seller marketplace. We protect your listing details and only let serious, verified buyers connect with you. Your mobile number and details are safeguarded from bulk broker calls." },
    { q: "What documents do I need to prepare?", a: "To make your listing high-trust, we recommend preparing a copy of your Title Deed, Patta / Jamabandi / Khata Uni, and any approved layout plans. Uploading these documents increases your buyer callback rates by over 400%." }
  ];

  const savingsData = calculateSavings(propertyValue);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
        {/* Simple Navbar */}
        <nav className="w-full border-b border-slate-800 bg-slate-900/50 backdrop-blur-md py-4 px-6 flex justify-between items-center z-50 sticky top-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-2 rounded-lg">
              <LandPlot className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">A1Plot</span>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl scale-125 animate-pulse"></div>
            <div className="relative bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Your Listing is Submitted!</h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed">
            Thank you for listing your property. Our legal desk will perform the initial 50-point land records check within 24 hours. We will contact you shortly to publish it live on the buyer map.
          </p>
          <a 
            href="https://wa.me/918306041133?text=Hi%20A1Plot%20team,%20I%20just%20submitted%20my%20land%20details%20for%20free%20listing." 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:-translate-y-0.5 text-lg"
          >
            <MessageCircle className="w-6 h-6 fill-white stroke-none" />
            <span>Connect with Admin on WhatsApp</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Dynamic inline styles for smooth premium visuals */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .glow-button {
          position: relative;
          overflow: hidden;
        }
        .glow-button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            rgba(255, 255, 255, 0.1) 48%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.1) 52%,
            transparent 55%
          );
          transform: rotate(-45deg) translate(-100%, -100%);
          transition: all 0.6s ease;
        }
        .glow-button:hover::after {
          transform: rotate(-45deg) translate(100%, 100%);
        }
        
        /* Interactive Calculator Slider Styling */
        .premium-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: #e2e8f0;
          outline: none;
        }
        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          border: 4px solid #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          background: #059669;
        }
        
        /* Glassmorphic border lines */
        .glass-card {
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.7);
        }
        
        .dark-glass-card {
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(15, 23, 42, 0.6);
        }
      `}} />

      {/* 1. Navigation Bar */}
      <nav className="w-full bg-white/80 backdrop-blur-md py-4 px-6 md:px-12 flex justify-between items-center z-50 sticky top-0 shadow-sm border-b border-slate-100 transition-all">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 text-white p-2 rounded-xl shadow-md shadow-slate-900/10">
            <LandPlot className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">A1Plot</span>
          <span className="hidden sm:inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
            Seller Hub
          </span>
        </div>
        <button 
          onClick={() => scrollToSection('listing-form-sec')}
          className="glow-button bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-md shadow-emerald-500/10 flex items-center gap-2"
        >
          List Your Land Free <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative bg-[#0B132B] pt-20 pb-28 md:py-36 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        
        {/* Glowing blurred orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold mb-8 tracking-wide font-outfit uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Direct Property Owner Channel
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight font-outfit">
            List Your Land Free.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              Reach Verified Buyers Directly.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-2xl text-slate-300 mb-12 max-w-3xl font-light font-jakarta leading-relaxed">
            Skip broker networks and 2-5% commission fees. Access over 10,000 verified buyers looking for agricultural, commercial, and residential plots in India.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full max-w-md">
            <button 
              onClick={() => scrollToSection('listing-form-sec')}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 flex justify-center items-center gap-2 font-outfit"
            >
              Start Free Listing <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollToSection('calculator-sec')}
              className="w-full sm:w-auto border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white bg-slate-900/50 hover:bg-slate-900 text-lg px-8 py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 font-outfit"
            >
              Calculate Brokerage Savings
            </button>
          </div>

          {/* Minimal visual stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-4xl w-full border-t border-slate-800/80 pt-10 text-left">
            <div>
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Commission Cost</h4>
              <p className="text-white text-2xl font-bold font-outfit">0% Brokerage</p>
            </div>
            <div className="border-l border-slate-800/80 pl-6">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Average Deal Speed</h4>
              <p className="text-white text-2xl font-bold font-outfit">4x Faster</p>
            </div>
            <div className="border-l border-slate-800/80 pl-6">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Buyer Base</h4>
              <p className="text-white text-2xl font-bold font-outfit">10k+ Verified</p>
            </div>
            <div className="border-l border-slate-800/80 pl-6">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Land Records Check</h4>
              <p className="text-white text-2xl font-bold font-outfit">50-Point Vetted</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Savings Calculator Section */}
      <section id="calculator-sec" className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Brokerage Savings Estimator
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              See How Much You Save
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Brokers typically charge 2% of the land sale price. Calculate your savings by listing directly on A1Plot.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Input Slider Card */}
            <div className="md:col-span-7 bg-slate-50 border border-slate-200/60 p-8 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Estimated Land Value</span>
                <span className="text-3xl font-extrabold text-emerald-600 font-outfit">{formatCurrency(propertyValue * 100000)}</span>
              </div>

              {/* Range Slider */}
              <div className="mb-8">
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="5"
                  value={propertyValue} 
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="premium-slider"
                />
                <div className="flex justify-between text-xs text-slate-400 font-semibold mt-3">
                  <span>₹10 Lakh</span>
                  <span>₹2.5 Cr</span>
                  <span>₹5 Cr</span>
                  <span>₹7.5 Cr</span>
                  <span>₹10 Cr</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200/80">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Traditional Broker Commission (Avg. 2%):</span>
                  <span className="font-bold text-red-500 line-through">{savingsData.brokerFee}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>A1Plot Listing & Service Charge:</span>
                  <span className="font-bold text-emerald-600">₹0 (Free Forever)</span>
                </div>
              </div>
            </div>

            {/* Savings Display Card */}
            <div className="md:col-span-5 bg-[#0B132B] text-white p-8 rounded-3xl relative overflow-hidden h-full flex flex-col justify-between shadow-xl">
              {/* Radial gradient background */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-2xl"></div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5" /> Extra Cash Saved
                </div>
                <h3 className="text-slate-400 font-medium text-sm mb-1">Money Saved on Listing</h3>
                <div className="text-4xl md:text-5xl font-extrabold text-white font-outfit mb-4">{savingsData.savings}</div>
                <p className="text-slate-400 text-sm leading-relaxed font-jakarta">
                  By bypassing brokers, you keep this exact amount entirely in your bank account upon sale completion.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/80">
                <button 
                  onClick={() => scrollToSection('listing-form-sec')}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 group font-outfit"
                >
                  Save This Money Now 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparison Section */}
      <section className="py-24 bg-slate-50 border-t border-b border-slate-100 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Market Analysis
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              Selling Land: The Real Difference
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Compare the traditional broker route with listing directly on India's modern land platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Broker Cards - Rose/Gray theme */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/50 shadow-sm relative">
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 font-outfit">Traditional Broker Route</h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">High Commissions</strong>
                    <span className="text-slate-500 text-xs">Lose 2% to 5% of your final sales value to agent fees.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">Broker Spam Calls</strong>
                    <span className="text-slate-500 text-xs">Endless calls from middle-men asking for low-ball bids.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">Manual Boundary Disputes</strong>
                    <span className="text-slate-500 text-xs">Vague dimensions create friction and buyer hesitation.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-0.5">✕</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">Months of Delays</strong>
                    <span className="text-slate-500 text-xs">Rely on word-of-mouth with no access to digital marketing.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* A1Plot Cards - Emerald theme */}
            <div className="bg-white p-8 rounded-3xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5 relative overflow-hidden">
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold py-1 px-4 rounded-bl-xl tracking-wider">
                Recommended
              </div>

              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 font-outfit">The A1Plot Way</h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">0% Brokerage Fees</strong>
                    <span className="text-slate-500 text-xs font-jakarta">Free to list, free to trade. Keep all your property value.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">10,000+ Direct Buyers</strong>
                    <span className="text-slate-500 text-xs font-jakarta">Get directly connected with verified HNIs and institutional buyers.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">Satellite Map Boundaries</strong>
                    <span className="text-slate-500 text-xs font-jakarta">Draw precise cadastral shapes on maps to build buyer confidence.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <div>
                    <strong className="text-slate-800 text-sm block">Smart Records Check</strong>
                    <span className="text-slate-500 text-xs font-jakarta">We run automatic public check verification (Bhulekh/RERA) for you.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Visual Listing Timeline */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Listing Workflow
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              How It Works in 24 Hours
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Your land is verified, optimized, and published to buyers in three simple phases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-slate-100 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center mb-6 font-outfit text-xl font-bold text-emerald-600">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">Submit Property Details</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Provide essential details like state, city, size, expected value, and your contact credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/50 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center mb-6 font-outfit text-xl font-bold text-emerald-600">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">50-Point Legal Vetting</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Our operations team verifies your land registry data (Jamabandi/Khata) and boundary map to ensure clean title records.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-slate-50/50 p-6 rounded-2xl border border-emerald-500/20 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 flex items-center justify-center mb-6 font-outfit text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">Published on Buyer Map</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Your land goes live on our interactive cadastral buyer map, triggering SMS/Email alerts to matching investors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Benefits & Features Grid */}
      <section className="py-24 bg-slate-50 border-t border-slate-100 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Listing Advantages
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              Everything You Need to Sell
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Powerful built-in features to make your property listings secure and trustworthy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Map className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">Satellite Cadastral Map</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Draw exact coordinate shapes directly onto hybrid maps. Let buyers visualize your access roads, shape, and surrounding landmarks easily.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">RERA & Jamabandi Sync</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Connect your state's Bhulekh land registry. Adding verified cadastral records builds buyer trust and speeds up transactions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/40 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 font-outfit">Secure Document Vault</h3>
              <p className="text-slate-500 text-xs font-jakarta leading-relaxed">
                Store blueprints, certificates, and maps securely. Grant viewing access only to matching buyers, protecting sensitive deeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Listing Form Section */}
      <section id="listing-form-sec" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Listing Form
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              List Your Property Now
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Takes less than 2 minutes. Fill in your details to start the verification process.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8 md:p-12 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
            
            {error && (
              <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="utm_source" value={utms.utm_source} />
              <input type="hidden" name="utm_medium" value={utms.utm_medium} />
              <input type="hidden" name="utm_campaign" value={utms.utm_campaign} />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mobile Number *</label>
                  <div className="flex relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 select-none text-sm">+91</span>
                    <input 
                      type="tel" 
                      name="mobileNumber" 
                      value={formData.mobileNumber} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                <input 
                  type="email" 
                  name="emailAddress" 
                  value={formData.emailAddress} 
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Property Type *</label>
                  <div className="relative">
                    <select 
                      name="propertyType" 
                      value={formData.propertyType} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none pr-10 font-jakarta text-sm"
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Expected Price (₹) *</label>
                  <input 
                    type="number" 
                    name="expectedPrice" 
                    value={formData.expectedPrice} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                    placeholder="e.g. 5000000"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">State *</label>
                  <div className="relative">
                    <select 
                      name="state" 
                      value={formData.state} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none pr-10 font-jakarta text-sm"
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City / District *</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                    placeholder="e.g. Jaipur"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Plot Size *</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    name="plotSize" 
                    value={formData.plotSize} 
                    onChange={handleChange}
                    className="w-2/3 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-jakarta text-sm"
                    placeholder="e.g. 1500"
                    required
                  />
                  <div className="relative w-1/3">
                    <select 
                      name="plotSizeUnit" 
                      value={formData.plotSizeUnit} 
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none pr-8 font-semibold text-slate-700 text-sm"
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Details (Optional)</label>
                <textarea 
                  name="additionalDetails" 
                  value={formData.additionalDetails} 
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none font-jakarta text-sm"
                  placeholder="Describe road access, water availability, nearby landmarks..."
                ></textarea>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg py-4.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center gap-2 font-outfit"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying with Registry...
                    </>
                  ) : (
                    'Submit My Land Listing (FREE)'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-4 inline-block">
              Faq
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight font-outfit">
              Questions & Answers
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-jakarta">
              Got questions? We've got responses to help you understand the direct listing model.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${activeFaq === idx ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-md bg-white' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h4 className={`font-bold pr-4 text-base md:text-lg font-outfit ${activeFaq === idx ? 'text-slate-900' : 'text-slate-700'}`}>{faq.q}</h4>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeFaq === idx ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {activeFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-slate-500 leading-relaxed text-sm md:text-base font-jakarta">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pre-footer Trust Strip */}
      <section className="bg-[#0B132B] text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-outfit">Ready to list? Save thousands in brokerage.</h2>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto font-jakarta">
            Get your plot checked by legal experts and mapped dynamically for thousands of premium active buyers across India.
          </p>
          <button 
            onClick={() => scrollToSection('listing-form-sec')}
            className="glow-button bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)] font-outfit"
          >
            Start Listing My Land
          </button>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-[#080d1e] py-16 px-6 border-t border-slate-900 text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <LandPlot className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight font-outfit">A1Plot</span>
          </div>
          <p className="text-slate-400 text-sm mb-10 max-w-md leading-relaxed font-jakarta">
            India's most trusted platform for verified premium land parcels, commercial plots, and agricultural land.
          </p>
          <div className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-8"></div>
          <div className="text-slate-600 text-xs font-semibold uppercase tracking-wider font-jakarta">
            &copy; {new Date().getFullYear()} A1Plot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
