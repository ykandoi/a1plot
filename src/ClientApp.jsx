"use client";
import './clientApp.css';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TrendingUp, ShieldCheck, MapPin,
  Search, ArrowRight,
  Smartphone, Clock, CheckCircle2,
  ChevronRight, ChevronDown, Building, Upload,
  LogOut, User, Mail, Lock, Eye, EyeOff, Settings,
  Shield, Check, X, Menu, Undo, Trash2, Edit3, Heart, Navigation,
  Home, Tag, UserCheck
} from 'lucide-react';
import dynamic from 'next/dynamic';
// Charts use recharts (~0.5MB). Lazy-load them so the library is fetched only
// when a chart renders — keeping it off the initial bundle / first paint.
const MiniLineChart = dynamic(() => import('./components/Charts').then(m => m.MiniLineChart), { ssr: false, loading: () => null });
const PortfolioAreaChart = dynamic(() => import('./components/Charts').then(m => m.PortfolioAreaChart), { ssr: false, loading: () => null });
const Sparkline = dynamic(() => import('./components/Charts').then(m => m.Sparkline), { ssr: false, loading: () => null });
// Broker + buyer-requirement features — lazy-loaded so they stay off the initial bundle.
const BrokerRegister = dynamic(() => import('./components/BrokerRegister'), { ssr: false, loading: () => null });
const PostRequirement = dynamic(() => import('./components/PostRequirement'), { ssr: false, loading: () => null });
const BrokerDashboard = dynamic(() => import('./components/BrokerDashboard'), { ssr: false, loading: () => null });
const SearchResults = dynamic(() => import('./components/SearchResults'), { ssr: false, loading: () => null });
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, Autocomplete, PolygonF } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];
import { auth, googleProvider, storage, popupRedirectResolver } from './firebase';
import { plotStaticMapUrl } from './lib/staticMap';
import AdminTable from './components/admin/AdminTable';
import { plotDisplayImage } from './lib/staticMap';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { usePlots } from './hooks/usePlots';
import { useInterests } from './hooks/useInterests';
import { useBrokers } from './hooks/useBrokers';
import { useRequirements } from './hooks/useRequirements';
import { useUsers } from './hooks/useUsers';
import { useCatalogs } from './hooks/useCatalogs';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import PhoneField, { isValidPhone } from './components/PhoneField';

const GOOGLE_MAPS_API_KEY = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : '';

const mapContainerStyle = {
  width: '100%',
  height: '550px',
  borderRadius: '1rem'
};

const getSortedPolygonPath = (points) => {
  return points;
};

const defaultCenter = {
  lat: 15.0,
  lng: 78.0
};

const mapOptions = {
  mapTypeId: 'hybrid',
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  disableDoubleClickZoom: true,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', stylers: [{ color: '#c9e8f5' }] },
    { featureType: 'landscape', stylers: [{ color: '#f0f4f0' }] }
  ]
};

// Admin credentials
const ADMIN_EMAILS = ['kdy20330@gmail.com', 'ykandoi20330@gmail.com'];

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 4500 },
  { name: 'Mar', value: 4200 },
  { name: 'Apr', value: 5100 },
  { name: 'May', value: 5800 },
  { name: 'Jun', value: 6500 },
];


const ADMIN_MAP_DEFAULT_CENTER = { lat: 23.5937, lng: 78.9629 };
const ADMIN_MAP_OPTIONS = { mapTypeId: 'hybrid', streetViewControl: false, draggableCursor: 'crosshair', clickableIcons: false, disableDoubleClickZoom: true };

const INITIAL_PLOTS = [
  {
    id: 1,
    ownerUid: 'admin',
    visibility: 'public',
    title: 'SEZ Institutional Land',
    location: 'SEZ',
    price: '₹70 Crore',
    size: '18,000 m²',
    cagr: '14.5%',
    developer: 'Verified Listing',
    status: 'Ready to Move',
    badge: 'Institutional Patta',
    features: 'Institutional Patta, High Value Zone',
    khasraNumber: '142/5',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 26.837,
    lng: 75.642,
    investedAmount: 700000000,
    currentValue: 700000000,
    purchaseDate: '2024-01-01',
    priceHistory: [],
    city: 'Jaipur',
    transactionType: 'sale',
    propertyType: 'land',
    landType: 'converted',
    landUse: 'institutional',
    constructedType: 'flat',
    constructionStatus: 'constructed',
    budgetRange: '₹70 Crore',
    facingDirection: 'East',
    cornerProperty: true,
    parkFacing: false,
    roadFacing: true
  },
  {
    id: 2,
    ownerUid: 'admin',
    visibility: 'public',
    title: 'Palada Agriculture Land',
    location: 'Palada',
    price: '₹7.25 Crore',
    size: '7.25 Bigha',
    cagr: '12.0%',
    developer: 'Verified Listing',
    status: 'Ready to Move',
    badge: 'Agriculture',
    features: 'Agriculture Land, Fertile',
    khasraNumber: '89',
    image: 'https://images.unsplash.com/photo-1510007802148-5c4d16857cb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 25.10,
    lng: 75.80,
    investedAmount: 72500000,
    currentValue: 72500000,
    purchaseDate: '2024-01-01',
    priceHistory: [],
    city: 'Kota',
    transactionType: 'sale',
    propertyType: 'land',
    landType: 'agriculture',
    landUse: 'residential',
    constructedType: 'flat',
    constructionStatus: 'constructed',
    budgetRange: '₹7.25 Crore',
    facingDirection: 'West',
    cornerProperty: false,
    parkFacing: false,
    roadFacing: true
  },
  {
    id: 3,
    ownerUid: 'admin',
    visibility: 'public',
    title: 'Todha Agriculture Land',
    location: 'Todha',
    price: '₹1.5 Crore',
    size: '20 Bigha',
    cagr: '10.5%',
    developer: 'Verified Listing',
    status: 'Ready to Move',
    badge: 'Agriculture',
    features: 'Agriculture Land',
    image: 'https://images.unsplash.com/photo-1473445763015-ab6ce30ce6f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 26.50,
    lng: 75.90,
    investedAmount: 15000000,
    currentValue: 15000000,
    purchaseDate: '2024-01-01',
    priceHistory: [],
    city: 'Jaipur',
    transactionType: 'sale',
    propertyType: 'land',
    landType: 'agriculture',
    landUse: 'residential',
    constructedType: 'flat',
    constructionStatus: 'constructed',
    budgetRange: '₹1.5 Crore',
    facingDirection: 'North',
    cornerProperty: false,
    parkFacing: false,
    roadFacing: false
  },
  {
    id: 4,
    ownerUid: 'admin',
    visibility: 'public',
    title: 'Sikar Road Commercial Plot',
    location: 'Sikar Road',
    price: '₹22 Crore',
    size: '1,500 m²',
    cagr: '18.0%',
    developer: 'Verified Listing',
    status: 'Active',
    badge: 'Commercial',
    features: 'Commercial, Prime Location, Highway Facing',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 26.98,
    lng: 75.76,
    investedAmount: 220000000,
    currentValue: 220000000,
    purchaseDate: '2024-01-01',
    priceHistory: [],
    city: 'Jaipur',
    transactionType: 'sale',
    propertyType: 'land',
    landType: 'converted',
    landUse: 'commercial',
    constructedType: 'flat',
    constructionStatus: 'constructed',
    budgetRange: '₹22 Crore',
    facingDirection: 'South',
    cornerProperty: true,
    parkFacing: false,
    roadFacing: true
  },
  {
    id: 5,
    ownerUid: 'admin',
    visibility: 'public',
    title: 'Bikaner Agriculture Land',
    location: 'Bikaner',
    price: '₹20 Crore',
    size: '100 Bigha',
    cagr: '15.0%',
    developer: 'Verified Listing',
    status: 'Active',
    badge: 'Agriculture',
    features: 'Agriculture Land, Large Parcel',
    image: 'https://images.unsplash.com/photo-1510007802148-5c4d16857cb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 28.02,
    lng: 73.31,
    investedAmount: 200000000,
    currentValue: 200000000,
    purchaseDate: '2024-01-01',
    priceHistory: [],
    city: 'Bikaner',
    transactionType: 'sale',
    propertyType: 'land',
    landType: 'agriculture',
    landUse: 'residential',
    constructedType: 'flat',
    constructionStatus: 'constructed',
    budgetRange: '₹20 Crore',
    facingDirection: 'North',
    cornerProperty: false,
    parkFacing: false,
    roadFacing: false
  }
];

// Aggregate portfolio chart data (combined value over time)
const PORTFOLIO_CHART_DATA = [
  { month: 'Dec 23', value: 12000000 },
  { month: 'Feb 24', value: 12200000 },
  { month: 'Apr 24', value: 16980000 },
  { month: 'Jun 24', value: 17280000 },
  { month: 'Aug 24', value: 21420000 },
  { month: 'Oct 24', value: 21810000 },
  { month: 'Dec 24', value: 22680000 },
  { month: 'Feb 25', value: 22570000 },
  { month: 'Apr 25', value: 22970000 },
  { month: 'Jun 25', value: 23250000 },
  { month: 'Aug 25', value: 23360000 },
  { month: 'Oct 25', value: 23689000 },
];

const viewToPath = {
  'home': '/',
  'privacy': '/privacy_policy',
  'terms': '/terms_of_service',
  'buyer-map': '/buyer_map',
  'seller-dashboard': '/dashboard',
  'seller-list': '/list_property',
  'seller-edit': '/edit_property',
  'interested': '/interests',
  'contact': '/contact',
  'buy-request': '/buy_request',
  'admin': '/admin',
  'admin-edit': '/admin_edit',
  'property-detail': '/property',
  'login': '/login',
  'about': '/about_us',
  'direct-list': '/direct-list',
  'search': '/search',
  'post-requirement': '/post-requirement',
  'broker-register': '/brokers/register',
  'broker-dashboard': '/broker-dashboard'
};

const pathToView = {
  '/': 'home',
  '/privacy_policy': 'privacy',
  '/terms_of_service': 'terms',
  '/buyer_map': 'buyer-map',
  '/dashboard': 'seller-dashboard',
  '/list_property': 'seller-list',
  '/edit_property': 'seller-edit',
  '/interests': 'interested',
  '/contact': 'contact',
  '/buy_request': 'buy-request',
  '/admin': 'admin',
  '/admin_edit': 'admin-edit',
  '/admin_map': 'admin-map',
  '/property': 'property-detail',
  '/login': 'login',
  '/about_us': 'about',
  '/direct-list': 'direct-list',
  '/quick-list': 'direct-list',
  '/meta-ads': 'direct-list',
  '/search': 'search',
  '/post-requirement': 'post-requirement',
  '/brokers/register': 'broker-register',
  '/broker-dashboard': 'broker-dashboard'
};

const autocompleteOptions = {
  componentRestrictions: { country: 'in' },
  types: ['geocode', 'establishment']
};

// `hideChrome` — used when this component is mounted as a client island inside
// a real server-rendered page (see e.g. app/list_property/page.jsx): the outer
// SSR page already provides a real <nav>/<footer> for crawlers, so ClientApp
// must not render its OWN copy on top of it. Purely additive — doesn't touch
// any of the actual form/business logic below.
export default function App({ hideChrome = false } = {}) {
  // Clear any stale localStorage keys from old code versions
  try { localStorage.removeItem('selected_property_detail'); } catch(e) {}

  // Initialize view directly from URL path so reloads land on the correct page
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('bypass') === 'true' || params.get('bypass') === '1') {
        return 'direct-list';
      }
    }
    const pathToViewMap = {
      '/': 'home',
      '/privacy_policy': 'privacy',
      '/terms_of_service': 'terms',
      '/buyer_map': 'buyer-map',
      '/dashboard': 'seller-dashboard',
      '/list_property': 'seller-list',
      '/edit_property': 'seller-edit',
      '/interests': 'interested',
      '/contact': 'contact',
      '/buy_request': 'buy-request',
      '/admin': 'admin',
      '/admin_edit': 'admin-edit',
      '/property': 'property-detail',
      '/login': 'login',
      '/about_us': 'about',
      '/direct-list': 'direct-list',
      '/quick-list': 'direct-list',
      '/meta-ads': 'direct-list',
      '/search': 'search',
      '/post-requirement': 'post-requirement',
      '/brokers/register': 'broker-register',
      '/broker-dashboard': 'broker-dashboard'
    };
    return pathToViewMap[window.location.pathname] || 'home';
  };
  const [view, setView] = useState(getInitialView);
  // Supports /login?redirect=/brokers/register style deep links (e.g. the
  // header's "Broker" link) — falls back to the normal requireAuth() flow
  // when no query param is present.
  const [redirectTarget, setRedirectTarget] = useState(() => {
    if (typeof window === 'undefined') return null;
    const redirectPath = new URLSearchParams(window.location.search).get('redirect');
    return redirectPath && pathToView[redirectPath] ? pathToView[redirectPath] : null;
  });
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [directStep, setDirectStep] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPlot, setNewPlot] = useState({ title: '', location: '', price: '', size: '', features: '', additionalInfo: '', visibility: 'public', khasraNumber: '', state: '', district: '', tehsil: '', village: '', city: '', transactionType: 'sale', propertyType: 'land', landType: 'converted', landUse: 'residential', constructedType: 'flat', constructionStatus: 'constructed', budgetRange: '', facingDirection: 'East', cornerProperty: false, parkFacing: false, roadFacing: false });
  const [editingPlot, setEditingPlot] = useState(null);
  const [adminNewPlot, setAdminNewPlot] = useState({ ownerEmail: '', ownerPhone: '', title: '', location: '', price: '', size: '', features: '', additionalInfo: '', visibility: 'public', status: 'Verification Pending', media: [], documentsAvailable: [], khasraNumber: '', state: '', district: '', tehsil: '', village: '', city: '', transactionType: 'sale', propertyType: 'land', landType: 'converted', landUse: 'residential', constructedType: 'flat', constructionStatus: 'constructed', budgetRange: '', facingDirection: 'East', cornerProperty: false, parkFacing: false, roadFacing: false });
  const [adminEditingPlot, setAdminEditingPlot] = useState(null);
  const [adminTempPin, setAdminTempPin] = useState(null);
  // Store only the plot ID in localStorage to avoid stale cached data
  const [selectedPropertyDetailId, setSelectedPropertyDetailId] = useState(() => {
    try {
      return localStorage.getItem('selected_property_detail_id') || null;
    } catch (e) {
      return null;
    }
  });
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(null);
  // True when property-detail was opened from the admin panel's "Open" action
  // rather than by a buyer browsing — swaps the "Back to Explore" button for
  // admin review actions (Edit, Verify, Mark Pending, Reject, Delete) on the
  // same formatted view buyers see, instead of dropping straight into the
  // raw edit form.
  const [adminPreviewPlot, setAdminPreviewPlot] = useState(false);
  const [requestingDocsFor, setRequestingDocsFor] = useState(null);
  const [legalAgreed, setLegalAgreed] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [buyerMapSelectedPlotId, setBuyerMapSelectedPlotId] = useState(null);
  const [mapFocusPlot, setMapFocusPlot] = useState(null);
  const [droppedPin, setDroppedPin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Listing form file & location state
  const [mediaFiles, setMediaFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);

  // "AI Property Add" — describe the listing in plain language (optionally
  // with photos already in mediaFiles) instead of filling the form field by
  // field. Extraction only ever populates `newPlot` below; the seller still
  // reviews and submits through the existing handleListProperty path.
  const [listingMode, setListingMode] = useState('manual'); // 'manual' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiExtractError, setAiExtractError] = useState('');
  const [aiExtracted, setAiExtracted] = useState(false);

  // Admin-only "Bulk Import from Broker Message" — paste a raw blob
  // containing several properties at once (mixed Hindi/English shorthand is
  // common) and get one editable draft per property back. Submitting a
  // draft calls addPlot directly, same pipeline/status as any other
  // listing; nothing is saved until the admin reviews and hits Submit.
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkExtracting, setBulkExtracting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkDrafts, setBulkDrafts] = useState([]); // [{ _id, included, ...fields, sourceText }]
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [plotLocation, setPlotLocation] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [buyerMapCenter, setBuyerMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [polygonPath, setPolygonPath] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [mapType, setMapType] = useState('hybrid');
  const sortedPolygonPath = useMemo(() => getSortedPolygonPath(polygonPath), [polygonPath]);
  const mediaInputRef = useRef(null);
  const docInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);


  // Auth State
  const [user, setUser] = useState(null);
  // Only these views actually read the plots array — everywhere else (listing
  // form, broker pages, login, interests, contact, admin auth screens, etc.)
  // was paying for a live full-collection Firestore listener it never used.
  const NEEDS_PLOTS_VIEWS = ['home', 'buyer-map', 'seller-dashboard', 'seller-edit', 'admin', 'admin-edit', 'admin-map', 'property-detail', 'search', 'broker-dashboard'];
  const needsPlotsList = NEEDS_PLOTS_VIEWS.includes(view);
  const { plots, loading: plotsLoading, addPlot, updatePlot, deletePlot } = usePlots(INITIAL_PLOTS, needsPlotsList);
  // "Install App" menu item — hidden entirely on desktop/laptop via the
  // existing CSS on the two containers it's placed in (.sc-mobile-menu-wrapper
  // and .profile-dropdown-mobile-links are both display:none above 860px), so
  // no extra device check is needed here beyond what the hook itself covers
  // (browser support, iOS vs Android, already-installed).
  const { canInstall, showIOSInstructions, promptInstall } = useInstallPrompt();

  const [toastMessage, setToastMessage] = useState(null);
  
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Persist only the selected plot ID so reloads can resolve fresh data from Firestore
  useEffect(() => {
    try {
      if (selectedPropertyDetail) {
        localStorage.setItem('selected_property_detail_id', String(selectedPropertyDetail.id));
      } else {
        localStorage.removeItem('selected_property_detail_id');
      }
    } catch (e) {}
  }, [selectedPropertyDetail]);

  // When plots finish loading from Firestore, resolve the saved ID to the fresh plot object
  useEffect(() => {
    if (selectedPropertyDetailId && plots && plots.length > 0 && !selectedPropertyDetail) {
      const match = plots.find(p => String(p.id) === String(selectedPropertyDetailId));
      if (match) {
        setSelectedPropertyDetail(match);
      } else {
        // ID not found in current plots — clear stale reference
        setSelectedPropertyDetailId(null);
        localStorage.removeItem('selected_property_detail_id');
      }
    }
  }, [plots, selectedPropertyDetailId]);

  const showToast = (msg) => setToastMessage(msg);

  const handleInstallAppClick = async () => {
    const accepted = await promptInstall();
    showToast(accepted ? 'A1Plot installed! Check your home screen.' : 'Install dismissed — you can try again anytime from this menu.');
  };
  const handleIOSInstallHintClick = () => {
    showToast('Tap the Share icon in your browser, then "Add to Home Screen".');
  };

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewerOpen) return;
      if (e.key === 'Escape') setViewerOpen(false);
      const images = selectedPropertyDetail?.media && selectedPropertyDetail.media.length > 0 
        ? selectedPropertyDetail.media 
        : (selectedPropertyDetail?.image ? [selectedPropertyDetail.image] : []);
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, selectedPropertyDetail]);

  const [contactedPlots, setContactedPlots] = useState(() => {
    try {
      const saved = localStorage.getItem('contacted_plots');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('contacted_plots', JSON.stringify(contactedPlots));
    } catch (e) {}
  }, [contactedPlots]);

  // Contact Agent form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  // Buy Request (docs request) form state
  const [buyRequestQuery, setBuyRequestQuery] = useState('');
  const [buyRequestSubmitting, setBuyRequestSubmitting] = useState(false);
  const [buyRequestSuccess, setBuyRequestSuccess] = useState(false);
  const [buyRequestError, setBuyRequestError] = useState('');
  const [buyRequestDocs, setBuyRequestDocs] = useState(['titleDeed', 'ec']);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'contact',
          userName: contactName,
          userEmail: contactEmail,
          userPhone: contactPhone,
          message: contactMessage,
        }),
      });
      // fetch() only rejects on a network failure — a 500 response still
      // resolves "successfully", so the actual result has to be checked here.
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || 'The message could not be sent. Please try again.');
      }
      setContactSuccess(true);
      setContactName(''); setContactEmail(''); setContactPhone(''); setContactMessage('');
      setTimeout(() => { setContactSuccess(false); navigate('home'); }, 3000);
    } catch (err) {
      console.error('Contact form error:', err);
      setContactError('Sorry, something went wrong sending your message. Please try again, or email us directly at support@a1plot.com.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleBuyRequestSubmit = async (e) => {
    e.preventDefault();
    if (!legalAgreed) return;
    setBuyRequestSubmitting(true);
    const docLabels = {
      titleDeed: 'Title Deed',
      ec: 'Encumbrance Certificate (EC)',
      layoutPlan: 'Layout Plan',
      khata: 'Khata Certificate',
    };
    const selectedDocs = buyRequestDocs.map(d => docLabels[d] || d).join(', ');
    setBuyRequestError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'buyRequest',
          userName: user?.displayName || user?.email?.split('@')[0] || 'Buyer',
          userEmail: user?.email || '',
          plotId: requestingDocsFor?.id,
          plotTitle: requestingDocsFor?.title,
          plotLocation: requestingDocsFor?.location,
          plotPrice: requestingDocsFor?.price,
          plotSize: requestingDocsFor?.size,
          requestedDocs: selectedDocs,
          specificQuery: buyRequestQuery,
        }),
      });
      // fetch() only rejects on a network failure — a 500 response still
      // resolves "successfully", so the actual result has to be checked here.
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.details || data?.error || 'The request could not be sent. Please try again.');
      }
      setBuyRequestSuccess(true);
      setBuyRequestQuery('');
      setTimeout(() => { setBuyRequestSuccess(false); navigate('interested'); }, 3000);
    } catch (err) {
      console.error('Buy request form error:', err);
      setBuyRequestError('Sorry, something went wrong sending your request. Please try again, or email us directly at support@a1plot.com.');
    } finally {
      setBuyRequestSubmitting(false);
    }
  };
  // Only these views ever show a "liked/interested" heart or the Interests
  // list — everywhere else (dashboard, admin, listing form, login, etc.) was
  // paying for a live per-user Firestore listener it never rendered.
  const needsInterests = ['home', 'buyer-map', 'interested', 'property-detail'].includes(view);
  const { interestedPlots, addInterest, removeInterest } = useInterests(user?.uid, needsInterests);
  // Broker network + buyer-requirement data. On the admin panel, load ALL
  // brokers (the approval queue). Only APPROVED brokers subscribe to buyer
  // requirements — pending/rejected would just get permission-denied.
  const { myBrokerProfile, myBrokerProfileLoading, allBrokers, saveBroker, approveBroker, rejectBroker } =
    useBrokers(user?.uid, ADMIN_EMAILS.includes(user?.email) && view === 'admin');
  const requirementsMode = view === 'broker-dashboard' && myBrokerProfile?.status === 'approved' ? 'broker' : 'none';
  const { requirements, loading: requirementsLoading, addRequirement } = useRequirements(requirementsMode, user?.uid);
  // Mirrors the signed-in user into the `users` collection on every sign-in, and
  // (admins only, on the admin panel) loads the whole signed-in-user directory.
  const { allUsers, loading: usersLoading } =
    useUsers(user, ADMIN_EMAILS.includes(user?.email) && view === 'admin');
  // A broker's shareable client catalogs — only subscribed on their dashboard.
  const { catalogs, loading: catalogsLoading, createCatalog, updateCatalog, deleteCatalog } =
    useCatalogs(user?.uid, view === 'broker-dashboard');
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  // Google's photoURL sometimes fails to load with a bare <img> (referrer
  // policy) — falls back to the placeholder icon instead of a broken image.
  const [avatarError, setAvatarError] = useState(false);

  // Admin check
  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  // Listen for auth state changes
  useEffect(() => {
    if (auth && typeof onAuthStateChanged === 'function' && auth.onAuthStateChanged) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock auth bypass if Firebase isn't configured for testing
      setAuthLoading(false);
    }
  }, []);

  // If someone lands on /login?redirect=... while already signed in (e.g.
  // clicking "Broker" in the header when already logged in), skip the login
  // form entirely and go straight to the intended destination.
  useEffect(() => {
    if (!authLoading && view === 'login' && user && redirectTarget) {
      navigate(redirectTarget);
      setRedirectTarget(null);
    }
  }, [authLoading, view, user, redirectTarget]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setAvatarError(false); }, [user?.photoURL]);

  // Listing/broker forms always ask for a contact email + phone. When we
  // already know them (real account, or an existing broker profile), prefill
  // rather than making the person retype — they stay editable either way.
  useEffect(() => {
    if (user && !user.isAnonymous && user.email) {
      setLeadEmail(prev => prev || user.email);
    }
  }, [user]);

  useEffect(() => {
    if (myBrokerProfile?.phone) setLeadPhone(prev => prev || myBrokerProfile.phone);
  }, [myBrokerProfile?.phone]);

  const handleGoogleSignIn = async () => {
    if (!auth || !auth.app) { setAuthError('Firebase not configured. Check .env file.'); return; }
    try {
      setAuthError('');
      // The resolver is passed here rather than baked into initializeAuth (see
      // src/firebase.js): that keeps its ~93KB firebaseapp.com iframe off every
      // page load and pulls it in only when someone actually clicks sign in.
      const result = await signInWithPopup(auth, googleProvider, popupRedirectResolver);
      if (result?.user) {
        const target = redirectTarget || (['login', 'home'].includes(view) ? 'home' : view);
        navigate(target);
        setRedirectTarget(null);
      }
    } catch (err) {
      const code = err?.code || '';
      let msg = '';
      if (code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup was closed. Please try again.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'Popup was blocked by the browser. Please allow popups for this site and try again.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized for sign-in. The site admin needs to add this domain in Firebase Console → Authentication → Settings → Authorized domains.';
      } else if (code === 'auth/cancelled-popup-request') {
        return; // User clicked again before previous popup resolved, ignore
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error. Please check your internet connection and try again.';
      } else {
        msg = err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)\.?/, '').trim() || 'Sign-in failed. Please try again.';
      }
      if (msg) setAuthError(msg);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!auth || !auth.app) { setAuthError('Firebase not configured. Check .env file'); return; }
    setAuthError('');
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setAuthEmail('');
      setAuthPassword('');
      const target = redirectTarget || (['login', 'home'].includes(view) ? 'home' : view);
      navigate(target);
      setRedirectTarget(null);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', '').replace('auth/', ''));
    }
  };

  const handleSignOut = async () => {
    if (auth && auth.app) {
      await signOut(auth);
    }
    navigate('home');
  };



  const handleLocateMe = (setCenter) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCenter(loc);
          setUserLocation(loc);
        },
        () => {
          alert("Could not get your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Gate seller features behind auth
  const requireAuth = (targetView) => {
    if (!user) {
      setRedirectTarget(targetView);
      navigate('login');
    } else {
      navigate(targetView);
    }
  };

  // A "real" account — i.e. Google/email sign-in, not the invisible anonymous
  // session we create for people who list without logging in. Used to decide
  // whether we still need to ASK for an email address.
  const isRealAccount = !!user && !user.isAnonymous;

  /**
   * ensureAuth — guarantees there's SOME Firebase principal before a Firestore
   * write, without ever showing a sign-in screen.
   *
   * Listing a property and registering as a broker no longer require signing
   * in; we collect an email + phone instead. But firestore.rules still demand
   * `request.auth != null` on create — that's what stops anyone on the internet
   * from writing unlimited junk into `plots`/`brokers`. Anonymous auth squares
   * the two: the visitor sees no login step, while the rules keep working.
   *
   * Requires the Anonymous provider to be enabled in
   * Firebase Console → Authentication → Sign-in method.
   */
  const ensureAuth = async () => {
    if (user) return user;
    if (!auth || !auth.app) throw new Error('Authentication is unavailable. Please try again later.');
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (err) {
      console.error('Anonymous sign-in failed:', err);
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error('Guest listing is not enabled yet. Please enable Anonymous sign-in in the Firebase console, or log in to continue.');
      }
      throw new Error('Could not start a guest session. Please check your connection and try again.');
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const onMapLoad = useCallback((map) => {
    const visible = plots.filter(p => p.visibility === 'public' && p.status !== 'Verification Pending' && p.status !== 'Rejected');
    if (visible.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      visible.forEach(plot => {
        if (plot.lat && plot.lng) {
          bounds.extend({ lat: plot.lat, lng: plot.lng });
        }
      });
      map.fitBounds(bounds, { padding: 60 });
    }
  }, [plots]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Synchronize browser URL bar and back/forward browser buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (params.get('bypass') === 'true' || params.get('bypass') === '1') {
        setView('direct-list');
        return;
      }
      const targetView = pathToView[currentPath] || 'home';
      setView(targetView);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial view based on current path on page load
    const initialPath = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (params.get('bypass') === 'true' || params.get('bypass') === '1') {
      setView('direct-list');
    } else if (pathToView[initialPath]) {
      setView(pathToView[initialPath]);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (v) => {
    setView(v);
    setMobileMenuOpen(false);
    setProfileOpen(false);
    const newPath = viewToPath[v] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  };

  const handleToggleInterest = async (plot) => {
    if (!user) {
      showToast("Please log in to save properties to your interested list.");
      return;
    }
    const isInterested = interestedPlots.some(p => p.id === plot.id);
    if (isInterested) {
      if (removeInterest) await removeInterest(plot.id);
      showToast("Removed property from your 'Interested' list.");
    } else {
      await addInterest(plot);
      showToast("You have this property, and it is saved in the 'Interested' section.");
    }
  };

  const handleDetailInterestClick = async (plot) => {
    if (!user) {
      showToast("Please log in to express interest in this property.");
      return;
    }
    const isContacted = contactedPlots.includes(plot.id);
    if (isContacted) {
      navigate('contact');
      return;
    }

    if (!interestedPlots.some(p => p.id === plot.id)) {
      await addInterest(plot);
    }

    setContactedPlots(prev => [...prev, plot.id]);
    showToast("Interest registered! Sending contact details to seller rep...");

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: 'ykandoi20330@gmail.com',
          userEmail: user.email,
          userName: user.displayName || user.email.split('@')[0],
          plotId: plot.id,
          plotTitle: plot.title,
          plotLocation: plot.location,
          plotPrice: plot.price,
          plotSize: plot.size
        })
      });
      if (response.ok) {
        showToast("Seller has been notified of your interest!");
      } else {
        console.error("Failed to notify seller via email");
      }
    } catch (err) {
      console.error("Error calling send-email API:", err);
    }
  };

  // File upload handlers
  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      isVideo: file.type.startsWith('video/')
    }));
    setMediaFiles(prev => [...prev, ...newMedia]);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleDocSelect = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));
    setDocFiles(prev => [...prev, ...newDocs]);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  // Upload a document file to Firebase Storage and return its download URL
  const uploadDocToStorage = async (fileObj) => {
    if (!storage) {
      // If Firebase Storage isn't configured, return a local object URL as fallback
      return URL.createObjectURL(fileObj.file);
    }
    const storageRef = ref(storage, `documents/${Date.now()}_${fileObj.name}`);
    await uploadBytes(storageRef, fileObj.file);
    return await getDownloadURL(storageRef);
  };

  const removeMediaFile = (id) => {
    setMediaFiles(prev => {
      const toRemove = prev.find(f => f.id === id);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const removeDocFile = (id) => {
    setDocFiles(prev => prev.filter(f => f.id !== id));
  };

  function fetchAddressFromCoords(lat, lng) {
    try {
      if (!window.google?.maps?.Geocoder) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat: Number(lat), lng: Number(lng) } }, (results, status) => {
        if (status === 'OK' && results && results[0] && results[0].address_components) {
          let state = '';
          let district = '';
          let tehsil = '';
          let village = '';
          results[0].address_components.forEach(comp => {
            const types = comp.types || [];
            if (types.includes('administrative_area_level_1')) state = comp.long_name;
            if (types.includes('administrative_area_level_3')) tehsil = comp.long_name;
            if (types.includes('administrative_area_level_2')) district = comp.long_name;
            if (types.includes('sublocality') || types.includes('locality') || types.includes('neighborhood')) {
              if (!village) village = comp.long_name;
            }
          });
          if (!village && results[0].address_components[0]) village = results[0].address_components[0].long_name;
          
          setNewPlot(prev => ({
            ...prev,
            state: state || prev.state,
            district: district || prev.district,
            tehsil: tehsil || prev.tehsil,
            village: village || prev.village,
            location: results[0].formatted_address || prev.location
          }));
        }
      });
    } catch (err) {
      console.error("fetchAddressFromCoords error:", err);
    }
  }

    const getStateBhulekhLink = (stateName) => {
    if (!stateName) return 'https://landrecords.gov.in/';
    const lowerState = stateName.toLowerCase();
    
    // Priority to Bhu-Naksha (Cadastral Map) Portals
    if (lowerState.includes('rajasthan')) return 'https://bhunaksha.rajasthan.gov.in/';
    if (lowerState.includes('uttar') && lowerState.includes('pradesh')) return 'https://upbhunaksha.gov.in/';
    if (lowerState.includes('maharashtra')) return 'https://mahabhunaksha.mahabhumi.gov.in/';
    if (lowerState.includes('bihar')) return 'https://bhunaksha.bihar.gov.in/';
    if (lowerState.includes('chhattisgarh') || lowerState.includes('chhatisgarh')) return 'https://bhunaksha.cg.nic.in/';
    if (lowerState.includes('jharkhand')) return 'https://jharbhoomi.jharkhand.gov.in/bhunaksha/';
    if (lowerState.includes('odisha') || lowerState.includes('orissa')) return 'https://bhunakshaodisha.nic.in/';
    
    // Integrated land record portals
    if (lowerState.includes('madhya') && lowerState.includes('pradesh')) return 'https://mpbhulekh.gov.in/';
    if (lowerState.includes('karnataka')) return 'https://landrecords.karnataka.gov.in/Service84/';
    if (lowerState.includes('gujarat')) return 'https://anyror.gujarat.gov.in/';
    if (lowerState.includes('haryana')) return 'https://jamabandi.nic.in/';
    if (lowerState.includes('punjab')) return 'https://jamabandi.punjab.gov.in/';
    if (lowerState.includes('telangana')) return 'https://dharani.telangana.gov.in/gis/';
    if (lowerState.includes('andhra') && lowerState.includes('pradesh')) return 'https://meebhoomi.ap.gov.in/';
    if (lowerState.includes('tamil nadu') || lowerState.includes('tamilnadu')) return 'https://eservices.tn.gov.in/';
    if (lowerState.includes('kerala')) return 'https://emrekha.kerala.gov.in/';
    if (lowerState.includes('west bengal')) return 'https://banglarbhumi.gov.in/';
    if (lowerState.includes('assam')) return 'https://revenueassam.nic.in/';
    if (lowerState.includes('uttarakhand')) return 'https://bhulekh.uk.gov.in/';
    if (lowerState.includes('himachal')) return 'https://himbhoomi.nic.in/';

    return 'https://landrecords.gov.in/'; // Generic fallback
  };

  // Places autocomplete handler
  const onPlaceSelected = () => {
    try {
      if (!autocompleteRef.current) return;
      const place = autocompleteRef.current.getPlace();
      if (!place) return;
      const addr = place.formatted_address || place.name || '';

      if (place.geometry && place.geometry.location) {
        // Normal path — geometry returned
        const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
        const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
        setPlotLocation({ lat, lng });
        setNewPlot(prev => ({ ...prev, location: addr }));
        if (locationInputRef.current) locationInputRef.current.value = addr;
        fetchAddressFromCoords(lat, lng);
      } else if (addr) {
        // Fallback: use Geocoder when geometry is missing (Places API (New) quirk)
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: addr }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const fallbackLat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
            const fallbackLng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
            setPlotLocation({ lat: fallbackLat, lng: fallbackLng });
            const formattedAddr = results[0].formatted_address || addr;
            setNewPlot(prev => ({ ...prev, location: formattedAddr }));
            if (locationInputRef.current) locationInputRef.current.value = formattedAddr;
            fetchAddressFromCoords(fallbackLat, fallbackLng);
          }
        });
      }
    } catch (err) {
      console.error("onPlaceSelected error:", err);
    }
  };

  const onMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPlotLocation({ lat, lng });
    fetchAddressFromCoords(lat, lng);
  };

  const handleToggleDrawingMode = () => {
    if (isDrawingMode) {
      // Stopping drawing
      setIsDrawingMode(false);
      const sorted = getSortedPolygonPath(polygonPath);
      if (sorted.length >= 3 && window.google?.maps?.geometry?.encoding) {
        const latLngs = sorted.map(p => new window.google.maps.LatLng(p.lat, p.lng));
        const encodedPath = window.google.maps.geometry.encoding.encodePath(latLngs);
        const avgLat = sorted.reduce((sum, p) => sum + p.lat, 0) / sorted.length;
        const avgLng = sorted.reduce((sum, p) => sum + p.lng, 0) / sorted.length;
        const markersParam = encodeURIComponent(`color:red|${avgLat},${avgLng}`);
        const pathParam = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodedPath}`);
        const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=hybrid&zoom=19&markers=${markersParam}&path=${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
        
        setMediaFiles(prev => {
          const filtered = prev.filter(f => !f.isStaticMap);
          return [{ id: 'static-map-' + Date.now(), preview: url, name: 'Boundary Map Preview', isStaticMap: true }, ...filtered];
        });
      }
      if (sorted.length > 0) {
        fetchAddressFromCoords(sorted[0].lat, sorted[0].lng);
      }
    } else {
      // Starting drawing
      setIsDrawingMode(true);
      setMediaFiles(prev => prev.filter(f => !f.isStaticMap));
    }
  };

  const handleMapClickForDrawing = (e) => {
    if (isDrawingMode) {
      const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      const updatedPath = [...polygonPath, newPoint];
      setPolygonPath(updatedPath);
      
      // Calculate area if we have at least 3 points
      const sortedPath = getSortedPolygonPath(updatedPath);
      if (sortedPath.length >= 3 && window.google?.maps?.geometry?.spherical) {
        const areaSqMeters = window.google.maps.geometry.spherical.computeArea(sortedPath);
        let formattedSize = '';
        if (areaSqMeters >= 1000000) {
          formattedSize = (areaSqMeters / 1000000).toFixed(3) + ' km²';
        } else {
          formattedSize = Math.round(areaSqMeters).toLocaleString() + ' m²';
        }
        setNewPlot(prev => ({ ...prev, size: formattedSize }));
      }
    }
  };

  // Admin actions.
  //
  // Status is the single control. Visibility is written alongside it rather
  // than being a separate switch someone can set independently — the public
  // site's Firestore query filters on `visibility`, so it still has to exist,
  // but it is now always whatever the status implies. Previously a listing
  // could be Rejected and still flagged public, or Verified and hidden.
  const setPlotStatus = async (plotId, status) => {
    await updatePlot(plotId, {
      status,
      badge: status === 'Verified' ? 'Verified' : status === 'Rejected' ? 'Rejected' : 'Pending',
      visibility: visibilityForStatus(status),
    });
  };

  // One-time reconciliation of legacy records.
  //
  // Before status drove visibility, the two were set independently, so the
  // database holds listings that are Rejected yet flagged public, or Verified
  // yet private. New writes can no longer diverge, but existing documents
  // still can, and the public site queries on `visibility`.
  //
  // This runs in the app rather than as an offline script because
  // firestore.rules only permits an admin to update a listing, so it needs a
  // signed-in admin session — which is exactly what viewing this panel is. It
  // touches only documents that actually disagree, and runs at most once per
  // session.
  const visibilityBackfilled = useRef(false);
  useEffect(() => {
    if (!isAdmin || view !== 'admin' || plotsLoading) return;
    if (visibilityBackfilled.current) return;
    const wrong = plots.filter(p => p?.id && p.visibility !== visibilityForStatus(plotStatusOf(p)));
    if (wrong.length === 0) { visibilityBackfilled.current = true; return; }
    visibilityBackfilled.current = true;
    (async () => {
      let fixed = 0;
      for (const p of wrong) {
        try {
          await updatePlot(p.id, { visibility: visibilityForStatus(plotStatusOf(p)) });
          fixed++;
        } catch (err) {
          console.error('visibility backfill failed for', p.id, err);
        }
      }
      if (fixed > 0) showToast(`Synced visibility on ${fixed} listing${fixed === 1 ? '' : 's'} to match their status.`);
    })();
  }, [isAdmin, view, plotsLoading, plots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerifyPlot = (plotId) => setPlotStatus(plotId, 'Verified');
  const handleRejectPlot = (plotId) => setPlotStatus(plotId, 'Rejected');
  const handlePendingPlot = (plotId) => setPlotStatus(plotId, 'Verification Pending');

  // Admin: approve / reject a broker application.
  const handleApproveBroker = async (broker) => {
    try {
      await approveBroker(broker.uid);
      showToast(`Approved broker: ${broker.name || broker.email || broker.uid}`);
    } catch (e) {
      showToast('Failed to approve broker. Please try again.');
    }
  };
  const handleRejectBroker = async (broker) => {
    const ok = window.confirm(`Reject broker "${broker.name || broker.email || 'this applicant'}"? They will lose access to buyer requirements.`);
    if (!ok) return;
    try {
      await rejectBroker(broker.uid);
      showToast(`Rejected broker: ${broker.name || broker.email || broker.uid}`);
    } catch (e) {
      showToast('Failed to reject broker. Please try again.');
    }
  };

  const handleDeletePlot = async (plot) => {
    const ok = window.confirm(`Delete "${plot.title || 'this property'}" permanently? This removes it from the list and cannot be undone.`);
    if (!ok) return false;
    try {
      await deletePlot(plot.id);
      showToast('Property deleted.');
      return true;
    } catch (e) {
      showToast('Failed to delete property. Please try again.');
      return false;
    }
  };

  // Render an epoch-ms (or Firestore Timestamp) as a readable IST date.
  const formatTimestamp = (ts) => {
    if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') ts = ts.toDate().getTime(); // Firestore Timestamp
    if (!ts) return '—';
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Format the time a property was listed for the admin table.
  const formatListedTime = (plot) => {
    let ts = plot.createdAt;
    if (ts && typeof ts === 'object' && typeof ts.toDate === 'function') ts = ts.toDate().getTime();
    if (!ts && /^\d{13}$/.test(String(plot.id))) ts = Number(plot.id); // legacy: id was Date.now()
    return formatTimestamp(ts);
  };

  // Resolve who uploaded a listing for the admin table. New listings carry a
  // structured `uploadedBy`; anything created before that field existed is
  // reconstructed from the ownerEmail/ownerUid/developer columns it did have,
  // so historical rows still show a real person instead of a blank cell.
  const resolveUploader = (plot) => {
    if (plot.uploadedBy?.name || plot.uploadedBy?.email) {
      return {
        name: plot.uploadedBy.name || plot.uploadedBy.email.split('@')[0],
        email: plot.uploadedBy.email || '',
        role: plot.uploadedBy.role || 'user',
      };
    }
    if (plot.ownerUid === 'admin') return { name: 'A1Plot (seed)', email: '', role: 'admin' };
    if (plot.ownerUid === 'meta-ad') return { name: 'Meta Ads Lead', email: plot.ownerEmail || '', role: 'lead' };
    if (plot.ownerEmail) {
      return {
        name: plot.ownerEmail.split('@')[0],
        email: plot.ownerEmail,
        role: ADMIN_EMAILS.includes(plot.ownerEmail) ? 'admin' : 'user',
      };
    }
    return { name: 'Unknown', email: '', role: 'unknown' };
  };

  // The three states a listing can be in. Visibility is no longer a separate
  // switch an admin sets: a Verified listing is public, anything Pending or
  // Rejected is not. The `visibility` field is still written, because the
  // public site's Firestore query filters on it — it is just derived now
  // rather than chosen, so the two can never contradict each other.
  const PLOT_STATUSES = ['Verified', 'Verification Pending', 'Rejected'];
  const plotStatusOf = (p) => (PLOT_STATUSES.includes(p?.status) ? p.status : 'Verified');
  const visibilityForStatus = (status) => (status === 'Verified' ? 'public' : 'private');
  const STATUS_RANK = { 'Verified': 0, 'Verification Pending': 1, 'Rejected': 2 };
  // Listings submitted by users come before ones the admin added themselves.
  const uploaderRank = (p) => (resolveUploader(p).role === 'admin' ? 1 : 0);

  const UPLOADER_ROLE_STYLES = {
    admin:   { bg: '#ede9fe', color: '#5b21b6' },
    broker:  { bg: '#dbeafe', color: '#1e40af' },
    user:    { bg: '#dcfce7', color: '#166534' },
    lead:    { bg: '#fef3c7', color: '#92400e' },
    unknown: { bg: '#f1f5f9', color: '#475569' },
  };

  const renderUploadedBy = (plot) => {
    const u = resolveUploader(plot);
    const style = UPLOADER_ROLE_STYLES[u.role] || UPLOADER_ROLE_STYLES.unknown;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 140 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</span>
        {u.email && (
          <a
            href={`mailto:${u.email}`}
            onClick={(e) => e.stopPropagation()}
            style={{ fontSize: '0.75rem', color: 'var(--primary)' }}
          >
            {u.email}
          </a>
        )}
        <span style={{
          alignSelf: 'flex-start', padding: '0.1rem 0.45rem', borderRadius: 999,
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '.03em', background: style.bg, color: style.color,
        }}>
          {u.role}
        </span>
      </div>
    );
  };

  // plotStaticMapUrl() / the admin-edit equivalent return a LIVE
  // maps.googleapis.com URL. Storing that URL directly as `image`/`media`
  // meant every later view of the listing — every card grid, every detail
  // page, every row in the admin table — re-fetched it from Google's Static
  // Maps API, billing the key on every page load instead of once. This
  // fetches that URL a single time at submit time and uploads the resulting
  // image to Firebase Storage, so every later view loads the stored copy
  // instead (and still works if the Maps API/billing ever breaks again).
  // Returns null — same contract as plotStaticMapUrl itself — if there's no
  // URL to capture or the fetch/upload fails, so callers fall back to their
  // existing "no image" handling rather than storing a broken link.
  const captureAndStoreMapImage = async (liveMapUrl) => {
    if (!liveMapUrl || !storage) return null;
    try {
      const res = await fetch(liveMapUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      const sRef = ref(storage, `media/${Date.now()}_boundary-snapshot.png`);
      await uploadBytes(sRef, blob);
      return await getDownloadURL(sRef);
    } catch (err) {
      console.warn('Static map snapshot capture failed:', err);
      return null;
    }
  };

  // Small client-side helper for the "AI Property Add" vision payload only —
  // produces a throwaway, downscaled JPEG copy to keep the request small. It
  // never touches the original File objects; those still go to Firebase
  // Storage unchanged via handleListProperty below.
  const compressImageForAI = (fileObj) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
    };
    img.onerror = reject;
    img.src = fileObj.preview || URL.createObjectURL(fileObj.file);
  });

  // "Extract with AI" — sends the free-text description (plus up to 2 of
  // whatever photos are already in mediaFiles) to /api/ai-property-extract,
  // then merges whatever fields come back into newPlot. Never writes to
  // Firestore itself — the seller still reviews the now-prefilled form and
  // submits through the unmodified handleListProperty/addPlot path below.
  const handleAiExtract = async () => {
    if (!aiPrompt.trim() || aiExtracting) return;
    setAiExtracting(true);
    setAiExtractError('');
    try {
      const imageFiles = mediaFiles.filter(f => f.file && f.file.type.startsWith('image/')).slice(0, 2);
      const images = await Promise.all(imageFiles.map(compressImageForAI));
      const res = await fetch('/api/ai-property-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiPrompt.slice(0, 4000), images }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not extract details from that description. Please try rephrasing, or fill the form manually.');
      }
      setNewPlot(prev => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(data.fields || {})) {
          if (value === null || value === '') continue;
          next[key] = value;
        }
        return next;
      });
      setAiExtracted(true);
    } catch (err) {
      console.error('AI extract error:', err);
      setAiExtractError(err.message || 'Something went wrong. Please try again, or fill the form manually.');
    } finally {
      setAiExtracting(false);
    }
  };

  // "Bulk Import from Broker Message" (admin only) — one AI call splits a
  // pasted blob into N draft listings; nothing is saved until the admin
  // reviews each draft and clicks Submit All.
  const handleBulkExtract = async () => {
    if (!bulkText.trim() || bulkExtracting) return;
    setBulkExtracting(true);
    setBulkError('');
    try {
      const res = await fetch('/api/ai-property-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'bulk', description: bulkText.slice(0, 8000) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not read that text. Please check it and try again.');
      }
      setBulkDrafts((data.listings || []).map((fields, i) => ({
        _id: `${Date.now()}_${i}`,
        included: true,
        ...fields,
      })));
    } catch (err) {
      console.error('Bulk extract error:', err);
      setBulkError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBulkExtracting(false);
    }
  };

  const handleBulkDraftChange = (id, key, value) => {
    setBulkDrafts(prev => prev.map(d => (d._id === id ? { ...d, [key]: value } : d)));
  };

  const handleBulkRemoveDraft = (id) => {
    setBulkDrafts(prev => prev.filter(d => d._id !== id));
  };

  // Bypasses handleListProperty (that function assumes the public listing
  // form's state — mediaFiles, a visited map pin, a lead phone/email — none
  // of which exist for a pasted text blob) and calls addPlot directly, with
  // the same required fields and 'Verification Pending' status any other
  // listing gets.
  const handleBulkSubmitAll = async () => {
    const toSubmit = bulkDrafts.filter(d => d.included);
    if (toSubmit.length === 0 || bulkSubmitting) return;
    setBulkSubmitting(true);
    try {
      const authedUser = await ensureAuth();
      const contactEmail = (isRealAccount ? user.email : '') || '';
      await Promise.all(toSubmit.map(({ _id, included, sourceText, ...fields }) => addPlot({
        ...fields,
        id: `${Date.now()}_${_id}`,
        createdAt: Date.now(),
        // Derived, never hardcoded — see visibilityForStatus. This used to be
        // hardcoded 'public', which left a bulk-imported listing publicly
        // visible to anyone with a direct /property/<slug> link while it was
        // still Verification Pending.
        visibility: visibilityForStatus('Verification Pending'),
        ownerUid: authedUser?.uid || 'admin-bulk-import',
        ownerEmail: contactEmail,
        ownerPhone: '',
        uploadedBy: {
          uid: authedUser?.uid || null,
          name: user?.displayName || 'Admin',
          email: contactEmail,
          phone: '',
          role: 'admin',
          agency: '',
          at: Date.now(),
        },
        status: 'Verification Pending',
        cagr: 'TBD',
        developer: 'Admin Listed',
        badge: 'New',
        image: '',
        media: [],
        documentsAvailable: [],
        lat: null,
        lng: null,
        polygonPath: null,
        priceHistory: [],
        investedAmount: 0,
        currentValue: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
      })));
      showToast(`Added ${toSubmit.length} listing${toSubmit.length === 1 ? '' : 's'} as Verification Pending.`);
      setBulkDrafts([]);
      setBulkText('');
    } catch (err) {
      console.error('Bulk submit error:', err);
      setBulkError('Some listings failed to save. Please try again.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleListProperty = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Listing no longer requires an account, but we DO require a way to reach
    // the seller. Checked here too (not just via `required` on the inputs) so
    // the phone number is actually validated, not merely non-empty.
    if (!editingPlot) {
      if (!leadEmail.trim() || !leadPhone.trim()) {
        setSubmitError('Please enter both your email address and phone number so buyers can reach you.');
        return;
      }
      if (!isValidPhone(leadPhone)) {
        setSubmitError('Please enter a valid phone number, including the country code.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Creates an invisible guest session when nobody is signed in, so the
      // Firestore write still satisfies `request.auth != null`.
      const authedUser = await ensureAuth();
      // A satellite view of the plot's own coordinates. This used to require a
      // drawn boundary; without one the listing fell through to a stock photo
      // of unrelated farmland (see below). plotStaticMapUrl outlines the parcel
      // when a boundary exists and drops a marker when only a point does, so
      // any listing with coordinates gets a picture of the actual land.
      const staticMapUrl = await captureAndStoreMapImage(plotStaticMapUrl({
        lat: plotLocation.lat,
        lng: plotLocation.lng,
        polygonPath: sortedPolygonPath,
      }));

      if (editingPlot) {
        const updateData = { ...newPlot, lat: plotLocation.lat, lng: plotLocation.lng, polygonPath: sortedPolygonPath.length >= 3 ? sortedPolygonPath : null };
        if (staticMapUrl) {
          updateData.image = staticMapUrl;
          if (!updateData.media) updateData.media = editingPlot.media || [];
          if (!updateData.media.includes(staticMapUrl)) {
            updateData.media = [staticMapUrl, ...updateData.media];
          }
        }
        await updatePlot(editingPlot.id, updateData);
        setEditingPlot(null);
      } else {
        // Upload photos/videos to Firebase Storage
        const uploadableMedia = mediaFiles.filter(f => !f.isStaticMap);
        const uploadedMediaUrls = await Promise.all(
          uploadableMedia.map(async (f) => {
            if (!storage) return f.preview || null;
            try {
              const sRef = ref(storage, `media/${Date.now()}_${f.name}`);
              await uploadBytes(sRef, f.file);
              return await getDownloadURL(sRef);
            } catch (err) {
              console.warn('Media upload failed for', f.name, err);
              return null;
            }
          })
        ).then(urls => urls.filter(Boolean));

        // Build final media array: satellite map first, then uploaded photos
        const finalMedia = [
          ...(staticMapUrl ? [staticMapUrl] : []),
          ...uploadedMediaUrls,
        ];

        // Contact details: a signed-in account supplies its own email, a guest
        // typed one into the form. Phone always comes from the form — Google
        // sign-in never gives us one.
        const contactEmail = (isRealAccount ? user.email : leadEmail.trim()) || leadEmail.trim() || '';
        const contactPhone = leadPhone.trim() || myBrokerProfile?.phone || '';
        // Who to credit. A registered broker's profile name wins — it's the
        // name they gave us — then the account display name, then the email.
        const uploaderName =
          myBrokerProfile?.name
          || (isRealAccount ? (user.displayName || user.email?.split('@')[0]) : '')
          || (contactEmail ? contactEmail.split('@')[0] : '')
          || 'Guest Lister';
        const uploaderRole = isAdmin ? 'admin' : (myBrokerProfile ? 'broker' : (isRealAccount ? 'user' : 'guest'));

        const plot = {
          ...newPlot,
          id: Date.now().toString(),
          createdAt: Date.now(),
          ownerUid: authedUser?.uid || 'meta-ad',
          ownerEmail: contactEmail,
          ownerPhone: contactPhone,
          // Who actually submitted this listing. ownerUid/ownerEmail already
          // exist but are bare identifiers — this keeps the human-readable name
          // and the role they held at submission time, so the admin panel can
          // show "uploaded by X (broker)" without a second lookup.
          uploadedBy: {
            uid: authedUser?.uid || null,
            name: uploaderName,
            email: contactEmail,
            phone: contactPhone,
            role: uploaderRole,
            agency: myBrokerProfile?.agency || '',
            at: Date.now(),
          },
          status: 'Verification Pending',
          cagr: 'TBD',
          developer: myBrokerProfile ? (myBrokerProfile.agency || 'Broker Listed') : (isRealAccount ? 'Self Listed' : 'Guest Listed'),
          badge: 'New',
          // No stock photo. This was `finalMedia[0] || fallbackImage`, which
          // pasted an Unsplash picture of someone else's field onto any
          // listing without uploads — six of eight live listings were showing
          // it. An empty string renders the "no photo" state instead, and the
          // display layer substitutes a satellite view of the real location.
          image: finalMedia[0] || '',
          media: finalMedia,
          documentsAvailable: await Promise.all(docFiles.map(f => uploadDocToStorage(f))),
          lat: plotLocation.lat,
          lng: plotLocation.lng,
          polygonPath: sortedPolygonPath.length >= 3 ? sortedPolygonPath : null,
          priceHistory: [],
          investedAmount: 0,
          currentValue: 0,
          purchaseDate: new Date().toISOString().split('T')[0]
        };
        await addPlot(plot);

        // Conversion signal for the property listing form submission
        if (typeof window !== 'undefined') {
          const parsePriceToNumeric = (priceStr) => {
            if (!priceStr) return 0;
            try {
              let cleaned = String(priceStr).replace(/[₹,\s]/g, '').trim().toLowerCase();
              let matches = cleaned.match(/^([\d.]+)\s*(crore|cr|lakh|l|k)?$/);
              if (!matches) {
                let numMatch = cleaned.match(/[\d.]+/);
                return numMatch ? parseFloat(numMatch[0]) : 0;
              }
              let val = parseFloat(matches[1]);
              let unit = matches[2];
              if (unit === 'crore' || unit === 'cr') return val * 10000000;
              if (unit === 'lakh' || unit === 'l') return val * 100000;
              if (unit === 'k') return val * 1000;
              return val;
            } catch (err) {
              console.warn('Error parsing price in parsePriceToNumeric:', err);
              return 0;
            }
          };

          const formData = {
            expected_price: parsePriceToNumeric(newPlot.price)
          };

          try {
            if (window.fbq) {
              window.fbq('track', 'CompleteRegistration', {
                content_name: 'Property Listing Created',
                currency: 'INR',
                value: formData.expected_price, // the seller's asking price
                status: 'listed'
              });
              console.log('CompleteRegistration event tracked successfully with value:', formData.expected_price);
            } else {
              console.warn('window.fbq not defined during tracking attempt.');
            }
          } catch (err) {
            console.error('Failed to track CompleteRegistration event:', err);
          }

          try {
            if (window.gtag) {
              window.gtag('event', 'sign_up', {
                method: 'property_listing_form'
              });
              console.log('Google Analytics sign_up event tracked successfully.');
            } else {
              console.warn('window.gtag not defined during tracking attempt.');
            }
          } catch (err) {
            console.error('Failed to track sign_up event:', err);
          }
        }
      }
      setNewPlot({ title: '', location: '', price: '', size: '', features: '', visibility: 'public', khasraNumber: '', state: '', district: '', tehsil: '', village: '', city: '', transactionType: 'sale', propertyType: 'land', landType: 'converted', landUse: 'residential', constructedType: 'flat', constructionStatus: 'constructed', budgetRange: '', facingDirection: 'East', cornerProperty: false, parkFacing: false, roadFacing: false });
      setLeadEmail('');
      setLeadPhone('');
      setListingMode('manual');
      setAiPrompt('');
      setAiExtracted(false);
      setAiExtractError('');
      setMediaFiles([]);
      setDocFiles([]);
      setPolygonPath([]);
      setIsDrawingMode(false);
      setPlotLocation({ lat: 20.5937, lng: 78.9629 });
      
      if (view === 'direct-list') {
        showToast("Property successfully listed! Our admin team will verify it soon.");
        setTimeout(() => {
          navigate('home');
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('seller-dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setSubmitError(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (plot) => {
    setEditingPlot(plot);
    setNewPlot({
      title: plot.title,
      location: plot.location,
      price: plot.price,
      size: plot.size,
      features: plot.features || '',
      additionalInfo: plot.additionalInfo || '',
      visibility: plot.visibility || 'public',
      khasraNumber: plot.khasraNumber || '',
      state: plot.state || '',
      district: plot.district || '',
      tehsil: plot.tehsil || '',
      village: plot.village || '',
      city: plot.city || '',
      transactionType: plot.transactionType || 'sale',
      propertyType: plot.propertyType || 'land',
      landType: plot.landType || 'converted',
      landUse: plot.landUse || 'residential',
      constructedType: plot.constructedType || 'flat',
      constructionStatus: plot.constructionStatus || 'constructed',
      budgetRange: plot.budgetRange || '',
      facingDirection: plot.facingDirection || 'East',
      cornerProperty: plot.cornerProperty || false,
      parkFacing: plot.parkFacing || false,
      roadFacing: plot.roadFacing || false
    });
    setPlotLocation({ lat: plot.lat, lng: plot.lng });
    if (plot.polygonPath) {
      setPolygonPath(plot.polygonPath);
    } else {
      setPolygonPath([]);
    }
    navigate('seller-edit');
  };

  const handleViewProperty = (plot) => {
    setSelectedPropertyDetail(plot);
    setSelectedPropertyDetailId(String(plot.id));
    setAdminPreviewPlot(false);
    navigate('property-detail');
  };

  // "Open" from the admin panel — shows the exact same formatted view a
  // buyer sees (so nothing looks different/broken from the raw Firestore
  // record), with admin actions added on top. Editing is a deliberate next
  // step from there (handleAdminEditClick), not the default landing spot.
  const handleAdminViewClick = (plot) => {
    setSelectedPropertyDetail(plot);
    setSelectedPropertyDetailId(String(plot.id));
    setAdminPreviewPlot(true);
    navigate('property-detail');
  };

  const handleAdminEditClick = (plot) => {
    setAdminPreviewPlot(false);
    setAdminEditingPlot(plot);
    setAdminNewPlot({
      ownerEmail: plot.ownerEmail || '',
      ownerPhone: plot.ownerPhone || '',
      title: plot.title,
      location: plot.location,
      price: plot.price,
      size: plot.size,
      features: plot.features || '',
      additionalInfo: plot.additionalInfo || '',
      visibility: plot.visibility || 'public',
      status: plot.status || 'Verification Pending',
      media: plot.media || (plot.image ? [plot.image] : []),
      documentsAvailable: plot.documentsAvailable || [],
      khasraNumber: plot.khasraNumber || '',
      state: plot.state || '',
      district: plot.district || '',
      tehsil: plot.tehsil || '',
      village: plot.village || '',
      city: plot.city || '',
      transactionType: plot.transactionType || 'sale',
      propertyType: plot.propertyType || 'land',
      landType: plot.landType || 'converted',
      landUse: plot.landUse || 'residential',
      constructedType: plot.constructedType || 'flat',
      constructionStatus: plot.constructionStatus || 'constructed',
      budgetRange: plot.budgetRange || '',
      facingDirection: plot.facingDirection || 'East',
      cornerProperty: plot.cornerProperty || false,
      parkFacing: plot.parkFacing || false,
      roadFacing: plot.roadFacing || false
    });
    setPlotLocation({ lat: plot.lat, lng: plot.lng });
    if (plot.polygonPath) {
      setPolygonPath(plot.polygonPath);
    } else {
      setPolygonPath([]);
    }
    navigate('admin-edit');
  };

  const handleAdminUpdateProperty = async (e) => {
    e.preventDefault();
    if (!adminEditingPlot) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      let staticMapUrl = null;
      if (sortedPolygonPath.length >= 3 && window.google?.maps?.geometry?.encoding) {
        const latLngs = sortedPolygonPath.map(p => new window.google.maps.LatLng(p.lat, p.lng));
        const encodedPath = window.google.maps.geometry.encoding.encodePath(latLngs);
        const avgLat = sortedPolygonPath.reduce((sum, p) => sum + p.lat, 0) / sortedPolygonPath.length;
        const avgLng = sortedPolygonPath.reduce((sum, p) => sum + p.lng, 0) / sortedPolygonPath.length;
        const markersParam = encodeURIComponent(`color:red|${avgLat},${avgLng}`);
        const pathParam = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodedPath}`);
        const liveStaticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=hybrid&zoom=19&markers=${markersParam}&path=${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
        staticMapUrl = await captureAndStoreMapImage(liveStaticMapUrl);
      }
      
      let finalMedia = adminNewPlot.media || [];
      if (staticMapUrl && !finalMedia.includes(staticMapUrl)) {
        finalMedia = [staticMapUrl, ...finalMedia];
      }
      const uploadableMedia = mediaFiles.filter(f => !f.isStaticMap);
      if (uploadableMedia.length > 0) {
        const newUrls = uploadableMedia.map(f => f.preview || 'https://via.placeholder.com/600');
        finalMedia = [...finalMedia, ...newUrls];
      }
      let finalDocs = adminNewPlot.documentsAvailable || [];
      if (docFiles.length > 0) {
        const uploadedUrls = await Promise.all(docFiles.map(f => uploadDocToStorage(f)));
        finalDocs = [...finalDocs, ...uploadedUrls];
      }

      await updatePlot(adminEditingPlot.id, {
        ownerEmail: adminNewPlot.ownerEmail || '',
        ownerPhone: adminNewPlot.ownerPhone || '',
        title: adminNewPlot.title,
        location: adminNewPlot.location,
        price: adminNewPlot.price,
        size: adminNewPlot.size,
        features: adminNewPlot.features,
        additionalInfo: adminNewPlot.additionalInfo || '',
        // Derived, never chosen — see setPlotStatus.
        visibility: visibilityForStatus(adminNewPlot.status),
        status: adminNewPlot.status,
        lat: plotLocation.lat,
        lng: plotLocation.lng,
        polygonPath: sortedPolygonPath.length > 0 ? sortedPolygonPath : null,
        media: finalMedia,
        image: staticMapUrl || (finalMedia.length > 0 ? finalMedia[0] : (adminEditingPlot.image || '')),
        documentsAvailable: finalDocs,
        state: adminNewPlot.state || '',
        district: adminNewPlot.district || '',
        tehsil: adminNewPlot.tehsil || '',
        village: adminNewPlot.village || '',
        khasraNumber: adminNewPlot.khasraNumber || '',
        city: adminNewPlot.city || '',
        transactionType: adminNewPlot.transactionType || 'sale',
        propertyType: adminNewPlot.propertyType || 'land',
        landType: adminNewPlot.landType || 'converted',
        landUse: adminNewPlot.landUse || 'residential',
        constructedType: adminNewPlot.constructedType || 'flat',
        constructionStatus: adminNewPlot.constructionStatus || 'constructed',
        budgetRange: adminNewPlot.budgetRange || '',
        facingDirection: adminNewPlot.facingDirection || 'East',
        cornerProperty: adminNewPlot.cornerProperty || false,
        parkFacing: adminNewPlot.parkFacing || false,
        roadFacing: adminNewPlot.roadFacing || false
      });

      setAdminEditingPlot(null);
      setAdminNewPlot({
        ownerEmail: '',
        ownerPhone: '',
        title: '',
        location: '',
        price: '',
        size: '',
        features: '',
        additionalInfo: '',
        visibility: 'public',
        status: 'Verification Pending',
        media: [],
        documentsAvailable: [],
        khasraNumber: '',
        state: '',
        district: '',
        tehsil: '',
        village: '',
        city: '',
        transactionType: 'sale',
        propertyType: 'land',
        landType: 'converted',
        landUse: 'residential',
        constructedType: 'flat',
        constructionStatus: 'constructed',
        budgetRange: '',
        facingDirection: 'East',
        cornerProperty: false,
        parkFacing: false,
        roadFacing: false
      });
      setMediaFiles([]);
      setDocFiles([]);
      setPolygonPath([]);
      setIsDrawingMode(false);
      navigate('admin');
    } catch (err) {
      console.error('Admin submit failed:', err);
      setSubmitError(err?.message || 'Failed to update property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================
     HOME VIEW
     ============================================ */
  const renderHome = () => (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content text-center">
            <div className="hero-badge">
              <TrendingUp size={16} />
              <span>Real Estate, Simplified</span>
            </div>
            <h1 className="hero-title">
              Invest in Lands <br/>
              <span className="text-primary">Like You Invest in Stocks</span>
            </h1>
            <p className="hero-subtitle">
              Verified, branded land parcels. Transparent pricing. Instant digital booking. <br/>
              Build your real estate portfolio without the friction of traditional brokers.
            </p>
            <div className="flex justify-center gap-4">
              <button className="btn btn-primary" onClick={() => navigate('buyer-map')}>
                Explore Plots <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('seller-list')}>
                List Your Land
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h4>500+</h4>
                <p>Verified Plots</p>
              </div>
              <div className="stat-item">
                <h4>₹500Cr+</h4>
                <p>Asset Value</p>
              </div>
              <div className="stat-item">
                <h4>0%</h4>
                <p>Brokerage</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Portfolio Section - 2nd scroll */}
      <section id="portfolio" className="dashboard-preview">
        <div className="container">
          <div className="dashboard-container">
            <div className="dashboard-text">
              <h2>Your Real Estate Portfolio, Digitized.</h2>
              <p>Trade the messy file folders for a clean, modern dashboard. Track the real-time valuation of your land investments just like your mutual funds or stocks.</p>

              <ul style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', marginBottom: '2rem'}}>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-green" /> <span>Real-time local price indexing</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-green" /> <span>All legal documents in a centralized vault</span>
                </li>
                <li className="flex items-center gap-4">
                  <CheckCircle2 className="text-green" /> <span>Instant exit/resale capabilities</span>
                </li>
              </ul>

              <button className="btn btn-accent" onClick={() => navigate('interested')}>
                See My Interests <ArrowRight size={18} />
              </button>
            </div>

            <div className="dashboard-mockup">
              <div className="mockup-header">
                <div className="font-semibold">My Portfolio <span className="mockup-sample-tag">Sample</span></div>
                <div className="btn btn-secondary" style={{padding: '0.25rem 0.75rem', fontSize: '0.8rem'}}>Export</div>
              </div>

              <div className="mockup-portfolio">
                <div className="text-muted mb-2">Total Current Value</div>
                <div className="flex items-center gap-4">
                  <div className="mockup-value">₹1,24,50,000</div>
                  <div className="mockup-gain">
                    <TrendingUp size={18} /> +18.2%
                  </div>
                </div>
              </div>

              <div style={{height: '200px'}}>
                <MiniLineChart data={chartData} />
              </div>
              <p className="mockup-disclaimer">Sample dashboard. Figures are illustrative only — not actual holdings, and not a projection or guarantee of returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="section bg-white">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Zero Friction Investing</h2>
            <p className="text-muted">Skip the endless negotiations and site visits. We have digitized the entire process.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon"><Search size={24} /></div>
              <h3 className="step-title">1. Discover & Analyze</h3>
              <p className="step-desc">Browse exclusively curated, RERA-approved land parcels. Compare pricing, location metrics, and expected appreciation.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><ShieldCheck size={24} /></div>
              <h3 className="step-title">2. Due Diligence Done</h3>
              <p className="step-desc">Every plot undergoes 50+ legal checks. Access all digital property documents instantly.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><Smartphone size={24} /></div>
              <h3 className="step-title">3. Instant Booking</h3>
              <p className="step-desc">Complete your digital KYC, sign the agreement online, and pay the token amount directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Opportunities */}
      <section id="explore" className="section bg-light">
        <div className="container">
          <div className="flex items-center justify-between mb-12" style={{flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <h2 className="section-title" style={{marginBottom: '0.5rem', textAlign: 'left'}}>All Properties</h2>
              <p className="text-muted">Explore our complete portfolio of high-growth land investments.</p>
            </div>
          </div>

          <div className="plots-grid">
            {plots
              .filter(p => p.visibility !== 'private' && p.status !== 'Verification Pending' && p.status !== 'Rejected')
              .map((plot) => (
              <div 
                key={plot.id} 
                className="plot-card"
                onClick={() => handleViewProperty(plot)}
                style={{
                  cursor: 'pointer', 
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                <div className="plot-image">
                  <div className="plot-badge">{plot.badge || 'Listed'}</div>
                  <button 
                    className={`plot-favorite-btn ${interestedPlots.some(p => p.id === plot.id) ? 'is-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleInterest(plot); }}
                    title="Save to Interested List"
                  >
                    <Heart size={16} fill={interestedPlots.some(p => p.id === plot.id) ? "#ef4444" : "none"} />
                  </button>
                  <img src={plot.image} alt={plot.title} />
                </div>
                <div className="plot-content">
                  <div className="plot-location">
                    <MapPin size={14} /> {plot.location}
                  </div>
                  <h3 className="plot-title">{plot.title}</h3>

                  <div className="plot-metrics">
                    <div className="metric">
                      <span className="metric-label">Expected CAGR</span>
                      <p className="metric-up">
                        <TrendingUp size={16} /> {plot.cagr}
                      </p>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Plot Size</span>
                      <p>{plot.size}</p>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Seller</span>
                      <p>{plot.ownerUid === 'demo' ? plot.developer : 'A1Plot Verified Seller'}</p>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Status</span>
                      <p className="text-green font-semibold">{plot.status}</p>
                    </div>
                  </div>

                  <div className="plot-footer">
                    <div>
                      <span className="price-label">Total Price</span>
                      <div className="plot-price">{plot.price}</div>
                    </div>
                    <button className="btn btn-outline" style={{padding: '0.45rem 1rem', fontSize: '0.85rem'}}>
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section trust-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Built on Absolute Trust</h2>
            <p className="text-muted">Real estate is risky. We remove the risk by only listing bank-approved, heavily vetted properties along with fully transparent agreements.</p>
          </div>

          <div className="trust-badges">
            <div className="trust-badge">
              <div className="trust-icon"><Building size={32} /></div>
              <h4 className="font-semibold mb-2">RERA Registered</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>100% compliance with local authority laws.</p>
            </div>
            <div className="trust-badge">
              <div className="trust-icon"><ShieldCheck size={32} /></div>
              <h4 className="font-semibold mb-2">50-Point Legal Check</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>Title verification by top tier law firms.</p>
            </div>
            <div className="trust-badge">
              <div className="trust-icon"><Clock size={32} /></div>
              <h4 className="font-semibold mb-2">Seamless Exits</h4>
              <p className="text-muted" style={{fontSize: '0.875rem'}}>Built-in secondary marketplace.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  /* ============================================
     SELLER: LISTING FORM
     ============================================ */
  const renderSellerForm = () => (
    <section className="section bg-white" style={{paddingTop: hideChrome ? '1.5rem' : (view === 'direct-list' ? '2rem' : '6rem')}}>
      <div className="container" style={{maxWidth: '800px'}}>
        {/* Skip this heading when mounted inside a real SSR page shell for a
            NEW listing (list_property / direct-list / quick-list / meta-ads)
            — those pages already show their own real heading server-side, so
            this would just duplicate it. Editing keeps its own heading
            regardless, since /edit_property's SSR shell has none of its own. */}
        {!(hideChrome && !editingPlot) && (
          <div className="section-header" style={view === 'direct-list' ? {marginBottom: '1.75rem'} : undefined}>
            <h2 className="section-title">{editingPlot ? 'Edit Land Details' : (view === 'direct-list' ? 'List Your Land Free' : 'List Your Land Parcel')}</h2>
            <p className="text-muted">{editingPlot ? 'Update your property details below.' : (view === 'direct-list' ? 'List your land directly on A1Plot and reach verified buyers across India — zero brokerage, a 50-point legal check, and your listing live within 24 hours. Just fill in the short form below to get started.' : 'Fill in the details below to start the verification process.')}</p>
          </div>
        )}
        {/* AI Property Add: a toggle, not a separate page — keeps
            handleListProperty/addPlot completely untouched below. Only makes
            sense for a brand-new listing reached through the normal flow. */}
        {!editingPlot && !hideChrome && (
          <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
            <button
              type="button"
              className={`btn ${listingMode === 'manual' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setListingMode('manual')}
            >
              Fill form manually
            </button>
            <button
              type="button"
              className={`btn ${listingMode === 'ai' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setListingMode('ai')}
            >
              ✨ Describe it, let AI fill it in
            </button>
          </div>
        )}
        <form className="listing-form" onSubmit={handleListProperty}>
          {/* Contact details. Listing does NOT require an account, so we always
              collect a reachable email + phone — the only exception is editing,
              where the listing already carries the seller's details. */}
          {!editingPlot && (
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                <div className="form-group mb-8">
                  <label>Contact Email Address <span style={{color: 'var(--accent-red)'}}>*</span></label>
                  <input
                    type="email"
                    placeholder="e.g. name@domain.com"
                    className="form-input"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                </div>
                <PhoneField
                  id="listing-phone"
                  label="Contact Phone Number"
                  value={leadPhone}
                  onChange={setLeadPhone}
                />
              </div>
              <p style={{fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 0'}}>
                No account needed — we only use these to reach you about this listing.
              </p>
            </div>
          )}
          {listingMode === 'ai' && !editingPlot && (
            <div className="form-group mb-8" style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1.25rem'}}>
              <label>Describe the property</label>
              <textarea
                className="form-input"
                rows={4}
                maxLength={4000}
                placeholder="e.g. 3BHK flat for sale in Sector 45 Gurgaon, 1450 sq ft, ready to move, asking 85 Lakh, east facing, corner plot, gated society..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />

              {/* These attach to the SAME mediaFiles/docFiles state as the
                  "Upload Images/Videos" and "Upload Documents" sections
                  further down — nothing uploaded here is extra or separate,
                  it's exactly what gets attached to the listing on submit.
                  Clicking just opens those same hidden file inputs via ref,
                  so there's no second upload pipeline to keep in sync. */}
              <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.85rem'}}>
                <button type="button" className="btn btn-outline" style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem'}} onClick={() => mediaInputRef.current?.click()}>
                  <Upload size={14} style={{display: 'inline', marginRight: '0.35rem'}} />
                  {mediaFiles.length > 0 ? `Photos (${mediaFiles.length})` : 'Add Photos'}
                </button>
                <button type="button" className="btn btn-outline" style={{padding: '0.45rem 0.9rem', fontSize: '0.85rem'}} onClick={() => docInputRef.current?.click()}>
                  <Upload size={14} style={{display: 'inline', marginRight: '0.35rem'}} />
                  {docFiles.length > 0 ? `Documents (${docFiles.length})` : 'Add Documents'}
                </button>
              </div>
              <p className="text-muted" style={{fontSize: '0.78rem', margin: '0.4rem 0 0'}}>
                Up to 2 photos are shown to the AI to help fill in details; all photos and documents you attach here are saved with the listing.
              </p>

              {mediaFiles.length > 0 && (
                <div className="media-preview-grid" style={{marginTop: '0.6rem'}}>
                  {mediaFiles.map(f => (
                    <div key={f.id} className="media-preview-item">
                      {f.preview ? (
                        <img src={f.preview} alt={f.name} />
                      ) : f.isVideo ? (
                        <div className="media-preview-video">
                          <span>🎬</span>
                          <span style={{fontSize: '0.7rem', wordBreak: 'break-all'}}>{f.name}</span>
                        </div>
                      ) : null}
                      <button type="button" className="media-preview-remove" onClick={() => removeMediaFile(f.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {docFiles.length > 0 && (
                <div className="doc-file-list" style={{marginTop: '0.6rem'}}>
                  {docFiles.map(f => (
                    <div key={f.id} className="doc-file-item">
                      <div className="doc-file-icon">📄</div>
                      <div className="doc-file-info">
                        <div className="doc-file-name">{f.name}</div>
                        <div className="doc-file-size">{f.size}</div>
                      </div>
                      <button type="button" className="doc-file-remove" onClick={() => removeDocFile(f.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary"
                style={{marginTop: '1rem'}}
                disabled={aiExtracting || !aiPrompt.trim()}
                onClick={handleAiExtract}
              >
                {aiExtracting ? 'Extracting…' : 'Extract with AI'}
              </button>
              {aiExtractError && (
                <p style={{color: 'var(--accent-red)', fontSize: '0.85rem', marginTop: '0.5rem'}}>{aiExtractError}</p>
              )}
              {aiExtracted && !aiExtractError && (
                <p style={{color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem'}}>Fields below were filled in by AI — please review and correct anything before submitting.</p>
              )}
            </div>
          )}
          <div className="form-group mb-8">
            <label>Plot Title <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Premium Corner Plot in Sarjapur"
              className="form-input"
              required
              value={newPlot.title}
              onChange={(e) => setNewPlot({...newPlot, title: e.target.value})}
            />
          </div>
          <div className="form-group mb-8">
            <label>Expected Price (Quotation) <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input
              type="text"
              placeholder="₹ e.g. 45 L or 1.2 Cr"
              className="form-input"
              required
              value={newPlot.price}
              onChange={(e) => setNewPlot({...newPlot, price: e.target.value})}
            />
          </div>

          <div className="form-group mb-8">
            <label>City Location <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Bangalore, Jaipur, Indore"
              className="form-input"
              required
              value={newPlot.city || ''}
              onChange={(e) => setNewPlot({...newPlot, city: e.target.value})}
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Lease or Outright Purchase <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={newPlot.transactionType}
                onChange={(e) => setNewPlot({...newPlot, transactionType: e.target.value})}
              >
                <option value="sale">Outright Purchase</option>
                <option value="lease">Lease</option>
              </select>
            </div>
            <div className="form-group mb-8">
              <label>Budget Range / Price range <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <input
                type="text"
                placeholder="e.g. ₹50 L - ₹70 L"
                className="form-input"
                required
                value={newPlot.budgetRange || ''}
                onChange={(e) => setNewPlot({...newPlot, budgetRange: e.target.value})}
              />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Property Type <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={newPlot.propertyType}
                onChange={(e) => setNewPlot({...newPlot, propertyType: e.target.value})}
              >
                <option value="land">Land</option>
                <option value="constructed">Constructed Property</option>
              </select>
            </div>

            {newPlot.propertyType === 'land' ? (
              <div className="form-group mb-8">
                <label>Land Classification <span style={{color: 'var(--accent-red)'}}>*</span></label>
                <select
                  className="form-input"
                  required
                  value={newPlot.landType}
                  onChange={(e) => setNewPlot({...newPlot, landType: e.target.value})}
                >
                  <option value="converted">Land Converted</option>
                  <option value="agriculture">Agriculture Land</option>
                </select>
              </div>
            ) : (
              <div className="form-group mb-8">
                <label>Construction Status <span style={{color: 'var(--accent-red)'}}>*</span></label>
                <select
                  className="form-input"
                  required
                  value={newPlot.constructionStatus}
                  onChange={(e) => setNewPlot({...newPlot, constructionStatus: e.target.value})}
                >
                  <option value="constructed">Constructed</option>
                  <option value="under-construction">Under construction</option>
                </select>
              </div>
            )}
          </div>

          {newPlot.propertyType === 'land' ? (
            <div className="form-group mb-8">
              <label>Land Use Zoning <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={newPlot.landUse}
                onChange={(e) => setNewPlot({...newPlot, landUse: e.target.value})}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="institutional">Institutional</option>
                <option value="resort">Resort</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
          ) : (
            <div className="form-group mb-8">
              <label>Property Subtype <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={newPlot.constructedType}
                onChange={(e) => setNewPlot({...newPlot, constructedType: e.target.value})}
              >
                <option value="flat">Flat / Apartment</option>
                <option value="independent_house_villa">Independent House / Villa</option>
                <option value="high_rise_apartment">High-rise Apartment</option>
                <option value="g_plus_building">G+ Building</option>
                <option value="residential_plot">Residential Plot</option>
                <option value="commercial_plot">Commercial Plot</option>
              </select>
            </div>
          )}

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Facing Direction <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={newPlot.facingDirection}
                onChange={(e) => setNewPlot({...newPlot, facingDirection: e.target.value})}
              >
                <option value="East">East Facing</option>
                <option value="West">West Facing</option>
                <option value="North">North Facing</option>
                <option value="South">South Facing</option>
              </select>
            </div>
            
            <div className="form-group mb-8">
              <label>Property Characteristics / Facing Tags</label>
              <div style={{display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={newPlot.cornerProperty || false}
                    onChange={(e) => setNewPlot({...newPlot, cornerProperty: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Corner Property</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={newPlot.parkFacing || false}
                    onChange={(e) => setNewPlot({...newPlot, parkFacing: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Park Facing</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={newPlot.roadFacing || false}
                    onChange={(e) => setNewPlot({...newPlot, roadFacing: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Road Facing</span>
                </label>
              </div>
            </div>
          </div>
          <div className="form-group mb-8">
            <label>Key Features</label>
            <input
              type="text"
              placeholder="West facing, Corner, Gated community, etc."
              className="form-input"
              value={newPlot.features}
              onChange={(e) => setNewPlot({...newPlot, features: e.target.value})}
            />
          </div>
          <div className="form-group mb-8">
            <label>Additional Information</label>
            <textarea
              placeholder="Anything else buyers should know — contact/broker name, nearby landmarks, possession timeline, negotiability, loan/approval status, etc."
              className="form-input"
              rows={3}
              value={newPlot.additionalInfo}
              onChange={(e) => setNewPlot({...newPlot, additionalInfo: e.target.value})}
            />
          </div>

          {/* ── Property Location on Map ── */}
          <div className="form-group mb-8">
            <label><MapPin size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.35rem'}} />Property Location</label>
            <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.75rem'}}>Search for the location or drag the marker to pinpoint the exact spot.</p>
            {isLoaded ? (
              <>
                <Autocomplete
                  onLoad={(ac) => (autocompleteRef.current = ac)}
                  onPlaceChanged={onPlaceSelected}
                  fields={['formatted_address', 'geometry', 'name']}
                  options={autocompleteOptions}
                >
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Search location, e.g. Sarjapur Road, Bangalore"
                    className="form-input"
                    defaultValue={newPlot.location}
                    onBlur={(e) => setNewPlot(prev => ({...prev, location: e.target.value}))}
                    style={{marginBottom: '0.75rem'}}
                  />
                </Autocomplete>
                <div className="location-map-container" style={{ position: 'relative' }}>
                  <button type="button" style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, padding: '0.6rem', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', backgroundColor: 'white', color: '#1a73e8', border: 'none', cursor: 'pointer' }} onClick={() => handleLocateMe(setPlotLocation)} title="Locate Me">
                    <Navigation size={20} />
                  </button>
                  <GoogleMap
                    mapContainerStyle={{width: '100%', height: '400px', borderRadius: '0.75rem', cursor: isDrawingMode ? 'crosshair' : 'grab'}}
                    center={plotLocation}
                    zoom={14}
                    onClick={handleMapClickForDrawing}
                    options={{
                      mapTypeId: mapType,
                      disableDefaultUI: true,
                      zoomControl: true,
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                      gestureHandling: 'greedy',
                      disableDoubleClickZoom: true,
                      draggableCursor: isDrawingMode ? 'crosshair' : 'grab',
                      styles: mapOptions.styles
                    }}
                  >
                    {!isDrawingMode && (
                      <MarkerF
                        position={plotLocation}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                      />
                    )}
                    {userLocation && (
                      <MarkerF
                        position={userLocation}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>'
                          ),
                          scaledSize: new window.google.maps.Size(24, 24),
                          anchor: new window.google.maps.Point(12, 12)
                        }}
                        zIndex={999}
                      />
                    )}
                    {sortedPolygonPath.length > 0 && (
                      <PolygonF
                        paths={sortedPolygonPath}
                        options={{
                          fillColor: '#10b981',
                          fillOpacity: 0.35,
                          strokeColor: '#10b981',
                          strokeOpacity: 1,
                          strokeWeight: 2,
                          clickable: false
                        }}
                      />
                    )}
                    {isDrawingMode && polygonPath.map((point, index) => (
                      <MarkerF
                        key={index}
                        position={point}
                        label={{
                          text: (index + 1).toString(),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%2310b981" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`
                          ),
                          scaledSize: new window.google.maps.Size(20, 20),
                          anchor: new window.google.maps.Point(10, 10)
                        }}
                      />
                    ))}
                  
                
              </GoogleMap>
                  <div className="location-coords">
                    <span>📍 {plotLocation.lat.toFixed(5)}, {plotLocation.lng.toFixed(5)}</span>
                  </div>
                  {/* Floating Map Controls Inside Map */}
                  <div className="map-drawing-controls" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.95)', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexWrap: 'wrap', maxWidth: 'calc(100% - 20px)' }}>
                    <button 
                      type="button"
                      className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      onClick={handleToggleDrawingMode}
                    >
                      <Edit3 size={14} style={{display: 'inline', marginRight: '4px'}} /> {isDrawingMode ? 'Stop' : (polygonPath.length > 0 ? 'Change boundary' : 'Draw Boundary')}
                    </button>
                    {polygonPath.length > 0 && (
                      <>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => setPolygonPath(polygonPath.slice(0, -1))}>
                          <Undo size={14} style={{display: 'inline', marginRight: '4px'}} /> Undo
                        </button>
                        <button type="button" className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', whiteSpace: 'nowrap' }} onClick={() => { setPolygonPath([]); setNewPlot(prev => ({...prev, size: ''})); setMediaFiles(prev => prev.filter(f => !f.isStaticMap)); }}>
                          <Trash2 size={14} style={{display: 'inline', marginRight: '4px'}} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', overflowX: 'auto' }}>
                    <button type="button" className={`btn ${mapType === 'roadmap' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('roadmap')}>Map</button>
                    <button type="button" className={`btn ${mapType === 'satellite' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('satellite')}>Satellite</button>
                    <button type="button" className={`btn ${mapType === 'hybrid' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('hybrid')}>Hybrid</button>
                    <button type="button" className={`btn ${mapType === 'terrain' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('terrain')}>Terrain</button>
                  </div>
                </div>
                {isDrawingMode && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, textAlign: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    👉 Click on the map to draw your land boundaries
                  </div>
                )}
              </>
            ) : (
              <div style={{height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '0.75rem'}}>
                <p className="text-muted">Loading map...</p>
              </div>
            )}
          </div>

          <div className="form-group mb-8">
            <label>Plot Size <span style={{color: 'var(--accent-red)'}}>*</span> <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: 'var(--text-muted)'}}>(Calculated based on satellite imagery of the location)</span></label>
            <input
              type="text"
              placeholder="e.g. 1,200 m² (Click on the map above in 'Draw Boundary' mode to automatically calculate)"
              className="form-input"
              required
              value={newPlot.size}
              onChange={(e) => setNewPlot({...newPlot, size: e.target.value})}
            />
          </div>

          <div className="form-group mb-8">
            <label>District ➔ Tehsil ➔ Village</label>
            <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>Automatically fetched when you mark the plot on the map.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="District" className="form-input" style={{flex: 1}} value={newPlot.district || ''} onChange={e => setNewPlot({...newPlot, district: e.target.value})} />
              <input type="text" placeholder="Tehsil" className="form-input" style={{flex: 1}} value={newPlot.tehsil || ''} onChange={e => setNewPlot({...newPlot, tehsil: e.target.value})} />
              <input type="text" placeholder="Village" className="form-input" style={{flex: 1}} value={newPlot.village || ''} onChange={e => setNewPlot({...newPlot, village: e.target.value})} />
            </div>
          </div>

          <div className="form-group mb-8">
            <label>Khasra / Khatauni Number <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: '#10b981'}}>(Optional)</span></label>
            <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>
              <strong>Note:</strong> People who provide the Khasra number of their land have a <strong style={{color: '#3b82f6'}}>20x higher chance of selling</strong> as it builds immediate trust!
            </p>
            <input
              type="text"
              placeholder="e.g. 142/5"
              className="form-input"
              value={newPlot.khasraNumber || ''}
              onChange={(e) => setNewPlot({...newPlot, khasraNumber: e.target.value})}
            />

            {newPlot.state && newPlot.district && (
              <div style={{
                marginTop: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981',
                borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
                <MapPin size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#065f46', fontSize: '0.95rem' }}>Smart Village Lookup Detected</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#047857', fontSize: '0.85rem' }}>
                    <strong>{newPlot.village || 'Location'}</strong> in {newPlot.tehsil ? `${newPlot.tehsil}, ` : ''}{newPlot.district}, {newPlot.state}.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#064e3b' }}>
                    Don't know your Khasra number? <a href={getStateBhulekhLink(newPlot.state)} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'underline' }}>Verify it on {newPlot.state} Bhulekh Portal</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden file inputs always rendered — the AI panel's "Add
              Photos"/"Add Documents" buttons above open these same elements
              via ref, so there's one upload pipeline whichever button opens
              the picker. Their visible upload-area + previews below are
              hidden in AI mode since the AI panel already shows them, to
              avoid showing the same thumbnails twice on one page. */}
          <input
            ref={mediaInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaSelect}
            style={{display: 'none'}}
            id="media-upload"
          />
          <input
            ref={docInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleDocSelect}
            style={{display: 'none'}}
            id="doc-upload"
          />

          {/* ── Upload Images / Videos ── */}
          {listingMode !== 'ai' && (
          <div className="form-group mb-8">
            <label>Upload Images / Videos</label>
            <div className="upload-area" onClick={() => mediaInputRef.current?.click()}>
              <Upload size={28} className="text-muted" />
              <p className="text-muted">Click to upload photos & videos (multiple allowed)</p>
              <span className="text-muted" style={{fontSize: '0.78rem'}}>JPG, PNG, MP4, MOV — Max 50MB each</span>
            </div>
            {mediaFiles.length > 0 && (
              <div className="media-preview-grid">
                {mediaFiles.map(f => (
                  <div key={f.id} className="media-preview-item">
                    {f.preview ? (
                      <img src={f.preview} alt={f.name} />
                    ) : f.isVideo ? (
                      <div className="media-preview-video">
                        <span>🎬</span>
                        <span style={{fontSize: '0.7rem', wordBreak: 'break-all'}}>{f.name}</span>
                      </div>
                    ) : null}
                    <button type="button" className="media-preview-remove" onClick={() => removeMediaFile(f.id)}>✕</button>
                  </div>
                ))}
                <div className="media-preview-add" onClick={() => mediaInputRef.current?.click()}>
                  <Upload size={20} />
                  <span>Add More</span>
                </div>
              </div>
            )}
          </div>
          )}

          {/* ── Upload Documents ── */}
          {listingMode !== 'ai' && (
          <div className="form-group mb-12">
            <label>Upload Documents (Title Deed, EC, Legal docs)</label>
            <div className="upload-area" onClick={() => docInputRef.current?.click()}>
              <Upload size={28} className="text-muted" />
              <p className="text-muted">Click to upload property papers (multiple allowed)</p>
              <span className="text-muted" style={{fontSize: '0.78rem'}}>PDF, DOC, JPG — Title Deed, EC, Khata, Layout Plan</span>
            </div>
            {docFiles.length > 0 && (
              <div className="doc-file-list">
                {docFiles.map(f => (
                  <div key={f.id} className="doc-file-item">
                    <div className="doc-file-icon">📄</div>
                    <div className="doc-file-info">
                      <div className="doc-file-name">{f.name}</div>
                      <div className="doc-file-size">{f.size}</div>
                    </div>
                    <button type="button" className="doc-file-remove" onClick={() => removeDocFile(f.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* No visibility switch. It implied a choice the seller did not
              actually have: a listing was only ever shown to buyers once an
              admin verified it, whatever the toggle said. Verification alone
              decides now, and this explains that. */}
          <div className="form-group" style={{background: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem'}}>
            <div style={{fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem'}}>What happens next</div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
              We review every listing before it goes live. Once verified it appears to buyers
              across A1Plot. Until then it stays visible only to you in your dashboard.
            </div>
          </div>

          {submitError && (
            <div style={{background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.9rem'}}>
              ⚠️ {submitError}
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button type="submit" className="btn btn-primary" style={{padding: '1rem 3rem', opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : (editingPlot ? 'Update Details' : 'Submit for Verification')}
            </button>
            {editingPlot && (
              <button type="button" className="btn btn-outline" style={{padding: '1rem 2rem'}} onClick={() => {
                setEditingPlot(null);
                setNewPlot({ title: '', location: '', price: '', size: '', features: '', visibility: 'public', khasraNumber: '', state: '', district: '', tehsil: '', village: '', city: '', transactionType: 'sale', propertyType: 'land', landType: 'converted', landUse: 'residential', constructedType: 'flat', constructionStatus: 'constructed', budgetRange: '', facingDirection: 'East', cornerProperty: false, parkFacing: false, roadFacing: false });
                setMediaFiles([]);
                setDocFiles([]);
                navigate('seller-dashboard');
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </section>
  );

  /* ============================================
     SELLER: PORTFOLIO DASHBOARD (Groww/Zerodha style)
     ============================================ */
  const [chartRange, setChartRange] = useState('ALL');
  const [selectedPropertyChart, setSelectedPropertyChart] = useState(null);

  const formatCurrency = (val) => {
    if (val >= 10000000) return '₹' + (val / 10000000).toFixed(2) + ' Cr';
    if (val >= 100000) return '₹' + (val / 100000).toFixed(2) + ' L';
    return '₹' + val.toLocaleString('en-IN');
  };

  // True XIRR formula implementation (Newton-Raphson method)
  const calculateXIRR = (cashFlows) => {
    if (!cashFlows || cashFlows.length < 2) return 0;
    let rate = 0.1; // 10% initial guess
    for (let i = 0; i < 100; i++) {
      let f = 0, df = 0;
      for (let j = 0; j < cashFlows.length; j++) {
        const t = cashFlows[j].days / 365.0;
        f += cashFlows[j].amount / Math.pow(1 + rate, t);
        df -= (t * cashFlows[j].amount) / Math.pow(1 + rate, t + 1);
      }
      const newRate = rate - f / df;
      if (Math.abs(newRate - rate) < 1e-6) return newRate;
      rate = newRate;
    }
    return rate;
  };

  const myHoldings = plots.filter(p => p.investedAmount && (p.ownerUid === user?.uid || p.ownerEmail === user?.email));
  const totalInvested = myHoldings.reduce((sum, p) => sum + (p.investedAmount || 0), 0);
  const totalCurrent = myHoldings.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const totalReturn = totalCurrent - totalInvested;
  const totalReturnPct = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : '0.00';
  const isPositiveReturn = totalReturn >= 0;

  // Generate dynamic XIRR based on deterministic simulated holding periods
  const portfolioXIRR = useMemo(() => {
    if (myHoldings.length === 0) return '0.00';
    const cashFlows = [];
    myHoldings.forEach((p, idx) => {
      const charCode = p.id ? String(p.id).charCodeAt(0) : idx * 10;
      const daysHeld = 200 + (charCode % 400); // held between 200 and 600 days
      cashFlows.push({ amount: -(p.investedAmount || 0), days: daysHeld });
    });
    cashFlows.push({ amount: totalCurrent, days: 0 }); // current value today
    return (calculateXIRR(cashFlows) * 100).toFixed(2);
  }, [myHoldings, totalCurrent]);

  const getChartData = () => {
    const data = selectedPropertyChart
      ? (plots.find(p => p.id === selectedPropertyChart)?.priceHistory || [])
      : PORTFOLIO_CHART_DATA;
    if (chartRange === 'ALL') return data;
    const sliceMap = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 };
    const count = sliceMap[chartRange] || data.length;
    return data.slice(-count);
  };

  const chartTooltipFormatter = (value) => [formatCurrency(value), 'Value'];

  const renderSellerDashboard = () => {
    const displayData = getChartData();
    const chartMin = Math.min(...displayData.map(d => d.value)) * 0.97;
    const chartMax = Math.max(...displayData.map(d => d.value)) * 1.01;
    const investedBase = selectedPropertyChart
      ? (plots.find(p => p.id === selectedPropertyChart)?.investedAmount || 0)
      : totalInvested;

    return (
    <section className="section pf-dashboard" style={{paddingTop: '6rem'}}>
      <div className="container">
        {/* Header */}
        <div className="pf-header">
          <div>
            <h2 className="pf-page-title">My Portfolio</h2>
            <p className="text-muted">Track property performance & estimated returns.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('seller-list')}>+ Add New Plot</button>
        </div>

        {/* Summary Cards */}
        <div className="pf-summary-grid">
          <div className="pf-summary-card pf-summary-card--main">
            <div className="pf-summary-label">Current Value</div>
            <div className="pf-summary-value">{formatCurrency(totalCurrent)}</div>
            <div className={`pf-summary-change ${isPositiveReturn ? 'pf-positive' : 'pf-negative'}`}>
              <TrendingUp size={16} />
              <span>{isPositiveReturn ? '+' : ''}{formatCurrency(totalReturn)} ({isPositiveReturn ? '+' : ''}{totalReturnPct}%)</span>
            </div>
          </div>
          <div className="pf-summary-card">
            <div className="pf-summary-label">Total Invested</div>
            <div className="pf-summary-value pf-summary-value--sm">{formatCurrency(totalInvested)}</div>
            <div className="pf-summary-sub">{myHoldings.length} Properties</div>
          </div>
          <div className="pf-summary-card">
            <div className="pf-summary-label">Total Returns</div>
            <div className={`pf-summary-value pf-summary-value--sm ${isPositiveReturn ? 'pf-positive' : 'pf-negative'}`}>{isPositiveReturn ? '+' : ''}{formatCurrency(totalReturn)}</div>
            <div className="pf-summary-sub">P&L since purchase</div>
          </div>
          <div className="pf-summary-card">
            <div className="pf-summary-label">XIRR (Est.)</div>
            <div className={`pf-summary-value pf-summary-value--sm ${portfolioXIRR >= 0 ? 'pf-positive' : 'pf-negative'}`}>{portfolioXIRR >= 0 ? '+' : ''}{portfolioXIRR}%</div>
            <div className="pf-summary-sub">Annualized</div>
          </div>
        </div>

        {/* Main Chart Section */}
        <div className="pf-chart-container">
          <div className="pf-chart-header">
            <div className="pf-chart-title">
              {selectedPropertyChart
                ? plots.find(p => p.id === selectedPropertyChart)?.title || 'Property'
                : 'Portfolio Performance'
              }
            </div>
            <div className="pf-chart-tabs">
              <button className="pf-chart-tab" onClick={() => {setSelectedPropertyChart(null);}} style={!selectedPropertyChart ? {background: 'var(--primary)', color:'white'} : {}}>All</button>
            </div>
          </div>
          <div className="pf-chart-body">
            <div className="pf-chart-left">
              <div className="pf-range-toggles">
                {['1M', '3M', '6M', '1Y', 'ALL'].map(range => (
                  <button
                    key={range}
                    className={`pf-range-btn ${chartRange === range ? 'pf-range-btn--active' : ''}`}
                    onClick={() => setChartRange(range)}
                  >{range}</button>
                ))}
              </div>
              <div className="pf-chart-area">
                <PortfolioAreaChart data={displayData} chartMin={chartMin} chartMax={chartMax} investedBase={investedBase} tooltipFormatter={chartTooltipFormatter} />
              </div>
            </div>
            <div className="pf-chart-map">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={defaultCenter}
                  zoom={5}
                  onLoad={(map) => {
                    const pts = myHoldings.filter(p => p.lat && p.lng);
                    if (pts.length > 0) {
                      const bounds = new window.google.maps.LatLngBounds();
                      pts.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                      map.fitBounds(bounds, { padding: 40 });
                    }
                  }}
                  options={{ mapTypeId: 'hybrid', mapTypeControl: true, disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy', disableDoubleClickZoom: true, styles: mapOptions.styles }}
                >
                  {myHoldings.map(plot => plot.lat && plot.lng && (
                    <React.Fragment key={plot.id}>
                      <MarkerF
                        position={{ lat: plot.lat, lng: plot.lng }}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${selectedPropertyChart === plot.id ? '#f59e0b' : '#3b7a76'}" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`
                          ),
                          scaledSize: new window.google.maps.Size(36, 36)
                        }}
                        onClick={() => setSelectedPropertyChart(selectedPropertyChart === plot.id ? null : plot.id)}
                      />
                      {plot.polygonPath && plot.polygonPath.length >= 3 && (
                        <PolygonF
                          paths={plot.polygonPath}
                          options={{
                            fillColor: selectedPropertyChart === plot.id ? '#f59e0b' : '#3b7a76',
                            fillOpacity: 0.35,
                            strokeColor: selectedPropertyChart === plot.id ? '#f59e0b' : '#3b7a76',
                            strokeOpacity: 1,
                            strokeWeight: 2,
                            clickable: true
                          }}
                          onClick={() => setSelectedPropertyChart(selectedPropertyChart === plot.id ? null : plot.id)}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </GoogleMap>
              ) : (
                <div className="pf-map-loading">
                  <MapPin size={22} />
                  <span>Loading map…</span>
                </div>
              )}
              {isLoaded && myHoldings.filter(p => p.lat && p.lng).length === 0 && (
                <div className="pf-map-empty">No property locations yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Property Holdings */}
        <div className="pf-holdings-section">
          <h3 className="pf-holdings-title">Your Holdings</h3>
          <div className="pf-holdings-list">
            {myHoldings.map(plot => {
              const pReturn = (plot.currentValue || 0) - (plot.investedAmount || 0);
              const pReturnPct = plot.investedAmount ? ((pReturn / plot.investedAmount) * 100).toFixed(2) : '0.00';
              const isPositive = pReturn >= 0;
              const sparkData = (plot.priceHistory || []).slice(-6);
              return (
                <div key={plot.id} className={`pf-holding-card ${selectedPropertyChart === plot.id ? 'pf-holding-card--selected' : ''}`} onClick={() => setSelectedPropertyChart(selectedPropertyChart === plot.id ? null : plot.id)}>
                  <div className="pf-holding-left">
                    <img src={plot.image} alt={plot.title} className="pf-holding-thumb" />
                    <div className="pf-holding-info">
                      <div className="pf-holding-name">{plot.title}</div>
                      <div className="pf-holding-loc"><MapPin size={12} /> {plot.location}</div>
                      <div className="pf-holding-meta">
                        <span>{plot.size}</span>
                        <span className="pf-holding-dot">•</span>
                        <span>{plot.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pf-holding-sparkline">
                    <Sparkline data={sparkData} id={plot.id} isPositive={isPositive} />
                  </div>
                  <div className="pf-holding-right">
                    <div className="pf-holding-current">{formatCurrency(plot.currentValue)}</div>
                    <div className={`pf-holding-return ${isPositive ? 'pf-positive' : 'pf-negative'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(pReturn)} ({isPositive ? '+' : ''}{pReturnPct}%)
                    </div>
                    <div className="pf-holding-invested">Invested: {formatCurrency(plot.investedAmount)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Self-Listed Properties (user-created) */}
        {plots.filter(p => p.ownerUid === user?.uid && !p.investedAmount).length > 0 && (
          <div className="pf-listed-section">
            <h3 className="pf-holdings-title">Your Listed Properties</h3>
            <div className="plots-grid">
              {plots.filter(p => p.ownerUid === user?.uid && !p.investedAmount).map((plot) => (
                <div key={plot.id} className="plot-card">
                  <div className="plot-image">
                    <div className="plot-badge">{plot.status}</div>
                    <img src={plot.image} alt={plot.title} />
                  </div>
                  <div className="plot-content">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="plot-title" style={{marginBottom: 0}}>{plot.title}</h3>
                      <button className="text-primary font-semibold" onClick={() => handleEditClick(plot)} style={{fontSize: '0.875rem'}}>Edit Details</button>
                    </div>
                    <p className="text-muted mb-4" style={{display: 'flex', alignItems: 'center', gap: '0.35rem'}}><MapPin size={14} /> {plot.location}</p>
                    <div className="plot-metrics">
                      <div className="metric">
                        <span className="metric-label">Price</span>
                        <p>{plot.price}</p>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Size</span>
                        <p>{plot.size}</p>
                      </div>
                    </div>
                    {buyerMapSelectedPlotId && (
                      <div style={{marginTop: '1rem'}}>
                        <button 
                          className="btn btn-primary" 
                          style={{width: '100%', padding: '0.6rem'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProperty(plot);
                          }}
                        >
                          View Property
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
    );
  };

  /* ============================================
     BUYER: MAP VIEW
     ============================================ */
  const renderBuyerMap = () => (
    <section className="section bg-light" style={{paddingTop: '5rem', paddingBottom: '0', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div style={{width: '100%', padding: '0 2rem', maxWidth: '1800px', margin: '0 auto'}}>
        <div className="section-header" style={{textAlign: 'left', marginBottom: '1.5rem', marginTop: '1rem'}}>
          <h2 className="section-title" style={{fontSize: '2.25rem', marginBottom: '0.5rem'}}>Buy Land</h2>
          <p className="text-muted">Browse our verified listings and find your perfect plot. Select a property to view on the map.</p>
        </div>
        <div className="buyer-map-layout">
          
          {/* Left side: Property Cards */}
          <div className="buyer-map-list">
            <div className="plots-grid" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
              {plots
                .filter(p => p.visibility !== 'private' && p.status !== 'Verification Pending' && p.status !== 'Rejected')
                .map(plot => (
                <div 
                  key={plot.id} 
                  className="plot-card" 
                  onClick={() => handleViewProperty(plot)} 
                  style={{
                    cursor: 'pointer', 
                    border: '1px solid var(--border-color)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="plot-image" style={{height: '160px'}}>
                    <div className="plot-badge">{plot.badge || 'Listed'}</div>
                    <button 
                      className={`plot-favorite-btn ${interestedPlots.some(p => p.id === plot.id) ? 'is-active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleToggleInterest(plot); }}
                      title="Save to Interested List"
                    >
                      <Heart size={16} fill={interestedPlots.some(p => p.id === plot.id) ? "#ef4444" : "none"} />
                    </button>
                    <img src={plot.image} alt={plot.title} />
                  </div>
                  <div className="plot-content" style={{padding: '1.25rem'}}>
                    <div className="plot-location" style={{fontSize: '0.8rem', marginBottom: '0.35rem'}}>
                      <MapPin size={12} /> {plot.location}
                    </div>
                    <h3 className="plot-title" style={{fontSize: '1.1rem', marginBottom: '0.75rem'}}>{plot.title}</h3>
                    
                    <div className="plot-metrics" style={{marginBottom: '1rem', paddingBottom: '1rem', gap: '0.5rem'}}>
                      <div className="metric">
                        <h5 style={{fontSize: '0.65rem'}}>Price</h5>
                        <p style={{fontSize: '0.95rem'}}>{plot.price}</p>
                      </div>
                      <div className="metric">
                        <h5 style={{fontSize: '0.65rem'}}>Size</h5>
                        <p style={{fontSize: '0.95rem'}}>{plot.size}</p>
                      </div>
                    </div>
                    
                    {buyerMapSelectedPlotId === plot.id ? (
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button 
                          className="btn btn-primary" 
                          style={{flex: 1, padding: '0.5rem', fontSize: '0.85rem'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProperty(plot);
                          }}
                        >
                          Visit Property
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '0.5rem', fontSize: '0.85rem'}}
                          title="Zoom to location"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMapFocusPlot(plot);
                          }}
                        >
                          🔍 Zoom
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn btn-outline" 
                        style={{width: '100%', padding: '0.5rem', fontSize: '0.85rem'}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProperty(plot);
                        }}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Map View */}
          <div className="buyer-map-map" style={{position: 'relative'}}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{width: '100%', height: '100%'}}
                center={mapFocusPlot ? { lat: mapFocusPlot.lat, lng: mapFocusPlot.lng } : buyerMapCenter}
                zoom={mapFocusPlot ? 16 : 6}
                onLoad={onMapLoad}
                options={mapOptions}
                onClick={() => { setBuyerMapSelectedPlotId(null); setSelectedMarker(null); }}
              >
                <button type="button" style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, padding: '0.6rem', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', backgroundColor: 'white', color: '#1a73e8', border: 'none', cursor: 'pointer' }} onClick={() => { setMapFocusPlot(null); handleLocateMe(setBuyerMapCenter); }} title="Locate Me">
                  <Navigation size={20} />
                </button>
                {userLocation && (
                  <MarkerF
                    position={userLocation}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="white"/></svg>'
                      ),
                      scaledSize: new window.google.maps.Size(24, 24),
                      anchor: new window.google.maps.Point(12, 12)
                    }}
                    zIndex={999}
                  />
                )}
                {plots
                  .filter(p => p.visibility !== 'private' && p.status !== 'Verification Pending' && p.status !== 'Rejected')
                  .map(plot => (
                  plot.lat && plot.lng && (
                    <React.Fragment key={plot.id}>
                      <MarkerF
                        position={{ lat: plot.lat, lng: plot.lng }}
                        onClick={() => { setBuyerMapSelectedPlotId(plot.id); setSelectedMarker(plot); }}
                        icon={{
                          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="%233b7a76" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`
                          ),
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                      />
                      {plot.polygonPath && plot.polygonPath.length >= 3 && (
                        <PolygonF
                          paths={plot.polygonPath}
                          options={{
                            fillColor: '#3b7a76',
                            fillOpacity: 0.35,
                            strokeColor: '#3b7a76',
                            strokeOpacity: 1,
                            strokeWeight: 2,
                            clickable: true
                          }}
                          onClick={() => { setBuyerMapSelectedPlotId(plot.id); setSelectedMarker(plot); }}
                        />
                      )}
                    </React.Fragment>
                  )
                ))}

                {selectedMarker && (
                  <InfoWindowF
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div style={{width: '240px', fontFamily: 'Inter, sans-serif', padding: '0.25rem'}}>
                      <img src={selectedMarker.image} alt={selectedMarker.title} style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem'}} />
                      <h4 style={{fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', color: '#0f172a'}}>{selectedMarker.title}</h4>
                      <p style={{fontSize: '1.1rem', fontWeight: 700, color: '#3b7a76', marginBottom: '0.5rem'}}>{selectedMarker.price}</p>
                      
                      <div style={{fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem'}}>
                        <strong style={{color: '#0f172a'}}>Size:</strong> {selectedMarker.size}
                      </div>
                      <div style={{fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: '1.5'}}>
                        <strong style={{color: '#0f172a'}}>Documents:</strong><br/>
                        {selectedMarker.documentsAvailable && selectedMarker.documentsAvailable.filter(d => d && d.trim() !== '').length > 0
                          ? selectedMarker.documentsAvailable.filter(d => d && d.trim() !== '').join(', ')
                          : 'No documents uploaded'}
                      </div>
                      <div style={{marginTop: '0.5rem', display: 'flex', gap: '0.5rem'}}>
                        <button 
                          className="btn btn-primary" 
                          style={{flex: 1, padding: '0.5rem', fontSize: '0.85rem'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProperty(selectedMarker);
                          }}
                        >
                          Visit Property
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '0.5rem', fontSize: '0.85rem'}}
                          title="Zoom to location"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMapFocusPlot(selectedMarker);
                          }}
                        >
                          🔍 Zoom
                        </button>
                      </div>
                    </div>
                  </InfoWindowF>
                )}
              </GoogleMap>
            ) : (
              <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9'}}>
                <p className="text-muted">Loading map...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  /* ============================================
     BUYER: INTERESTED PROPERTIES
     ============================================ */
  const renderInterested = () => (
    <section className="section bg-light" style={{paddingTop: '6rem'}}>
      <div className="container">
        <div className="section-header" style={{textAlign: 'left', margin: '0 0 3rem'}}>
          <h2 className="section-title">Interested Properties</h2>
          <p className="text-muted">Properties you've expressed interest in. Request documents to start the buying process.</p>
        </div>
        <div className="plots-grid">
          {interestedPlots.map((plot) => (
            <div key={plot.id} className="plot-card">
              <div className="plot-image">
                <img src={plot.image} alt={plot.title} />
              </div>
              <div className="plot-content">
                <h3 className="plot-title">{plot.title}</h3>
                <p className="text-muted mb-4" style={{display: 'flex', alignItems: 'center', gap: '0.35rem'}}><MapPin size={14} /> {plot.location}</p>
                <div className="plot-footer">
                  <div className="plot-price">{plot.price}</div>
                  <button className="btn btn-primary" onClick={() => {
                    setRequestingDocsFor(plot);
                    setLegalAgreed(false);
                    navigate('buy-request');
                  }}>Request Docs</button>
                </div>
              </div>
            </div>
          ))}
          {interestedPlots.length === 0 && (
            <div className="text-center" style={{gridColumn: '1 / -1', padding: '4rem 2rem'}}>
              <p className="text-muted" style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>No properties in your interest list yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('buyer-map')}>Explore Plots on Map</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  /* ============================================
     BUYER: CONTACT AGENT
     ============================================ */
  const renderContact = () => (
    <section className="section bg-white" style={{paddingTop: '6rem'}}>
      <div className="container" style={{maxWidth: '600px'}}>
        <div className="section-header">
          <h2 className="section-title">Contact Our Agent</h2>
          <p className="text-muted">Leave your details and our team will get back to you within 24 hours.</p>
        </div>
        {contactSuccess ? (
          <div style={{background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center'}}>
            <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>✅</div>
            <h3 style={{color: '#166534', fontWeight: 700, marginBottom: '0.5rem'}}>Message Sent!</h3>
            <p style={{color: '#15803d'}}>Our agent will contact you within 24 hours. Redirecting you home…</p>
          </div>
        ) : (
          <form className="listing-form" onSubmit={handleContactSubmit}>
            {contactError && (
              <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem'}}>{contactError}</div>
            )}
            <div className="form-group mb-8">
              <label>Full Name <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <input type="text" className="form-input" placeholder="Your full name" required value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            <div className="form-group mb-8">
              <label>Email Address <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <input type="email" className="form-input" placeholder="you@example.com" required value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
            <div className="form-group mb-8">
              <label>Phone Number</label>
              <input type="tel" className="form-input" placeholder="+91 98765 43210" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            </div>
            <div className="form-group mb-12">
              <label>Message</label>
              <textarea className="form-input" rows="4" placeholder="I'm interested in investing in land parcels..." value={contactMessage} onChange={e => setContactMessage(e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{padding: '1rem', opacity: contactSubmitting ? 0.7 : 1}} disabled={contactSubmitting}>
              {contactSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );

  /* ============================================
     COMPANY: ABOUT US & OUR FOUNDERS
     ============================================ */
  const renderAbout = () => (
    <section className="section bg-white" style={{paddingBottom: '2rem'}}>
      {/* Hero Header */}
      <div className="about-hero">
        <div className="container">
          <h1 className="about-hero-title">About Us</h1>
          <p className="about-hero-subtitle">
            We are on a mission to democratize land investment in India, combining state-of-the-art satellite intelligence with ironclad legal assurance.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Intro Grid */}
        <div className="about-intro-grid">
          <div className="about-intro-text">
            <h3>Revolutionizing Land Ownership</h3>
            <p>
              Founded with the goal of bringing stock-market velocity, liquidity, and absolute transparency to physical property acquisitions, <strong>A1Plot</strong> bridges the gap between ambitious land seekers and authenticated sellers.
            </p>
            <p>
              We bypass traditional brokerages, eliminate asymmetric information, and secure transactions through rigorous 50-point due-diligence legal checks, digital layout mappings, and authenticated authority registries.
            </p>
          </div>
          <div className="about-intro-stats">
            <div className="about-intro-stat-card">
              <div className="about-intro-stat-num">500+</div>
              <div className="about-intro-stat-label">Verified Plots</div>
            </div>
            <div className="about-intro-stat-card">
              <div className="about-intro-stat-num">₹500Cr+</div>
              <div className="about-intro-stat-label">Asset Value Listed</div>
            </div>
            <div className="about-intro-stat-card">
              <div className="about-intro-stat-num">0%</div>
              <div className="about-intro-stat-label">Brokerage Fee</div>
            </div>
            <div className="about-intro-stat-card">
              <div className="about-intro-stat-num">100%</div>
              <div className="about-intro-stat-label">RERA Compliant</div>
            </div>
          </div>
        </div>
      </div>

      {/* Founders Section */}
      <div className="founders-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <h2 className="section-title">Meet Our Founders</h2>
            <p className="text-muted">The visionary minds and industry specialists behind A1Plot's growth and trust.</p>
          </div>

          <div className="founders-grid">
            {/* Yash Kandoi */}
            <div className="founder-card">
              <div className="founder-avatar-wrapper">
                <img
                  src="/assets/yash_profile.jpg"
                  alt="Yash Kandoi"
                  className="founder-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="founder-avatar">YK</div>
              </div>
              <h3 className="founder-name">Yash Kandoi</h3>
              <div className="founder-role">Founder & CEO</div>
              <p className="founder-bio">
                An alumnus of the prestigious IIT Kharagpur, Yash is a technologist and product builder. He designed the high-velocity trade engine, satellite polygon mapping, and digital dashboard integrations that form the core of A1Plot's unique frictionless platform.
              </p>
              <div className="founder-socials">
                <a
                  href="https://www.linkedin.com/in/yash-kandoi-85b612184/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-social"
                  title="Connect on LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Ashok Kandoi */}
            <div className="founder-card">
              <div className="founder-avatar-wrapper">
                <img
                  src="/assets/ashok_profile.png"
                  alt="Ashok Kandoi"
                  className="founder-avatar-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="founder-avatar">AK</div>
              </div>
              <h3 className="founder-name">Ashok Kandoi</h3>
              <div className="founder-role">Co-Founder & Director</div>
              <p className="founder-bio">
                Ashok brings over three decades of unparalleled hands-on real estate expertise, land acquisitions foresight, and municipal regulatory knowledge. He spearheads A1Plot's strict 50-point land validation protocols and local registry compliance processes.
              </p>
              <div className="founder-socials">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-social"
                  title="Connect on LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="about-values-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '3rem' }}>
            <h2 className="section-title">Our Grounding Principles</h2>
            <p className="text-muted">How we ensure every plot is as secure as a blue-chip stock.</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <ShieldCheck size={24} />
              </div>
              <h4 className="value-title">Absolute Legal Security</h4>
              <p className="value-desc">
                We handle title deeds, EC check pipelines, and layout plans with absolute rigor so you invest with peace of mind.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <TrendingUp size={24} />
              </div>
              <h4 className="value-title">Liquidity & Exit Strategy</h4>
              <p className="value-desc">
                By maintaining a digitized portfolio tracker and automated matching systems, we bring secondary market capabilities to land.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <MapPin size={24} />
              </div>
              <h4 className="value-title">High-Growth Geospatial Focus</h4>
              <p className="value-desc">
                We prioritize high-appreciating corridors with SEZ access, highway proximity, and commercial authorizations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderPrivacy = () => (
    <section className="section bg-white" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div style={{marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem'}}>
          <span style={{fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 700}}>Legal & Compliance</span>
          <h1 className="section-title" style={{fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem'}}>Privacy Policy</h1>
          <p className="text-muted">Last Updated: May 20, 2026</p>
        </div>

        <div style={{lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem'}}>
          <p style={{marginBottom: '1.5rem'}}>
            At <strong>A1Plot</strong>, we are committed to safeguarding the privacy and confidentiality of our investors, sellers, and visitors. This Privacy Policy details how we collect, process, secure, and share information on our platform.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>1. Information We Collect</h3>
          <p style={{marginBottom: '1.25rem'}}>
            To provide a premium real estate transactional experience, we collect information across three main categories:
          </p>
          <ul style={{paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc'}}>
            <li style={{marginBottom: '0.5rem'}}><strong>Personal Details:</strong> Name, verified email address, phone number, and Firebase authentication credentials.</li>
            <li style={{marginBottom: '0.5rem'}}><strong>Property & Listing Information:</strong> Ownership status, coordinate data, sizes, prices, layout plans, and legal files such as Title Deeds, Encumbrance Certificates (EC), and Khata Certificates.</li>
            <li style={{marginBottom: '0.5rem'}}><strong>Analytics & Cookies:</strong> Geographic coordinates, interactive map zoom selections, and temporary cookies to secure user sessions.</li>
          </ul>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>2. Data Masking & Buyer Engagement</h3>
          <p style={{marginBottom: '1.25rem'}}>
            To protect sellers from unsolicited brokers and maintain listing integrity:
          </p>
          <p style={{marginBottom: '1.25rem'}}>
            - All public-facing interfaces (including our Map View and home featured list) completely mask the seller's true name and details, displaying them as <strong>"A1Plot Verified Seller"</strong>.
          </p>
          <p style={{marginBottom: '1.25rem'}}>
            - The seller's actual identity is only released to a potential buyer after the buyer registers an interest, requests documentation, and signs our legally binding exclusive transactional commitment checkbox.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>3. How We Use Your Information</h3>
          <p style={{marginBottom: '1.25rem'}}>
            We process your information to:
          </p>
          <ul style={{paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc'}}>
            <li style={{marginBottom: '0.5rem'}}>Execute administrative verification of listed land plots.</li>
            <li style={{marginBottom: '0.5rem'}}>Calculate and present customized portfolio dashboards including historical returns and estimated returns.</li>
            <li style={{marginBottom: '0.5rem'}}>Render interactive map markers to assist buyers in viewing plot placements.</li>
            <li style={{marginBottom: '0.5rem'}}>Prevent fraudulent property listings and verify title integrity with local registration systems.</li>
          </ul>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>4. Data Security</h3>
          <p style={{marginBottom: '1.25rem'}}>
            Your profile data is protected via industry-standard Firebase authentication protocols. All sensitive title documents requested are handled securely and shared only with verified platform members who have signed relevant transactional checks.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>5. Cookies & Tracking</h3>
          <p style={{marginBottom: '1.25rem'}}>
            We use functional session management cookies to keep you signed in. We do not use third-party tracking pixels to sell your behavioral browsing data to advertisers.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>6. Your Rights & Deletion</h3>
          <p style={{marginBottom: '1.5rem'}}>
            Under Indian digital data privacy regulations, you have full rights to request the download or permanent deletion of your account and uploaded properties. You can submit data deletion requests via our <a onClick={() => navigate('contact')} style={{color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline'}}>Contact Page</a>.
          </p>
        </div>

        <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
          <button className="btn btn-primary" onClick={() => navigate('home')}>Return to Explore</button>
          <button className="btn btn-outline" onClick={() => navigate('terms')}>View Terms of Service</button>
        </div>
      </div>
    </section>
  );

  const renderTerms = () => (
    <section className="section bg-white" style={{paddingTop: '6rem', paddingBottom: '6rem'}}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div style={{marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem'}}>
          <span style={{fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 700}}>Legal & Compliance</span>
          <h1 className="section-title" style={{fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem'}}>Terms of Service</h1>
          <p className="text-muted">Last Updated: May 20, 2026</p>
        </div>

        <div style={{lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1rem'}}>
          <p style={{marginBottom: '1.5rem'}}>
            Welcome to <strong>A1Plot</strong>. By accessing or using our platform, website, interactive mapping services, or dashboard features, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>1. Platform Objective</h3>
          <p style={{marginBottom: '1.25rem'}}>
            A1Plot functions as a modern real estate investment platform designed to bring liquidity, verification, and transparency to Indian land investments. The website serves working professionals looking to manage verified land holdings and buy/sell parcels safely.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            2. Platform Exclusivity Agreement & Legal Violations
          </h3>
          <div style={{background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', borderLeft: '4px solid #f59e0b'}}>
            <p style={{fontWeight: 600, color: '#b45309', margin: 0, fontSize: '0.95rem'}}>
              ⚠️ CRITICAL PROVISION FOR BUYERS & SELLERS:
            </p>
            <p style={{fontSize: '0.9rem', color: '#78350f', marginTop: '0.5rem', marginBottom: 0}}>
              All buyer leads generated on A1Plot, and all document requests initiated via our platform, must be transacted <strong>exclusively under the facilitation of A1Plot</strong>. Users are strictly prohibited from bypassing the platform to engage directly after learning of a property listing here. Any bypass or attempt to circumvent the platform to complete a transaction privately to avoid platform support or commission is a material breach of contract, resulting in legal repercussions, project suspension, and a penalty fee.
            </p>
          </div>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>3. Listing Visibility & Verification Checklist</h3>
          <p style={{marginBottom: '1.25rem'}}>
            Sellers listing properties can set visibility options to:
          </p>
          <ul style={{paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyleType: 'disc'}}>
            <li style={{marginBottom: '0.5rem'}}><strong>Public:</strong> Properties are visible on the map and featured grids. Note: Properties must have their document verification approved by an A1Plot admin before they can be showcased publicly.</li>
            <li style={{marginBottom: '0.5rem'}}><strong>Private:</strong> Properties are restricted to the seller's personal portfolio dashboard and will not be displayed to the public or on the map.</li>
          </ul>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>4. Accuracy of Information</h3>
          <p style={{marginBottom: '1.25rem'}}>
            While A1Plot performs manual verification of upload files (such as EC and Title Deeds), we advise all users to execute their own independent land registry and local municipal checks. We explicitly leave direct government registration automated checks as an additional due-diligence step.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>5. Not Financial Advice</h3>
          <p style={{marginBottom: '1.25rem'}}>
            All portfolio growth rates, historic valuations, and estimated return visualisations shown on the dashboard represent hypothetical historical data and estimates. A1Plot does not supply official, registered financial, legal, or investment advice.
          </p>

          <h3 style={{fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem', marginBottom: '1rem', color: '#0f172a'}}>6. Termination of Access</h3>
          <p style={{marginBottom: '1.5rem'}}>
            We reserve the right to suspend accounts or reject listings that violate our verification criteria, input false location coordinates, list assets they do not own, or act in bad faith.
          </p>
        </div>

        <div style={{marginTop: '3rem', display: 'flex', gap: '1rem'}}>
          <button className="btn btn-primary" onClick={() => navigate('home')}>Return to Explore</button>
          <button className="btn btn-outline" onClick={() => navigate('privacy')}>View Privacy Policy</button>
        </div>
      </div>
    </section>
  );

  /* ============================================
     BUYER: BUY REQUEST / DOCS
     ============================================ */
  const renderBuyRequest = () => (
    <section className="section bg-white" style={{paddingTop: '6rem'}}>
      <div className="container" style={{maxWidth: '650px'}}>
        <div className="section-header">
          <h2 className="section-title">Buying Interface</h2>
          <p className="text-muted">Request verified documents for <strong>{requestingDocsFor?.title}</strong></p>
        </div>

        <div className="plot-card mb-8">
          <div className="plot-content">
            <div className="flex justify-between items-center mb-2" style={{flexWrap: 'wrap', gap: '0.5rem'}}>
              <h3 className="plot-title" style={{marginBottom: 0}}>{requestingDocsFor?.title}</h3>
              <span className="text-primary font-bold">{requestingDocsFor?.price}</span>
            </div>
            <p className="text-muted" style={{display: 'flex', alignItems: 'center', gap: '0.35rem'}}><MapPin size={14} /> {requestingDocsFor?.location}</p>
          </div>
        </div>

        {buyRequestSuccess ? (
          <div style={{background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', marginTop: '1.5rem'}}>
            <div style={{fontSize: '2.5rem', marginBottom: '0.75rem'}}>✅</div>
            <h3 style={{color: '#166534', fontWeight: 700, marginBottom: '0.5rem'}}>Request Sent!</h3>
            <p style={{color: '#15803d'}}>Our buying agent has been notified and will prepare the documents for you. Redirecting…</p>
          </div>
        ) : (
          <form className="listing-form" onSubmit={handleBuyRequestSubmit}>
            {buyRequestError && (
              <div style={{background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.25rem', fontSize: '0.9rem'}}>{buyRequestError}</div>
            )}
            <div className="form-group mb-8">
              <label>Select Documents Needed</label>
              <div className="flex gap-4" style={{flexWrap: 'wrap', marginTop: '0.5rem'}}>
                <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                  <input type="checkbox" checked={buyRequestDocs.includes('titleDeed')} onChange={e => setBuyRequestDocs(prev => e.target.checked ? [...prev, 'titleDeed'] : prev.filter(d => d !== 'titleDeed'))} /> Title Deed
                </label>
                <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                  <input type="checkbox" checked={buyRequestDocs.includes('ec')} onChange={e => setBuyRequestDocs(prev => e.target.checked ? [...prev, 'ec'] : prev.filter(d => d !== 'ec'))} /> Encumbrance Certificate (EC)
                </label>
                <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                  <input type="checkbox" checked={buyRequestDocs.includes('layoutPlan')} onChange={e => setBuyRequestDocs(prev => e.target.checked ? [...prev, 'layoutPlan'] : prev.filter(d => d !== 'layoutPlan'))} /> Layout Plan
                </label>
                <label className="flex items-center gap-2" style={{cursor: 'pointer'}}>
                  <input type="checkbox" checked={buyRequestDocs.includes('khata')} onChange={e => setBuyRequestDocs(prev => e.target.checked ? [...prev, 'khata'] : prev.filter(d => d !== 'khata'))} /> Khata Certificate
                </label>
              </div>
            </div>
            <div className="form-group mb-12">
              <label>Any Specific Queries?</label>
              <textarea className="form-input" rows="3" placeholder="Is the property bank approved? What are the payment terms?" value={buyRequestQuery} onChange={e => setBuyRequestQuery(e.target.value)}></textarea>
            </div>

            {/* Legal Agreement */}
            <div className="legal-agreement-box">
              <label className="legal-agreement-label">
                <input
                  type="checkbox"
                  checked={legalAgreed}
                  onChange={e => setLegalAgreed(e.target.checked)}
                  style={{flexShrink: 0, marginTop: '2px'}}
                />
                <span>
                  I agree that any transaction for this property will be conducted <strong>exclusively through A1Plot</strong>.
                  I understand that bypassing the platform may result in legal action and a penalty fee as per the platform's terms.
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button type="button" className="btn btn-outline" onClick={() => navigate('interested')}>Back</button>
              <button type="submit" className="btn btn-primary" style={{flex: 1, opacity: legalAgreed && !buyRequestSubmitting ? 1 : 0.5, cursor: legalAgreed && !buyRequestSubmitting ? 'pointer' : 'not-allowed'}} disabled={!legalAgreed || buyRequestSubmitting}>
                {buyRequestSubmitting ? 'Submitting…' : 'Submit Request to Buying Agent'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );

  /* ============================================
     AUTH: CREATIVE LOGIN / SIGNUP PAGE
     ============================================ */
  const renderAuth = () => (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-container">
        {/* Left panel - branding */}
        <div className="auth-branding">
          <img src="/assets/logo.webp" alt="A1Plot" style={{height: '56px', width: 'auto', marginBottom: '2rem', alignSelf: 'flex-start', objectFit: 'contain'}} />
          <h1 style={{fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem'}}>Invest in Land.<br/><span style={{color: '#10b981'}}>Build Wealth.</span></h1>
          <p style={{color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem'}}>Join thousands of smart investors who trust A1Plot for verified, transparent land investments.</p>
          <div className="flex gap-8">
            <div>
              <div style={{fontSize: '1.75rem', fontWeight: 800, color: 'white'}}>500+</div>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>Verified Plots</div>
            </div>
            <div>
              <div style={{fontSize: '1.75rem', fontWeight: 800, color: 'white'}}>₹500Cr+</div>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>Asset Value</div>
            </div>
            <div>
              <div style={{fontSize: '1.75rem', fontWeight: 800, color: 'white'}}>0%</div>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>Brokerage</div>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <h2 style={{fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem'}}>
              {authMode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-muted" style={{marginBottom: '2rem'}}>
              {authMode === 'login' ? 'Sign in to access your dashboard and investments.' : 'Start your real estate investment journey today.'}
            </p>

            {/* Google Sign In Button */}
            <button type="button" className="auth-google-btn" onClick={handleGoogleSignIn}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth}>
              <div className="auth-field">
                <Mail size={18} className="auth-field-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <Lock size={18} className="auth-field-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {authError && (
                <div className="auth-error">{authError}</div>
              )}

              <button type="submit" className="auth-submit-btn">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b'}}>
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                style={{color: '#3b7a76', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit'}}
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ============================================
     ADMIN EDIT FORM
     ============================================ */
  const renderAdminEditForm = () => (
    <section className="admin-panel-section pt-32 pb-20 fade-in">
      <div className="container" style={{maxWidth: '800px'}}>
        <div className="section-header">
          <h2 className="section-title">Admin Property Details & Edit</h2>
          <p className="text-muted">Review and update details for "{adminEditingPlot?.title}"</p>
        </div>
        {/* Field order below mirrors the List Your Land form exactly (Contact
            Email → Contact Phone → Title → Price → City → Transaction Type →
            Budget Range → Property Type → classification → Facing →
            Characteristics → Features → Additional Info → Map → Size →
            District/Tehsil/Village → Khasra → Images → Documents), so
            reviewing a listing here reads the same way it was entered.
            Contact details are admin-only — never shown on the public
            property page, same as the seller form never publishes them. */}
        <form className="listing-form" onSubmit={handleAdminUpdateProperty}>
          <div className="form-group mb-8">
            <label>Contact Email Address <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input type="email" className="form-input" value={adminNewPlot.ownerEmail || ''} onChange={(e) => setAdminNewPlot({...adminNewPlot, ownerEmail: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Contact Phone Number <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input type="tel" className="form-input" value={adminNewPlot.ownerPhone || ''} onChange={(e) => setAdminNewPlot({...adminNewPlot, ownerPhone: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Plot Title <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input type="text" className="form-input" required value={adminNewPlot.title} onChange={(e) => setAdminNewPlot({...adminNewPlot, title: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Location (Text)</label>
            <input type="text" className="form-input" required value={adminNewPlot.location} onChange={(e) => setAdminNewPlot({...adminNewPlot, location: e.target.value})} />
          </div>

          <div className="form-group mb-8">
            <label>Expected Price</label>
            <input type="text" className="form-input" required value={adminNewPlot.price} onChange={(e) => setAdminNewPlot({...adminNewPlot, price: e.target.value})} />
          </div>

          <div className="form-group mb-8">
            <label>City Location <span style={{color: 'var(--accent-red)'}}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Bangalore, Jaipur, Indore"
              className="form-input"
              required
              value={adminNewPlot.city || ''}
              onChange={(e) => setAdminNewPlot({...adminNewPlot, city: e.target.value})}
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Lease or Outright Purchase <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={adminNewPlot.transactionType}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, transactionType: e.target.value})}
              >
                <option value="sale">Outright Purchase</option>
                <option value="lease">Lease</option>
              </select>
            </div>
            <div className="form-group mb-8">
              <label>Budget Range / Price range <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <input
                type="text"
                placeholder="e.g. ₹50 L - ₹70 L"
                className="form-input"
                required
                value={adminNewPlot.budgetRange || ''}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, budgetRange: e.target.value})}
              />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Property Type <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={adminNewPlot.propertyType}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, propertyType: e.target.value})}
              >
                <option value="land">Land</option>
                <option value="constructed">Constructed Property</option>
              </select>
            </div>

            {adminNewPlot.propertyType === 'land' ? (
              <div className="form-group mb-8">
                <label>Land Classification <span style={{color: 'var(--accent-red)'}}>*</span></label>
                <select
                  className="form-input"
                  required
                  value={adminNewPlot.landType}
                  onChange={(e) => setAdminNewPlot({...adminNewPlot, landType: e.target.value})}
                >
                  <option value="converted">Land Converted</option>
                  <option value="agriculture">Agriculture Land</option>
                </select>
              </div>
            ) : (
              <div className="form-group mb-8">
                <label>Construction Status <span style={{color: 'var(--accent-red)'}}>*</span></label>
                <select
                  className="form-input"
                  required
                  value={adminNewPlot.constructionStatus}
                  onChange={(e) => setAdminNewPlot({...adminNewPlot, constructionStatus: e.target.value})}
                >
                  <option value="constructed">Constructed</option>
                  <option value="under-construction">Under construction</option>
                </select>
              </div>
            )}
          </div>

          {adminNewPlot.propertyType === 'land' ? (
            <div className="form-group mb-8">
              <label>Land Use Zoning <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={adminNewPlot.landUse}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, landUse: e.target.value})}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="institutional">Institutional</option>
                <option value="resort">Resort</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>
          ) : (
            <div className="form-group mb-8">
              <label>Property Subtype <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={adminNewPlot.constructedType}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, constructedType: e.target.value})}
              >
                <option value="flat">Flat / Apartment</option>
                <option value="independent_house_villa">Independent House / Villa</option>
                <option value="high_rise_apartment">High-rise Apartment</option>
                <option value="g_plus_building">G+ Building</option>
                <option value="residential_plot">Residential Plot</option>
                <option value="commercial_plot">Commercial Plot</option>
              </select>
            </div>
          )}

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem'}}>
            <div className="form-group mb-8">
              <label>Facing Direction <span style={{color: 'var(--accent-red)'}}>*</span></label>
              <select
                className="form-input"
                required
                value={adminNewPlot.facingDirection}
                onChange={(e) => setAdminNewPlot({...adminNewPlot, facingDirection: e.target.value})}
              >
                <option value="East">East Facing</option>
                <option value="West">West Facing</option>
                <option value="North">North Facing</option>
                <option value="South">South Facing</option>
              </select>
            </div>

            <div className="form-group mb-8">
              <label>Property Characteristics / Facing Tags</label>
              <div style={{display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={adminNewPlot.cornerProperty || false}
                    onChange={(e) => setAdminNewPlot({...adminNewPlot, cornerProperty: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Corner Property</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={adminNewPlot.parkFacing || false}
                    onChange={(e) => setAdminNewPlot({...adminNewPlot, parkFacing: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Park Facing</span>
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none'}}>
                  <input
                    type="checkbox"
                    checked={adminNewPlot.roadFacing || false}
                    onChange={(e) => setAdminNewPlot({...adminNewPlot, roadFacing: e.target.checked})}
                    style={{width: '18px', height: '18px', cursor: 'pointer'}}
                  />
                  <span>Road Facing</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group mb-8">
            <label>Key Features</label>
            <input type="text" className="form-input" value={adminNewPlot.features} onChange={(e) => setAdminNewPlot({...adminNewPlot, features: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Additional Information</label>
            <textarea className="form-input" rows={3} value={adminNewPlot.additionalInfo} onChange={(e) => setAdminNewPlot({...adminNewPlot, additionalInfo: e.target.value})} />
          </div>

          {/* ── Property Location on Map ── */}
          <div className="form-group mb-8">
            <label><MapPin size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.35rem'}} />Property Location Map</label>
            {isLoaded ? (
              <>
                <div className="location-map-container" style={{ position: 'relative' }}>

                  <GoogleMap
                    mapContainerStyle={{width: '100%', height: '400px', borderRadius: '0.75rem', cursor: isDrawingMode ? 'crosshair' : 'grab'}}
                    center={plotLocation}
                    zoom={14}
                    onClick={handleMapClickForDrawing}
                    options={{ mapTypeId: mapType, disableDefaultUI: true, zoomControl: true, mapTypeControl: false, draggableCursor: isDrawingMode ? 'crosshair' : 'grab', styles: mapOptions.styles }}
                  >
                    {!isDrawingMode && <MarkerF position={plotLocation} draggable={true} onDragEnd={onMarkerDragEnd} />}
                    {sortedPolygonPath.length > 0 && <PolygonF paths={sortedPolygonPath} options={{ fillColor: '#10b981', fillOpacity: 0.35, strokeColor: '#10b981', strokeOpacity: 1, strokeWeight: 2, clickable: false }} />}
                    {isDrawingMode && polygonPath.map((point, index) => (
                      <MarkerF key={index} position={point} label={{ text: (index + 1).toString(), color: 'white', fontWeight: 'bold', fontSize: '10px' }} icon={{ url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%2310b981" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`), scaledSize: new window.google.maps.Size(20, 20), anchor: new window.google.maps.Point(10, 10) }} />
                    ))}
                  </GoogleMap>
                  <div className="location-coords">
                    <span>📍 {plotLocation.lat.toFixed(5)}, {plotLocation.lng.toFixed(5)}</span>
                  </div>
                  {/* Floating Map Controls Inside Map */}
                  <div className="map-drawing-controls" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.95)', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexWrap: 'wrap', maxWidth: 'calc(100% - 20px)' }}>
                    <button
                      type="button"
                      className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      onClick={handleToggleDrawingMode}
                    >
                      <Edit3 size={14} style={{display: 'inline', marginRight: '4px'}} /> {isDrawingMode ? 'Stop' : (polygonPath.length > 0 ? 'Change boundary' : 'Draw Boundary')}
                    </button>
                    {polygonPath.length > 0 && (
                      <>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => setPolygonPath(polygonPath.slice(0, -1))}>
                          <Undo size={14} style={{display: 'inline', marginRight: '4px'}} /> Undo
                        </button>
                        <button type="button" className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', whiteSpace: 'nowrap' }} onClick={() => { setPolygonPath([]); setMediaFiles(prev => prev.filter(f => !f.isStaticMap)); }}>
                          <Trash2 size={14} style={{display: 'inline', marginRight: '4px'}} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', background: '#f8fafc', padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%', overflowX: 'auto' }}>
                    <button type="button" className={`btn ${mapType === 'roadmap' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('roadmap')}>Map</button>
                    <button type="button" className={`btn ${mapType === 'satellite' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('satellite')}>Satellite</button>
                    <button type="button" className={`btn ${mapType === 'hybrid' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('hybrid')}>Hybrid</button>
                    <button type="button" className={`btn ${mapType === 'terrain' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flex: '1 1 auto' }} onClick={() => setMapType('terrain')}>Terrain</button>
                  </div>
                </div>
                {isDrawingMode && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: 500, textAlign: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    👉 Click on the map to draw your land boundaries
                  </div>
                )}
              </>
            ) : (
              <div style={{height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '0.75rem'}}>
                <p className="text-muted">Loading map...</p>
              </div>
            )}
          </div>

          <div className="form-group mb-8">
            <label>Plot Size <span style={{color: 'var(--accent-red)'}}>*</span> <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: 'var(--text-muted)'}}>(Calculated based on satellite imagery of the location)</span></label>
            <input
              type="text"
              placeholder="e.g. 1,200 m² (Click on the map above in 'Draw Boundary' mode to automatically calculate)"
              className="form-input"
              required
              value={adminNewPlot.size}
              onChange={(e) => setAdminNewPlot({...adminNewPlot, size: e.target.value})}
            />
          </div>

          <div className="form-group mb-8">
            <label>State ➔ District ➔ Tehsil ➔ Village</label>
            <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>Automatically fetched when you mark the plot on the map.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="State" className="form-input" style={{flex: 1}} value={adminNewPlot.state || ''} onChange={e => setAdminNewPlot({...adminNewPlot, state: e.target.value})} />
              <input type="text" placeholder="District" className="form-input" style={{flex: 1}} value={adminNewPlot.district || ''} onChange={e => setAdminNewPlot({...adminNewPlot, district: e.target.value})} />
              <input type="text" placeholder="Tehsil" className="form-input" style={{flex: 1}} value={adminNewPlot.tehsil || ''} onChange={e => setAdminNewPlot({...adminNewPlot, tehsil: e.target.value})} />
              <input type="text" placeholder="Village" className="form-input" style={{flex: 1}} value={adminNewPlot.village || ''} onChange={e => setAdminNewPlot({...adminNewPlot, village: e.target.value})} />
            </div>
          </div>

          <div className="form-group mb-8">
            <label>Khasra / Khatauni Number <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: '#10b981'}}>(Optional)</span></label>
            <p className="text-muted" style={{fontSize: '0.85rem', marginBottom: '0.5rem'}}>
              <strong>Note:</strong> People who provide the Khasra number of their land have a <strong style={{color: '#3b82f6'}}>20x higher chance of selling</strong> as it builds immediate trust!
            </p>
            <input
              type="text"
              placeholder="e.g. 142/5"
              className="form-input"
              value={adminNewPlot.khasraNumber || ''}
              onChange={(e) => setAdminNewPlot({...adminNewPlot, khasraNumber: e.target.value})}
            />
          {adminNewPlot.state && adminNewPlot.district && (
              <div style={{
                marginTop: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #10b981',
                borderRadius: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
                <MapPin size={24} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#065f46', fontSize: '0.95rem' }}>Smart Village Lookup Detected</h4>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#047857', fontSize: '0.85rem' }}>
                    <strong>{adminNewPlot.village || 'Location'}</strong> in {adminNewPlot.tehsil ? `${adminNewPlot.tehsil}, ` : ''}{adminNewPlot.district}, {adminNewPlot.state}.
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#064e3b' }}>
                    Don't know your Khasra number? <a href={getStateBhulekhLink(adminNewPlot.state)} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 'bold', textDecoration: 'underline' }}>Verify it on {adminNewPlot.state} Bhulekh Portal</a>
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* ── Existing & New Images ── */}
          <div className="form-group mb-8">
            <label>Images</label>
            {adminNewPlot.media && adminNewPlot.media.length > 0 && (
              <div className="media-preview-grid mb-4">
                {adminNewPlot.media.map((url, i) => (
                  <div key={i} className="media-preview-item">
                    <img src={url} alt="" />
                    <button type="button" className="media-preview-remove" onClick={() => {
                      const updated = [...adminNewPlot.media];
                      updated.splice(i, 1);
                      setAdminNewPlot({ ...adminNewPlot, media: updated });
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <input ref={mediaInputRef} type="file" multiple accept="image/*,video/*" onChange={handleMediaSelect} style={{display: 'none'}} id="admin-media-upload" />
            <div className="upload-area" onClick={() => mediaInputRef.current?.click()}>
              <Upload size={28} className="text-muted" />
              <p className="text-muted">Click to upload new photos & videos</p>
            </div>
            {mediaFiles.length > 0 && (
              <div className="media-preview-grid mt-4">
                {mediaFiles.map(f => (
                  <div key={f.id} className="media-preview-item">
                    {f.preview ? <img src={f.preview} alt={f.name} /> : <div className="media-preview-video"><span>🎬</span><span>{f.name}</span></div>}
                    <button type="button" className="media-preview-remove" onClick={() => removeMediaFile(f.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Existing & New Documents ── */}
          <div className="form-group mb-12">
            <label>Documents</label>
            {adminNewPlot.documentsAvailable && adminNewPlot.documentsAvailable.length > 0 && (
              <div className="doc-file-list mb-4">
                {adminNewPlot.documentsAvailable.map((doc, i) => (
                  <div key={i} className="doc-file-item">
                    <div className="doc-file-icon">📄</div>
                    <div className="doc-file-info"><div className="doc-file-name">{adminNewPlot.title || 'Property'} {adminNewPlot.badge ? `(${adminNewPlot.badge})` : ''}</div></div>
                    <button type="button" className="doc-file-remove" onClick={() => {
                      const updated = [...adminNewPlot.documentsAvailable];
                      updated.splice(i, 1);
                      setAdminNewPlot({ ...adminNewPlot, documentsAvailable: updated });
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <input ref={docInputRef} type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleDocSelect} style={{display: 'none'}} id="admin-doc-upload" />
            <div className="upload-area" onClick={() => docInputRef.current?.click()}>
              <Upload size={28} className="text-muted" />
              <p className="text-muted">Click to upload new documents</p>
            </div>
            {docFiles.length > 0 && (
              <div className="doc-file-list mt-4">
                {docFiles.map(f => (
                  <div key={f.id} className="doc-file-item">
                    <div className="doc-file-icon">📄</div>
                    <div className="doc-file-info"><div className="doc-file-name">{f.name}</div><div className="doc-file-size">{f.size}</div></div>
                    <button type="button" className="doc-file-remove" onClick={() => removeDocFile(f.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group mb-8">
            <label>Status</label>
            <select className="form-input" value={adminNewPlot.status} onChange={(e) => setAdminNewPlot({...adminNewPlot, status: e.target.value})}>
              <option value="Verification Pending">Verification Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {submitError && (
            <div style={{background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#b91c1c', fontSize: '0.9rem'}}>
              ⚠️ {submitError}
            </div>
          )}
          <div className="flex justify-center gap-4">
            <button type="submit" className="btn btn-primary" style={{padding: '1rem 3rem', opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Details'}
            </button>
            <button type="button" className="btn btn-outline" style={{padding: '1rem 2rem'}} onClick={() => {
              setAdminEditingPlot(null);
              navigate('admin');
            }}>Cancel</button>
          </div>
        </form>
      </div>
    </section>
  );

  
  /* ============================================
     ADMIN MAP ANALYSIS
     ============================================ */
  const renderAdminMapAnalysis = () => {
    const mapPlots = plots.filter(p => p.lat && p.lng);

    const handleAdminMapClick = (e) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setAdminTempPin({ lat, lng, loading: true });
      
      if (!window.google?.maps?.Geocoder) {
        setAdminTempPin({ lat, lng, loading: false, error: "Maps API not loaded." });
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0] && results[0].address_components) {
          let state = '';
          let district = '';
          let tehsil = '';
          let village = '';
          results[0].address_components.forEach(comp => {
            const types = comp.types || [];
            if (types.includes('administrative_area_level_1')) state = comp.long_name;
            if (types.includes('administrative_area_level_3')) tehsil = comp.long_name;
            if (types.includes('administrative_area_level_2')) district = comp.long_name;
            if (types.includes('sublocality') || types.includes('locality') || types.includes('neighborhood')) {
              if (!village) village = comp.long_name;
            }
          });
          if (!village && results[0].address_components[0]) village = results[0].address_components[0].long_name;
          
          if (village || state) {
            setAdminTempPin({ lat, lng, loading: false, state, district, tehsil, village });
          } else {
            setAdminTempPin({ lat, lng, loading: false, error: "Could not detect location details." });
          }
        } else {
          setAdminTempPin({ lat, lng, loading: false, error: "Could not detect a village at this location." });
        }
      });
    };

    return (
      <section className="section bg-light" style={{paddingTop: '6rem', height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div className="container" style={{maxWidth: '1200px', flex: 1, display: 'flex', flexDirection: 'column'}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2" style={{marginBottom: '0.25rem'}}>
                <Navigation size={24} className="text-primary" />
                <h2 className="section-title" style={{marginBottom: 0}}>Analyse Lands in India</h2>
              </div>
              <p className="text-muted">Map view of all user-listed properties. <span style={{color: '#10b981', fontWeight: 'bold'}}>Green icons</span> indicate verified Bhulekh data. <br/><strong>Interactive Locator:</strong> Click anywhere on the map to find its village and generate a direct Bhulekh link!</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('admin')}>
              Back to List
            </button>
          </div>
          
          <div style={{flex: 1, minHeight: '500px', borderRadius: '1rem', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0'}}>
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{width: '100%', height: '100%'}}
                center={ADMIN_MAP_DEFAULT_CENTER}
                zoom={5}
                options={ADMIN_MAP_OPTIONS}
                onClick={handleAdminMapClick}
              >
                {mapPlots.map(plot => {
                  const hasKhasra = plot.khasraNumber && plot.khasraNumber.trim().length > 0;
                  const iconUrl = hasKhasra 
                    ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>')
                    : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>');
                  
                  return (
                    <MarkerF
                      key={plot.id}
                      position={{ lat: plot.lat, lng: plot.lng }}
                      icon={{
                        url: iconUrl,
                        scaledSize: new window.google.maps.Size(hasKhasra ? 32 : 28, hasKhasra ? 32 : 28),
                        anchor: new window.google.maps.Point(hasKhasra ? 16 : 14, hasKhasra ? 32 : 28)
                      }}
                      onClick={() => setSelectedPropertyDetailId(plot.id)}
                    />
                  );
                })}
                
                {selectedPropertyDetailId && (
                  (() => {
                    const selected = mapPlots.find(p => p.id === selectedPropertyDetailId);
                    if (!selected) return null;
                    return (
                      <InfoWindowF
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelectedPropertyDetailId(null)}
                      >
                        <div style={{padding: '0.5rem', maxWidth: '250px'}}>
                          <h4 style={{margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem'}}>{selected.title || 'Untitled Plot'}</h4>
                          <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>Size:</strong> {selected.size}</p>
                          <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>Price:</strong> {selected.price}</p>
                          <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>Location:</strong> {selected.location}</p>
                          {selected.khasraNumber && (
                            <div style={{background: '#ecfdf5', padding: '0.35rem', borderRadius: '0.25rem', border: '1px solid #10b981', marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                              <p style={{margin: 0, fontSize: '0.8rem', color: '#047857'}}><strong>Khasra Number:</strong> {selected.khasraNumber}</p>
                              <p style={{margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#065f46'}}>✓ Bhulekh Data Provided</p>
                            </div>
                          )}
                          <div style={{marginTop: '0.75rem', display: 'flex', gap: '0.5rem'}}>
                            <button 
                              className="btn btn-primary" 
                              style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', flex: 1}}
                              onClick={() => {
                                handleAdminEditClick(selected.id);
                              }}
                            >
                              Edit Property
                            </button>
                            <button 
                              className="btn btn-outline" 
                              style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem'}}
                              onClick={() => {
                                setSelectedPropertyDetail(selected);
                                navigate('property');
                              }}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </InfoWindowF>
                    );
                  })()
                )}
              
                {adminTempPin && (
                  <>
                    <MarkerF
                      position={{ lat: adminTempPin.lat, lng: adminTempPin.lng }}
                      icon={{
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>'),
                        scaledSize: new window.google.maps.Size(32, 32),
                        anchor: new window.google.maps.Point(16, 32)
                      }}
                      onClick={() => {}} 
                    />
                    <InfoWindowF
                      position={{ lat: adminTempPin.lat, lng: adminTempPin.lng }}
                      onCloseClick={() => setAdminTempPin(null)}
                      options={{ pixelOffset: new window.google.maps.Size(0, -32) }}
                    >
                      <div style={{padding: '0.5rem', maxWidth: '280px'}}>
                        <h4 style={{margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem'}}>Bhulekh Locator</h4>
                        {adminTempPin.loading ? (
                          <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Detecting village...</p>
                        ) : adminTempPin.error ? (
                          <p style={{margin: 0, fontSize: '0.85rem', color: '#ef4444'}}>{adminTempPin.error}</p>
                        ) : (
                          <>
                            <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>State:</strong> {adminTempPin.state}</p>
                            <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>District:</strong> {adminTempPin.district}</p>
                            <p style={{margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>Tehsil:</strong> {adminTempPin.tehsil}</p>
                            <p style={{margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b'}}><strong>Village:</strong> <span style={{color: '#0f172a', fontWeight: 'bold'}}>{adminTempPin.village}</span></p>
                            
                            <div style={{marginTop: '0.75rem'}}>
                              <a 
                                href={getStateBhulekhLink(adminTempPin.state)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                                style={{display: 'block', textAlign: 'center', padding: '0.35rem', fontSize: '0.8rem', textDecoration: 'none'}}
                              >
                                View on {adminTempPin.state} Bhulekh
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </InfoWindowF>
                  </>
                )}
</GoogleMap>
            ) : (
              <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9'}}><p>Loading map...</p></div>
            )}
          </div>
        </div>
      </section>
    );
  };

/* ============================================
     ADMIN PANEL
     ============================================ */
  const renderAdminPanel = () => {
    const pendingPlots = plots.filter(p => p.status === 'Verification Pending');
    const verifiedPlots = plots.filter(p => p.status === 'Verified');
    const rejectedPlots = plots.filter(p => p.status === 'Rejected');
    const allListedPlots = plots;

    return (
      <section className="section bg-light" style={{paddingTop: '6rem'}}>
        <div className="container">
          <div className="flex items-center justify-between mb-12" style={{flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <div className="flex items-center gap-2" style={{marginBottom: '0.25rem'}}>
                <Shield size={24} className="text-primary" />
                <h2 className="section-title" style={{marginBottom: 0}}>Admin Panel</h2>
              </div>
              <p className="text-muted">Review and manage all user-submitted property listings.</p>
            </div>
            <div className="flex gap-4">
              <button
                className="btn btn-outline"
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                onClick={() => setShowBulkImport(v => !v)}
              >
                ✨ {showBulkImport ? 'Hide Bulk Import' : 'Bulk Import from Text'}
              </button>
              <button
                className="btn btn-primary"
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                onClick={() => navigate('admin-map')}
              >
                <Navigation size={18} />
                Analyse Lands in India
              </button>
            </div>
            <div className="admin-stats-row">
              <div className="admin-stat">
                <div className="admin-stat-value">{pendingPlots.length}</div>
                <div className="admin-stat-label">Pending</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-value" style={{color: 'var(--accent-green)'}}>{verifiedPlots.length}</div>
                <div className="admin-stat-label">Verified</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-value" style={{color: 'var(--accent-red)'}}>{rejectedPlots.length}</div>
                <div className="admin-stat-label">Rejected</div>
              </div>
            </div>
          </div>

          {showBulkImport && (
            <div style={{padding: '1.5rem', marginBottom: '2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8}}>
              <h3 style={{marginTop: 0}}>Bulk Import from Broker Message</h3>
              <p className="text-muted" style={{fontSize: '0.9rem'}}>
                Paste a raw broker message with one or more properties (Hindi/English, abbreviated units are fine).
                AI splits it into drafts below — review, edit or remove any, then submit.
              </p>
              <textarea
                className="form-input"
                style={{minHeight: '160px', fontFamily: 'inherit', width: '100%'}}
                placeholder="Paste the broker message here..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                maxLength={8000}
              />
              <div className="flex items-center gap-4" style={{marginTop: '0.75rem'}}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={bulkExtracting || !bulkText.trim()}
                  onClick={handleBulkExtract}
                >
                  {bulkExtracting ? 'Extracting…' : 'Extract Listings'}
                </button>
                {bulkDrafts.length > 0 && (
                  <span className="text-muted" style={{fontSize: '0.85rem'}}>{bulkDrafts.length} draft{bulkDrafts.length === 1 ? '' : 's'} found</span>
                )}
              </div>
              {bulkError && <p style={{color: 'var(--accent-red)', fontSize: '0.85rem', marginTop: '0.5rem'}}>{bulkError}</p>}

              {bulkDrafts.map((d) => (
                <div key={d._id} style={{border: '1px solid #e2e8f0', borderRadius: 8, padding: '1rem', marginTop: '1rem', opacity: d.included ? 1 : 0.5}}>
                  <div className="flex items-center justify-between" style={{marginBottom: '0.5rem'}}>
                    <label className="flex items-center gap-2" style={{fontSize: '0.85rem'}}>
                      <input type="checkbox" checked={d.included} onChange={(e) => handleBulkDraftChange(d._id, 'included', e.target.checked)} />
                      Include this listing
                    </label>
                    <button type="button" className="admin-btn" style={{backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca'}} onClick={() => handleBulkRemoveDraft(d._id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem'}}>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Title</label>
                      <input className="form-input" value={d.title || ''} onChange={(e) => handleBulkDraftChange(d._id, 'title', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Location</label>
                      <input className="form-input" value={d.location || ''} onChange={(e) => handleBulkDraftChange(d._id, 'location', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Price</label>
                      <input className="form-input" value={d.price || ''} onChange={(e) => handleBulkDraftChange(d._id, 'price', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Budget Range</label>
                      <input className="form-input" value={d.budgetRange || ''} onChange={(e) => handleBulkDraftChange(d._id, 'budgetRange', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Size</label>
                      <input className="form-input" value={d.size || ''} onChange={(e) => handleBulkDraftChange(d._id, 'size', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>City</label>
                      <input className="form-input" value={d.city || ''} onChange={(e) => handleBulkDraftChange(d._id, 'city', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>State</label>
                      <input className="form-input" value={d.state || ''} onChange={(e) => handleBulkDraftChange(d._id, 'state', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>District</label>
                      <input className="form-input" value={d.district || ''} onChange={(e) => handleBulkDraftChange(d._id, 'district', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Tehsil</label>
                      <input className="form-input" value={d.tehsil || ''} onChange={(e) => handleBulkDraftChange(d._id, 'tehsil', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Village</label>
                      <input className="form-input" value={d.village || ''} onChange={(e) => handleBulkDraftChange(d._id, 'village', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Khasra Number</label>
                      <input className="form-input" value={d.khasraNumber || ''} onChange={(e) => handleBulkDraftChange(d._id, 'khasraNumber', e.target.value)} />
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Lease or Outright Purchase</label>
                      <select className="form-input" value={d.transactionType || ''} onChange={(e) => handleBulkDraftChange(d._id, 'transactionType', e.target.value)}>
                        <option value="">—</option>
                        <option value="sale">Outright Purchase</option>
                        <option value="lease">Lease</option>
                      </select>
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Property Type</label>
                      <select className="form-input" value={d.propertyType || ''} onChange={(e) => handleBulkDraftChange(d._id, 'propertyType', e.target.value)}>
                        <option value="">—</option>
                        <option value="land">Land</option>
                        <option value="constructed">Constructed Property</option>
                      </select>
                    </div>
                    {d.propertyType === 'constructed' ? (
                      <>
                        <div className="form-group mb-0">
                          <label style={{fontSize: '0.78rem'}}>Construction Status</label>
                          <select className="form-input" value={d.constructionStatus || ''} onChange={(e) => handleBulkDraftChange(d._id, 'constructionStatus', e.target.value)}>
                            <option value="">—</option>
                            <option value="constructed">Constructed</option>
                            <option value="under-construction">Under construction</option>
                          </select>
                        </div>
                        <div className="form-group mb-0">
                          <label style={{fontSize: '0.78rem'}}>Property Subtype</label>
                          <select className="form-input" value={d.constructedType || ''} onChange={(e) => handleBulkDraftChange(d._id, 'constructedType', e.target.value)}>
                            <option value="">—</option>
                            <option value="flat">Flat / Apartment</option>
                            <option value="independent_house_villa">Independent House / Villa</option>
                            <option value="high_rise_apartment">High-rise Apartment</option>
                            <option value="g_plus_building">G+ Building</option>
                            <option value="residential_plot">Residential Plot</option>
                            <option value="commercial_plot">Commercial Plot</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group mb-0">
                          <label style={{fontSize: '0.78rem'}}>Land Classification</label>
                          <select className="form-input" value={d.landType || ''} onChange={(e) => handleBulkDraftChange(d._id, 'landType', e.target.value)}>
                            <option value="">—</option>
                            <option value="converted">Land Converted</option>
                            <option value="agriculture">Agriculture Land</option>
                          </select>
                        </div>
                        <div className="form-group mb-0">
                          <label style={{fontSize: '0.78rem'}}>Land Use Zoning</label>
                          <select className="form-input" value={d.landUse || ''} onChange={(e) => handleBulkDraftChange(d._id, 'landUse', e.target.value)}>
                            <option value="">—</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="institutional">Institutional</option>
                            <option value="resort">Resort</option>
                            <option value="industrial">Industrial</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Facing Direction</label>
                      <select className="form-input" value={d.facingDirection || ''} onChange={(e) => handleBulkDraftChange(d._id, 'facingDirection', e.target.value)}>
                        <option value="">—</option>
                        <option value="East">East Facing</option>
                        <option value="West">West Facing</option>
                        <option value="North">North Facing</option>
                        <option value="South">South Facing</option>
                      </select>
                    </div>
                    <div className="form-group mb-0">
                      <label style={{fontSize: '0.78rem'}}>Property Tags</label>
                      <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer'}}>
                          <input type="checkbox" checked={d.cornerProperty || false} onChange={(e) => handleBulkDraftChange(d._id, 'cornerProperty', e.target.checked)} />
                          Corner
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer'}}>
                          <input type="checkbox" checked={d.parkFacing || false} onChange={(e) => handleBulkDraftChange(d._id, 'parkFacing', e.target.checked)} />
                          Park Facing
                        </label>
                        <label style={{display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer'}}>
                          <input type="checkbox" checked={d.roadFacing || false} onChange={(e) => handleBulkDraftChange(d._id, 'roadFacing', e.target.checked)} />
                          Road Facing
                        </label>
                      </div>
                    </div>
                    <div className="form-group mb-0" style={{gridColumn: '1 / -1'}}>
                      <label style={{fontSize: '0.78rem'}}>Key Features</label>
                      <input className="form-input" value={d.features || ''} onChange={(e) => handleBulkDraftChange(d._id, 'features', e.target.value)} />
                    </div>
                    <div className="form-group mb-0" style={{gridColumn: '1 / -1'}}>
                      <label style={{fontSize: '0.78rem'}}>Additional Information</label>
                      <textarea className="form-input" rows={2} value={d.additionalInfo || ''} onChange={(e) => handleBulkDraftChange(d._id, 'additionalInfo', e.target.value)} />
                    </div>
                  </div>
                  {d.sourceText && (
                    <p className="text-muted" style={{fontSize: '0.78rem', marginTop: '0.5rem', marginBottom: 0, whiteSpace: 'pre-wrap'}}>
                      Source: {d.sourceText}
                    </p>
                  )}
                </div>
              ))}

              {bulkDrafts.length > 0 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{marginTop: '1rem'}}
                  disabled={bulkSubmitting || bulkDrafts.filter(d => d.included).length === 0}
                  onClick={handleBulkSubmitAll}
                >
                  {bulkSubmitting ? 'Submitting…' : `Submit All (${bulkDrafts.filter(d => d.included).length})`}
                </button>
              )}
            </div>
          )}

          {allListedPlots.length === 0 ? (
            <div className="text-center" style={{padding: '4rem 2rem'}}>
              <p className="text-muted" style={{fontSize: '1.1rem'}}>No user-submitted listings yet.</p>
            </div>
          ) : (
            <AdminTable
              caption="properties"
              rows={allListedPlots}
              getRowKey={(p) => p.id}
              onRowOpen={(p) => handleAdminViewClick(p)}
              emptyMessage="No user-submitted listings yet."
              // Verified first, then pending, then rejected; inside each group
              // user submissions come before ones the admin listed themselves.
              defaultSort={(a, b) =>
                (STATUS_RANK[plotStatusOf(a)] - STATUS_RANK[plotStatusOf(b)])
                || (uploaderRank(a) - uploaderRank(b))
                || String(a.title || '').localeCompare(String(b.title || ''))
              }
              renderRowActions={(plot) => (
                <>
                  <button className="admin-btn" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => handleAdminViewClick(plot)}>
                    <Eye size={14} /> Open
                  </button>
                  {plotStatusOf(plot) !== 'Verified' && (
                    <button className="admin-btn admin-btn-verify" onClick={() => handleVerifyPlot(plot.id)}>
                      <Check size={14} /> Verify
                    </button>
                  )}
                  {plotStatusOf(plot) !== 'Verification Pending' && (
                    <button className="admin-btn" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }} onClick={() => handlePendingPlot(plot.id)}>
                      <Clock size={14} /> Mark Pending
                    </button>
                  )}
                  {plotStatusOf(plot) !== 'Rejected' && (
                    <button className="admin-btn admin-btn-reject" onClick={() => handleRejectPlot(plot.id)}>
                      <X size={14} /> Reject
                    </button>
                  )}
                  <button className="admin-btn" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={() => handleDeletePlot(plot)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
              columns={[
                {
                  key: 'title', label: 'Property', filter: 'text', width: '22%',
                  value: (p) => p.title || '',
                  render: (p) => (
                    <div className="admin-plot-title">
                      <img src={plotDisplayImage(p) || ''} alt="" className="admin-plot-thumb" />
                      <span>{p.title}</span>
                    </div>
                  ),
                },
                {
                  key: 'uploader', label: 'Uploaded By', filter: 'select', width: '18%',
                  value: (p) => resolveUploader(p).role,
                  sortValue: (p) => uploaderRank(p),
                  render: (p) => renderUploadedBy(p),
                },
                {
                  key: 'location', label: 'Location', filter: 'text', width: '16%',
                  value: (p) => p.location || p.city || '',
                  render: (p) => <span className="text-muted">{p.location || p.city || '—'}</span>,
                },
                {
                  key: 'price', label: 'Price / Size', filter: 'text', width: '13%',
                  value: (p) => p.price || '',
                  render: (p) => (
                    <>
                      <div className="font-semibold">{p.price || '—'}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.size || '—'}</div>
                    </>
                  ),
                },
                {
                  key: 'docs', label: 'Docs', width: '7%', align: 'center',
                  value: (p) => (p.documentsAvailable || []).length,
                  render: (p) => {
                    const n = (p.documentsAvailable || []).length;
                    return <span className="admin-doc-count" title={(p.documentsAvailable || []).join(', ')}>{n}</span>;
                  },
                },
                {
                  key: 'status', label: 'Status', filter: 'select', width: '12%',
                  value: (p) => plotStatusOf(p),
                  sortValue: (p) => STATUS_RANK[plotStatusOf(p)],
                  render: (p) => {
                    const st = plotStatusOf(p);
                    return (
                      <span className={`admin-status admin-status-${st.toLowerCase().replace(/\s+/g, '-')}`}>{st}</span>
                    );
                  },
                },
                {
                  key: 'listed', label: 'Listed', width: '12%',
                  value: (p) => p.createdAt || p.listedAt || 0,
                  render: (p) => <span className="text-muted" style={{ fontSize: '0.78rem' }}>{formatListedTime(p)}</span>,
                },
              ]}
            />
          )}

          {/* ── Broker Applications ─────────────────────────────────────── */}
          <div style={{ marginTop: '3.5rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
              <UserCheck size={22} className="text-primary" />
              <h2 className="section-title" style={{ marginBottom: 0, fontSize: '1.6rem' }}>Broker Applications</h2>
            </div>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Approve or reject brokers. Only <strong>approved</strong> brokers can see buyer requirements &amp; contact details.
            </p>

            <AdminTable
              caption="brokers"
              rows={allBrokers || []}
              getRowKey={(b) => b.uid}
              emptyMessage="No broker applications yet."
              // Pending applications first — those are the ones needing action.
              defaultSort={(a, b) => {
                const rank = (x) => ({ pending: 0, approved: 1, rejected: 2 }[x.status || 'pending'] ?? 0);
                return (rank(a) - rank(b)) || String(a.name || '').localeCompare(String(b.name || ''));
              }}
              renderRowActions={(b) => (
                <>
                  {(b.status || 'pending') !== 'approved' && (
                    <button className="admin-btn admin-btn-verify" onClick={() => handleApproveBroker(b)}>
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {(b.status || 'pending') !== 'rejected' && (
                    <button className="admin-btn admin-btn-reject" onClick={() => handleRejectBroker(b)}>
                      <X size={14} /> Reject
                    </button>
                  )}
                </>
              )}
              columns={[
                {
                  key: 'name', label: 'Broker', filter: 'text', width: '20%',
                  value: (b) => b.name || '',
                  render: (b) => (
                    <>
                      <div style={{ fontWeight: 600 }}>{b.name || 'Unnamed Broker'}</div>
                      {b.agency && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{b.agency}</div>}
                    </>
                  ),
                },
                {
                  key: 'email', label: 'Contact', filter: 'text', width: '22%',
                  value: (b) => b.email || '',
                  render: (b) => (
                    <>
                      {b.email && <div><a href={`mailto:${b.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)' }}>{b.email}</a></div>}
                      {b.phone && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{b.phone}</div>}
                    </>
                  ),
                },
                {
                  key: 'cities', label: 'Cities Covered', filter: 'text', width: '22%',
                  value: (b) => (b.citiesDisplay || b.cities || []).join(', '),
                  render: (b) => <span className="text-muted">{(b.citiesDisplay || b.cities || []).join(', ') || '—'}</span>,
                },
                {
                  key: 'rera', label: 'RERA ID', filter: 'text', width: '14%',
                  value: (b) => b.reraId || '',
                  render: (b) => b.reraId ? <span>{b.reraId}</span> : <span className="text-muted">Not provided</span>,
                },
                {
                  key: 'experience', label: 'Experience', width: '10%',
                  value: (b) => b.experience || '',
                  render: (b) => <span className="text-muted">{b.experience || '—'}</span>,
                },
                {
                  key: 'status', label: 'Status', filter: 'select', width: '12%',
                  value: (b) => b.status || 'pending',
                  render: (b) => {
                    const st = b.status || 'pending';
                    const c = st === 'approved' ? ['#dcfce7', '#166534'] : st === 'rejected' ? ['#fee2e2', '#991b1b'] : ['#fef3c7', '#92400e'];
                    return <span style={{ padding: '0.2rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', background: c[0], color: c[1] }}>{st}</span>;
                  },
                },
              ]}
            />
          </div>

          {/* ── Signed-In Users ──────────────────────────────────────────── */}
          <div style={{ marginTop: '3.5rem' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
              <User size={22} className="text-primary" />
              <h2 className="section-title" style={{ marginBottom: 0, fontSize: '1.6rem' }}>
                Signed-In Users {allUsers.length > 0 && <span className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>({allUsers.length})</span>}
              </h2>
            </div>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Everyone who has signed in to A1Plot, most recent first. Listings counted per user.
            </p>

            {usersLoading ? (
              <div className="text-center" style={{ padding: '2.5rem 2rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                <p className="text-muted">Loading users…</p>
              </div>
            ) : (
              <AdminTable
                caption="users"
                rows={allUsers}
                getRowKey={(u) => u.uid}
                emptyMessage="No signed-in users yet."
                defaultSort={(a, b) => (Number(b.lastSeenAt || 0) - Number(a.lastSeenAt || 0))}
                columns={[
                  {
                    key: 'name', label: 'User', filter: 'text', width: '20%',
                    value: (u) => u.displayName || u.email || '',
                    render: (u) => (
                      <div className="admin-plot-title">
                        {u.photoURL
                          ? <img src={u.photoURL} alt="" className="admin-plot-thumb" style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" />
                          : <span className="admin-plot-thumb" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#e2e8f0' }}><User size={16} style={{ color: '#64748b' }} /></span>}
                        <span>{u.displayName || u.email?.split('@')[0] || 'Unnamed'}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'email', label: 'Email', filter: 'text', width: '22%',
                    value: (u) => u.email || '',
                    render: (u) => u.email
                      ? <a href={`mailto:${u.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)' }}>{u.email}</a>
                      : <span className="text-muted">—</span>,
                  },
                  {
                    key: 'provider', label: 'Sign-in', filter: 'select', width: '11%',
                    value: (u) => (u.providers || []).map(x => (x === 'google.com' ? 'Google' : x === 'password' ? 'Email' : x)).join(', '),
                    render: (u) => <span className="text-muted" style={{ fontSize: '0.82rem' }}>{(u.providers || []).map(x => (x === 'google.com' ? 'Google' : x === 'password' ? 'Email' : x)).join(', ') || '—'}</span>,
                  },
                  {
                    key: 'role', label: 'Role', filter: 'select', width: '11%',
                    value: (u) => ADMIN_EMAILS.includes(u.email) ? 'admin' : ((allBrokers || []).find(b => b.uid === u.uid) ? 'broker' : 'user'),
                    render: (u) => {
                      const brokerProfile = (allBrokers || []).find(b => b.uid === u.uid);
                      const role = ADMIN_EMAILS.includes(u.email) ? 'admin' : brokerProfile ? 'broker' : 'user';
                      const st = UPLOADER_ROLE_STYLES[role];
                      return (
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', background: st.bg, color: st.color }}>
                          {role}{brokerProfile && brokerProfile.status !== 'approved' ? ` · ${brokerProfile.status}` : ''}
                        </span>
                      );
                    },
                  },
                  {
                    key: 'listings', label: 'Listings', width: '8%', align: 'center',
                    value: (u) => plots.filter(p => p.uploadedBy?.uid === u.uid || p.ownerUid === u.uid).length,
                    render: (u) => <span className="font-semibold">{plots.filter(p => p.uploadedBy?.uid === u.uid || p.ownerUid === u.uid).length}</span>,
                  },
                  {
                    key: 'signins', label: 'Sign-ins', width: '8%', align: 'center',
                    value: (u) => Number(u.signInCount || 1),
                    render: (u) => <span className="text-muted">{u.signInCount || 1}</span>,
                  },
                  {
                    key: 'lastSeen', label: 'Last Seen', width: '10%',
                    value: (u) => Number(u.lastSeenAt || 0),
                    render: (u) => <span className="text-muted" style={{ fontSize: '0.78rem' }}>{formatTimestamp(u.lastSeenAt)}</span>,
                  },
                  {
                    key: 'joined', label: 'Joined', width: '10%',
                    value: (u) => Number(u.createdAt || 0),
                    render: (u) => <span className="text-muted" style={{ fontSize: '0.78rem' }}>{formatTimestamp(u.createdAt)}</span>,
                  },
                ]}
              />
            )}
          </div>
        </div>
      </section>
    );
  };

  /* ============================================
     PROPERTY DETAIL VIEW (Public)
     ============================================ */
  const renderPropertyDetail = () => {
    if (!selectedPropertyDetail) {
      // Safety: if we're on /property but have no data (e.g. cleared localStorage), go home
      setTimeout(() => navigate('home'), 0);
      return null;
    }
    const plot = selectedPropertyDetail;
    const images = plot.media && plot.media.length > 0 ? plot.media : (plot.image ? [plot.image] : []);
    // Only show documents that were actually uploaded as files (they have a file extension).
    // Legacy placeholder strings like 'Title Deed', 'Patta' have no extension — skip them.
    const docs = (plot.documentsAvailable || []).filter(d => d && d.trim() !== '' && d.includes('.'));

    const showAdminControls = isAdmin && adminPreviewPlot;

    return (
      <section className="section bg-light" style={{paddingTop: '6rem', minHeight: '100vh'}}>
        <div className="container" style={{maxWidth: '1000px'}}>
          {showAdminControls ? (
            <div className="flex items-center justify-between mb-6" style={{flexWrap: 'wrap', gap: '0.75rem'}}>
              <button className="btn btn-outline" onClick={() => { setAdminPreviewPlot(false); navigate('admin'); }} style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white'}}>
                <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back to Admin Panel
              </button>
              <div className="flex items-center gap-2" style={{flexWrap: 'wrap'}}>
                <button className="admin-btn" style={{ backgroundColor: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1' }} onClick={() => handleAdminEditClick(plot)}>
                  <Edit3 size={14} /> Edit
                </button>
                {plotStatusOf(plot) !== 'Verified' && (
                  <button className="admin-btn admin-btn-verify" onClick={() => handleVerifyPlot(plot.id)}>
                    <Check size={14} /> Verify
                  </button>
                )}
                {plotStatusOf(plot) !== 'Verification Pending' && (
                  <button className="admin-btn" style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }} onClick={() => handlePendingPlot(plot.id)}>
                    <Clock size={14} /> Mark Pending
                  </button>
                )}
                {plotStatusOf(plot) !== 'Rejected' && (
                  <button className="admin-btn admin-btn-reject" onClick={() => handleRejectPlot(plot.id)}>
                    <X size={14} /> Reject
                  </button>
                )}
                <button className="admin-btn" style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }} onClick={async () => { if (await handleDeletePlot(plot)) { setAdminPreviewPlot(false); navigate('admin'); } }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-outline mb-6" onClick={() => navigate('buyer-map')} style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white'}}>
              <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back to Explore
            </button>
          )}

          {showAdminControls && (plot.ownerEmail || plot.ownerPhone) && (
            <div className="mb-6" style={{
              padding: '1.25rem 1.5rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Contact Email Address</span>
                <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.ownerEmail || 'Not provided'}</span>
              </div>
              <div>
                <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Contact Phone Number</span>
                <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.ownerPhone || 'Not provided'}</span>
              </div>
            </div>
          )}

          <div style={{background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)'}}>
            {/* Image Gallery Header */}
            {images.length > 0 && (
              <div style={{height: '400px', width: '100%', overflowX: 'auto', display: 'flex', gap: '2px', background: '#0f172a'}}>
                {images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt="" 
                    style={{height: '100%', minWidth: images.length === 1 ? '100%' : '60%', objectFit: 'cover', cursor: 'pointer'}} 
                    onClick={() => { setViewerIndex(i); setViewerOpen(true); }}
                  />
                ))}
              </div>
            )}

            <div style={{padding: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem'}}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`admin-status admin-status-${plot.status.toLowerCase().replace(/\s+/g,'-')}`}>
                      {plot.status === 'Verified' ? <><ShieldCheck size={14} style={{display: 'inline', marginRight: '0.2rem'}} /> Verified</> : plot.status}
                    </span>
                    <span style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}><MapPin size={14} style={{display: 'inline', verticalAlign: 'text-top'}} /> {plot.location}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                    <h1 style={{fontSize: '2rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0}}>{plot.title}</h1>
                    <button 
                      onClick={() => handleToggleInterest(plot)}
                      style={{
                        display: 'flex items-center gap-0.5rem', 
                        padding: '0.5rem 1rem', borderRadius: '2rem', 
                        border: `1px solid ${interestedPlots.some(p => p.id === plot.id) ? '#ef4444' : '#e2e8f0'}`,
                        background: interestedPlots.some(p => p.id === plot.id) ? '#fef2f2' : 'white',
                        color: interestedPlots.some(p => p.id === plot.id) ? '#ef4444' : '#64748b',
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Heart size={18} fill={interestedPlots.some(p => p.id === plot.id) ? "#ef4444" : "none"} />
                      {interestedPlots.some(p => p.id === plot.id) ? 'Liked' : 'Like Property'}
                    </button>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1'}}>{plot.price}</div>
                  <div style={{fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Size: {plot.size}</div>
                </div>
              </div>

              {/* Property Specifications Grid — field order mirrors the List
                  Your Land form (City, Lease/Purchase, Budget Range, Property
                  Type, Land/Construction classification, Land Use/Subtype,
                  Facing Direction, then Characteristics tags), so a listing
                  reads the same way here as it was entered. */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                textAlign: 'left'
              }}>
                <div>
                  <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>City Location</span>
                  <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.city || 'Not Specified'}</span>
                </div>
                <div>
                  <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Transaction Type</span>
                  <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                    {plot.transactionType === 'lease' ? 'Lease' : 'Outright Purchase'}
                  </span>
                </div>
                <div>
                  <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Budget / Asking Range</span>
                  <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.budgetRange || plot.price}</span>
                </div>
                <div>
                  <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Property Classification</span>
                  <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                    {plot.propertyType === 'constructed' ? 'Constructed Property' : 'Land Parcel'}
                  </span>
                </div>
                {plot.propertyType === 'constructed' ? (
                  <>
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Construction Status</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                        {plot.constructionStatus === 'under-construction' ? 'Under Construction' : 'Constructed / Ready'}
                      </span>
                    </div>
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Property Subtype</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                        {plot.constructedType === 'flat' && 'Flat / Apartment'}
                        {plot.constructedType === 'independent_house_villa' && 'Independent House / Villa'}
                        {plot.constructedType === 'high_rise_apartment' && 'High-rise Apartment'}
                        {plot.constructedType === 'g_plus_building' && 'G+ Building'}
                        {plot.constructedType === 'residential_plot' && 'Residential Plot'}
                        {plot.constructedType === 'commercial_plot' && 'Commercial Plot'}
                        {!['flat', 'independent_house_villa', 'high_rise_apartment', 'g_plus_building', 'residential_plot', 'commercial_plot'].includes(plot.constructedType) && (plot.constructedType || 'Constructed')}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Land Classification</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                        {plot.landType === 'agriculture' ? 'Agriculture Land' : 'Land Converted'}
                      </span>
                    </div>
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Land Zoning / Use</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', textTransform: 'capitalize'}}>
                        {plot.landUse || 'Residential'}
                      </span>
                    </div>
                  </>
                )}
                <div>
                  <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Facing Direction</span>
                  <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.facingDirection || 'East'} Facing</span>
                </div>
                {(plot.cornerProperty || plot.parkFacing || plot.roadFacing) && (
                  <div style={{gridColumn: '1 / -1'}}>
                    <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Property Tags</span>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      {plot.cornerProperty && (
                        <span style={{background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600}}>
                          📐 Corner Property
                        </span>
                      )}
                      {plot.parkFacing && (
                        <span style={{background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600}}>
                          🌳 Park Facing
                        </span>
                      )}
                      {plot.roadFacing && (
                        <span style={{background: '#fdf2f8', color: '#c01574', border: '1px solid #fbcfe8', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600}}>
                          🛣️ Road Facing
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {plot.features && plot.features.trim() && (
                <div style={{marginTop: '2rem'}}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>Key Features</h3>
                  <p style={{color: 'var(--text-muted)', lineHeight: 1.6}}>{plot.features}</p>
                </div>
              )}

              {plot.additionalInfo && plot.additionalInfo.trim() && (
                <div style={{marginTop: '2rem'}}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>Additional Information</h3>
                  <p style={{whiteSpace: 'pre-wrap', color: 'var(--text-muted)', lineHeight: 1.6}}>{plot.additionalInfo}</p>
                </div>
              )}

              {(plot.state || plot.district || plot.tehsil || plot.village || plot.khasraNumber) && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.5rem',
                  textAlign: 'left'
                }}>
                  {(plot.state || plot.district || plot.tehsil || plot.village) && (
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>State / District / Tehsil / Village</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>
                        {[plot.village, plot.tehsil, plot.district, plot.state].filter(Boolean).join(', ') || 'Not Specified'}
                      </span>
                    </div>
                  )}
                  {plot.khasraNumber && (
                    <div>
                      <span style={{fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Khasra / Khatauni Number</span>
                      <span style={{fontSize: '1.05rem', fontWeight: 700, color: '#1e293b'}}>{plot.khasraNumber}</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem'}}>
                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>Property Location</h3>
                  <div style={{height: '300px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-color)'}}>
                    {isLoaded && plot.lat && plot.lng ? (
                      <GoogleMap
                        mapContainerStyle={{width: '100%', height: '100%'}}
                        center={{ lat: plot.lat, lng: plot.lng }}
                        zoom={15}
                        options={{ mapTypeId: 'hybrid', disableDefaultUI: true, zoomControl: true }}
                      >
                        <MarkerF position={{ lat: plot.lat, lng: plot.lng }} />
                        {plot.polygonPath && plot.polygonPath.length >= 3 && (
                          <PolygonF paths={plot.polygonPath} options={{ fillColor: '#10b981', fillOpacity: 0.35, strokeColor: '#10b981', strokeOpacity: 1, strokeWeight: 2 }} />
                        )}
                      </GoogleMap>
                    ) : (
                      <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9'}}><p>Map not available</p></div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem'}}>Available Documents</h3>
                  {docs.length > 0 ? (
                    <div className="doc-file-list">
                      {docs.map((doc, i) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}} title="Click to open document">
                          <div className="doc-file-item" style={{background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background='#eff6ff'} onMouseLeave={e => e.currentTarget.style.background='#f8fafc'}>
                            <div className="doc-file-icon" style={{fontSize: '1.5rem'}}>📄</div>
                            <div className="doc-file-info" style={{flex: 1}}>
                              <div className="doc-file-name" style={{fontWeight: 600, color: '#334155'}}>{plot.title} {plot.badge ? `(${plot.badge})` : ''}</div>
                              <div style={{fontSize: '0.75rem', color: '#3b82f6'}}>Click to Open ↗</div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      background: '#f8fafc', 
                      padding: '1rem', 
                      borderRadius: '0.5rem', 
                      border: '1px dashed #cbd5e1', 
                      textAlign: 'center', 
                      color: '#64748b', 
                      fontSize: '0.95rem', 
                      fontWeight: 500
                    }}>
                      Documents not uploaded
                    </div>
                  )}

                  <div style={{marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0'}}>
                    <h4 style={{fontSize: '1.1rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem'}}>
                      {contactedPlots.includes(plot.id) ? 'Contact Seller Directly' : 'Interested in this property?'}
                    </h4>
                    <p style={{fontSize: '0.9rem', color: '#15803d', marginBottom: '1rem'}}>
                      {contactedPlots.includes(plot.id) 
                        ? 'You have expressed interest. Click below to contact our seller rep.' 
                        : 'Register your interest to notify the seller and request a call back.'}
                    </p>
                    <button 
                      className={`btn ${contactedPlots.includes(plot.id) ? 'btn-accent' : 'btn-primary'}`} 
                      style={{width: '100%'}} 
                      onClick={() => handleDetailInterestClick(plot)}
                    >
                      {contactedPlots.includes(plot.id) ? 'Contact Seller' : 'Interested'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderDirectPromoPage = () => {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-main)',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Simple Clean Header */}
        <header style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--primary)',
              letterSpacing: '-0.02em'
            }}>A1Plot</span>
            <span style={{
              backgroundColor: 'rgba(59, 122, 118, 0.1)',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)'
            }}>Direct Listing Portal</span>
          </div>
        </header>

        {/* Hero Section */}
        <main style={{ flex: 1, padding: '4rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            maxWidth: '750px',
            margin: '0 auto',
            textAlign: 'center',
            background: 'var(--surface)',
            padding: '4rem 3rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)',
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '2rem',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              ⚡ Direct Land Listing (No Account Required)
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'var(--text-main)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em'
            }}>
              List Your Land Parcel & Reach Thousands of Buyers
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              marginBottom: '3rem',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto 3rem'
            }}>
              Direct onboarding for Meta Ads users. Skip Google Sign-In entirely and submit your property details to our admin desk in 3 minutes.
            </p>

            {/* CTA Button */}
            <button 
              className="btn btn-primary"
              onClick={() => setDirectStep('form')}
              style={{
                padding: '1.25rem 3.5rem',
                fontSize: '1.1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'var(--transition)'
              }}
            >
              List Your Land Now &rarr;
            </button>

            {/* Verification Features Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              marginTop: '4rem',
              paddingTop: '3rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'left'
            }}>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '1.05rem' }}>1. No Sign-In</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Provide contact info directly without account registration.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '1.05rem' }}>2. Satellite Pin</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pinpoint your exact boundary layout on our integrated map tool.</p>
              </div>
              <div>
                <h4 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '1.05rem' }}>3. Instant Review</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Admin team processes verification docs to list it live on the map.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface)',
          padding: '2.5rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>© {new Date().getFullYear()} A1Plot Partner Portal. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>This is a secure private listing portal powered by A1Plot.</p>
        </footer>
      </div>
    );
  };

  const renderDirectLandingPage = () => (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Minimal branded header — no nav links. Suppressed when mounted inside
          a real SSR page shell, which already provides a real header for
          crawlers (see e.g. app/direct-list/page.jsx). */}
      {!hideChrome && (
        <header style={{
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/assets/logo.webp" alt="A1Plot" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>A1Plot</span>
            <span style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-green)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-full)'
            }}>Direct Listing — No Sign-In Required</span>
          </div>
        </header>
      )}

      {/* The full seller form — exact same as main site */}
      <main style={{ flex: 1 }}>
        {renderSellerForm()}
      </main>

      {/* Simple footer */}
      {!hideChrome && (
        <footer style={{
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--surface)',
          padding: '2rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.82rem'
        }}>
          <p>&copy; {new Date().getFullYear()} A1Plot — India's Premium Land Investment Platform</p>
          <p style={{ marginTop: '0.4rem', fontSize: '0.75rem' }}>Your listing is reviewed and verified by our admin team before going live.</p>
        </footer>
      )}
    </div>
  );

  /* ============================================
     MAIN RENDER
     ============================================ */
  if (authLoading || plotsLoading) {
    return (
      <div className="global-loader-container">
        <div className="global-loader-card">
          <div className="logo-spinner-wrapper">
            <div className="spinner-ring"></div>
            <img src="/assets/logo.webp" alt="A1Plot" className="spinner-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div className="loader-text">Securing Verified Land Plots...</div>
          <div className="loader-subtext">Connecting to registry & satellite imagery data</div>
        </div>
      </div>
    );
  }

  if (view === 'direct-list') {
    return renderDirectLandingPage();
  }

  return (
    <>
      {/* Navbar — matches the site-wide SiteChrome header (logo + search + CTA).
          Suppressed when mounted as a client island inside a real SSR page
          shell, which already renders its own real <nav> for crawlers. */}
      {!hideChrome && (
      <nav className="navbar sc-navbar">
        <div className="container sc-navbar-inner">
          <a href="/" className="navbar-brand sc-brand" aria-label="A1Plot home">
            <img src="/assets/logo.webp" alt="A1Plot Logo" className="logo-img" width="120" height="52" />
          </a>

          <form action="/search" method="get" className="sc-header-search" role="search">
            <div className="sc-header-search-box">
              <Search size={18} />
              <input type="text" name="q" placeholder="Search property…" aria-label="Search properties by city or location" />
              <button type="submit">Search</button>
            </div>
          </form>

          <div className="sc-text-links">
            <a className="nav-link" href="/buyer_map" title="Buy or Rent Land"><Home size={15} /> Buy</a>
            <a className="nav-link" href="/list_property" title="Sell Your Land"><Tag size={15} /> Sell</a>
            <a className="nav-link" href={user ? (myBrokerProfile ? '/broker-dashboard' : '/brokers/register') : '/login?redirect=/brokers/register'} title={user && myBrokerProfile ? 'Go to Your Broker Dashboard' : 'Register Yourself as a Broker'}><UserCheck size={15} /> Broker</a>
            {isAdmin && (
              <a className="nav-link" href="/admin" style={{color: '#e11d48', fontWeight: 600}}>
                <Shield size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem'}} />Admin
              </a>
            )}
          </div>

          <div className="sc-nav-actions">
            <a className="btn btn-accent sc-cta-post" href="/post-requirement">Post Requirement</a>
            {user ? (
              <div className="profile-dropdown-wrapper">
                <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                  {user.photoURL && !avatarError ? (
                    <img src={user.photoURL} alt="" className="user-avatar" referrerPolicy="no-referrer" onError={() => setAvatarError(true)} />
                  ) : (
                    <div className="user-avatar-placeholder"><User size={16} /></div>
                  )}
                  <span className="user-name">{user.displayName || user.email?.split('@')[0]}</span>
                  <ChevronDown size={16} className={`profile-chevron ${profileOpen ? 'open' : ''}`} />
                </button>
                {profileOpen && (
                  <>
                    <div className="profile-dropdown-backdrop" onClick={() => setProfileOpen(false)} />
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
                        <a className="profile-dropdown-item" href="/buyer_map">Buy Land</a>
                        <a className="profile-dropdown-item" href="/search">Search Properties</a>
                        <a className="profile-dropdown-item" href="/post-requirement">Post a Requirement</a>
                        <a className="profile-dropdown-item" href="/list_property">Sell Your Land</a>
                        <a className="profile-dropdown-item" href="/brokers/register">Register as a Broker</a>
                        <a className="profile-dropdown-item" href="/about_us">About Us</a>
                        <a className="profile-dropdown-item" href="/contact">Contact</a>
                        {(canInstall || showIOSInstructions) && (
                          <button
                            type="button"
                            className="profile-dropdown-item"
                            onClick={() => { setProfileOpen(false); canInstall ? handleInstallAppClick() : handleIOSInstallHintClick(); }}
                          >
                            📲 {canInstall ? 'Install App' : 'Add to Home Screen'}
                          </button>
                        )}
                        <div className="profile-dropdown-divider" />
                      </div>

                      <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('seller-dashboard'); }}>
                        <Building size={16} /> My Lands
                      </button>
                      <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('interested'); }}>
                        <MapPin size={16} /> My Interests
                      </button>
                      <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('broker-dashboard'); }}>
                        <User size={16} /> {myBrokerProfile ? 'Broker Dashboard' : 'Become a Broker'}
                      </button>
                      {isAdmin && (
                        <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('admin'); }} style={{color: '#e11d48'}}>
                          <Shield size={16} /> Admin Panel
                        </button>
                      )}
                      <div className="profile-dropdown-divider" />
                      <button className="profile-dropdown-item profile-dropdown-signout" onClick={() => { setProfileOpen(false); handleSignOut(); }}>
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <a className="btn btn-outline sc-login-btn" href="/login">Log In</a>
                {/* Only exists in the DOM when signed out — once logged in, the
                    avatar dropdown above is the single mobile menu trigger. */}
                <button type="button" className="mobile-menu-toggle sc-mobile-toggle-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open menu">
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown — signed-out only (see above) */}
        {!user && mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <a className="mobile-menu-link" href="/buyer_map">Buy Land</a>
              <a className="mobile-menu-link" href="/search">Search Properties</a>
              <a className="mobile-menu-link" href="/post-requirement">Post a Requirement</a>
              <a className="mobile-menu-link" href="/list_property">Sell Your Land</a>
              <a className="mobile-menu-link" href="/brokers/register">Register as a Broker</a>
              <a className="mobile-menu-link" href="/about_us">About Us</a>
              <a className="mobile-menu-link" href="/contact">Contact</a>
              <a className="mobile-menu-link" href="/login">Log In</a>
              {(canInstall || showIOSInstructions) && (
                <button
                  type="button"
                  className="mobile-menu-link"
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', font: 'inherit' }}
                  onClick={() => { setMobileMenuOpen(false); canInstall ? handleInstallAppClick() : handleIOSInstallHintClick(); }}
                >
                  📲 {canInstall ? 'Install App' : 'Add to Home Screen'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      )}

      <main>
        {view === 'home' && renderHome()}
        {view === 'login' && renderAuth()}
        {/* Listing a NEW property needs no account — the form collects a
            mandatory email + phone instead. Editing an EXISTING listing still
            requires a session, since that's the owner changing their own data. */}
        {view === 'seller-list' && renderSellerForm()}
        {view === 'seller-edit' && (user ? renderSellerForm() : renderAuth())}
        {view === 'direct-list' && renderSellerForm()}
        {view === 'seller-dashboard' && (user ? renderSellerDashboard() : renderAuth())}
        {view === 'buyer-map' && renderBuyerMap()}
        {view === 'interested' && renderInterested()}
        {view === 'contact' && renderContact()}
        {view === 'buy-request' && renderBuyRequest()}
        {view === 'admin' && (isAdmin ? renderAdminPanel() : renderAuth())}
        {view === 'admin-map' && (isAdmin ? renderAdminMapAnalysis() : renderAuth())}
        {view === 'admin-edit' && (isAdmin ? renderAdminEditForm() : renderAuth())}
        {view === 'property-detail' && renderPropertyDetail()}
        {view === 'privacy' && renderPrivacy()}
        {view === 'terms' && renderTerms()}
        {view === 'about' && renderAbout()}
        {view === 'search' && (
          <SearchResults
            plots={plots}
            navigate={navigate}
            user={user}
            showToast={showToast}
            onOpenProperty={(plot) => { setSelectedPropertyDetail(plot); setAdminPreviewPlot(false); navigate('property-detail'); }}
          />
        )}
        {view === 'post-requirement' && (
          <PostRequirement user={user} navigate={navigate} showToast={showToast} addRequirement={addRequirement} />
        )}
        {view === 'broker-register' && (
          <BrokerRegister user={user} navigate={navigate} showToast={showToast} myBrokerProfile={myBrokerProfile} saveBroker={saveBroker} ensureAuth={ensureAuth} />
        )}
        {view === 'broker-dashboard' && (
          <BrokerDashboard user={user} navigate={navigate} showToast={showToast} myBrokerProfile={myBrokerProfile} profileLoading={!!user && myBrokerProfileLoading} requirements={requirements} loading={requirementsLoading} plots={plots} plotsLoading={plotsLoading} onViewPlot={handleViewProperty} catalogs={catalogs} catalogsLoading={catalogsLoading} createCatalog={createCatalog} updateCatalog={updateCatalog} deleteCatalog={deleteCatalog} />
        )}
      </main>

      {/* Footer */}
      {toastMessage && (
        <div className="toast-notification-container">
          <div className="toast-notification-card">
            <div className="toast-icon-circle">
              <CheckCircle2 size={18} />
            </div>
            <div className="toast-content">
              <div className="toast-title">A1Plot Notification</div>
              <div className="toast-desc">{toastMessage}</div>
            </div>
            <button className="toast-close" onClick={() => setToastMessage(null)}>✕</button>
          </div>
        </div>
      )}
      {!hideChrome && view !== 'login' && (
        <footer>
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="navbar-brand footer-brand">
                  <img src="/assets/logo.webp" alt="A1Plot Logo" className="logo-img" width="120" height="52" />
                </div>
                <p className="footer-desc">
                  Bringing stock-market velocity, liquidity, and transparency to Indian real estate investments.
                </p>
              </div>
              <div className="footer-links">
                <h4>Platform</h4>
                <ul>
                  <li><a onClick={() => navigate('buyer-map')}>Browse Plots</a></li>
                  <li><a onClick={() => navigate('search')}>Search Properties</a></li>
                  <li><a onClick={() => navigate('post-requirement')}>Post a Requirement</a></li>
                  <li><a onClick={() => navigate('broker-register')}>Register as a Broker</a></li>
                  <li><a onClick={() => navigate('broker-dashboard')}>Broker Dashboard</a></li>
                  <li><a onClick={() => navigate('seller-list')}>List Land</a></li>
                </ul>
              </div>
              <div className="footer-links">
                <h4>Company</h4>
                <ul>
                  <li><a onClick={() => navigate('about')}>About Us</a></li>
                  <li><a href="#careers">Careers</a></li>
                  <li><a href="#blog">Blog</a></li>
                  <li><a onClick={() => navigate('contact')}>Contact</a></li>
                </ul>
              </div>
              <div className="footer-links">
                <h4>Legal</h4>
                <ul>
                  <li><a onClick={() => navigate('terms')}>Terms of Service</a></li>
                  <li><a onClick={() => navigate('privacy')}>Privacy Policy</a></li>
                  <li><a href="#rera">RERA Disclaimers</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              &copy; {new Date().getFullYear()} A1Plot.com. All rights reserved. Not actual financial advice.
            </div>
          </div>
        </footer>
      )}
    </>
  );
};
