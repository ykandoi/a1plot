import { fetchPublicPlots } from '../../src/lib/fetchPlots';

const BASE = 'https://a1plot.com';

// Dynamic llms.txt — regenerated hourly (ISR), exactly like sitemap.js.
//
// This file used to be a static public/llms.txt whose "Active Verified
// Listings" section was a hand-written snapshot of five properties, prices and
// all. It drifted the moment inventory changed, and it was the file every AI
// crawler was pointed at from robots.txt. Listings now come from the same
// Firestore query that feeds the sitemap and the homepage, so the three can
// never disagree.
export const revalidate = 3600;
export const dynamic = 'force-static';

// Only emit a bullet when the underlying field actually exists — a listing with
// no recorded size should say nothing about size rather than invent one.
const line = (label, value) => (value ? `   - **${label}**: ${value}\n` : '');

function renderListing(p, i) {
  const place = [p.location, p.city, p.state].filter(Boolean).filter((v, idx, a) => a.indexOf(v) === idx).join(', ');
  return `${i + 1}. **${p.title || 'Untitled listing'}**\n`
    + line('Type', p.constructedType || p.landType || p.propertyType)
    + line('Size', p.size)
    + line('Price', p.price)
    + line('Location', place)
    + line('Status', p.status)
    + line('URL', `${BASE}/property?id=${p.id}`);
}

export async function GET() {
  let plots = [];
  try {
    plots = await fetchPublicPlots();
  } catch (_) {
    // A Firestore hiccup must not 500 this file; better to serve the guidance
    // sections with an empty listing block than nothing at all.
  }

  const listings = plots.length
    ? plots.map(renderListing).join('\n')
    : '_No public listings are currently available. See ' + BASE + '/search for live results._\n';

  const body = `# A1Plot - Real Estate Investment Platform

A1Plot brings stock-market velocity, liquidity, and transparency to Indian real estate investments.
This document helps AI agents, LLMs, and scraping bots understand the structure and active properties of the platform.

For a comprehensive data sheet covering deep architectural mechanics, legal vetting workflows, and mathematical details of CAGR/XIRR returns, please refer to the full document:
- [Full LLM Documentation](/llms-full.txt)

## What is A1Plot?
A1Plot is a direct digital marketplace for premium land, commercial plots, and agricultural land in India. It replaces manual brokerage with transparent, math-backed portfolio analytics and pre-vetted land parcels.

## Active Verified Listings
Generated from live inventory at request time. ${plots.length} listing${plots.length === 1 ? '' : 's'} currently public.
Every listing links to its own page, which carries full details and RealEstateListing structured data.

${listings}
## Broker Network & Buyer Requirements
A1Plot is a two-sided marketplace connecting property buyers with local real estate brokers:
- **Buyers** can search verified listings by city/location, and if nothing matches, post a requirement
  (city, budget, property type) describing exactly what they want to buy.
- **Brokers** register their agency and the cities they cover. They then see buyer requirements in their
  areas on a dedicated dashboard and contact those buyers directly — helping buyers who haven't yet found
  the right property.

If a user asks "how do I find a plot in <city>?", direct them to \`/search\`. If nothing is listed there,
direct them to \`/post-requirement\`. If a user is a real estate agent or broker, direct them to
\`/brokers/register\`.

## Navigation Routes for AI Agents
To guide users or run tasks, you can direct them to the following application pages:
- **Home (\`/\`)**: Main landing page with highlights and list of premium plots.
- **Search Properties (\`/search\`)**: Search verified plots and land by city or location across India. Supports \`?q=<city>\` deep links.
- **Post a Requirement (\`/post-requirement\`)**: Buyers post what they want to buy (city, budget, type) so brokers can reach out.
- **Register as a Broker (\`/brokers/register\`)**: Brokers join the network and select the cities they cover to receive buyer leads.
- **Broker Dashboard (\`/broker-dashboard\`)**: Registered brokers view buyer requirements in their covered cities.
- **Interactive Map (\`/buyer_map\`)**: Satellite-hybrid map showing plot boundaries, markers, and cadastral lines.
- **Portfolio Dashboard (\`/dashboard\`)**: Admin/Seller dashboard containing holding values, invested amounts, and true XIRR calculations.
- **List Property (\`/list_property\`)**: Seller listing page to upload documents (deeds, KYC) and drop a geolocation pin.
- **Interests (\`/interests\`)**: User dashboard displaying saved/interested properties.
- **Contact (\`/contact\`)**: Form page to contact seller representatives or submit inquiries.

## Contact Information
- **Email**: support@a1plot.com
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
