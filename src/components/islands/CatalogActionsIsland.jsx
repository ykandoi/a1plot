"use client";
import React, { useState } from 'react';

/**
 * CatalogActionsIsland — the only interactive part of the shared catalog page.
 *
 * "Download PDF" deliberately uses the browser's own print-to-PDF rather than
 * generating a PDF server-side: headless Chrome on a serverless function is
 * slow, memory-hungry and an extra dependency, while every desktop and mobile
 * browser already renders a clean PDF from the page's @media print rules.
 */
export default function CatalogActionsIsland({ title }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${title} — shared via A1Plot`;

  const handleShare = async () => {
    // Native share sheet on mobile (WhatsApp, Messages, Mail…); falls back to
    // copying the link on desktop browsers that don't implement it.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch (err) {
        // AbortError just means the user dismissed the sheet — not a failure,
        // and copying the link behind their back would be surprising.
        if (err?.name === 'AbortError') return;
      }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (_) {
      window.prompt('Copy this catalog link:', shareUrl);
    }
  };

  return (
    <div className="cat-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
      <button type="button" className="cat-btn cat-btn-primary" onClick={handleShare}>Share</button>
      <button type="button" className="cat-btn" onClick={handleCopy}>{copied ? 'Link copied ✓' : 'Copy link'}</button>
      <button type="button" className="cat-btn" onClick={() => window.print()}>Download PDF</button>
    </div>
  );
}
