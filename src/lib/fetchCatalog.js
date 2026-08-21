// Server-side fetch of a shared broker catalog, for the public /catalog page.
//
// Same shape as fetchPlots.js: try the Firebase JS SDK first, fall back to the
// Firestore REST API so a transient SDK problem never blanks a link a broker
// has already sent to a client. Catalogs are world-readable
// (firestore.rules: `allow read: if true`), so this works unauthenticated.

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { fetchPlotById } from './fetchPlots';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const DATABASE_ID = 'default';

const isDbReady = () => db && db.type === 'firestore';

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

async function restCatalog(id) {
  if (!PROJECT_ID || !API_KEY) return null;
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/catalogs/${encodeURIComponent(id)}?key=${API_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  const d = await res.json();
  if (!d.name) return null;
  const out = { id: d.name.split('/').pop() };
  for (const k in (d.fields || {})) out[k] = unwrap(d.fields[k]);
  return out;
}

export async function fetchCatalogById(id) {
  if (!id) return null;
  if (isDbReady()) {
    try {
      const snap = await getDoc(doc(db, 'catalogs', String(id)));
      if (snap.exists()) return { ...snap.data(), id: snap.id };
    } catch (e) {
      console.error('fetchCatalogById (SDK) failed, trying REST:', e?.code || e?.message);
    }
  }
  try {
    return await restCatalog(id);
  } catch (e) {
    console.error('fetchCatalogById (REST) failed:', e);
    return null;
  }
}

/**
 * Resolve a catalog into the full property list to render.
 *
 * Platform listings are re-read at request time rather than snapshotted into
 * the catalog, so a client opening the link always sees the current price and
 * status. Broker-typed `customItems` are stored inline — they exist nowhere
 * else. A plot that has since been deleted is skipped rather than rendering an
 * empty card.
 */
export async function fetchCatalogWithItems(id) {
  const catalog = await fetchCatalogById(id);
  if (!catalog) return null;

  const plotIds = Array.isArray(catalog.plotIds) ? catalog.plotIds : [];
  const plots = (await Promise.all(plotIds.map(pid => fetchPlotById(pid).catch(() => null))))
    .filter(Boolean)
    .map(p => ({ ...p, source: 'platform' }));

  const customItems = (Array.isArray(catalog.customItems) ? catalog.customItems : [])
    .map((c, i) => ({ ...c, id: c.id || `custom-${i}`, source: 'custom' }));

  return { catalog, items: [...plots, ...customItems] };
}
