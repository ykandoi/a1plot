"use client";
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF, PolygonF } from '@react-google-maps/api';
import { auth } from '../../firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { useInterests } from '../../hooks/useInterests';

const GOOGLE_MAPS_API_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '';
const LIBRARIES = ['places', 'geometry'];

/**
 * PropertyIsland — the interactive layer for the server-rendered property page.
 * One component, three slots ('like', 'interest', 'map'), each mounted where the
 * matching static markup sits. Self-manages Firebase auth + saved interests so
 * it works standalone (outside ClientApp). Firebase stays client-side because
 * the island is mounted via next/dynamic ssr:false.
 */
export default function PropertyIsland({ plot, slot }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsub = onAuthStateChanged(auth, setUser);
      return () => unsub();
    }
  }, []);

  const { interestedPlots, addInterest, removeInterest } = useInterests(user?.uid);
  const isInterested = interestedPlots.some(p => String(p.id) === String(plot.id));

  const [contacted, setContacted] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('contacted_plots') || '[]');
      setContacted(saved.includes(plot.id));
    } catch (_) {}
  }, [plot.id]);

  // ── Slot: LIKE ─────────────────────────────────────────────────────────────
  if (slot === 'like') {
    const toggle = async () => {
      if (!user) { window.location.assign('/login'); return; }
      if (isInterested) { await removeInterest(plot.id); }
      else { await addInterest(plot); }
    };
    return (
      <button onClick={toggle} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '2rem',
        border: `1px solid ${isInterested ? '#ef4444' : '#e2e8f0'}`,
        background: isInterested ? '#fef2f2' : 'white',
        color: isInterested ? '#ef4444' : '#64748b',
        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
      }}>
        <Heart size={18} fill={isInterested ? '#ef4444' : 'none'} />
        {isInterested ? 'Liked' : 'Like Property'}
      </button>
    );
  }

  // ── Slot: INTEREST / CONTACT ─────────────────────────────────────────────────
  if (slot === 'interest') {
    const onClick = async () => {
      if (!user) { window.location.assign('/login'); return; }
      if (contacted) { window.location.assign('/contact'); return; }
      if (!isInterested) await addInterest(plot);
      try {
        const saved = JSON.parse(localStorage.getItem('contacted_plots') || '[]');
        if (!saved.includes(plot.id)) localStorage.setItem('contacted_plots', JSON.stringify([...saved, plot.id]));
      } catch (_) {}
      setContacted(true);
      try {
        await fetch('/api/send-email', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email, userName: user.displayName || user.email.split('@')[0],
            plotId: plot.id, plotTitle: plot.title, plotLocation: plot.location, plotPrice: plot.price, plotSize: plot.size,
          }),
        });
      } catch (_) {}
    };
    return (
      <button className={`btn ${contacted ? 'btn-accent' : 'btn-primary'}`} style={{ width: '100%' }} onClick={onClick}>
        {contacted ? 'Contact Seller' : 'Interested'}
      </button>
    );
  }

  // ── Slot: MAP ────────────────────────────────────────────────────────────────
  if (slot === 'map') return <PropertyMap plot={plot} />;

  return null;
}

/**
 * PropertyResolver — used when /property is opened WITHOUT ?id= (e.g. an in-app
 * reload that stored the id in localStorage), or sends the user home.
 *
 * Only a bare id is available here, never the plot document, so this cannot
 * build the descriptive slug itself. Handing off to the legacy /property?id=
 * route is deliberate: that route fetches the plot server-side and 308s to the
 * canonical /property/<slug>-<id>, so the user still lands on one URL.
 */
export function PropertyResolver() {
  useEffect(() => {
    try {
      const id = localStorage.getItem('selected_property_detail_id');
      window.location.replace(id ? `/property?id=${encodeURIComponent(id)}` : '/');
    } catch (_) {
      window.location.replace('/');
    }
  }, []);
  return <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>Loading property…</div>;
}

function PropertyMap({ plot }) {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });
  if (!isLoaded || !plot.lat || !plot.lng) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}><p>Loading map…</p></div>;
  }
  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: plot.lat, lng: plot.lng }} zoom={15} options={{ mapTypeId: 'hybrid', disableDefaultUI: true, zoomControl: true }}>
      <MarkerF position={{ lat: plot.lat, lng: plot.lng }} />
      {plot.polygonPath && plot.polygonPath.length >= 3 && (
        <PolygonF paths={plot.polygonPath} options={{ fillColor: '#10b981', fillOpacity: 0.35, strokeColor: '#10b981', strokeOpacity: 1, strokeWeight: 2 }} />
      )}
    </GoogleMap>
  );
}
