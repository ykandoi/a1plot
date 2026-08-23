"use client";
import { plotUrl } from '../../lib/slug';
import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '';
const LIBRARIES = ['places', 'geometry'];
const defaultCenter = { lat: 22.0, lng: 78.0 };
const mapOptions = { mapTypeId: 'hybrid', streetViewControl: false, fullscreenControl: true, gestureHandling: 'greedy' };

/**
 * BuyerMapIsland — interactive satellite map of every public listing. Rendered
 * client-side (ssr:false) beside the server-rendered listing directory. Each
 * marker links through to that property's server-rendered detail page.
 */
export default function BuyerMapIsland({ plots = [] }) {
  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });
  const [active, setActive] = useState(null);
  const withCoords = plots.filter(p => p.lat && p.lng);

  const onLoad = useCallback((map) => {
    if (withCoords.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      withCoords.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, { padding: 60 });
    }
  }, [withCoords.length]); // eslint-disable-line

  if (!isLoaded) {
    return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8eef0' }}><p style={{ color: '#64748b' }}>Loading map…</p></div>;
  }

  return (
    <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={defaultCenter} zoom={5} onLoad={onLoad} options={mapOptions}>
      {withCoords.map(p => (
        <MarkerF key={p.id} position={{ lat: p.lat, lng: p.lng }} onClick={() => setActive(p)} />
      ))}
      {active && (
        <InfoWindowF position={{ lat: active.lat, lng: active.lng }} onCloseClick={() => setActive(null)}>
          <div style={{ maxWidth: 200 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{active.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>{active.price}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 6px' }}>{active.location}</div>
            <a href={plotUrl(active)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Visit Property</a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
