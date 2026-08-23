import React from 'react';

/**
 * Inline SVG icons for the header islands.
 *
 * These were `import { User, ChevronDown, … } from 'lucide-react'`, but that
 * import pulled a ~448KB chunk containing the whole icon set into every page
 * view — `optimizePackageImports` did not tree-shake it down to the eight icons
 * actually rendered here. SiteChrome already draws its own icons inline for the
 * same reason, so this follows the established pattern.
 *
 * Paths are lucide's own, so nothing changes visually. Each takes the same
 * `size` prop the lucide components did.
 */
const Svg = ({ size = 16, className, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {children}
  </svg>
);

export const User = (p) => (<Svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Svg>);
export const ChevronDown = (p) => (<Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>);
export const Building = (p) => (<Svg {...p}><rect width="16" height="20" x="4" y="2" rx="2" /><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" /></Svg>);
export const MapPin = (p) => (<Svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Svg>);
export const Shield = (p) => (<Svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></Svg>);
export const LogOut = (p) => (<Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></Svg>);
export const Menu = (p) => (<Svg {...p}><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></Svg>);
export const X = (p) => (<Svg {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Svg>);
