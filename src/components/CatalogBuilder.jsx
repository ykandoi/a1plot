"use client";
import React, { useState, useMemo, useRef } from 'react';
import { Search, Check, Plus, ArrowLeft, ArrowRight, Image as ImageIcon, X, Share2, Link2, FileText, MessageCircle } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const EMPTY_CUSTOM = { title: '', location: '', price: '', size: '', description: '', image: '' };

export const catalogUrl = (id) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://a1plot.com'}/catalog?id=${id}`;

// Catalogs have no user-supplied name — brokers just pick properties and send.
// This is the label the dashboard list uses so entries stay tellable apart.
export const autoLabel = (count) =>
  `${count} ${count === 1 ? 'property' : 'properties'} · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;

/**
 * CatalogBuilder — two steps, deliberately: pick properties, then send.
 *
 * Step 1 is the whole job (choose what to show), step 2 is purely the share
 * surface. There is no title/client/description form: brokers said that's
 * friction, and the catalog is identified by its link, not by metadata.
 *
 * Platform listings are stored as `plotIds` only, so a client opening the link
 * always sees the current price and status rather than a snapshot. Properties
 * the broker types in are stored inline as `customItems` — they exist nowhere
 * else.
 */
export default function CatalogBuilder({
  user, plots = [], plotsLoading, myBrokerProfile, showToast,
  editing, onSave, onCancel,
}) {
  const [step, setStep] = useState('select'); // 'select' | 'send'
  const [savedId, setSavedId] = useState(editing?.id || null);
  const [selectedIds, setSelectedIds] = useState(() => new Set(editing?.plotIds || []));
  const [customItems, setCustomItems] = useState(editing?.customItems || []);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(EMPTY_CUSTOM);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  // Only what a client should ever be shown: publicly visible, not rejected.
  // Pending listings are included so a broker can share something they've just
  // uploaded while it's still being verified.
  const shareable = useMemo(
    () => (plots || []).filter(p => p.visibility !== 'private' && p.status !== 'Rejected'),
    [plots]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shareable;
    return shareable.filter(p =>
      [p.title, p.location, p.city, p.price, p.size, p.features]
        .some(f => String(f || '').toLowerCase().includes(q))
    );
  }, [shareable, search]);

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!storage) {
      setError('Image uploads are unavailable right now. You can still add the property without a photo.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const sRef = ref(storage, `catalog/${Date.now()}_${file.name}`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      setDraft(d => ({ ...d, image: url }));
    } catch (err) {
      console.error('Catalog image upload failed:', err);
      setError('That image could not be uploaded. You can still add the property without a photo.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addCustom = () => {
    if (!draft.title.trim()) {
      setError('Give the property a title before adding it.');
      return;
    }
    setCustomItems(prev => [...prev, { ...draft, id: `custom-${Date.now()}` }]);
    setDraft(EMPTY_CUSTOM);
    setShowCustomForm(false);
    setError('');
  };

  const totalCount = selectedIds.size + customItems.length;

  // Step 1 → 2. Saving happens here so the share step always has a real link.
  const handleNext = async () => {
    setError('');
    if (totalCount === 0) { setError('Select at least one property to put in the catalog.'); return; }

    setSaving(true);
    try {
      const payload = {
        title: autoLabel(totalCount),
        plotIds: [...selectedIds],
        customItems,
        brokerUid: user.uid,
        brokerName: myBrokerProfile?.name || user.displayName || '',
        brokerPhone: myBrokerProfile?.phone || '',
        brokerEmail: myBrokerProfile?.email || user.email || '',
        brokerAgency: myBrokerProfile?.agency || '',
      };
      const id = await onSave(payload, savedId);
      setSavedId(id);
      setStep('send');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Catalog save failed:', err);
      setError(err.message || 'Could not save the catalog. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const url = savedId ? catalogUrl(savedId) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) {
      window.prompt('Copy this catalog link:', url);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Property Catalog', text: 'Here are some properties for you:', url });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // user dismissed the sheet
      }
    }
    handleCopy();
  };

  /* ── Step 2: send ──────────────────────────────────────────────────────── */
  if (step === 'send') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Check size={28} />
          </div>
          <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Catalog ready</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {totalCount} {totalCount === 1 ? 'property' : 'properties'} — share this link with anyone.
          </p>
        </div>

        <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc',
            border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.65rem 0.85rem',
            marginBottom: '1rem', overflow: 'hidden',
          }}>
            <Link2 size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
            <button type="button" className="btn btn-primary" style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={handleShare}>
              <Share2 size={16} /> Share
            </button>
            <a
              className="btn"
              href={`https://wa.me/?text=${encodeURIComponent('Here are some properties for you: ' + url)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, background: '#25d366', color: 'white', border: '1px solid #25d366' }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <button type="button" className="btn btn-outline" style={{ justifyContent: 'center', background: 'white', display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={handleCopy}>
              <Link2 size={16} /> {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a className="btn btn-outline" href={url} target="_blank" rel="noopener noreferrer" style={{ justifyContent: 'center', background: 'white', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <FileText size={16} /> Open / PDF
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline" style={{ background: 'white', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setStep('select')}>
            <ArrowLeft size={15} /> Edit properties
          </button>
          <button type="button" className="btn btn-outline" style={{ background: 'white' }} onClick={onCancel}>Done</button>
        </div>
      </div>
    );
  }

  /* ── Step 1: select ────────────────────────────────────────────────────── */
  return (
    <div>
      <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', marginBottom: '1.25rem' }} onClick={onCancel}>
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      <h2 className="section-title" style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
        {editing ? 'Edit Catalog' : 'Select Properties'}
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Tap the properties you want to include, then press Next to get a shareable link.
      </p>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem' }}>{error}</div>
      )}

      {/* ── Platform listings ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>
          Properties on A1Plot <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>({selectedIds.size} selected)</span>
        </h3>
        <div style={{ position: 'relative', minWidth: 220, flex: '0 1 300px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 32 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, city, price…" />
        </div>
      </div>

      {plotsLoading ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>Loading properties…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          {search ? 'No properties match that search.' : 'No properties available on the platform yet.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.9rem', marginBottom: '2rem' }}>
          {filtered.map(p => {
            const on = selectedIds.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                aria-pressed={on}
                style={{
                  textAlign: 'left', padding: 0, cursor: 'pointer', overflow: 'hidden',
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  border: on ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: on ? '0 0 0 3px rgba(59,122,118,0.12)' : 'var(--shadow-sm)',
                  position: 'relative', transition: 'all .15s',
                }}
              >
                {on && (
                  <span style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} />
                  </span>
                )}
                {p.image
                  ? <img src={p.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  : <div style={{ height: 120, background: '#f1f5f9' }} />}
                <div style={{ padding: '0.75rem 0.85rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: 3 }}>{p.title || 'Untitled'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>{p.location || p.city || '—'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#10b981' }}>{p.price || '—'}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>{p.size || ''}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Broker's own additions ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)' }}>
          Your Own Properties <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>({customItems.length})</span>
        </h3>
        {!showCustomForm && (
          <button type="button" className="btn btn-outline" style={{ background: 'white', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setShowCustomForm(true)}>
            <Plus size={16} /> Add a property
          </button>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1rem' }}>
        Add a property that isn't listed on A1Plot. It appears in this catalog only — it won't be published to the platform.
      </p>

      {customItems.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.9rem', marginBottom: '1rem' }}>
          {customItems.map((c, i) => (
            <div key={c.id || i} style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
              <button
                type="button"
                aria-label={`Remove ${c.title}`}
                onClick={() => setCustomItems(prev => prev.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
              {c.image
                ? <img src={c.image} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                : <div style={{ height: 120, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={22} style={{ color: '#cbd5e1' }} /></div>}
              <div style={{ padding: '0.75rem 0.85rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 3 }}>{c.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 5 }}>{c.location || '—'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#10b981' }}>{c.price || '—'}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{c.size || ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCustomForm && (
        <div className="listing-form" style={{ marginBottom: '1.5rem' }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Property Title <span style={{ color: 'var(--accent-red)' }}>*</span></label>
              <input className="form-input" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. 2 Bigha near Ajmer Road" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-input" value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Ajmer Road, Jaipur" />
            </div>
          </div>
          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label>Price</label>
              <input className="form-input" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="e.g. ₹45 Lakh" />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input className="form-input" value={draft.size} onChange={e => setDraft({ ...draft, size: e.target.value })} placeholder="e.g. 2 Bigha" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label>Description</label>
            <textarea className="form-input" rows={2} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Anything the client should know (optional)" />
          </div>
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label>Photo</label>
            <input ref={fileRef} type="file" accept="image/*" className="form-input" onChange={handleImagePick} disabled={uploading} />
            {uploading && <small style={{ color: 'var(--text-muted)' }}>Uploading…</small>}
            {draft.image && !uploading && <img src={draft.image} alt="" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={addCustom} disabled={uploading}>Add to catalog</button>
            <button type="button" className="btn btn-outline" style={{ background: 'white' }} onClick={() => { setShowCustomForm(false); setDraft(EMPTY_CUSTOM); setError(''); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Next ──────────────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', bottom: 0, background: 'white', borderTop: '1px solid var(--border-color)', padding: '1rem 0', marginTop: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }} onClick={handleNext} disabled={saving || totalCount === 0}>
          {saving ? 'Saving…' : 'Next'} <ArrowRight size={17} />
        </button>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {totalCount} selected
        </span>
      </div>
    </div>
  );
}
