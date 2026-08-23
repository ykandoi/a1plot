"use client";
import React from 'react';
import { useBrokers } from '../../hooks/useBrokers';

/**
 * The signed-in half of BrokerNavLink, kept in its own chunk.
 *
 * useBrokers reads Firestore, and importing it pulls the Firestore SDK — grpc
 * and protobuf included, ~340KB of transfer — into whatever chunk it lands in.
 * When this lived inside BrokerNavLink itself, that cost was paid on EVERY page
 * view, including by signed-out visitors and crawlers who can never have a
 * broker profile to look up.
 *
 * BrokerNavLink now only watches auth (which is Firestore-free) and mounts this
 * lazily once it knows there is a real user, so Firestore is fetched only when
 * the answer can actually differ.
 */
export default function BrokerNavLinkAuthed({ uid, className, icon }) {
  const { myBrokerProfile } = useBrokers(uid);
  const href = myBrokerProfile ? '/broker-dashboard' : '/brokers/register';
  const title = myBrokerProfile ? 'Go to Your Broker Dashboard' : 'Register Yourself as a Broker';
  return <a href={href} className={className} title={title}>{icon} Broker</a>;
}
