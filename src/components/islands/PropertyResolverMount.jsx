"use client";
import dynamic from 'next/dynamic';

const PropertyResolver = dynamic(() => import('./PropertyIsland').then(m => m.PropertyResolver), { ssr: false, loading: () => null });

export default function PropertyResolverMount() {
  return <PropertyResolver />;
}
