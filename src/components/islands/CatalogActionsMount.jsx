"use client";
import dynamic from 'next/dynamic';

// ssr:false — these buttons depend on window.location / navigator.share, and
// the catalog page around them is fully server-rendered without them.
const CatalogActionsIsland = dynamic(() => import('./CatalogActionsIsland'), {
  ssr: false,
  loading: () => null,
});

export default function CatalogActionsMount({ title }) {
  return <CatalogActionsIsland title={title} />;
}
