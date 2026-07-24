"use client";
import dynamic from 'next/dynamic';

// Mounts a property interactive slot client-side only (ssr:false) so Firebase /
// Google Maps stay off the server. The static SEO content is server-rendered.
const PropertyIsland = dynamic(() => import('./PropertyIsland'), { ssr: false, loading: () => null });

export default function PropertyMount(props) {
  return <PropertyIsland {...props} />;
}
