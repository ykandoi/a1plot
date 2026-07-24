"use client";
import React, { useState, useEffect } from 'react';
import { UserCheck, Building2, Phone, MapPin, Briefcase, CheckCircle2, LogIn, ShieldCheck } from 'lucide-react';

/**
 * BrokerRegister — lets an authenticated user register/update a broker profile.
 * Saved to brokers/{uid}; the existence of that doc is what marks the user as a
 * broker (and unlocks the Broker Dashboard). Cities are matched to buyer
 * requirements, so brokers only see leads in areas they actually work.
 */
export default function BrokerRegister({ user, navigate, showToast, myBrokerProfile, saveBroker }) {
  const [form, setForm] = useState({ name: '', phone: '', agency: '', cities: '', areas: '', experience: '', hasRera: 'no', reraId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Prefill from an existing profile (editing) or the signed-in user's name.
  useEffect(() => {
    if (myBrokerProfile) {
      setForm({
        name: myBrokerProfile.name || '',
        phone: myBrokerProfile.phone || '',
        agency: myBrokerProfile.agency || '',
        cities: (myBrokerProfile.citiesDisplay || myBrokerProfile.cities || []).join(', '),
        areas: myBrokerProfile.areas || '',
        experience: myBrokerProfile.experience || '',
        hasRera: myBrokerProfile.reraId ? 'yes' : 'no',
        reraId: myBrokerProfile.reraId || '',
      });
    } else if (user) {
      setForm(f => ({ ...f, name: f.name || user.displayName || '', }));
    }
  }, [myBrokerProfile, user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cityList = form.cities.split(',').map(c => c.trim()).filter(Boolean);
    if (!form.name || !form.phone || cityList.length === 0) {
      setError('Please fill your name, phone, and at least one city you cover.');
      return;
    }
    setSubmitting(true);
    try {
      await saveBroker(user.uid, {
        name: form.name,
        email: user.email || '',
        phone: form.phone,
        agency: form.agency,
        cities: cityList,
        citiesDisplay: cityList,
        areas: form.areas,
        experience: form.experience,
        reraId: form.hasRera === 'yes' ? form.reraId.trim() : '',
      });
      // Notify admin (best-effort — never blocks the flow).
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'brokerRegister',
            userName: form.name,
            userEmail: user.email || '',
            userPhone: form.phone,
            agency: form.agency,
            cities: cityList.join(', '),
            experience: form.experience,
            reraId: form.hasRera === 'yes' ? form.reraId.trim() : 'Not provided',
          }),
        });
      } catch (_) {}
      setDone(true);
      // New registrations need admin approval before they can see buyer data.
      showToast && showToast(
        myBrokerProfile
          ? 'Broker profile updated.'
          : 'Application submitted! Our team will review and approve your broker account shortly.'
      );
      setTimeout(() => navigate('broker-dashboard'), 1600);
    } catch (err) {
      console.error('Broker register error:', err);
      setError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Signed-out state — prompt to log in first.
  if (!user) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560 }}>
        <div className="listing-form" style={{ textAlign: 'center' }}>
          <UserCheck size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Please log in or create an account to register as a broker and start receiving buyer leads in your area.
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
      {myBrokerProfile && (
        <p style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 600, marginBottom: '1.5rem' }}>Editing your broker profile</p>
      )}

      <form className="listing-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem' }}>{error}</div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label><UserCheck size={14} style={{ display: 'inline', marginRight: 5 }} />Full Name *</label>
            <input className="form-input" value={form.name} onChange={set('name')} placeholder="e.g. Rahul Sharma" />
          </div>
          <div className="form-group">
            <label><Phone size={14} style={{ display: 'inline', marginRight: 5 }} />Phone Number *</label>
            <input className="form-input" value={form.phone} onChange={set('phone')} placeholder="e.g. 98765 43210" />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label><Building2 size={14} style={{ display: 'inline', marginRight: 5 }} />Agency / Firm Name</label>
          <input className="form-input" value={form.agency} onChange={set('agency')} placeholder="e.g. Sharma Real Estate (optional)" />
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label><MapPin size={14} style={{ display: 'inline', marginRight: 5 }} />Cities You Cover * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
          <input className="form-input" value={form.cities} onChange={set('cities')} placeholder="e.g. Jaipur, Kota, Ajmer" />
          <small style={{ color: 'var(--text-muted)' }}>You'll receive buyer requirements posted for these cities.</small>
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label><MapPin size={14} style={{ display: 'inline', marginRight: 5 }} />Specific Areas / Localities</label>
          <textarea className="form-input" value={form.areas} onChange={set('areas')} placeholder="e.g. Sikar Road, Vaishali Nagar, Mansarovar (optional)" />
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label><Briefcase size={14} style={{ display: 'inline', marginRight: 5 }} />Years of Experience</label>
          <input className="form-input" value={form.experience} onChange={set('experience')} placeholder="e.g. 5 years (optional)" />
        </div>

        <div className="form-group" style={{ marginTop: '1.25rem' }}>
          <label><ShieldCheck size={14} style={{ display: 'inline', marginRight: 5 }} />Do you have a RERA ID?</label>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 400 }}>
              <input type="radio" name="hasRera" checked={form.hasRera === 'yes'} onChange={() => setForm(f => ({ ...f, hasRera: 'yes' }))} /> Yes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 400 }}>
              <input type="radio" name="hasRera" checked={form.hasRera === 'no'} onChange={() => setForm(f => ({ ...f, hasRera: 'no', reraId: '' }))} /> No
            </label>
          </div>
          {form.hasRera === 'yes' && (
            <input className="form-input" style={{ marginTop: '0.75rem' }} value={form.reraId} onChange={set('reraId')} placeholder="Enter your RERA Registration ID" />
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.75rem', justifyContent: 'center' }} disabled={submitting || done}>
          {done ? (<><CheckCircle2 size={18} style={{ marginRight: 6 }} /> Saved!</>) : submitting ? 'Saving…' : (myBrokerProfile ? 'Update Profile' : 'Register as Broker')}
        </button>
      </form>
    </div></section>
  );
}
