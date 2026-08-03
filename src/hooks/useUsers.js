import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// A Firestore instance always has a 'type' property equal to 'firestore'
const isDbReady = () => db && db.type === 'firestore';

/**
 * useUsers — maintains the `users` collection: a mirror of everyone who has
 * signed in.
 *
 * WHY A MIRROR: the Firebase *client* SDK can only ever see the currently
 * signed-in user — listing every account requires the Admin SDK and a service
 * account key, which this app (a static/SSR Next site with no privileged
 * backend) deliberately doesn't ship. So each user writes their own
 * users/{uid} document on sign-in, and the admin panel reads the collection.
 *
 * Consequence: a user only appears here once they have signed in at least once
 * AFTER this feature shipped. Accounts that existed before and never came back
 * won't be listed.
 *
 * @param user     the Firebase auth user object (null when signed out).
 * @param loadAll  when true (admin only), subscribe to the whole collection.
 */
export function useUsers(user, loadAll = false) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(loadAll);

  // Record / refresh this user's own profile document on every sign-in.
  // Anonymous sessions are skipped: they're the invisible guest principal
  // created for people listing a property without an account (see ensureAuth
  // in ClientApp), not real users — mirroring them would fill this directory
  // with empty throwaway rows. Guests are still fully identifiable on the
  // listing itself via `uploadedBy` (name, email, phone).
  useEffect(() => {
    if (!isDbReady() || !user?.uid || user.isAnonymous) return;
    let cancelled = false;

    (async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const existing = await getDoc(ref);
        if (cancelled) return;

        const profile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          // How they authenticated (google.com, password, …) — handy for spotting
          // which sign-in methods people actually use.
          providers: (user.providerData || []).map(p => p?.providerId).filter(Boolean),
          lastSeenAt: Date.now(),
          signInCount: (existing.exists() ? existing.data().signInCount || 0 : 0) + 1,
        };
        // createdAt is stamped once and never overwritten, so the admin panel can
        // show a true "joined" date rather than the last sign-in.
        if (!existing.exists()) {
          profile.createdAt = Number(user.metadata?.creationTime ? Date.parse(user.metadata.creationTime) : Date.now()) || Date.now();
        }
        await setDoc(ref, profile, { merge: true });
      } catch (e) {
        // Never let profile bookkeeping break sign-in — the app works fine
        // without it, the admin list just won't include this user.
        console.warn('Could not record user profile:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.uid, user?.email, user?.displayName, user?.photoURL]);

  // Admin-only: subscribe to every signed-in user.
  useEffect(() => {
    if (!isDbReady() || !loadAll) { setAllUsers([]); setLoading(false); return; }
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsers(
        snap.docs
          .map(d => ({ ...d.data(), uid: d.id }))
          .sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0))
      );
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users list:', error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadAll]);

  return { allUsers, loading };
}
