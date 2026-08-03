"use client";
import React, { useState, useEffect } from 'react';
import { UserCheck, Building2, Mail, MapPin, Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';
import PhoneField, { isValidPhone } from './PhoneField';

/**
 * BrokerRegister — registers/updates a broker profile.
 *
 * Registering does NOT require signing in: we collect a mandatory email +
 * phone instead, and `ensureAuth` (passed from ClientApp) quietly creates an
 * anonymous Firebase session so the brokers/{uid} write still satisfies
 * firestore.rules. The existence of that doc is what marks someone as a broker
 * (and unlocks the Broker Dashboard). Cities are matched to buyer
 * requirements, so brokers only see leads in areas they actually work.
 */
export default function BrokerRegister({ user, navigate, showToast, myBrokerProfile, saveBroker, ensureAuth }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', agency: '', cities: '', areas: '', experience: '', hasRera: 'no', reraId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Prefill from an existing profile (editing) or the signed-in user's name.
  useEffect(() => {
    if (myBrokerProfile) {
      setForm({
        name: myBrokerProfile.name || '',
        email: myBrokerProfile.email || '',
        phone: myBrokerProfile.phone || '',
        agency: myBrokerProfile.agency || '',
        cities: (myBrokerProfile.citiesDisplay || myBrokerProfile.cities || []).join(', '),
        areas: myBrokerProfile.areas || '',
        experience: myBrokerProfile.experience || '',
        hasRera: myBrokerProfile.reraId ? 'yes' : 'no',
        reraId: myBrokerProfile.reraId || '',
      });
    } else if (user && !user.isAnonymous) {
      // Signed in with a real account — seed what we already know, still editable.
      setForm(f => ({
        ...f,
        name: f.name || user.displayName || '',
        email: f.email || user.email || '',
      }));
    }
  }, [myBrokerProfile, user]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cityList = form.cities.split(',').map(c => c.trim()).filter(Boolean);
    if (!form.name || !form.email.trim() || !form.phone.trim() || cityList.length === 0) {
      setError('Please fill your name, email, phone number, and at least one city you cover.');
      return;
    }
    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid phone number, including the country code.');
      return;
    }
    setSubmitting(true);
    try {
      // No sign-in required — this creates an invisible guest session when the
      // visitor isn't logged in, so the Firestore write still has a principal.
      const authedUser = user || (ensureAuth ? await ensureAuth() : null);
      if (!authedUser?.uid) throw new Error('Could not start a session. Please try again.');

      await saveBroker(authedUser.uid, {
        name: form.name,
        email: form.email.trim(),
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
            userEmail: form.email.trim(),
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
            <label><Mail size={14} style={{ display: 'inline', marginRight: 5 }} />Email Address *</label>
            <input type="email" className="form-input" value={form.email} onChange={set('email')} placeholder="e.g. name@domain.com" />
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <PhoneField
            id="broker-phone"
            value={form.phone}
            onChange={(v) => setForm(f => ({ ...f, phone: v }))}
          />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            No account needed — buyers and our team use these to reach you.
          </p>
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
