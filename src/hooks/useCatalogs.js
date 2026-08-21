import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// A Firestore instance always has a 'type' property equal to 'firestore'
const isDbReady = () => db && db.type === 'firestore';

/**
 * useCatalogs — a broker's shareable property catalogs.
 *
 * A catalog is a hand-picked set of properties a broker sends to one specific
 * client. It can mix listings that already live on the platform (`plotIds`,
 * resolved at render time so prices/status stay current) with one-off
 * properties the broker types in themselves (`customItems`, stored inline
 * because they exist nowhere else).
 *
 * Documents get Firestore auto-IDs — 20 random chars — because the doc ID *is*
 * the share link. A sequential ID would let anyone walk other brokers' client
 * catalogs.
 *
 * @param brokerUid  owner whose catalogs to subscribe to.
 * @param enabled    skip the subscription entirely when the UI isn't showing.
 */
export function useCatalogs(brokerUid, enabled = true) {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(!!(brokerUid && enabled));

  useEffect(() => {
    if (!isDbReady() || !brokerUid || !enabled) { setCatalogs([]); setLoading(false); return; }
    setLoading(true);
    const q = query(collection(db, 'catalogs'), where('brokerUid', '==', brokerUid));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCatalogs(
        snap.docs
          .map(d => ({ ...d.data(), id: d.id }))
          .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))
      );
      setLoading(false);
    }, (error) => {
      console.error('Error fetching catalogs:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [brokerUid, enabled]);

  const withTimeout = (promise, ms = 10000) =>
    Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms / 1000}s.`)), ms)
      ),
    ]);

  const createCatalog = async (data) => {
    if (!isDbReady()) throw new Error('Database unavailable.');
    // Firestore rejects undefined; round-tripping through JSON drops them.
    const clean = JSON.parse(JSON.stringify({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    const ref = await withTimeout(addDoc(collection(db, 'catalogs'), clean));
    return ref.id;
  };

  const updateCatalog = async (catalogId, data) => {
    if (!isDbReady() || !catalogId) throw new Error('Database unavailable.');
    const clean = JSON.parse(JSON.stringify({ ...data, updatedAt: Date.now() }));
    await withTimeout(updateDoc(doc(db, 'catalogs', catalogId), clean));
  };

  const deleteCatalog = async (catalogId) => {
    if (!isDbReady() || !catalogId) return;
    await withTimeout(deleteDoc(doc(db, 'catalogs', catalogId)));
  };

  return { catalogs, loading, createCatalog, updateCatalog, deleteCatalog };
}
