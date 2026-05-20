# A1Plot - Project Documentation

This document contains all the necessary information regarding the A1Plot platform, including its architecture, connected accounts, APIs used, and deployment steps. Keep this safe as it is the "Master Guide" for your project.

## 1. Project Overview
A1Plot is a land investment platform that allows users to view, list, and express interest in premium plots of land. It supports user authentication, property listings, and admin verification of listings.

- **Live Website URL:** [https://a1plot.com](https://a1plot.com)
- **Tech Stack:** React (Vite), CSS3, Firebase (Auth & Firestore), Google Maps API

---

## 2. Connected Accounts & Services

### GitHub (Source Code Management)
- **Account:** `ykandoi`
- **Email:** `ykandoi20330@gmail.com`
- **Repository URL:** [https://github.com/ykandoi/a1plot](https://github.com/ykandoi/a1plot)
- **Purpose:** Stores all the source code safely. Vercel pulls code from here automatically whenever a new update is pushed.

### Vercel (Hosting & Deployment)
- **Project Name:** `a1-plot-website` (Linked to custom domain `a1plot.com`)
- **Connected Repo:** `ykandoi/a1plot`
- **Purpose:** Hosts the live website. Every time code is pushed to the `main` branch on GitHub, Vercel automatically deploys the latest version.
- **Environment Variables stored in Vercel:**
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_GOOGLE_MAPS_API_KEY`

### Firebase (Backend & Database)
- **Account:** `ykandoi20330@gmail.com`
- **Project ID:** `a1plot-c8f10`
- **Project Console:** [console.firebase.google.com/project/a1plot-c8f10](https://console.firebase.google.com/project/a1plot-c8f10)
- **Services Used:**
  - **Firebase Authentication:** Handles user sign-ups, logins, and Google Sign-In.
  - **Firestore Database (NoSQL):** Stores all dynamic data permanently. Region: `asia-south1` (Mumbai).

### Google Cloud (Maps & Geolocation APIs)
- **Account:** `ykandoi20330@gmail.com` (Linked to your Google Cloud project)
- **Project:** Same underlying Google Cloud project as Firebase.
- **Enabled APIs:**
  1. **Maps JavaScript API:** Renders the interactive map on the website.
  2. **Places API (Legacy):** Powers the autocomplete search bar when users enter a plot location.
  3. **Geocoding API:** Converts the typed address into map coordinates (Latitude/Longitude) to drop the pin.
- **Billing:** Enabled and required for Maps to function.

---

## 3. Database Structure (Firestore)

The database consists of two main collections:

### A. `plots` (Collection)
Stores all properties listed on the website.
- `id` (String) - Unique identifier
- `title`, `location`, `price`, `size`, `features` (Strings) - Plot details
- `lat`, `lng` (Numbers) - Map coordinates
- `ownerUid` (String) - ID of the user who created the listing
- `status` (String) - E.g., `Verification Pending`, `Verified`, `Rejected`
- `visibility` (String) - E.g., `public`, `private`

### B. `interests` (Collection)
Stores properties that a specific user has marked as "Interested".
- Path: `interests/{userId}/plots/{plotId}`
- Stores a copy of the plot data so the user can see it in their dashboard.

**Admin Verification:**
Users with the email `kdy20330@gmail.com` or `ykandoi20330@gmail.com` have admin rights via Firestore Security Rules. They can update the `status` of any plot to verify it for the public.

---

## 4. Code Structure

```text
A1 plot website/
│
├── src/                      # Main source code folder
│   ├── App.jsx               # The core React component (Routing, Views, Forms)
│   ├── App.css               # Specific styles for components
│   ├── index.css             # Global styles and CSS variables
│   ├── main.jsx              # Entry point for React
│   ├── firebase.js           # Firebase configuration and initialization
│   │
│   ├── hooks/                # Custom React Hooks for database logic
│   │   ├── usePlots.js       # Fetches, adds, and updates plots in Firestore
│   │   └── useInterests.js   # Manages the "Interested" plots for users
│   │
│   └── assets/               # Images and icons (e.g., logo.jpg, hero.png)
│
├── public/                   # Static assets served directly (e.g., favicon)
├── index.html                # Main HTML template
├── vite.config.js            # Build tool configuration (Vite)
├── vercel.json               # Vercel deployment settings (Routes fallback)
├── package.json              # List of dependencies (React, Firebase, Google Maps)
└── .env                      # Local environment variables (DO NOT COMMIT to GitHub)
```

---

## 5. How to Update the Website

If you want to make changes to the code in the future, follow this workflow:

1. Open the code in your editor (e.g., VS Code).
2. Run the local testing server to see changes:
   ```bash
   npm run dev
   ```
3. Once satisfied with the changes, open the terminal and push to GitHub:
   ```bash
   git add -A
   git commit -m "Describe what you changed here"
   git push origin main
   ```
4. **Vercel will automatically detect the push and deploy the new version to a1plot.com within 2 minutes!**
