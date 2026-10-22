import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { ADMIN_EMAILS } from '../lib/adminEmails';
import seedData from '../data/valuationRatesSeed.json';

const isDbReady = () => db && db.type === 'firestore';

// Government-published property valuation rates (DLC rate / circle rate /
// ready reckoner rate, depending on state) backing the Price Trends map.
// Same seed-if-empty pattern as usePlots.js, with one necessary difference:
// firestore.rules requires an admin to write to this collection (unlike
// `plots`, which any signed-in/anonymous session can create into), so the
// seed attempt only runs once Firebase Auth confirms the current user IS an
// admin — attempting it as anyone else would just fail with a permission
// error on every single page load for every visitor, which is both noisy
// and pointless. A non-admin visitor only ever reads (which the rules allow
// for everyone), never attempts to write.
export function useValuationRates() {
  const [rates, setRates] = useState(() => (isDbReady() ? [] : seedData));
  const [loading, setLoading] = useState(() => isDbReady());

  useEffect(() => {
    if (!isDbReady()) return;

    const ratesRef = collection(db, 'valuationRates');

    const seedIfEmpty = async () => {
      try {
        const snapshot = await getDocs(ratesRef);
        if (snapshot.empty && seedData.length > 0) {
          // Deterministic IDs, not auto-IDs: two admin tabs loading at once
          // both see an empty collection, and with auto-IDs each wrote its own
          // full copy (this happened — every area ended up stored twice).
          // With a fixed ID per area, concurrent seeds write the same docs.
          const batch = writeBatch(db);
          seedData.forEach((rate) => {
            const id = `${rate.state}-${rate.city}-${rate.area}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            batch.set(doc(ratesRef, id), rate);
          });
          await batch.commit();
        }
      } catch (e) {
        console.error('Error seeding valuation rates:', e);
      }
    };
    const unsubscribeAuth = auth
      ? onAuthStateChanged(auth, (user) => {
          if (user?.email && ADMIN_EMAILS.includes(user.email)) seedIfEmpty();
        })
      : () => {};

    const unsubscribe = onSnapshot(ratesRef, (snapshot) => {
      setRates(snapshot.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoading(false);
    }, (error) => {
      console.error('Error fetching valuation rates:', error);
      setRates(seedData);
      setLoading(false);
    });

    return () => { unsubscribe(); unsubscribeAuth(); };
  }, []);

  const addRate = async (rateData) => {
    if (!isDbReady()) return;
    const cleanData = JSON.parse(JSON.stringify(rateData));
    const ratesRef = collection(db, 'valuationRates');
    const docRef = await addDoc(ratesRef, cleanData);
    return docRef.id;
  };

  const updateRate = async (rateId, updateData) => {
    if (!isDbReady()) return;
    const cleanData = JSON.parse(JSON.stringify(updateData));
    await updateDoc(doc(db, 'valuationRates', rateId), cleanData);
  };

  const deleteRate = async (rateId) => {
    if (!isDbReady()) return;
    await deleteDoc(doc(db, 'valuationRates', rateId));
  };

  return { rates, loading, addRate, updateRate, deleteRate };
}
