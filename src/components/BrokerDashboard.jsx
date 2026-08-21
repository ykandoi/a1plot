"use client";
import React, { useState, useMemo } from 'react';
import { MapPin, Phone, Mail, IndianRupee, Home, Clock, UserCheck, Inbox, Filter, Upload, Building, BookOpen, Share2, Link2, FileText, Edit3, Trash2, Plus } from 'lucide-react';
import { normalizeCity } from '../hooks/useBrokers';
import CatalogBuilder from './CatalogBuilder';

const CATALOG_URL = (id) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://a1plot.com'}/catalog?id=${id}`;

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
export default function BrokerDashboard({
  user, navigate, showToast, myBrokerProfile, profileLoading = false, requirements, loading,
  plots = [], plotsLoading = false, onViewPlot,
  catalogs = [], catalogsLoading = false, createCatalog, updateCatalog, deleteCatalog,
}) {
  const [cityFilter, setCityFilter] = useState('all');
  const [revealed, setRevealed] = useState({}); // requirementId -> true once "Contact" clicked
  // 'dashboard' | 'builder' — the builder takes over the whole view so brokers
  // can browse the full property list without a cramped modal.
  const [mode, setMode] = useState('dashboard');
  const [editingCatalog, setEditingCatalog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const brokerCities = useMemo(
    () => (myBrokerProfile?.cities || []).map(normalizeCity),
    [myBrokerProfile]
  );

  // Listings this broker uploaded. Matches on the new `uploadedBy.uid` and also
  // the older `ownerUid`, so anything they listed before this dashboard section
  // existed still shows up here.
  const myListings = useMemo(() => {
    if (!user?.uid) return [];
    return (plots || [])
      .filter(p => p.uploadedBy?.uid === user.uid || p.ownerUid === user.uid)
      .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  }, [plots, user?.uid]);

  const matched = useMemo(() => {
    let rows = (requirements || []).filter(r => (r.status || 'open') === 'open');
    if (brokerCities.length > 0) rows = rows.filter(r => brokerCities.includes(normalizeCity(r.city)));
    if (cityFilter !== 'all') rows = rows.filter(r => normalizeCity(r.city) === cityFilter);
    return rows;
  }, [requirements, brokerCities, cityFilter]);

  const openBuilder = (catalog = null) => {
    setEditingCatalog(catalog);
    setMode('builder');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCatalog = async (data) => {
    if (editingCatalog) {
      await updateCatalog(editingCatalog.id, data);
      showToast && showToast('Catalog updated.');
    } else {
      const id = await createCatalog(data);
      // Put the link on the clipboard immediately — creating a catalog is
      // almost always followed by sending it to someone.
      try { await navigator.clipboard.writeText(CATALOG_URL(id)); } catch (_) {}
      showToast && showToast('Catalog created — share link copied to your clipboard.');
    }
    setEditingCatalog(null);
    setMode('dashboard');
  };

  const handleCopyLink = async (id) => {
    const url = CATALOG_URL(id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (_) {
      window.prompt('Copy this catalog link:', url);
    }
  };

  const handleShareCatalog = async (catalog) => {
    const url = CATALOG_URL(catalog.id);
    const text = `${catalog.title} — ${(catalog.plotIds?.length || 0) + (catalog.customItems?.length || 0)} properties`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: catalog.title, text, url });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // user dismissed the sheet
      }
    }
    handleCopyLink(catalog.id);
  };

  const handleDeleteCatalog = async (catalog) => {
    const ok = window.confirm(`Delete the catalog "${catalog.title}"? Anyone you've already sent the link to will no longer be able to open it.`);
    if (!ok) return;
    try {
      await deleteCatalog(catalog.id);
      showToast && showToast('Catalog deleted.');
    } catch (_) {
      showToast && showToast('Could not delete that catalog. Please try again.');
    }
  };

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

  // Still figuring out who's asking (auth resolving, or their broker profile
  // hasn't loaded yet) — show a neutral placeholder instead of guessing wrong
  // (e.g. flashing "you're not registered" for an already-approved broker).
  if (profileLoading) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="listing-form">
          <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading your broker dashboard…</p>
        </div>
      </div></section>
    );
  }

  // No session at all and no broker profile — registering is what creates one
  // (no login required), so point them there rather than at a login screen.
  if (!user && !myBrokerProfile) {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container" style={{ maxWidth: 560, textAlign: 'center' }}>
        <div className="listing-form">
          <UserCheck size={40} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h2 className="section-title">Register as a Broker</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Add your name, email and phone number to start receiving buyer requirements in the cities you cover. No account needed.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('broker-register')}>Register as Broker</button>
        </div>
      </div></section>
    );
  }

  // Has a session but hasn't registered a broker profile yet.
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

  // The catalog builder replaces the dashboard body while it's open.
  if (mode === 'builder') {
    return (
      <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container">
        <CatalogBuilder
          user={user}
          plots={plots}
          plotsLoading={plotsLoading}
          myBrokerProfile={myBrokerProfile}
          showToast={showToast}
          editing={editingCatalog}
          onSave={handleSaveCatalog}
          onCancel={() => { setEditingCatalog(null); setMode('dashboard'); }}
        />
      </div></section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '1.5rem' }}><div className="container">
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 className="section-title">Buyer Requirements in Your Area</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
            Covering: <strong>{(myBrokerProfile.citiesDisplay || myBrokerProfile.cities || []).join(', ') || '—'}</strong>
            {' · '}<a onClick={() => navigate('broker-register')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Edit areas</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}
            onClick={() => navigate('seller-list')}
          >
            <Upload size={17} /> Upload Property
          </button>
          <button
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => openBuilder()}
          >
            <BookOpen size={17} /> Make a Catalog
          </button>
        </div>
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

      {/* ── Shareable catalogs ────────────────────────────────────────────── */}
      <div style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={22} style={{ color: 'var(--primary)' }} /> My Catalogs
              {catalogs.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>({catalogs.length})</span>}
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Handpicked property sets you can send to a client as a link or a PDF.
            </p>
          </div>
          <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white' }} onClick={() => openBuilder()}>
            <Plus size={16} /> New Catalog
          </button>
        </div>

        {catalogsLoading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0' }}>Loading catalogs…</p>
        ) : catalogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.4, color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              No catalogs yet. Build one by picking properties from the platform and adding your own.
            </p>
            <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => openBuilder()}>
              <BookOpen size={17} /> Make Your First Catalog
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {catalogs.map(cat => {
              const count = (cat.plotIds?.length || 0) + (cat.customItems?.length || 0);
              const url = CATALOG_URL(cat.id);
              return (
                <div key={cat.id} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>{cat.title}</h3>
                    <span style={{ background: 'rgba(59,122,118,0.1)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {count} {count === 1 ? 'property' : 'properties'}
                    </span>
                  </div>
                  {cat.clientName && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 0.35rem' }}>For <strong>{cat.clientName}</strong></p>
                  )}
                  <p style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 0.9rem' }}>
                    <Clock size={12} /> Updated {timeAgo(cat.updatedAt || cat.createdAt)}
                  </p>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <button className="admin-btn" style={{ background: 'var(--primary)', color: 'white', border: '1px solid var(--primary)' }} onClick={() => handleShareCatalog(cat)}>
                      <Share2 size={14} /> Share
                    </button>
                    <button className="admin-btn" style={{ background: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => handleCopyLink(cat.id)}>
                      <Link2 size={14} /> {copiedId === cat.id ? 'Copied!' : 'Copy link'}
                    </button>
                    <a className="admin-btn" href={url} target="_blank" rel="noopener noreferrer" style={{ background: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1', textDecoration: 'none' }}>
                      <FileText size={14} /> Open / PDF
                    </a>
                    <button className="admin-btn" style={{ background: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => openBuilder(cat)}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button className="admin-btn" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => handleDeleteCatalog(cat)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Properties this broker has uploaded ───────────────────────────── */}
      <div style={{ marginTop: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={22} style={{ color: 'var(--primary)' }} /> My Listings
              {myListings.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>({myListings.length})</span>}
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Properties you've uploaded. Each one is reviewed by our team before it goes live.
            </p>
          </div>
          <button
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}
            onClick={() => navigate('seller-list')}
          >
            <Upload size={16} /> Add Another
          </button>
        </div>

        {plotsLoading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem 0' }}>Loading your listings…</p>
        ) : myListings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <Building size={40} style={{ margin: '0 auto 1rem', opacity: 0.4, color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
              You haven't uploaded any properties yet. List one to start matching it against buyer requirements.
            </p>
            <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('seller-list')}>
              <Upload size={17} /> Upload Your First Property
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {myListings.map(plot => {
              const status = ['Verification Pending', 'Rejected'].includes(plot.status) ? plot.status : 'Verified';
              const statusColor = status === 'Verified' ? '#166534' : status === 'Rejected' ? '#991b1b' : '#92400e';
              const statusBg = status === 'Verified' ? '#dcfce7' : status === 'Rejected' ? '#fee2e2' : '#fef3c7';
              return (
                <div
                  key={plot.id}
                  onClick={() => onViewPlot && onViewPlot(plot)}
                  style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', cursor: onViewPlot ? 'pointer' : 'default' }}
                >
                  {plot.image && (
                    <img src={plot.image} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                  )}
                  <div style={{ padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--text-main)' }}>{plot.title || 'Untitled listing'}</h3>
                      <span style={{ padding: '0.15rem 0.55rem', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, whiteSpace: 'nowrap', background: statusBg, color: statusColor }}>
                        {status}
                      </span>
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                      <MapPin size={13} /> {plot.location || '—'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{plot.price || 'Price on request'}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{plot.size || ''}</span>
                    </div>
                    {plot.createdAt && (
                      <p style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.6rem 0 0' }}>
                        <Clock size={12} /> Listed {timeAgo(plot.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div></section>
  );
}
