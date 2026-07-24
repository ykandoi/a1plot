"use client";
import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useBrokers } from '../../hooks/useBrokers';
import { useRequirements } from '../../hooks/useRequirements';
import { usePlots } from '../../hooks/usePlots';
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
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsub = onAuthStateChanged(auth, setUser);
      return () => unsub();
    }
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

  const { myBrokerProfile, saveBroker } = useBrokers(feature === 'broker-register' || feature === 'broker-dashboard' ? user?.uid : null);
  // Only subscribe to buyer requirements once the broker is APPROVED — a
  // pending/rejected broker would just get permission-denied from the rules.
  const reqMode = feature === 'broker-dashboard' && myBrokerProfile?.status === 'approved' ? 'broker' : 'none';
  const { requirements, loading: reqLoading, addRequirement } = useRequirements(reqMode, user?.uid);
  const { plots } = usePlots(initialPlots, feature === 'search');

  const shared = { user, navigate, showToast };

  return (
    <>
      {feature === 'broker-register' && <BrokerRegister {...shared} myBrokerProfile={myBrokerProfile} saveBroker={saveBroker} />}
      {feature === 'post-requirement' && <PostRequirement {...shared} addRequirement={addRequirement} />}
      {feature === 'broker-dashboard' && <BrokerDashboard {...shared} myBrokerProfile={myBrokerProfile} requirements={requirements} loading={reqLoading} />}
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
