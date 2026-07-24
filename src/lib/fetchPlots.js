// Server-side fetch of public plot listings for SSR / SEO.
//
// Primary path: the Firebase JS SDK (same code path that powers the live client
// app), which reads the named `default` Firestore database. Plots are
// world-readable (firestore.rules: `allow read: if true`), so this works
// unauthenticated on the server. If the SDK read fails for any reason we fall
// back to the Firestore REST API so a transient issue never blanks the page.

import { collection, getDocs, doc, getDoc, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DATABASE_ID = 'default';

const isDbReady = () => db && db.type === 'firestore';

const isPublic = (p) => p.visibility === 'public' && p.status !== 'Verification Pending' && p.status !== 'Rejected';

// ── REST fallback helpers ─────────────────────────────────────────────────────
const unwrap = (v) => {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(unwrap);
  if ('mapValue' in v) {
    const out = {}; const f = v.mapValue.fields || {};
    for (const k in f) out[k] = unwrap(f[k]);
    return out;
  }
  if ('nullValue' in v) return null;
  return undefined;
};
const parseRestDoc = (d) => {
  const fields = d.fields || {}; const out = { id: d.name.split('/').pop() };
  for (const k in fields) out[k] = unwrap(fields[k]);
  return out;
};

async function restAllPlots() {
  if (!PROJECT_ID || !API_KEY) return [];
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/plots?pageSize=300&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.documents || []).map(parseRestDoc);
}

// Cap how many docs we ever pull for a listing page. Keeps load time bounded
// no matter how many properties get listed over time, instead of fetching
// (and paying the transfer/parse cost for) the entire collection every visit.
const MAX_LISTINGS = 100;

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchPublicPlots() {
  // Try the SDK first. Filtering by visibility IN THE QUERY (rather than
  // fetching everything and discarding private/pending docs afterward) cuts
  // both the Firestore read cost and the network payload — this is what was
  // making the buy/sell listing pages slow to load.
  if (isDbReady()) {
    try {
      const q = query(collection(db, 'plots'), where('visibility', '==', 'public'), limit(MAX_LISTINGS));
      const snap = await getDocs(q);
      const rows = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      if (rows.length > 0) return rows.filter(isPublic);
    } catch (e) {
      console.error('fetchPublicPlots (SDK) failed, trying REST:', e?.code || e?.message);
    }
  }
  // REST fallback (unfiltered — only hit when the SDK path itself fails).
  try {
    return (await restAllPlots()).filter(isPublic);
  } catch (e) {
    console.error('fetchPublicPlots (REST) failed:', e);
    return [];
  }
}

export async function fetchPlotById(id) {
  if (!id) return null;
  if (isDbReady()) {
    try {
      const snap = await getDoc(doc(db, 'plots', String(id)));
      if (snap.exists()) return { ...snap.data(), id: snap.id };
    } catch (e) {
      console.error('fetchPlotById (SDK) failed, trying REST:', e?.code || e?.message);
    }
  }
  if (!PROJECT_ID || !API_KEY) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/plots/${encodeURIComponent(id)}?key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const d = await res.json();
    return d.name ? parseRestDoc(d) : null;
  } catch (e) {
    console.error('fetchPlotById (REST) failed:', e);
    return null;
  }
}
