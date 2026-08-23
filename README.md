# A1Plot - Real Estate Investment Platform

A1Plot is a modern, dynamic web application designed to bring stock-market-level velocity, liquidity, and transparency to Indian real estate investments. It provides a premium platform for buyers and sellers to discover, track, and manage land investments.

## 🚀 Tech Stack

- **Frontend Framework**: React 18 (built with Vite)
- **Database & Backend**: Firebase (Firestore)
- **Authentication**: Firebase Auth (Email/Password & Google Sign-In)
- **Storage**: Firebase Storage (for property images and media)
- **Mapping**: Google Maps API (`@react-google-maps/api`)
- **Data Visualization**: Recharts (for portfolio growth charts)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (`index.css` & `App.css`) with modern glassmorphism and premium aesthetics.
- **Deployment**: Vercel

## 🏗️ Project Structure

- `src/App.jsx`: The core monolithic application file. It acts as the router, state manager, and contains all the primary UI views (Home, Property Details, Map View, Portfolio Dashboard, Login, etc.).
- `src/index.css`: Contains the global design system, CSS variables, utility classes, and custom animations.
- `src/firebase.js`: Firebase initialization and configuration.
- `src/hooks/`: Contains custom React hooks (e.g., `usePlots` for fetching real-time database updates from Firestore).
- `public/`: Contains static assets, `robots.txt`, `sitemap.xml`, and `llms.txt` for AI agent indexing.

## ✨ Key Features

1. **Dynamic Property Discovery**: Beautiful, responsive property cards showing Key Metrics, Expected CAGR, Total Price, and Plot Size.
2. **Interactive Maps**: Deep integration with Google Maps API (defaulting to High-Res Satellite View) to show exact property locations.
3. **Seller Portfolio Dashboard**: A stock-broker style (Groww/Zerodha) dashboard for property owners. It dynamically calculates:
   - Total Invested Amount
   - Total Current Value
   - Absolute P&L
   - **Authentic XIRR Calculation**: Uses the Newton-Raphson mathematical formula to calculate true annualized returns based on simulated property holding periods.
4. **Authentication System**: Secure login portal allowing users to track their specific "My Lands" portfolio securely.
5. **SEO & AI Optimized**: Fully configured with OpenGraph meta tags, sitemaps, and an `llms.txt` file for automated AI web scraping.

## 💻 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Copy the environment template:
     ```bash
     cp .env.example .env.local
     ```
   - Get your Firebase credentials:
     1. Go to [Firebase Console](https://console.firebase.google.com)
     2. Select the `a1plot-c8f10` project
     3. Click the gear icon → **Project Settings**
     4. Scroll to "Your apps" → Copy the Firebase SDK config
     5. Paste the values into `.env.local`
   - Required Firebase variables:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. **Configure Google Maps (optional)**:
   - Add your Google Maps API key to `.env.local`:
     ```env
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (Next.js).

## 🗄️ Database Schema (Firestore)

The primary collection is `plots`, which contains documents with the following structure:
- `title` (String): e.g., "Palada Agriculture Land"
- `price` (String): Formatted price for display
- `currentValue` (Number): Exact integer value
- `investedAmount` (Number): Original purchase price
- `cagr` / `tags` (Array): Expected growth rates
- `lat` / `lng` (Number): Coordinates for the map
- `images` (Array of Strings): URLs to Firebase Storage images
- `ownerEmail` (String): Links the property to a specific user's portfolio dashboard.
