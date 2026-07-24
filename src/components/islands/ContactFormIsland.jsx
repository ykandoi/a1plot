"use client";
import React, { useState } from 'react';

/**
 * ContactFormIsland — the interactive contact form, extracted so the /contact
 * page can be server-rendered (headings + copy) with only the form as a client
 * island. Mirrors the original handleContactSubmit flow.
 */
export default function ContactFormIsland() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'contact', userName: name, userEmail: email, userPhone: phone, message }),
      });
      // fetch() only rejects on a network failure — a 500 response still
      // resolves "successfully", so the actual result has to be checked here.
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || 'The message could not be sent. Please try again.');
      }
      setSuccess(true);
      setName(''); setEmail(''); setPhone(''); setMessage('');
      setTimeout(() => { window.location.assign('/'); }, 3000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Sorry, something went wrong sending your message. Please try again, or email us directly at support@a1plot.com.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ color: '#166534', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
        <p style={{ color: '#15803d' }}>Our agent will contact you within 24 hours. Redirecting you home…</p>
      </div>
    );
  }

  return (
    <form className="listing-form" onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem' }}>{error}</div>
      )}
      <div className="form-group mb-8">
        <label>Full Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
        <input type="text" className="form-input" placeholder="Your full name" required value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group mb-8">
        <label>Email Address <span style={{ color: 'var(--accent-red)' }}>*</span></label>
        <input type="email" className="form-input" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group mb-8">
        <label>Phone Number</label>
        <input type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="form-group mb-12">
        <label>Message</label>
        <textarea className="form-input" rows="4" placeholder="I'm interested in investing in land parcels..." value={message} onChange={e => setMessage(e.target.value)}></textarea>
      </div>
      <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
