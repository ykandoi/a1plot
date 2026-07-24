import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

// A Firestore instance always has a 'type' property equal to 'firestore'
const isDbReady = () => db && db.type === 'firestore';

// Normalize a city name so "Jaipur ", "jaipur", "JAIPUR" all match.
export const normalizeCity = (c) => String(c || '').trim().toLowerCase();

/**
 * useBrokers — manages the `brokers` collection.
 *
 * A broker document lives at brokers/{uid}. It is created with status
 * 'pending'; an admin must approve it (status 'approved') before it grants
 * access to buyer requirements (enforced in firestore.rules). `cities` is a
 * normalized lowercase array used to match brokers to buyer requirements.
 *
 * @param uid      current user's uid — loads that user's own broker profile.
 * @param loadAll  when true (admin only), also subscribes to the whole brokers
 *                 collection so the admin panel can approve/reject applicants.
 */
export function useBrokers(uid, loadAll = false) {
  const [myBrokerProfile, setMyBrokerProfile] = useState(null);
  // Distinguishes "still checking Firestore" from "genuinely not registered" —
  // both start out as myBrokerProfile === null, and without this flag callers
  // can't tell them apart, causing a "you're not registered" flash on every
  // load even for an already-approved broker (see BrokerDashboard.jsx).
  const [myBrokerProfileLoading, setMyBrokerProfileLoading] = useState(!!uid);
  const [allBrokers, setAllBrokers] = useState([]);

  // Live subscription to the signed-in user's own broker profile.
  useEffect(() => {
    if (!isDbReady() || !uid) { setMyBrokerProfile(null); setMyBrokerProfileLoading(false); return; }
    setMyBrokerProfileLoading(true);
    const ref = doc(db, 'brokers', uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setMyBrokerProfile(snap.exists() ? { ...snap.data(), uid: snap.id } : null);
      setMyBrokerProfileLoading(false);
    }, (error) => {
      console.error('Error fetching broker profile:', error);
      setMyBrokerProfileLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  // Admin-only: subscribe to every broker profile for the approval queue.
  useEffect(() => {
    if (!isDbReady() || !loadAll) { setAllBrokers([]); return; }
    const unsubscribe = onSnapshot(collection(db, 'brokers'), (snap) => {
      setAllBrokers(
        snap.docs
          .map(d => ({ ...d.data(), uid: d.id }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      );
    }, (error) => {
      console.error('Error fetching brokers list:', error);
    });
    return () => unsubscribe();
  }, [loadAll]);

  const withTimeout = (promise, ms = 10000) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms / 1000}s.`)), ms)
      ),
    ]);

  // Create or update a broker profile. New profiles start 'pending'; on edit we
  // deliberately do NOT touch `status` (the security rules forbid an owner from
  // changing their own approval status, and merge:true preserves it).
  const saveBroker = async (brokerUid, data) => {
    if (!isDbReady() || !brokerUid) throw new Error('Not signed in or database unavailable.');
    const cities = (data.cities || []).map(normalizeCity).filter(Boolean);
    const ref = doc(db, 'brokers', brokerUid);
    const existing = await getDoc(ref);

    const clean = JSON.parse(JSON.stringify({
      ...data,
      cities,
      citiesDisplay: (data.citiesDisplay || data.cities || []).map(c => String(c).trim()).filter(Boolean),
      uid: brokerUid,
      updatedAt: Date.now(),
    }));
    // status/createdAt only set at creation — never overwritten on edit.
    if (!existing.exists()) {
      clean.status = 'pending';
      clean.createdAt = Date.now();
    }
    await withTimeout(setDoc(ref, clean, { merge: true }));
    return brokerUid;
  };

  // Admin actions — allowed only for admins by firestore.rules.
  const approveBroker = async (brokerUid) => {
    if (!isDbReady() || !brokerUid) return;
    await withTimeout(updateDoc(doc(db, 'brokers', brokerUid), { status: 'approved', reviewedAt: Date.now() }));
  };
  const rejectBroker = async (brokerUid) => {
    if (!isDbReady() || !brokerUid) return;
    await withTimeout(updateDoc(doc(db, 'brokers', brokerUid), { status: 'rejected', reviewedAt: Date.now() }));
  };

  const deleteBroker = async (brokerUid) => {
    if (!isDbReady() || !brokerUid) return;
    await withTimeout(deleteDoc(doc(db, 'brokers', brokerUid)));
  };

  return { myBrokerProfile, myBrokerProfileLoading, allBrokers, saveBroker, approveBroker, rejectBroker, deleteBroker };
}
