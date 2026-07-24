"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, ArrowRight, IndianRupee, Ruler, Sparkles, UserCheck } from 'lucide-react';

// Only publicly visible, non-pending, non-rejected listings are searchable.
const isPublic = (p) => p.visibility === 'public' && p.status !== 'Verification Pending' && p.status !== 'Rejected';

const matchesQuery = (plot, q) => {
  if (!q) return true;
  const hay = [plot.title, plot.location, plot.city, plot.district, plot.tehsil, plot.village, plot.state, plot.landUse, plot.badge]
    .filter(Boolean).join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every(term => hay.includes(term));
};

/**
 * SearchResults — a buyer searches a location and sees matching public listings.
 * When nothing matches, we funnel them to "Post your requirement" so brokers in
 * that city can respond.
 */
export default function SearchResults({ plots, navigate, onOpenProperty, user }) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  // Seed the search from ?q= / ?city= in the URL (e.g. deep links, ads).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || params.get('city') || params.get('location') || '';
    if (q) { setQuery(q); setSubmitted(q); }
  }, []);

  const results = useMemo(() => {
    const visible = (plots || []).filter(isPublic);
    return visible.filter(p => matchesQuery(p, submitted));
  }, [plots, submitted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  return (
    <section className="section"><div className="container">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="section-title">Search Properties</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.35rem auto 0', maxWidth: 520 }}>
          Find verified plots, land and property by city or location across India.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 640, margin: '0 auto 2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 42 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city or location e.g. Jaipur, Bikaner…"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Search</button>
      </form>

      {submitted && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {results.length} {results.length === 1 ? 'property' : 'properties'} found{submitted ? ` for "${submitted}"` : ''}.
        </p>
      )}

      {results.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {results.map(plot => (
            <div key={plot.id} onClick={() => onOpenProperty(plot)} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', cursor: 'pointer', transition: 'transform .15s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ height: 170, background: `#eef2f1 url(${plot.image || (plot.media && plot.media[0]) || ''}) center/cover no-repeat` }} />
              <div style={{ padding: '1.1rem' }}>
                {plot.badge && <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--primary)' }}>{plot.badge}</span>}
                <h3 style={{ fontSize: '1.05rem', margin: '0.25rem 0 0.5rem', color: 'var(--text-main)' }}>{plot.title}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.75rem' }}>
                  <MapPin size={14} /> {plot.location || plot.city || '—'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#10b981' }}><IndianRupee size={15} />{String(plot.price || '').replace('₹', '')}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)', fontSize: '0.85rem' }}><Ruler size={13} />{plot.size || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.5rem', maxWidth: 620, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
          <Sparkles size={38} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>
            {submitted ? `No listings yet in "${submitted}"` : 'Not finding what you want?'}
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
            Post your requirement and verified brokers covering this area will bring matching properties directly to you.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('post-requirement')}>
            Post Your Requirement <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </button>
        </div>
      )}

      {/* Broker cross-sell */}
      <div style={{ marginTop: '3rem', background: 'rgba(59,122,118,0.06)', border: '1px solid rgba(59,122,118,0.15)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', textAlign: 'center' }}>
        <UserCheck size={30} style={{ color: 'var(--primary)', margin: '0 auto 0.5rem' }} />
        <h3 style={{ margin: '0 0 0.35rem', color: 'var(--text-main)' }}>Are you a broker?</h3>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1.1rem' }}>Register to see buyers actively looking for property in your city.</p>
        <button className="btn btn-outline" onClick={() => navigate('broker-register')} style={{ background: 'white' }}>Register as a Broker</button>
      </div>
    </div></section>
  );
}
