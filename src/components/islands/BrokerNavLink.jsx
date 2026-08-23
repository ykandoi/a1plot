"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseAuth';

// Loaded only once auth reports a signed-in user — see BrokerNavLinkAuthed for
// why (it pulls Firestore, which signed-out visitors have no use for).
const BrokerNavLinkAuthed = dynamic(() => import('./BrokerNavLinkAuthed'), { ssr: false, loading: () => null });

const SIGNED_OUT_HREF = '/login?redirect=/brokers/register';
const SIGNED_OUT_TITLE = 'Register Yourself as a Broker';

/**
 * BrokerNavLink — the "Broker" nav item needs to know whether the signed-in
 * user already has a broker profile (any status), so an existing broker gets
 * routed straight to their dashboard instead of always being bounced through
 * the registration form on every click.
 *
 * Anonymous sessions are treated as signed out: they are the invisible guest
 * principal created for listing without an account, and can never own a broker
 * profile, so looking one up would load Firestore to learn nothing.
 */
export default function BrokerNavLink({ className, icon }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); });
      return () => unsub();
    }
    setReady(true);
  }, []);

  if (ready && user && !user.isAnonymous) {
    return <BrokerNavLinkAuthed uid={user.uid} className={className} icon={icon} />;
  }
  return <a href={SIGNED_OUT_HREF} className={className} title={SIGNED_OUT_TITLE}>{icon} Broker</a>;
}
