"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const StaticFallback = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">A1Plot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="/" className="hover:text-emerald-400 transition">Home</a>
            <a href="/buyer_map" className="hover:text-emerald-400 transition">Interactive Map</a>
            <a href="/list_property" className="hover:text-emerald-400 transition">List Your Land</a>
            <a href="/contact" className="hover:text-emerald-400 transition">Contact Reps</a>
            <a href="/about_us" className="hover:text-emerald-400 transition">About Us</a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Premium Land & Plot Investments in India
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
            A1Plot brings stock-market velocity, liquidity, and transparency to Indian real estate. Discover and invest in verified premium land parcels, commercial plots, and agricultural land in Rajasthan, Bangalore, and across India with zero brokerage.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/buyer_map" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/10">
              Explore Interactive Map
            </a>
            <a href="/contact" className="border border-slate-700 hover:border-slate-600 bg-slate-800/50 px-6 py-3 rounded-lg font-semibold transition-colors">
              Speak with a Representative
            </a>
          </div>
        </section>

        {/* Verified Property Listings (Static fallback for SEO / AI bots) */}
        <section className="py-12 border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Verified Real Estate Listings</h2>
              <p className="text-slate-400">All properties undergo a rigorous 50-point legal, title, and RERA check.</p>
            </div>
            <span className="text-xs text-slate-500 mt-2 md:mt-0">Showing 5 primary seed listings</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Listing 1 */}
            <article className="border border-slate-800 bg-slate-950/40 rounded-xl p-6 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded">Institutional Patta</span>
                <span className="text-emerald-400 text-sm font-semibold">14.5% CAGR</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">SEZ Institutional Land</h3>
              <p className="text-slate-400 text-sm mb-4">Jaipur, Rajasthan, India (Khasra: 142/5)</p>
              <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-b border-slate-800/50 py-2">
                <span>Size: 18,000 m²</span>
                <span>Ready to Move</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-white">₹70 Crore</span>
                <a href="/contact?plot=1" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  Enquire Now &rarr;
                </a>
              </div>
            </article>

            {/* Listing 2 */}
            <article className="border border-slate-800 bg-slate-950/40 rounded-xl p-6 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded">Agriculture</span>
                <span className="text-emerald-400 text-sm font-semibold">12.0% CAGR</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Palada Agriculture Land</h3>
              <p className="text-slate-400 text-sm mb-4">Palada, India (Khasra: 89)</p>
              <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-b border-slate-800/50 py-2">
                <span>Size: 7.25 Bigha</span>
                <span>Ready to Move</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-white">₹7.25 Crore</span>
                <a href="/contact?plot=2" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  Enquire Now &rarr;
                </a>
              </div>
            </article>

            {/* Listing 3 */}
            <article className="border border-slate-800 bg-slate-950/40 rounded-xl p-6 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded">Agriculture</span>
                <span className="text-emerald-400 text-sm font-semibold">10.5% CAGR</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Todha Agriculture Land</h3>
              <p className="text-slate-400 text-sm mb-4">Todha, India</p>
              <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-b border-slate-800/50 py-2">
                <span>Size: 20 Bigha</span>
                <span>Ready to Move</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-white">₹1.5 Crore</span>
                <a href="/contact?plot=3" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  Enquire Now &rarr;
                </a>
              </div>
            </article>

            {/* Listing 4 */}
            <article className="border border-slate-800 bg-slate-950/40 rounded-xl p-6 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded">Commercial</span>
                <span className="text-emerald-400 text-sm font-semibold">18.0% CAGR</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sikar Road Commercial Plot</h3>
              <p className="text-slate-400 text-sm mb-4">Sikar Road, India</p>
              <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-b border-slate-800/50 py-2">
                <span>Size: 1,500 m²</span>
                <span>Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-white">₹22 Crore</span>
                <a href="/contact?plot=4" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  Enquire Now &rarr;
                </a>
              </div>
            </article>

            {/* Listing 5 */}
            <article className="border border-slate-800 bg-slate-950/40 rounded-xl p-6 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded">Agriculture</span>
                <span className="text-emerald-400 text-sm font-semibold">15.0% CAGR</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bikaner Agriculture Land</h3>
              <p className="text-slate-400 text-sm mb-4">Bikaner, India</p>
              <div className="flex justify-between text-sm text-slate-500 mb-4 border-t border-b border-slate-800/50 py-2">
                <span>Size: 100 Bigha</span>
                <span>Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-extrabold text-white">₹20 Crore</span>
                <a href="/contact?plot=5" className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1">
                  Enquire Now &rarr;
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* Brand & Vetting Features */}
        <section className="py-12 border-t border-slate-800 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">50-Point Legal Vetting</h3>
            <p className="text-slate-400 text-sm">
              Every plot undergoes a thorough verification of RERA registrations, land title deeds, and tax receipts.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Brokerage Fees</h3>
            <p className="text-slate-400 text-sm">
              We connect buyers and sellers directly. Pay no broker commissions and execute transparent digital bookings.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Math-Backed Annual Return (XIRR)</h3>
            <p className="text-slate-400 text-sm">
              Track your portfolio using Zerodha-style dashboards that calculate true XIRR returns utilizing the Newton-Raphson method.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p className="mb-2">&copy; {new Date().getFullYear()} A1Plot. All rights reserved.</p>
        <p className="text-xs">Please enable JavaScript to access the full interactive digital dashboard with map, drawing boundaries, live listings filters, and portfolio management tools.</p>
      </footer>
    </div>
  );
};

const ClientApp = dynamic(() => import('../src/ClientApp'), {
  ssr: false,
  loading: () => <StaticFallback />
});

export default function ClientWrapper() {
  return <ClientApp />;
}
