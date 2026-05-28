import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// A Firestore instance always has a 'type' property equal to 'firestore'
const isDbReady = () => db && db.type === 'firestore';

export function usePlots(initialSeedPlots) {
  const [plots, setPlots] = useState(() => isDbReady() ? [] : initialSeedPlots);
  const [loading, setLoading] = useState(() => !isDbReady() ? false : true);

  useEffect(() => {
    if (!isDbReady()) {
      return;
    }

    const plotsRef = collection(db, 'plots');

    // Seed database if empty
    const seedIfEmpty = async () => {
      try {
        const snapshot = await getDocs(plotsRef);
        if (snapshot.empty && initialSeedPlots && initialSeedPlots.length > 0) {
          const batch = writeBatch(db);
          initialSeedPlots.forEach((plot) => {
            const docRef = doc(plotsRef, plot.id.toString());
            batch.set(docRef, plot);
          });
          await batch.commit();
        }
      } catch (e) {
        console.error("Error seeding plots:", e);
      }
    };
    seedIfEmpty();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(plotsRef, (snapshot) => {
      const fetchedPlots = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      }));
      setPlots(fetchedPlots);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching plots:", error);
      setPlots(initialSeedPlots); // fallback
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addPlot = async (newPlotData) => {
    if (!isDbReady()) {
      console.warn("Firestore not ready — plot not saved.");
      return;
    }
    // Remove any undefined values (Firestore rejects them)
    const cleanData = JSON.parse(JSON.stringify(newPlotData));
    try {
      const plotsRef = collection(db, 'plots');
      const docRef = await addDoc(plotsRef, cleanData);
      return docRef.id;
    } catch (e) {
      console.error("Error adding plot:", e);
      throw e;
    }
  };

  const updatePlot = async (plotId, updateData) => {
    if (!isDbReady()) {
      console.warn("Firestore not ready — plot not updated.");
      return;
    }
    const cleanData = JSON.parse(JSON.stringify(updateData));
    try {
      const plotDocRef = doc(db, 'plots', plotId.toString());
      await updateDoc(plotDocRef, cleanData);
    } catch (e) {
      console.error("Error updating plot:", e);
      throw e;
    }
  };

  return { plots, loading, addPlot, updatePlot };
}
