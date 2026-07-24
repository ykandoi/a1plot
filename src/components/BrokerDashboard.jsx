"use client";
import React, { useState, useMemo } from 'react';
import { MapPin, Phone, Mail, IndianRupee, Home, Clock, UserCheck, Inbox, Filter } from 'lucide-react';
import { normalizeCity } from '../hooks/useBrokers';

const timeAgo = (ts) => {
  if (!ts) return '';
  const diff = Date.now() - Number(ts);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs > 0) return `${hrs}h ago`;
  const mins = Math.floor(diff / 60000);
  return mins > 0 ? `${mins}m ago` : 'just now';
};

/**
 * BrokerDashboard — a registered broker sees buyer requirements filtered to the
 * cities they cover. `requirements` is the full open-requirements feed (loaded
 * in ClientApp via useRequirements('broker')); we filter it client-side against
 * the broker's own cities so no composite Firestore index is needed.
 */
export default function BrokerDashboard({ user, navigate, showToast, myBrokerProfile, requirements, loading }) {
  const [cityFilter, setCityFilter] = useState('all');
  const [revealed, setRevealed] = useState({}); // requirementId -> true once "Contact" clicked

  const brokerCities = useMemo(
    () => (myBrokerProfile?.cities || []).map(normalizeCity),
    [myBrokerProfile]
  );

  const matched = useMemo(() => {
    let rows = (requirements || []).filter(r => (r.status || 'open') === 'open');
    if (brokerCities.length > 0) rows = rows.filter(r => brokerCities.includes(normalizeCity(r.city)));
    if (cityFilter !== 'all') rows = rows.filter(r => normalizeCity(r.city) === cityFilter);
    return rows;
  }, [requirements, brokerCities, cityFilter]);

  const handleContact = async (req) => {
    setRevealed(prev => ({ ...prev, [req.id]: true }));
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'brokerContact',
          brokerName: myBrokerProfile?.name || user?.displayName || 'Broker',
          brokerEmail: user?.email || '',
          brokerPhone: myBrokerProfile?.phone || '',
          agency: myBrokerProfile?.agency || '',
          buyerName: req.buyerName,
          buyerEmail: req.buyerEmail,
          buyerPhone: req.buyerPhone,
          city: req.cityDisplay || req.city,
          propertyType: req.propertyTypeLabel || req.propertyType,
          budget: req.budgetLabel,
        }),
      });
    } catch (_) {}
    showToast && showToast('Buyer contact details revealed. Reach out to them directly!');
  };

  // Not signed in.
  if (!user) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="listing-form">
          <UserCheck size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>Please log in to access your broker dashboard.</p>
          <button className="btn btn-primary" onClick={() => navigate('login')}>Log In</button>
        </div>
      </div></section>
    );
  }

  // Signed in but not a registered broker yet.
  if (!myBrokerProfile) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="listing-form">
          <UserCheck size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 className="section-title">You're Not Registered as a Broker Yet</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Register your broker profile and select the cities you cover to start seeing buyer requirements in your area.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('broker-register')}>Register as Broker</button>
        </div>
      </div></section>
    );
  }

  // Registered but awaiting / denied admin approval — buyer PII stays hidden
  // until an admin approves (enforced by firestore.rules, not just this UI).
  if (myBrokerProfile.status !== 'approved') {
    const rejected = myBrokerProfile.status === 'rejected';
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="listing-form">
          <UserCheck size={40} style={{ color: rejected ? '#ef4444' : 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
            {rejected ? 'Application Not Approved' : 'Application Under Review'}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
            {rejected
              ? 'Your broker application was not approved. If you think this is a mistake, please contact our team.'
              : 'Thanks for registering! Our team is reviewing your broker application. Once approved, buyer requirements in your covered cities will appear here.'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
            Covering: <strong>{(myBrokerProfile.citiesDisplay || myBrokerProfile.cities || []).join(', ') || '—'}</strong>
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => navigate('broker-register')}>Edit Profile</button>
            {rejected && <button className="btn btn-primary" onClick={() => navigate('contact')}>Contact Us</button>}
          </div>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="section-title">Buyer Requirements in Your Area</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
          Covering: <strong>{(myBrokerProfile.citiesDisplay || myBrokerProfile.cities || []).join(', ') || '—'}</strong>
          {' · '}<a onClick={() => navigate('broker-register')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Edit areas</a>
        </p>
      </div>

      {brokerCities.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <button className={`btn ${cityFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setCityFilter('all')}>All</button>
          {(myBrokerProfile.citiesDisplay || myBrokerProfile.cities).map((c, i) => {
            const key = normalizeCity(c);
            return (
              <button key={key + i} className={`btn ${cityFilter === key ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setCityFilter(key)}>{c}</button>
            );
          })}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>Loading requirements…</p>
      ) : matched.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <Inbox size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No buyer requirements in your area yet. We'll notify you as new leads come in.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {matched.map(req => {
            const isRevealed = revealed[req.id];
            return (
              <div key={req.id} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.4rem', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(59,122,118,0.1)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: 999 }}>
                    <MapPin size={12} /> {req.cityDisplay || req.city}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    <Clock size={12} /> {timeAgo(req.createdAt)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Home size={16} style={{ color: 'var(--primary)' }} /> {req.propertyTypeLabel || req.propertyType}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>· {req.transactionType === 'rent' ? 'To Rent' : 'To Buy'}</span>
                </h3>

                <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)', fontWeight: 600, margin: '0 0 0.6rem' }}>
                  <IndianRupee size={15} style={{ color: '#10b981' }} /> {req.budgetLabel || 'Budget not specified'}
                </p>

                {req.details && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.9rem', lineHeight: 1.5 }}>{req.details}</p>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem' }}>
                  <p style={{ fontWeight: 600, margin: '0 0 0.4rem', color: 'var(--text-main)' }}>{req.buyerName || 'Buyer'}</p>
                  {isRevealed ? (
                    <div style={{ fontSize: '0.88rem' }}>
                      {req.buyerPhone && <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 0.3rem' }}><Phone size={14} style={{ color: 'var(--primary)' }} /> <a href={`tel:${req.buyerPhone}`} style={{ color: 'var(--primary)' }}>{req.buyerPhone}</a></p>}
                      {req.buyerEmail && <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Mail size={14} style={{ color: 'var(--primary)' }} /> <a href={`mailto:${req.buyerEmail}`} style={{ color: 'var(--primary)' }}>{req.buyerEmail}</a></p>}
                    </div>
                  ) : (
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }} onClick={() => handleContact(req)}>
                      <Phone size={15} style={{ marginRight: 6 }} /> Contact Buyer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div></section>
  );
}
