"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { auth } from '../../firebaseAuth';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { useBrokers } from '../../hooks/useBrokers';
import { useRequirements } from '../../hooks/useRequirements';
import { usePlots } from '../../hooks/usePlots';
import { useCatalogs } from '../../hooks/useCatalogs';
import BrokerRegister from '../BrokerRegister';
import PostRequirement from '../PostRequirement';
import BrokerDashboard from '../BrokerDashboard';
import SearchResults from '../SearchResults';

// Maps the presentational components' internal "view" names to real routes so
// they can navigate as standalone pages (outside the ClientApp SPA).
const PATHS = {
  login: '/login',
  home: '/',
  search: '/search',
  'post-requirement': '/post-requirement',
  'broker-register': '/brokers/register',
  'broker-dashboard': '/broker-dashboard',
  'property-detail': '/property',
};

/**
 * FeatureIsland — the interactive client "island" for the SEO server pages.
 * It self-manages Firebase auth, the Firestore hooks, navigation and toasts,
 * then renders the shared presentational component for `feature`. This keeps all
 * Firebase code client-side (the island is mounted via next/dynamic ssr:false),
 * while the SEO copy around it is server-rendered.
 */
export default function FeatureIsland({ feature, initialPlots = [] }) {
  const [user, setUser] = useState(null);
  // Firebase auth takes a moment to resolve even for an already-signed-in
  // session (it has to check persisted state first) — without tracking this,
  // `user` reads as null during that window and looks identical to "signed
  // out", causing screens like BrokerDashboard to briefly show the wrong state.
  const [authReady, setAuthReady] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setAuthReady(true); });
      return () => unsub();
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const navigate = (view) => {
    if (typeof window === 'undefined') return;
    window.location.assign(PATHS[view] || '/');
  };

  const openProperty = (plot) => {
    try { localStorage.setItem('selected_property_detail_id', String(plot.id)); } catch (_) {}
    navigate('property-detail');
  };

  const showToast = (msg) => setToast(msg);

  // Mirror of ClientApp's ensureAuth: registering as a broker needs no account,
  // but firestore.rules still require a principal on create. Hands back an
  // invisible anonymous session so the write succeeds with no sign-in screen.
  const ensureAuth = async () => {
    if (user) return user;
    if (!auth || !auth.app) throw new Error('Authentication is unavailable. Please try again later.');
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error('Anonymous sign-in failed:', err);
      throw new Error(
        err?.code === 'auth/operation-not-allowed'
          ? 'Guest registration is not enabled yet. Please log in to continue.'
          : 'Could not start a guest session. Please check your connection and try again.'
      );
    }
  };

  const { myBrokerProfile, myBrokerProfileLoading, saveBroker } = useBrokers(feature === 'broker-register' || feature === 'broker-dashboard' ? user?.uid : null);
  // Only subscribe to buyer requirements once the broker is APPROVED — a
  // pending/rejected broker would just get permission-denied from the rules.
  const reqMode = feature === 'broker-dashboard' && myBrokerProfile?.status === 'approved' ? 'broker' : 'none';
  const { requirements, loading: reqLoading, addRequirement } = useRequirements(reqMode, user?.uid);
  // The broker dashboard needs the full plot list too — "My Listings" and the
  // catalog builder both read it. Without this it silently rendered an empty
  // list ("No properties available on the platform yet").
  const needsPlots = feature === 'search' || feature === 'broker-dashboard';
  const { plots, loading: plotsLoading } = usePlots(initialPlots, needsPlots);
  const { catalogs, loading: catalogsLoading, createCatalog, updateCatalog, deleteCatalog } =
    useCatalogs(user?.uid, feature === 'broker-dashboard');

  // Combined "still figuring out who's asking" signal for BrokerDashboard —
  // either auth hasn't resolved yet, or (once we know there IS a user) their
  // broker profile hasn't loaded yet.
  const brokerProfileStillResolving = !authReady || (!!user && myBrokerProfileLoading);

  const shared = { user, navigate, showToast };

  return (
    <>
      {feature === 'broker-register' && <BrokerRegister {...shared} myBrokerProfile={myBrokerProfile} saveBroker={saveBroker} ensureAuth={ensureAuth} />}
      {feature === 'post-requirement' && <PostRequirement {...shared} addRequirement={addRequirement} />}
      {feature === 'broker-dashboard' && (
        <BrokerDashboard
          {...shared}
          myBrokerProfile={myBrokerProfile}
          profileLoading={brokerProfileStillResolving}
          requirements={requirements}
          loading={reqLoading}
          plots={plots}
          plotsLoading={plotsLoading}
          onViewPlot={openProperty}
          catalogs={catalogs}
          catalogsLoading={catalogsLoading}
          createCatalog={createCatalog}
          updateCatalog={updateCatalog}
          deleteCatalog={deleteCatalog}
        />
      )}
      {feature === 'search' && <SearchResults plots={plots} navigate={navigate} user={user} showToast={showToast} onOpenProperty={openProperty} />}

      {toast && (
        <div className="toast-notification-container">
          <div className="toast-notification-card">
            <div className="toast-icon-circle"><CheckCircle2 size={18} /></div>
            <div className="toast-content">
              <div className="toast-title">A1Plot Notification</div>
              <div className="toast-desc">{toast}</div>
            </div>
            <button className="toast-close" onClick={() => setToast(null)}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}
