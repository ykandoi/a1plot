import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// A Firestore instance always has a 'type' property equal to 'firestore'
const isDbReady = () => db && db.type === 'firestore';

// `enabled: false` skips the live Firestore subscription entirely — used by
// callers (like the broker/requirement islands) that render this hook
// unconditionally (rules of hooks) but only actually need plot data some of
// the time, so pages that don't show listings don't pay for a full
// `plots` collection listener.
export function usePlots(initialSeedPlots, enabled = true) {
  const [plots, setPlots] = useState(() => isDbReady() ? [] : initialSeedPlots);
  const [loading, setLoading] = useState(() => !isDbReady() || !enabled ? false : true);

  useEffect(() => {
    if (!isDbReady() || !enabled) {
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

    // One-time migration: clear any fake/placeholder document names from existing Firestore records
    const clearFakeDocuments = async () => {
      const FAKE_DOCS = new Set([
        'Title Deed', 'Patta', 'Layout Plan',
        'Khata Certificate', 'Commercial Approval', 'Tax Receipt'
      ]);
      try {
        const snapshot = await getDocs(plotsRef);
        const batch = writeBatch(db);
        let needsWrite = false;
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const docs = data.documentsAvailable || [];
          // Check if the plot still has ONLY fake placeholder names (not real uploaded files)
          // A real uploaded file would have an extension like .pdf .jpg etc.
          const hasOnlyFakeDocs = docs.length > 0 && docs.every(d => FAKE_DOCS.has(d));
          if (hasOnlyFakeDocs) {
            batch.update(docSnap.ref, { documentsAvailable: [] });
            needsWrite = true;
            console.log('Migrating plot:', docSnap.id, '— clearing fake docs:', docs);
          }
        });
        if (needsWrite) {
          await batch.commit();
          console.log('✅ Migration complete: fake document names cleared from Firestore.');
        }
      } catch (e) {
        console.error("Migration error (non-critical):", e);
      }
    };
    clearFakeDocuments();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(plotsRef, (snapshot) => {
      const fetchedPlots = snapshot.docs.map(d => {
        const data = d.data();
        // Scrub fake document names (those without file extensions) as data comes in
        if (data.documentsAvailable && Array.isArray(data.documentsAvailable)) {
          data.documentsAvailable = data.documentsAvailable.filter(doc => doc && typeof doc === 'string' && doc.includes('.'));
        }
        return {
          ...data,
          id: d.id
        };
      });
      setPlots(fetchedPlots);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching plots:", error);
      setPlots(initialSeedPlots); // fallback
      setLoading(false);
    });

    return () => unsubscribe();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper: wrap a promise with a timeout so Firestore calls don't hang forever
  const withTimeout = (promise, ms = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Firestore operation timed out after ${ms / 1000}s. Check your Firestore security rules and network connection.`)), ms)
      )
    ]);
  };

  const addPlot = async (newPlotData) => {
    if (!isDbReady()) {
      console.warn("Firestore not ready — plot not saved.");
      return;
    }
    // Remove any undefined values (Firestore rejects them)
    const cleanData = JSON.parse(JSON.stringify(newPlotData));
    const startTime = performance.now();
    try {
      const plotsRef = collection(db, 'plots');
      const docRef = await withTimeout(addDoc(plotsRef, cleanData));
      console.log(`✅ Plot added in ${((performance.now() - startTime) / 1000).toFixed(2)}s — ID: ${docRef.id}`);
      return docRef.id;
    } catch (e) {
      console.error(`❌ Error adding plot after ${((performance.now() - startTime) / 1000).toFixed(2)}s:`, e);
      throw e;
    }
  };

  const updatePlot = async (plotId, updateData) => {
    if (!isDbReady()) {
      console.warn("Firestore not ready — plot not updated.");
      return;
    }
    const cleanData = JSON.parse(JSON.stringify(updateData));
    const startTime = performance.now();
    try {
      const plotDocRef = doc(db, 'plots', plotId.toString());
      await withTimeout(updateDoc(plotDocRef, cleanData));
      console.log(`✅ Plot updated in ${((performance.now() - startTime) / 1000).toFixed(2)}s — ID: ${plotId}`);
    } catch (e) {
      console.error(`❌ Error updating plot after ${((performance.now() - startTime) / 1000).toFixed(2)}s:`, e);
      throw e;
    }
  };

  const deletePlot = async (plotId) => {
    if (!isDbReady()) {
      console.warn("Firestore not ready — plot not deleted.");
      return;
    }
    const startTime = performance.now();
    try {
      const plotDocRef = doc(db, 'plots', plotId.toString());
      await withTimeout(deleteDoc(plotDocRef));
      console.log(`🗑️ Plot deleted in ${((performance.now() - startTime) / 1000).toFixed(2)}s — ID: ${plotId}`);
    } catch (e) {
      console.error(`❌ Error deleting plot after ${((performance.now() - startTime) / 1000).toFixed(2)}s:`, e);
      throw e;
    }
  };

  return { plots, loading, addPlot, updatePlot, deletePlot };
}

