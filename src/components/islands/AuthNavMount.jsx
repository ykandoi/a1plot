"use client";
import dynamic from 'next/dynamic';

const AuthNavIsland = dynamic(() => import('./AuthNavIsland'), { ssr: false, loading: () => null });

export default function AuthNavMount() {
  return <AuthNavIsland />;
}
