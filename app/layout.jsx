import '../src/index.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';

// Self-hosted by next/font. index.css used to pull Inter via an @import, which
// forced three serial round trips across two external origins (css ->
// fonts.googleapis -> gstatic) in front of first paint, costing ~1.2s of LCP
// render delay. Now the woff2 is same-origin, fetched over the connection that
// is already open.
//
// display:'swap' plus next/font's metric-matched fallback is what actually
// protects LCP here: the hero text paints on the first frame in the fallback
// face and swaps in place, so first paint never waits on a font at all.
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata = {
  title: 'A1Plot | Premium Land & Plot Investments in India',
  description: 'A1Plot brings stock-market velocity, liquidity, and transparency to Indian real estate. Discover and invest in verified premium land parcels, commercial plots, and agricultural land in Rajasthan, Bangalore, and across India.',
  keywords: 'buy land, plots for sale, land investment India, agricultural land, commercial plots, real estate investing, A1Plot, SEZ land, Rajasthan land',
  authors: [{ name: 'A1Plot' }],
  icons: {
    icon: [
      { url: '/assets/favicon_logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon_logo.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/assets/favicon_logo.png',
  },
  openGraph: {
    title: 'A1Plot | Premium Land & Plot Investments',
    description: 'Discover and invest in verified premium land parcels, commercial plots, and agricultural land with zero friction.',
    url: 'https://a1plot.com/',
    siteName: 'A1Plot',
    images: [
      {
        url: 'https://a1plot.com/assets/plots/plot2.png',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A1Plot | Premium Land & Plot Investments',
    description: 'Discover and invest in verified premium land parcels, commercial plots, and agricultural land with zero friction.',
    images: ['https://a1plot.com/assets/plots/plot2.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Link to AI Sitemap/Context */}
        <link rel="llms-txt" type="text/markdown" href="/llms.txt" />

        {/* PWA: installable + offline-capable */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Only origins this page actually requests. The firestore / firebasestorage /
            maps preconnects that used to sit here were flagged unused by Lighthouse:
            nothing on a server-rendered page touches them before hydration, so they
            only cost handshakes. Maps is preconnected on /buyer_map instead, where it
            IS used. fonts.gstatic is gone now that next/font self-hosts Inter. */}
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Site-wide structured data: the organisation behind every page, plus
            the WebSite entity that carries the sitelinks search box.

            This deliberately does NOT describe listings. A hardcoded ItemList
            of five properties used to live here, which meant every page on the
            site — privacy policy included — claimed to list those exact plots,
            at prices frozen at the time it was written. It also collided with
            the real, Firestore-backed ItemList that app/page.jsx emits: same
            @id, different contents, on the same page. Listing data belongs on
            the routes that actually have listings, generated from live data. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "RealEstateAgent",
                  "@id": "https://a1plot.com/#organization",
                  "name": "A1Plot",
                  "url": "https://a1plot.com/",
                  "email": "support@a1plot.com",
                  "logo": { "@type": "ImageObject", "url": "https://a1plot.com/assets/logo.webp" },
                  "image": "https://a1plot.com/assets/logo.webp",
                  "description": "A1Plot is a direct digital marketplace for verified land, commercial plots and agricultural land across India, with transparent pricing and legally vetted title.",
                  "areaServed": { "@type": "Country", "name": "India" },
                  "knowsAbout": ["Land investment", "Agricultural land", "Commercial plots", "Residential plots", "RERA verification", "Title verification"]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://a1plot.com/#website",
                  "url": "https://a1plot.com/",
                  "name": "A1Plot",
                  "publisher": { "@id": "https://a1plot.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": { "@type": "EntryPoint", "urlTemplate": "https://a1plot.com/search?q={search_term_string}" },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}

        {/* Register the service worker (caches the app shell, enables offline) */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function () {});
              });
            }
          `}
        </Script>

        {/* Meta Pixel + GA4 run at lazyOnload rather than afterInteractive: together
            they pull ~253KB (fbevents 105KB, gtag 148KB) that Lighthouse flagged as
            largely unused at first paint. Both fbq() and gtag() queue calls made
            before their script lands, so no pageview is lost — it just fires later. */}
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1926750081367439');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1926750081367439&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {/* Google Analytics (GA4) — site-wide */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B7Y33BBVGX"
          strategy="lazyOnload"
        />
        <Script id="ga4-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B7Y33BBVGX');
          `}
        </Script>
        {/* End Google Analytics */}
      </body>
    </html>
  );
}
