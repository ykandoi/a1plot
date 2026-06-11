"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useJsApiLoader, GoogleMap, MarkerF, Autocomplete } from '@react-google-maps/api';

// ─── Firebase Init (standalone, no auth) ─────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            || 'AIzaSyC_pGezeMl4FfoQHm1cjP9OHv0qLI71SQs',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        || 'a1plot-c8f10.firebaseapp.com',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         || 'a1plot-c8f10',
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     || 'a1plot-c8f10.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|| '278480000333',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             || '1:278480000333:web:48573d0e4725099c255304',
};

const app  = getApps().find(a => a.name === 'direct-listing') || initializeApp(firebaseConfig, 'direct-listing');
const db      = getFirestore(app, 'default');
const storage = getStorage(app);

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC_pGezeMl4FfoQHm1cjP9OHv0qLI71SQs';
const MAPS_LIBS = ['places', 'geometry'];
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(file) {
  const path = `meta-leads/${Date.now()}_${file.name}`;
  const sRef = storageRef(storage, path);
  const snap = await uploadBytes(sRef, file);
  return getDownloadURL(snap.ref);
}

// ─── Styles (inline to keep file self-contained) ─────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: "'Inter', -apple-system, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  logo: { fontSize: '1.7rem', fontWeight: 800, color: '#3b7a76', letterSpacing: '-0.02em' },
  badge: {
    marginLeft: '0.75rem',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#3b7a76',
    background: 'rgba(59,122,118,0.1)',
    border: '1px solid rgba(59,122,118,0.25)',
    padding: '0.2rem 0.65rem',
    borderRadius: '999px',
  },
  main: { flex: 1 },
  hero: {
    textAlign: 'center',
    padding: '5rem 1.5rem 4rem',
    maxWidth: '680px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    padding: '0.4rem 1rem',
    borderRadius: '999px',
    marginBottom: '1.75rem',
  },
  h1: {
    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    color: '#0f172a',
    marginBottom: '1.2rem',
    letterSpacing: '-0.025em',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: '#64748b',
    lineHeight: 1.7,
    marginBottom: '2.5rem',
  },
  cta: {
    display: 'inline-block',
    background: '#3b7a76',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.1rem',
    padding: '1rem 3rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59,122,118,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    textDecoration: 'none',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    maxWidth: '680px',
    margin: '3.5rem auto 0',
    textAlign: 'left',
    padding: '2.5rem 1rem',
    borderTop: '1px solid #e2e8f0',
  },
  howItem: { padding: '0.25rem 0' },
  howNum: { fontSize: '1rem', fontWeight: 700, color: '#3b7a76', marginBottom: '0.3rem' },
  howDesc: { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 },

  // Form area
  formWrap: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem 4rem',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#64748b',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    marginBottom: '1.5rem',
    transition: 'color 0.15s',
  },
  card: {
    background: '#ffffff',
    borderRadius: '1rem',
    border: '1px solid #e2e8f0',
    padding: '2.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' },
  cardSub:   { fontSize: '0.95rem', color: '#64748b', marginBottom: '2rem' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' },
  fg: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' },
  label: { fontSize: '0.88rem', fontWeight: 600, color: '#374151' },
  requiredStar: { color: '#ef4444' },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#94a3b8',
    marginBottom: '1rem',
    marginTop: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  mapContainer: {
    borderRadius: '0.65rem',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    marginBottom: '1.25rem',
    position: 'relative',
  },
  locateBtn: {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    zIndex: 10,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#fff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
  },
  uploadArea: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.65rem',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    marginBottom: '1.25rem',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  fileTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.4rem',
    padding: '0.3rem 0.7rem',
    fontSize: '0.8rem',
    color: '#374151',
    margin: '0.3rem',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    background: '#3b7a76',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.05rem',
    border: 'none',
    borderRadius: '0.65rem',
    cursor: 'pointer',
    marginTop: '1.5rem',
    transition: 'opacity 0.15s, transform 0.15s',
    boxShadow: '0 4px 14px rgba(59,122,118,0.3)',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#b91c1c',
    fontSize: '0.88rem',
    marginBottom: '1rem',
  },
  successBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.75rem',
    padding: '2.5rem',
    textAlign: 'center',
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.82rem',
  },
};

// ─── Landing Screen ───────────────────────────────────────────────────────────
function LandingScreen({ onStart }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={S.main}>
      <div style={S.hero}>
        <div style={S.heroBadge}>⚡ No Account Required · Instant Submission</div>
        <h1 style={S.h1}>List Your Land Parcel &amp; Reach Thousands of Verified Buyers</h1>
        <p style={S.heroSub}>
          A1Plot's direct seller portal lets you register your land, agricultural plot, or commercial property 
          in under 3 minutes — no Google sign-in, no brokerage fees.
        </p>
        <button
          style={{ ...S.cta, ...(hovered ? { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(59,122,118,0.45)' } : {}) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onStart}
        >
          List Your Land Now →
        </button>

        <div style={S.howGrid}>
          <div style={S.howItem}>
            <div style={S.howNum}>1. Submit Details</div>
            <div style={S.howDesc}>Fill in property info, pinpoint the exact location on our satellite map, and upload title documents.</div>
          </div>
          <div style={S.howItem}>
            <div style={S.howNum}>2. Admin Review</div>
            <div style={S.howDesc}>Our expert team verifies your documents and approves your listing within 24–48 hours.</div>
          </div>
          <div style={S.howItem}>
            <div style={S.howNum}>3. Go Live</div>
            <div style={S.howDesc}>Your plot goes live on A1Plot's map and buyer feed — visible to thousands of serious investors.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Listing Form ─────────────────────────────────────────────────────────────
function ListingForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    contactEmail: '', contactPhone: '',
    title: '', price: '', size: '', features: '',
    khasraNumber: '', state: '', district: '', tehsil: '', village: '',
    location: '', visibility: 'public',
  });
  const [plotLocation, setPlotLocation] = useState(INDIA_CENTER);
  const [docFiles, setDocFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY, libraries: MAPS_LIBS });

  const onPlaceSelected = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setPlotLocation({ lat, lng });
    setForm(f => ({ ...f, location: place.formatted_address || place.name || f.location }));
    if (locationInputRef.current) locationInputRef.current.value = place.formatted_address || place.name || '';
  }, []);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => {
      setPlotLocation({ lat: p.coords.latitude, lng: p.coords.longitude });
    });
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fallback = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
      const docUrls = await Promise.all(docFiles.map(uploadFile));
      const plot = {
        title:              form.title,
        price:              form.price,
        size:               form.size,
        features:           form.features,
        location:           form.location,
        khasraNumber:       form.khasraNumber,
        state:              form.state,
        district:           form.district,
        tehsil:             form.tehsil,
        village:            form.village,
        visibility:         form.visibility,
        ownerUid:           'meta-ad',
        ownerEmail:         form.contactEmail,
        ownerPhone:         form.contactPhone,
        developer:          'Meta Ads Lead',
        status:             'Verification Pending',
        badge:              'New',
        cagr:               'TBD',
        image:              fallback,
        media:              [],
        documentsAvailable: docUrls,
        lat:                plotLocation.lat,
        lng:                plotLocation.lng,
        polygonPath:        null,
        priceHistory:       [],
        investedAmount:     0,
        currentValue:       0,
        purchaseDate:       new Date().toISOString().split('T')[0],
        id:                 Date.now().toString(),
      };
      await addDoc(collection(db, 'plots'), JSON.parse(JSON.stringify(plot)));
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (focused) => ({
    ...S.input,
    borderColor: focused ? '#3b7a76' : '#d1d5db',
    boxShadow: focused ? '0 0 0 3px rgba(59,122,118,0.1)' : 'none',
  });

  const [focused, setFocused] = useState('');

  return (
    <div style={S.formWrap}>
      <button style={S.backBtn} onClick={onBack}
        onMouseEnter={e => e.currentTarget.style.color = '#3b7a76'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        ← Back to Portal Home
      </button>

      <div style={S.card}>
        <h2 style={S.cardTitle}>List Your Land Parcel</h2>
        <p style={S.cardSub}>Fill in the details below. Our admin team will verify and publish your listing within 24–48 hours.</p>

        <form onSubmit={handleSubmit}>
          {/* Contact Info */}
          <div style={S.sectionLabel}>Your Contact Information</div>
          <div style={S.twoCol}>
            <div style={S.fg}>
              <label style={S.label}>Email Address <span style={S.requiredStar}>*</span></label>
              <input
                style={inputStyle(focused === 'email')}
                type="email" required placeholder="name@example.com"
                value={form.contactEmail} onChange={set('contactEmail')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              />
            </div>
            <div style={S.fg}>
              <label style={S.label}>Phone Number <span style={S.requiredStar}>*</span></label>
              <input
                style={inputStyle(focused === 'phone')}
                type="tel" required placeholder="+91 98765 43210"
                value={form.contactPhone} onChange={set('contactPhone')}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
              />
            </div>
          </div>

          {/* Property Info */}
          <div style={S.sectionLabel}>Property Details</div>
          <div style={S.fg}>
            <label style={S.label}>Plot / Property Title <span style={S.requiredStar}>*</span></label>
            <input
              style={inputStyle(focused === 'title')}
              type="text" required placeholder="e.g. Prime Agricultural Land near NH-48"
              value={form.title} onChange={set('title')}
              onFocus={() => setFocused('title')} onBlur={() => setFocused('')}
            />
          </div>
          <div style={S.twoCol}>
            <div style={S.fg}>
              <label style={S.label}>Expected Price <span style={S.requiredStar}>*</span></label>
              <input
                style={inputStyle(focused === 'price')}
                type="text" required placeholder="₹ e.g. 45 L or 1.2 Cr"
                value={form.price} onChange={set('price')}
                onFocus={() => setFocused('price')} onBlur={() => setFocused('')}
              />
            </div>
            <div style={S.fg}>
              <label style={S.label}>Size / Area</label>
              <input
                style={inputStyle(focused === 'size')}
                type="text" placeholder="e.g. 5 Bigha or 2000 sq ft"
                value={form.size} onChange={set('size')}
                onFocus={() => setFocused('size')} onBlur={() => setFocused('')}
              />
            </div>
          </div>
          <div style={S.fg}>
            <label style={S.label}>Key Features</label>
            <input
              style={inputStyle(focused === 'features')}
              type="text" placeholder="e.g. Corner plot, road-facing, near highway, tube well"
              value={form.features} onChange={set('features')}
              onFocus={() => setFocused('features')} onBlur={() => setFocused('')}
            />
          </div>

          {/* Location */}
          <div style={S.sectionLabel}>Property Location</div>
          {isLoaded ? (
            <>
              <div style={S.fg}>
                <label style={S.label}>Search Address</label>
                <Autocomplete
                  onLoad={ac => (autocompleteRef.current = ac)}
                  onPlaceChanged={onPlaceSelected}
                  fields={['formatted_address', 'geometry', 'name']}
                >
                  <input
                    ref={locationInputRef}
                    style={{ ...inputStyle(focused === 'location'), marginBottom: '0.75rem' }}
                    type="text" placeholder="Type to search, e.g. Sarjapur Road, Bangalore"
                    defaultValue={form.location}
                    onBlur={e => { setFocused(''); setForm(f => ({ ...f, location: e.target.value })); }}
                    onFocus={() => setFocused('location')}
                  />
                </Autocomplete>
              </div>
              <div style={S.mapContainer}>
                <button type="button" style={S.locateBtn} onClick={locateMe} title="Use my location">📍</button>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '360px' }}
                  center={plotLocation}
                  zoom={14}
                  options={{
                    mapTypeId: 'hybrid',
                    disableDefaultUI: true,
                    zoomControl: true,
                    gestureHandling: 'greedy',
                  }}
                >
                  <MarkerF
                    position={plotLocation}
                    draggable
                    onDragEnd={e => setPlotLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                  />
                </GoogleMap>
              </div>
            </>
          ) : (
            <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Loading map…</div>
          )}

          {/* Khasra / Revenue Details */}
          <div style={S.sectionLabel}>Revenue / Land Record Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {[['khasraNumber', 'Khasra / Survey No.', 'e.g. 142/5'],
              ['state',        'State',               'e.g. Rajasthan'],
              ['district',     'District',            'e.g. Jaipur'],
              ['tehsil',       'Tehsil',              'e.g. Sanganer'],
              ['village',      'Village',             'e.g. Morija']].map(([key, lbl, ph]) => (
              <div key={key} style={S.fg}>
                <label style={S.label}>{lbl}</label>
                <input
                  style={inputStyle(focused === key)}
                  type="text" placeholder={ph}
                  value={form[key]} onChange={set(key)}
                  onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
                />
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={S.sectionLabel}>Upload Supporting Documents (Optional)</div>
          <div
            style={S.uploadArea}
            onClick={() => docInputRef.current?.click()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b7a76'; e.currentTarget.style.background = 'rgba(59,122,118,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = ''; }}
          >
            📎 Click to upload Title Deed, Patta, EC, or other documents
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              style={{ display: 'none' }}
              onChange={e => setDocFiles(f => [...f, ...Array.from(e.target.files)])}
            />
          </div>
          {docFiles.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              {docFiles.map((f, i) => (
                <span key={i} style={S.fileTag}>
                  📄 {f.name}
                  <button
                    type="button"
                    onClick={() => setDocFiles(arr => arr.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontWeight: 700, fontSize: '0.9rem', padding: 0, lineHeight: 1 }}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          {/* Visibility toggle */}
          <div style={{ background: '#f8fafc', borderRadius: '0.65rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: '#374151' }}>Make Listing Public After Verification</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {form.visibility === 'public' ? 'Visible to buyers on the map after admin approval.' : 'Private — only in your admin panel.'}
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={form.visibility === 'public'}
                onChange={e => setForm(f => ({ ...f, visibility: e.target.checked ? 'public' : 'private' }))}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute', inset: 0,
                background: form.visibility === 'public' ? '#3b7a76' : '#d1d5db',
                borderRadius: '999px',
                transition: 'background 0.2s',
              }} />
              <span style={{
                position: 'absolute',
                top: '3px',
                left: form.visibility === 'public' ? '25px' : '3px',
                width: '20px', height: '20px',
                background: '#fff',
                borderRadius: '50%',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </label>
          </div>

          {error && <div style={S.errorBox}>⚠️ {error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{ ...S.submitBtn, opacity: submitting ? 0.65 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Submitting…' : 'Submit for Verification →'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div style={{ maxWidth: '600px', margin: '5rem auto', padding: '0 1.5rem' }}>
      <div style={S.successBox}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>✅</div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#15803d', marginBottom: '0.75rem' }}>
          Property Submitted Successfully!
        </h2>
        <p style={{ color: '#166534', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Your land listing has been received. Our admin team will review your documents and verify the property within <strong>24–48 hours</strong>. We'll be in touch on the phone number you provided.
        </p>
        <a
          href="https://a1plot.com"
          style={{
            display: 'inline-block',
            background: '#3b7a76',
            color: '#fff',
            fontWeight: 700,
            padding: '0.85rem 2.5rem',
            borderRadius: '0.65rem',
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          Visit A1Plot.com →
        </a>
      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function DirectListPage() {
  const [step, setStep] = useState('landing'); // 'landing' | 'form' | 'success'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        input:focus { outline: none; }
      `}</style>

      <div style={S.page}>
        {/* Header — always shown */}
        <header style={S.header}>
          <span style={S.logo}>A1Plot</span>
          <span style={S.badge}>Direct Listing Portal</span>
        </header>

        {step === 'landing' && <LandingScreen onStart={() => setStep('form')} />}
        {step === 'form'    && <ListingForm onBack={() => setStep('landing')} onSuccess={() => setStep('success')} />}
        {step === 'success' && <SuccessScreen />}

        {/* Footer — always shown */}
        <footer style={S.footer}>
          <p>© {new Date().getFullYear()} A1Plot Partner Portal · All rights reserved.</p>
          <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>
            This is a secure, private land registration portal powered by A1Plot.
          </p>
        </footer>
      </div>
    </>
  );
}
