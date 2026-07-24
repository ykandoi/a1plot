import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const isDbReady = () => db && db.type === 'firestore';

// `enabled: false` skips the live subscription — used by pages (like the
// seller dashboard / listing form) that render this hook unconditionally
// (rules of hooks) but never actually display interests data, so they don't
// pay for a listener they don't need.
export function useInterests(userId, enabled = true) {
  const [interestedPlots, setInterestedPlots] = useState([]);

  useEffect(() => {
    if (!isDbReady() || !userId || !enabled) {
      Promise.resolve().then(() => {
        setInterestedPlots(prev => prev.length === 0 ? prev : []);
      });
      return;
    }

    const interestsRef = collection(db, `interests/${userId}/plots`);

    const unsubscribe = onSnapshot(interestsRef, (snapshot) => {
      const fetchedInterests = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      }));
      setInterestedPlots(fetchedInterests);
    }, (error) => {
      console.error("Error fetching interests:", error);
    });

    return () => unsubscribe();
  }, [userId, enabled]);

  const addInterest = async (plot) => {
    if (!isDbReady() || !userId) return;
    try {
      const cleanPlot = JSON.parse(JSON.stringify(plot));
      const plotRef = doc(db, `interests/${userId}/plots`, plot.id.toString());
      await setDoc(plotRef, cleanPlot);
    } catch (e) {
      console.error("Error adding interest:", e);
    }
  };

  const removeInterest = async (plotId) => {
    if (!isDbReady() || !userId) return;
    try {
      const plotRef = doc(db, `interests/${userId}/plots`, plotId.toString());
      await deleteDoc(plotRef);
    } catch (e) {
      console.error("Error removing interest:", e);
    }
  };

  return { interestedPlots, addInterest, removeInterest };
}
