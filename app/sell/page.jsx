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
  MessageCircle 
} from 'lucide-react';

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
    // Capture UTM parameters
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
    document.getElementById('listing-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Basic Validation
    if (!formData.fullName || !formData.mobileNumber || !formData.emailAddress || 
        !formData.propertyType || !formData.state || !formData.city || 
        !formData.plotSize || !formData.expectedPrice) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to Firebase
      if (db) {
        await addDoc(collection(db, 'seller_leads'), {
          ...formData,
          ...utms,
          status: 'New',
          createdAt: serverTimestamp()
        });
      } else {
        console.warn('Firebase DB is not initialized. Simulating save.');
      }

      // Track Events
      if (typeof window !== 'undefined') {
        if (window.fbq) {
          window.fbq('track', 'Lead');
        }
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
      <div className="min-h-screen flex flex-col bg-white">
        {/* Simple Nav */}
        <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 flex justify-between items-center z-50 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">A1Plot</span>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-emerald-50 rounded-full p-6 mb-6">
            <CheckCircle2 className="w-20 h-20 text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">✅ Thank you!</h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            Our team will contact you within 24 hours to complete your listing.
          </p>
          <a 
            href="https://wa.me/918306041133" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* 1. Navigation Bar */}
      <nav className="w-full bg-white py-4 px-6 md:px-12 flex justify-between items-center z-50 sticky top-0 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">A1Plot</span>
        </div>
        <button 
          onClick={scrollToForm}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm md:text-base shadow-sm"
        >
          List Your Land Free
        </button>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative bg-slate-900 py-20 md:py-32 px-6 overflow-hidden">
        {/* Background Image / Overlay Overlay */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-900 z-0" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            List Your Land Free.<br /> Reach Verified Buyers Across India.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-light">
            No brokers. No commission. Just serious buyers ready to buy your land.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-emerald-400 font-medium">
              <ShieldCheck className="w-5 h-5" />
              <span>50-Point Legal Check</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full text-emerald-400 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>RERA Verified Listings</span>
            </div>
          </div>

          <button 
            onClick={scrollToForm}
            className="bg-emerald-500 hover:bg-emerald-400 text-white text-lg md:text-xl px-10 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transform hover:-translate-y-1"
          >
            Start Listing &rarr; Free
          </button>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-16 bg-white px-6 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center relative">
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-slate-100 z-0" style={{ width: '66%', left: '16.6%' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">1. Fill the form</h3>
              <p className="text-slate-500">Takes 2 minutes</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">2. We verify your land</h3>
              <p className="text-slate-500">50-point legal check within 24 hours</p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-emerald-200">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">3. Buyers reach you</h3>
              <p className="text-slate-500">Zero brokerage, zero commission</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust Strip */}
      <section className="bg-slate-900 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-800">
          <div className="px-4">
            <div className="text-emerald-400 font-bold text-xl md:text-2xl mb-1">Zero</div>
            <div className="text-slate-400 text-sm md:text-base">Brokerage</div>
          </div>
          <div className="px-4 border-l border-slate-700">
            <div className="text-emerald-400 font-bold text-xl md:text-2xl mb-1">50-Point</div>
            <div className="text-slate-400 text-sm md:text-base">Legal Verification</div>
          </div>
          <div className="px-4 border-l border-slate-700">
            <div className="text-emerald-400 font-bold text-xl md:text-2xl mb-1">Free</div>
            <div className="text-slate-400 text-sm md:text-base">Listing</div>
          </div>
          <div className="px-4 border-l border-slate-700">
            <div className="text-emerald-400 font-bold text-xl md:text-2xl mb-1">Pan-India</div>
            <div className="text-slate-400 text-sm md:text-base">Buyer Network</div>
          </div>
        </div>
      </section>

      {/* 5. Listing Form */}
      <section id="listing-form" className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">List Your Property in 2 Minutes</h2>
            <p className="text-slate-500 text-lg">Our team will verify and publish your listing within 24 hours</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-10">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* UTM Hidden Fields */}
              <input type="hidden" name="utm_source" value={utms.utm_source} />
              <input type="hidden" name="utm_medium" value={utms.utm_medium} />
              <input type="hidden" name="utm_campaign" value={utms.utm_campaign} />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500">
                      +91
                    </span>
                    <input 
                      type="tel" 
                      name="mobileNumber" 
                      value={formData.mobileNumber} 
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-r-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <input 
                  type="email" 
                  name="emailAddress" 
                  value={formData.emailAddress} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Property Type *</label>
                  <select 
                    name="propertyType" 
                    value={formData.propertyType} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Farm Land">Farm Land</option>
                    <option value="Industrial Plot">Industrial Plot</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected Price (₹) *</label>
                  <input 
                    type="number" 
                    name="expectedPrice" 
                    value={formData.expectedPrice} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. 5000000"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                  <select 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                    required
                  >
                    <option value="">Select State</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">City / District *</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Plot Size *</label>
                <div className="flex">
                  <input 
                    type="number" 
                    name="plotSize" 
                    value={formData.plotSize} 
                    onChange={handleChange}
                    className="w-2/3 px-4 py-3 rounded-l-lg border border-r-0 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g. 1500"
                    required
                  />
                  <select 
                    name="plotSizeUnit" 
                    value={formData.plotSizeUnit} 
                    onChange={handleChange}
                    className="w-1/3 px-4 py-3 rounded-r-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-slate-50"
                  >
                    <option value="Sq. Ft.">Sq. Ft.</option>
                    <option value="Sq. Mt.">Sq. Mt.</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Acres">Acres</option>
                    <option value="Guntha">Guntha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Details (Optional)</label>
                <textarea 
                  name="additionalDetails" 
                  value={formData.additionalDetails} 
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  placeholder="Describe road access, water availability, nearby landmarks..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-lg py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit My Property for Free Listing →'
                )}
              </button>
              
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Your details are safe. We never share your data with third parties.</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 6. Why A1Plot */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Why Sell with A1Plot?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No Middlemen</h3>
              <p className="text-slate-600 leading-relaxed">
                Connect directly with verified buyers. Keep 100% of your sale price without paying any brokerage fees.
              </p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Legally Verified</h3>
              <p className="text-slate-600 leading-relaxed">
                Every listing goes through our 50-point legal check. Buyers trust verified listings more, leading to faster sales.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Free Forever</h3>
              <p className="text-slate-600 leading-relaxed">
                Listing your property on A1Plot is completely free. No hidden charges, no subscription fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-5 flex justify-between items-center">
                  <h4 className="font-semibold text-slate-800 pr-4">{faq.q}</h4>
                  <div className="text-slate-400 shrink-0">
                    {activeFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                {activeFaq === idx && (
                  <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 py-12 px-6 text-center border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <div className="bg-emerald-500 text-white p-1 rounded-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">A1Plot</span>
          </div>
          <p className="text-slate-400 text-sm mb-6 max-w-md">
            India's most trusted platform for verified premium land parcels, commercial plots, and agricultural land.
          </p>
          <div className="text-slate-500 text-xs">
            &copy; {new Date().getFullYear()} A1Plot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
