import '../src/index.css';
import Script from 'next/script';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Link to AI Sitemap/Context */}
        <link rel="llms-txt" type="text/markdown" href="/llms.txt" />

        {/* PWA: installable + offline-capable */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Warm up connections to third parties so they resolve faster */}
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Structured Data for AI & Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://a1plot.com/#website",
                  "name": "A1Plot",
                  "url": "https://a1plot.com/",
                  "description": "A1Plot brings stock-market velocity, liquidity, and transparency to Indian real estate. Discover and invest in verified premium land parcels, commercial plots, and agricultural land in Rajasthan, Bangalore, and across India.",
                  "keywords": "buy land, plots for sale, real estate investing, A1Plot, agricultural land India",
                  "brand": {
                    "@type": "Brand",
                    "name": "A1Plot",
                    "color": "#1e293b",
                    "logo": "https://a1plot.com/assets/favicon_logo.png"
                  }
                },
                {
                  "@type": "ItemList",
                  "@id": "https://a1plot.com/#property-listings",
                  "name": "A1Plot Active Verified Properties",
                  "numberOfItems": 5,
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "item": {
                        "@type": "RealEstateListing",
                        "name": "SEZ Institutional Land",
                        "description": "Premium institutional patta land parcel in SEZ zone. RERA verified and 50-point legal check completed.",
                        "url": "https://a1plot.com/property?id=1",
                        "offers": {
                          "@type": "Offer",
                          "price": "700000000",
                          "priceCurrency": "INR",
                          "availability": "https://schema.org/InStock"
                        },
                        "about": {
                          "@type": "Landform",
                          "name": "SEZ Institutional Land",
                          "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "SEZ",
                            "addressRegion": "Rajasthan",
                            "addressCountry": "IN"
                          }
                        }
                      }
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "item": {
                        "@type": "RealEstateListing",
                        "name": "Palada Agriculture Land",
                        "description": "Fertile agricultural land parcel in Palada. Ideal for long term holds and farming. Verified listing.",
                        "url": "https://a1plot.com/property?id=2",
                        "offers": {
                          "@type": "Offer",
                          "price": "72500000",
                          "priceCurrency": "INR",
                          "availability": "https://schema.org/InStock"
                        },
                        "about": {
                          "@type": "Landform",
                          "name": "Palada Agriculture Land",
                          "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Palada",
                            "addressRegion": "Rajasthan",
                            "addressCountry": "IN"
                          }
                        }
                      }
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "item": {
                        "@type": "RealEstateListing",
                        "name": "Todha Agriculture Land",
                        "description": "Large agricultural land parcel in Todha. Complete title checks done. Direct booking.",
                        "url": "https://a1plot.com/property?id=3",
                        "offers": {
                          "@type": "Offer",
                          "price": "15000000",
                          "priceCurrency": "INR",
                          "availability": "https://schema.org/InStock"
                        },
                        "about": {
                          "@type": "Landform",
                          "name": "Todha Agriculture Land",
                          "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Todha",
                            "addressRegion": "Rajasthan",
                            "addressCountry": "IN"
                          }
                        }
                      }
                    },
                    {
                      "@type": "ListItem",
                      "position": 4,
                      "item": {
                        "@type": "RealEstateListing",
                        "name": "Sikar Road Commercial Plot",
                        "description": "High-value highway-facing commercial plot on Sikar Road. Complete RERA clearances.",
                        "url": "https://a1plot.com/property?id=4",
                        "offers": {
                          "@type": "Offer",
                          "price": "220000000",
                          "priceCurrency": "INR",
                          "availability": "https://schema.org/InStock"
                        },
                        "about": {
                          "@type": "Landform",
                          "name": "Sikar Road Commercial Plot",
                          "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Sikar Road",
                            "addressRegion": "Rajasthan",
                            "addressCountry": "IN"
                          }
                        }
                      }
                    },
                    {
                      "@type": "ListItem",
                      "position": 5,
                      "item": {
                        "@type": "RealEstateListing",
                        "name": "Bikaner Agriculture Land",
                        "description": "Massive 100 Bigha agricultural plot in Bikaner. Verified high-CAGR investment.",
                        "url": "https://a1plot.com/property?id=5",
                        "offers": {
                          "@type": "Offer",
                          "price": "200000000",
                          "priceCurrency": "INR",
                          "availability": "https://schema.org/InStock"
                        },
                        "about": {
                          "@type": "Landform",
                          "name": "Bikaner Agriculture Land",
                          "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Bikaner",
                            "addressRegion": "Rajasthan",
                            "addressCountry": "IN"
                          }
                        }
                      }
                    }
                  ]
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

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
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
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
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
