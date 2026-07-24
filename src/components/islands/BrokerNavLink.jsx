"use client";
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useBrokers } from '../../hooks/useBrokers';

/**
 * BrokerNavLink — the "Broker" nav item needs to know whether the signed-in
 * user already has a broker profile (any status), so an existing broker gets
 * routed straight to their dashboard instead of always being bounced through
 * the registration form on every click.
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

  const { myBrokerProfile } = useBrokers(user?.uid);

  let href = '/login?redirect=/brokers/register';
  let title = 'Register Yourself as a Broker';
  if (ready && user) {
    if (myBrokerProfile) {
      href = '/broker-dashboard';
      title = 'Go to Your Broker Dashboard';
    } else {
      href = '/brokers/register';
    }
  }

  return <a href={href} className={className} title={title}>{icon} Broker</a>;
}
