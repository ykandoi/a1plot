import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeCity } from './useBrokers';

const isDbReady = () => db && db.type === 'firestore';

/**
 * useRequirements — manages the `requirements` collection (buyer "I want to buy
 * X in city Y" posts).
 *
 * Modes (pick one via the `mode` arg):
 *  - 'broker'  → load ALL open requirements (a registered broker filters these
 *                by their own cities in the UI). Firestore rules only allow this
 *                for users who have a brokers/{uid} document.
 *  - 'mine'    → load only requirements posted by `uid` (the buyer's own).
 *  - 'none'    → don't subscribe (default).
 */
export function useRequirements(mode = 'none', uid = null) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(mode !== 'none');

  useEffect(() => {
    if (!isDbReady() || mode === 'none') { setLoading(false); return; }
    if (mode === 'mine' && !uid) { setRequirements([]); setLoading(false); return; }

    const reqRef = collection(db, 'requirements');
    // 'mine' must be a constrained query so security rules pass for non-brokers.
    const q = mode === 'mine' ? query(reqRef, where('buyerUid', '==', uid)) : reqRef;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRequirements(rows);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching requirements:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [mode, uid]);

  const withTimeout = (promise, ms = 10000) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms / 1000}s.`)), ms)
      ),
    ]);

  const addRequirement = async (data) => {
    if (!isDbReady()) throw new Error('Database unavailable.');
    const clean = JSON.parse(JSON.stringify({
      ...data,
      city: normalizeCity(data.city),
      cityDisplay: String(data.cityDisplay || data.city || '').trim(),
      status: 'open',
      createdAt: Date.now(),
    }));
    const ref = await withTimeout(addDoc(collection(db, 'requirements'), clean));
    return ref.id;
  };

  const updateRequirement = async (id, data) => {
    if (!isDbReady()) return;
    await withTimeout(updateDoc(doc(db, 'requirements', String(id)), JSON.parse(JSON.stringify(data))));
  };

  const deleteRequirement = async (id) => {
    if (!isDbReady()) return;
    await withTimeout(deleteDoc(doc(db, 'requirements', String(id))));
  };

  return { requirements, loading, addRequirement, updateRequirement, deleteRequirement };
}
