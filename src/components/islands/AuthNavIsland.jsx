"use client";
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { User, ChevronDown, Building, MapPin, Shield, LogOut, Menu, X } from 'lucide-react';

// Kept in sync with the admin list in firestore.rules / ClientApp.jsx.
const ADMIN_EMAILS = ['kdy20330@gmail.com', 'ykandoi20330@gmail.com'];

// Kept in sync with SiteChrome's footer links.
const SITE_LINKS = [
  { href: '/buyer_map', label: 'Buy Land' },
  { href: '/search', label: 'Search Properties' },
  { href: '/post-requirement', label: 'Post a Requirement' },
  { href: '/list_property', label: 'Sell Your Land' },
  { href: '/brokers/register', label: 'Register as a Broker' },
  { href: '/about_us', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

/**
 * AuthNavIsland — the ONLY auth-aware piece of the server-rendered header.
 * SiteChrome itself has zero client JS, so without this the "Log In" button
 * would show even to a signed-in user on every SSR page.
 *
 * Also owns the ENTIRE mobile menu trigger — by design there is ever only ONE
 * control in the DOM: a hamburger (signed out) OR the avatar (signed in),
 * decided here in React, never via a CSS class toggle. A prior version tried
 * hiding a separately-rendered hamburger with a `body.is-authed` CSS rule and
 * that kept coming back visible, so this version simply never renders it in
 * the first place once a session is confirmed.
 */
export default function AuthNavIsland() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  // Google's photoURL sometimes fails to load with a bare <img> (referrer
  // policy) — falls back to the placeholder icon instead of a broken image.
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); });
      return () => unsub();
    }
    setReady(true);
  }, []);

  useEffect(() => { setAvatarError(false); }, [user?.photoURL]);

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  const handleSignOut = async () => {
    try { if (auth?.app) await signOut(auth); } catch (_) { /* no-op */ }
    window.location.assign('/');
  };

  // Avoid a flash of the wrong state while the auth session resolves.
  if (!ready) {
    return <span className="btn btn-outline sc-login-btn" style={{ visibility: 'hidden' }} aria-hidden="true">Log In</span>;
  }

  // Signed out: Log In button (desktop) + the ONE hamburger trigger (mobile),
  // holding site nav + Log In.
  if (!user) {
    return (
      <>
        <a className="btn btn-outline sc-login-btn" href="/login">Log In</a>
        <div className="sc-mobile-menu-wrapper">
          <button type="button" className="mobile-menu-toggle sc-mobile-toggle-btn" onClick={() => setOpen(!open)} aria-label="Open menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          {open && (
            <>
              <div className="profile-dropdown-backdrop" onClick={() => setOpen(false)} />
              <div className="sc-mobile-menu">
                {SITE_LINKS.map(l => (
                  <a key={l.href} className="mobile-menu-link" href={l.href}>{l.label}</a>
                ))}
                <div className="mobile-menu-divider" />
                <a className="mobile-menu-link" href="/login">Log In</a>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // Signed in: avatar + dropdown ONLY — no hamburger exists anywhere in the DOM.
  return (
    <div className="profile-dropdown-wrapper">
      <button type="button" className="profile-trigger" onClick={() => setOpen(!open)}>
        {user.photoURL && !avatarError ? (
          <img src={user.photoURL} alt="" className="user-avatar" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
        ) : (
          <div className="user-avatar-placeholder"><User size={16} /></div>
        )}
        <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
        <ChevronDown size={16} className={`profile-chevron ${open ? 'open' : ''}`} />
      </button>
      {open && (
        <>
          <div className="profile-dropdown-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              {user.photoURL && !avatarError ? (
                <img src={user.photoURL} alt="" className="profile-dropdown-avatar" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
              ) : (
                <div className="profile-dropdown-avatar-placeholder"><User size={20} /></div>
              )}
              <div>
                <div className="profile-dropdown-name">{user.displayName || 'User'}</div>
                <div className="profile-dropdown-email">{user.email}</div>
              </div>
            </div>
            <div className="profile-dropdown-divider" />

            {/* Mobile-only: full site navigation, merged in since no separate hamburger exists once signed in */}
            <div className="profile-dropdown-mobile-links">
              {SITE_LINKS.map(l => (
                <a key={l.href} className="profile-dropdown-item" href={l.href}>{l.label}</a>
              ))}
              <div className="profile-dropdown-divider" />
            </div>

            <a className="profile-dropdown-item" href="/dashboard"><Building size={16} /> My Lands</a>
            <a className="profile-dropdown-item" href="/interests"><MapPin size={16} /> My Interests</a>
            <a className="profile-dropdown-item" href="/broker-dashboard"><User size={16} /> Broker Dashboard</a>
            {isAdmin && (
              <a className="profile-dropdown-item" href="/admin" style={{ color: '#e11d48' }}><Shield size={16} /> Admin Panel</a>
            )}
            <div className="profile-dropdown-divider" />
            <button type="button" className="profile-dropdown-item profile-dropdown-signout" onClick={handleSignOut}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
