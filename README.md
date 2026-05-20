# A1Plot Platform Architecture & Setup

## Features Built
I've successfully created the complete responsive UI for **A1Plot** combining the feel of modern investment tools (like Groww/Zerodha) with premium real estate properties.

**Sections Included:**
1. **Navbar:** Clean branding with log in, sign up, and core navigation. Uses a `TrendingUp` icon alongside the brand name to mimic the upward arrow contained in your provided logo image!
2. **Hero Section:** Positioned carefully for 24-40 modern professionals "Invest in Real Estate Like You Invest in Stocks".
3. **How It Works:** Step-by-step frictionless workflow. 
4. **Featured Investment Opportunities:** Asset cards highlighting expected CAGR, Plot Size, Pricing, and direct "Invest Now" CTAs. No emotional fluff.
5. **Dashboard Preview:** Contains a beautiful Recharts interactive line-graph displaying a digitized "My Portfolio" highlighting value and portfolio growth.
6. **Trust Section:** Badges representing RERA verification and 50-point legal checks. 
7. **Footer:** Professional standard layout with company indexing and disclaimers.

## Technology Stack & Setup
- Built via **React** with the **Vite** bundler.
- Styling utilizes premium vanilla CSS variables for max performance in `index.css` following exact color branding (#3b7a76 dark teal focus, emerald greens for accents, slate dark text).
- Responsive grid architectures applied entirely.
- Includes `lucide-react` for beautiful UI icons and `recharts` for the dashboard visualization.

## Instructions to Run locally
You can start the development server using:
```bash
npm install
npm run dev
```

*Note: Your local Node.js v20.17 environment seems to have an ESBuild native binding caching issue that prevents `npm run dev` right away. To fix this, run `npm rebuild esbuild` or simply delete the `node_modules` folder, then run `npm install` again.*
