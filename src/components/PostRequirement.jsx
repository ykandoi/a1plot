"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Home, Phone, CheckCircle2, LogIn, Send } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'land', label: 'Land / Plot' },
  { value: 'agriculture', label: 'Agricultural Land' },
  { value: 'residential', label: 'Residential (House/Flat)' },
  { value: 'commercial', label: 'Commercial' },
];

/**
 * PostRequirement — a buyer posts what they're looking for (city, type, budget).
 * Saved to the `requirements` collection. Registered brokers covering that city
 * then see the lead on their dashboard.
 */
export default function PostRequirement({ user, navigate, showToast, addRequirement }) {
  const [form, setForm] = useState({
    city: '', propertyType: 'land', transactionType: 'buy',
    budgetMin: '', budgetMax: '', name: '', phone: '', details: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) setForm(f => ({ ...f, name: f.name || user.displayName || '' }));
  }, [user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.city.trim() || !form.phone.trim()) {
      setError('Please enter the city you want to buy in and a contact phone number.');
      return;
    }
    setSubmitting(true);
    const typeLabel = (PROPERTY_TYPES.find(t => t.value === form.propertyType) || {}).label || form.propertyType;
    const budgetLabel = form.budgetMin || form.budgetMax
      ? `${form.budgetMin ? '₹' + form.budgetMin : ''}${form.budgetMin && form.budgetMax ? ' – ' : ''}${form.budgetMax ? '₹' + form.budgetMax : ''}`.trim()
      : 'Not specified';
    try {
      await addRequirement({
        buyerUid: user.uid,
        buyerName: form.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Buyer'),
        buyerEmail: user.email || '',
        buyerPhone: form.phone,
        city: form.city,
        cityDisplay: form.city.trim(),
        propertyType: form.propertyType,
        propertyTypeLabel: typeLabel,
        transactionType: form.transactionType,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        budgetLabel,
        details: form.details,
      });
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'newRequirement',
            userName: form.name || user.displayName || 'Buyer',
            userEmail: user.email || '',
            userPhone: form.phone,
            city: form.city.trim(),
            propertyType: typeLabel,
            transactionType: form.transactionType,
            budget: budgetLabel,
            details: form.details,
          }),
        });
      } catch (_) {}
      setDone(true);
      showToast && showToast('Requirement posted! Brokers in your area will reach out to you soon.');
      setTimeout(() => navigate('search'), 1500);
    } catch (err) {
      console.error('Post requirement error:', err);
      setError(err.message || 'Could not post your requirement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560 }}>
        <div className="listing-form" style={{ textAlign: 'center' }}>
          <Search size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Log in to tell us what you're looking for. Verified brokers in your city will contact you with matching options.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('login')}>
            <LogIn size={16} style={{ marginRight: 6 }} /> Log In / Sign Up
          </button>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 680 }}>

      <form className="listing-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem' }}>{error}</div>
        )}

        <div className="form-group">
          <label><MapPin size={14} style={{ display: 'inline', marginRight: 5 }} />City / Location *</label>
          <input className="form-input" value={form.city} onChange={set('city')} placeholder="e.g. Jaipur" />
        </div>

        <div className="form-grid" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label><Home size={14} style={{ display: 'inline', marginRight: 5 }} />Property Type</label>
            <select className="form-input" value={form.propertyType} onChange={set('propertyType')}>
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Looking To</label>
            <select className="form-input" value={form.transactionType} onChange={set('transactionType')}>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label><IndianRupee size={14} style={{ display: 'inline', marginRight: 5 }} />Min Budget</label>
            <input className="form-input" value={form.budgetMin} onChange={set('budgetMin')} placeholder="e.g. 50 Lakh" />
          </div>
          <div className="form-group">
            <label><IndianRupee size={14} style={{ display: 'inline', marginRight: 5 }} />Max Budget</label>
            <input className="form-input" value={form.budgetMax} onChange={set('budgetMax')} placeholder="e.g. 1 Crore" />
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: '1.25rem' }}>
          <div className="form-group">
            <label>Your Name</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label><Phone size={14} style={{ display: 'inline', marginRight: 5 }} />Contact Phone *</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="e.g. 98765 43210" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label>Additional Details</label>
          <textarea className="form-input" value={form.details} onChange={set('details')} placeholder="e.g. Corner plot preferred, near main road, ready to buy within 3 months (optional)" />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.75rem', justifyContent: 'center' }} disabled={submitting || done}>
          {done ? (<><CheckCircle2 size={18} style={{ marginRight: 6 }} /> Posted!</>) : submitting ? 'Posting…' : (<><Send size={16} style={{ marginRight: 6 }} /> Post My Requirement</>)}
        </button>
      </form>
    </div></section>
  );
}
