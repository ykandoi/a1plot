import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  TrendingUp, ShieldCheck, MapPin,
  Search, ArrowRight,
  Smartphone, Clock, CheckCircle2,
  ChevronRight, ChevronDown, Building, Upload,
  LogOut, User, Mail, Lock, Eye, EyeOff, Settings,
  Shield, Check, X, Menu, Undo, Trash2, Edit3, Heart
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, Autocomplete, PolygonF } from '@react-google-maps/api';

const LIBRARIES = ['places', 'geometry'];
import { auth, googleProvider, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { usePlots } from './hooks/usePlots';
import { useInterests } from './hooks/useInterests';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 26.837,
    lng: 75.642,
    investedAmount: 700000000,
    currentValue: 700000000,
    purchaseDate: '2024-01-01',
    priceHistory: []
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
    image: 'https://images.unsplash.com/photo-1510007802148-5c4d16857cb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    documentsAvailable: [],
    lat: 25.10,
    lng: 75.80,
    investedAmount: 72500000,
    currentValue: 72500000,
    purchaseDate: '2024-01-01',
    priceHistory: []
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
    priceHistory: []
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
    priceHistory: []
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
    priceHistory: []
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
  'about': '/about_us'
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
  '/property': 'property-detail',
  '/login': 'login',
  '/about_us': 'about'
};

function App() {
  // Clear any stale localStorage keys from old code versions
  try { localStorage.removeItem('selected_property_detail'); } catch(e) {}

  // Initialize view directly from URL path so reloads land on the correct page
  const getInitialView = () => {
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
      '/about_us': 'about'
    };
    return pathToViewMap[window.location.pathname] || 'home';
  };
  const [view, setView] = useState(getInitialView);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPlot, setNewPlot] = useState({ title: '', location: '', price: '', size: '', features: '', visibility: 'public' });
  const [editingPlot, setEditingPlot] = useState(null);
  const [adminNewPlot, setAdminNewPlot] = useState({ title: '', location: '', price: '', size: '', features: '', visibility: 'public', status: 'Verification Pending', media: [], documentsAvailable: [] });
  const [adminEditingPlot, setAdminEditingPlot] = useState(null);
  // Store only the plot ID in localStorage to avoid stale cached data
  const [selectedPropertyDetailId, setSelectedPropertyDetailId] = useState(() => {
    try {
      return localStorage.getItem('selected_property_detail_id') || null;
    } catch (e) {
      return null;
    }
  });
  const [selectedPropertyDetail, setSelectedPropertyDetail] = useState(null);
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
  const [plotLocation, setPlotLocation] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const [polygonPath, setPolygonPath] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const sortedPolygonPath = useMemo(() => getSortedPolygonPath(polygonPath), [polygonPath]);
  const mediaInputRef = useRef(null);
  const docInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const locationInputRef = useRef(null);


  // Auth State
  const [user, setUser] = useState(null);
  const { plots, loading: plotsLoading, addPlot, updatePlot } = usePlots(INITIAL_PLOTS);

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
  const { interestedPlots, addInterest, removeInterest } = useInterests(user?.uid);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

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

  const handleGoogleSignIn = async () => {
    if (!auth || !auth.app) { setAuthError('Firebase not configured. Check .env file.'); return; }
    try {
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        navigate('home');
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
      navigate('home');
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

  // Gate seller features behind auth
  const requireAuth = (targetView) => {
    if (!user) {
      navigate('login');
    } else {
      navigate(targetView);
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
      const targetView = pathToView[currentPath] || 'home';
      setView(targetView);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial view based on current path on page load
    const initialPath = window.location.pathname;
    if (pathToView[initialPath]) {
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

  // Places autocomplete handler
  const onPlaceSelected = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    const addr = place.formatted_address || place.name || '';

    if (place.geometry && place.geometry.location) {
      // Normal path — geometry returned
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setPlotLocation({ lat, lng });
      setNewPlot(prev => ({ ...prev, location: addr }));
      if (locationInputRef.current) locationInputRef.current.value = addr;
    } else if (addr) {
      // Fallback: use Geocoder when geometry is missing (Places API (New) quirk)
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addr }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          setPlotLocation({ lat: loc.lat(), lng: loc.lng() });
          const formattedAddr = results[0].formatted_address || addr;
          setNewPlot(prev => ({ ...prev, location: formattedAddr }));
          if (locationInputRef.current) locationInputRef.current.value = formattedAddr;
        }
      });
    }
  };

  const onMarkerDragEnd = (e) => {
    setPlotLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const handleToggleDrawingMode = () => {
    if (isDrawingMode) {
      // Stopping drawing
      setIsDrawingMode(false);
      const sorted = getSortedPolygonPath(polygonPath);
      if (sorted.length >= 3 && window.google?.maps?.geometry?.encoding) {
        const latLngs = sorted.map(p => new window.google.maps.LatLng(p.lat, p.lng));
        const encodedPath = window.google.maps.geometry.encoding.encodePath(latLngs);
        const centerPoint = `${plotLocation.lat},${plotLocation.lng}`;
        const markersParam = encodeURIComponent(`color:red|${centerPoint}`);
        const pathParam = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodedPath}`);
        const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=hybrid&markers=${markersParam}&path=${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
        
        setMediaFiles(prev => {
          const filtered = prev.filter(f => !f.isStaticMap);
          return [{ id: 'static-map-' + Date.now(), preview: url, name: 'Boundary Map Preview', isStaticMap: true }, ...filtered];
        });
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

  // Admin actions
  const handleVerifyPlot = async (plotId) => {
    await updatePlot(plotId, { status: 'Verified', badge: 'Verified', visibility: 'public' });
  };

  const handleRejectPlot = async (plotId) => {
    await updatePlot(plotId, { status: 'Rejected', badge: 'Rejected' });
  };

  const handleListProperty = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      let staticMapUrl = null;
      if (sortedPolygonPath.length >= 3 && window.google?.maps?.geometry?.encoding) {
        const latLngs = sortedPolygonPath.map(p => new window.google.maps.LatLng(p.lat, p.lng));
        const encodedPath = window.google.maps.geometry.encoding.encodePath(latLngs);
        const centerPoint = `${plotLocation.lat},${plotLocation.lng}`;
        const markersParam = encodeURIComponent(`color:red|${centerPoint}`);
        const pathParam = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodedPath}`);
        staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=hybrid&markers=${markersParam}&path=${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
      }

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
        const fallbackImage = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
        
        // Use a default image — blob URLs are session-only and can't be stored in DB
        const plot = {
          ...newPlot,
          id: Date.now().toString(),
          ownerUid: user?.uid,
          ownerEmail: user?.email || '',
          status: 'Verification Pending',
          cagr: 'TBD',
          developer: 'Self Listed',
          badge: 'New',
          image: staticMapUrl || fallbackImage,
          media: staticMapUrl ? [staticMapUrl] : [],
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
      }
      setNewPlot({ title: '', location: '', price: '', size: '', features: '', visibility: 'public' });
      setMediaFiles([]);
      setDocFiles([]);
      setPolygonPath([]);
      setIsDrawingMode(false);
      setPlotLocation({ lat: 20.5937, lng: 78.9629 });
      navigate('seller-dashboard');
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
      visibility: plot.visibility || 'public'
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
    navigate('property-detail');
  };

  const handleAdminEditClick = (plot) => {
    setAdminEditingPlot(plot);
    setAdminNewPlot({
      title: plot.title,
      location: plot.location,
      price: plot.price,
      size: plot.size,
      features: plot.features || '',
      visibility: plot.visibility || 'public',
      status: plot.status || 'Verification Pending',
      media: plot.media || (plot.image ? [plot.image] : []),
      documentsAvailable: plot.documentsAvailable || []
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
        const centerPoint = `${plotLocation.lat},${plotLocation.lng}`;
        const markersParam = encodeURIComponent(`color:red|${centerPoint}`);
        const pathParam = encodeURIComponent(`color:0x10b981AA|weight:3|fillcolor:0x10b98144|enc:${encodedPath}`);
        staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=hybrid&markers=${markersParam}&path=${pathParam}&key=${GOOGLE_MAPS_API_KEY}`;
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
        title: adminNewPlot.title,
        location: adminNewPlot.location,
        price: adminNewPlot.price,
        size: adminNewPlot.size,
        features: adminNewPlot.features,
        visibility: adminNewPlot.visibility,
        status: adminNewPlot.status,
        lat: plotLocation.lat,
        lng: plotLocation.lng,
        polygonPath: sortedPolygonPath.length > 0 ? sortedPolygonPath : null,
        media: finalMedia,
        image: staticMapUrl || (finalMedia.length > 0 ? finalMedia[0] : (adminEditingPlot.image || '')),
        documentsAvailable: finalDocs
      });

      setAdminEditingPlot(null);
      setAdminNewPlot({ title: '', location: '', price: '', size: '', features: '', visibility: 'public', status: 'Verification Pending', media: [], documentsAvailable: [] });
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
              <button className="btn btn-secondary" onClick={() => requireAuth('seller-list')}>
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
          {viewerOpen && images.length > 0 && (
            <div className="image-viewer-overlay" onClick={() => setViewerOpen(false)}>
              <button className="viewer-close" onClick={() => setViewerOpen(false)}>✕</button>
              
              {images.length > 1 && (
                <button 
                  className="viewer-arrow viewer-arrow-left" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewerIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                >
                  ‹
                </button>
              )}
              
              <div className="viewer-img-container" onClick={(e) => e.stopPropagation()}>
                <img src={images[viewerIndex]} alt="" className="viewer-img" />
                <div className="viewer-counter">{viewerIndex + 1} / {images.length}</div>
              </div>
              
              {images.length > 1 && (
                <button 
                  className="viewer-arrow viewer-arrow-right" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewerIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                >
                  ›
                </button>
              )}
            </div>
          )}
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
                <div className="font-semibold">My Portfolio</div>
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={12} fill="#64748b" />
                    <Tooltip cursor={{ stroke: '#3b7a76', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                      <h5>Expected CAGR</h5>
                      <p className="metric-up">
                        <TrendingUp size={16} /> {plot.cagr}
                      </p>
                    </div>
                    <div className="metric">
                      <h5>Plot Size</h5>
                      <p>{plot.size}</p>
                    </div>
                    <div className="metric">
                      <h5>Seller</h5>
                      <p>{plot.ownerUid === 'demo' ? plot.developer : 'A1Plot Verified Seller'}</p>
                    </div>
                    <div className="metric">
                      <h5>Status</h5>
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
    <section className="section bg-white" style={{paddingTop: '6rem'}}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div className="section-header">
          <h2 className="section-title">{editingPlot ? 'Edit Land Details' : 'List Your Land Parcel'}</h2>
          <p className="text-muted">{editingPlot ? 'Update your property details below.' : 'Fill in the details below to start the verification process.'}</p>
        </div>
        <form className="listing-form" onSubmit={handleListProperty}>
          <div className="form-group mb-8">
            <label>Plot Title</label>
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
            <label>Expected Price (Quotation)</label>
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
            <label>Key Features</label>
            <input
              type="text"
              placeholder="West facing, Corner, Gated community, etc."
              className="form-input"
              value={newPlot.features}
              onChange={(e) => setNewPlot({...newPlot, features: e.target.value})}
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
                  options={{
                    componentRestrictions: { country: 'in' },
                    types: ['geocode', 'establishment']
                  }}
                >
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Search location, e.g. Sarjapur Road, Bangalore"
                    className="form-input"
                    defaultValue={newPlot.location}
                    onChange={(e) => setNewPlot(prev => ({...prev, location: e.target.value}))}
                    style={{marginBottom: '0.75rem'}}
                  />
                </Autocomplete>
                <div className="location-map-container" style={{ position: 'relative' }}>
                  {isDrawingMode && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.9)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', zIndex: 10, pointerEvents: 'none' }}>
                      Click on the map to draw your land boundaries
                    </div>
                  )}
                  <GoogleMap
                    mapContainerStyle={{width: '100%', height: '320px', borderRadius: '0.75rem', cursor: isDrawingMode ? 'crosshair' : 'grab'}}
                    center={plotLocation}
                    zoom={14}
                    onClick={handleMapClickForDrawing}
                    options={{
                      mapTypeId: 'hybrid',
                      disableDefaultUI: true,
                      zoomControl: true,
                      mapTypeControl: true,
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
                </div>
                {/* Mobile-optimized Map Controls */}
                <div className="map-drawing-controls" style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Boundary Tools
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <button 
                      type="button"
                      className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }}
                      onClick={handleToggleDrawingMode}
                    >
                      <Edit3 size={14} style={{display: 'inline', marginRight: '4px'}} /> {isDrawingMode ? 'Stop' : 'Draw'}
                    </button>
                    {polygonPath.length > 0 && (
                      <>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }} onClick={() => setPolygonPath(polygonPath.slice(0, -1))}>
                          <Undo size={14} style={{display: 'inline', marginRight: '4px'}} /> Undo
                        </button>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }} onClick={() => { setPolygonPath([]); setNewPlot(prev => ({...prev, size: ''})); setMediaFiles(prev => prev.filter(f => !f.isStaticMap)); }}>
                          <Trash2 size={14} style={{display: 'inline', marginRight: '4px'}} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '0.75rem'}}>
                <p className="text-muted">Loading map...</p>
              </div>
            )}
          </div>

          <div className="form-group mb-8">
            <label>Plot Size <span style={{fontWeight: 'normal', fontSize: '0.85rem', color: 'var(--text-muted)'}}>(Calculated based on satellite imagery of the location)</span></label>
            <input
              type="text"
              placeholder="e.g. 1,200 m² (Click on the map above in 'Draw Boundary' mode to automatically calculate)"
              className="form-input"
              required
              value={newPlot.size}
              onChange={(e) => setNewPlot({...newPlot, size: e.target.value})}
            />
          </div>

          {/* ── Upload Images / Videos ── */}
          <div className="form-group mb-8">
            <label>Upload Images / Videos</label>
            <input
              ref={mediaInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              style={{display: 'none'}}
              id="media-upload"
            />
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

          {/* ── Upload Documents ── */}
          <div className="form-group mb-12">
            <label>Upload Documents (Title Deed, EC, Legal docs)</label>
            <input
              ref={docInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleDocSelect}
              style={{display: 'none'}}
              id="doc-upload"
            />
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

          {/* Visibility Toggle */}
          <div className="form-group" style={{background: '#f1f5f9', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
            <div>
              <div style={{fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem'}}>Showcase to Public</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                {newPlot.visibility === 'public'
                  ? 'Listing will be visible to buyers only after admin verification.'
                  : 'Listing is private — only visible to you in your dashboard.'}
              </div>
            </div>
            <label className="visibility-toggle">
              <input
                type="checkbox"
                checked={newPlot.visibility === 'public'}
                onChange={e => setNewPlot({ ...newPlot, visibility: e.target.checked ? 'public' : 'private' })}
              />
              <span className="visibility-toggle-slider" />
            </label>
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
                setNewPlot({ title: '', location: '', price: '', size: '', features: '', visibility: 'public' });
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
      const charCode = p.id ? p.id.charCodeAt(0) : idx * 10;
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
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} fontSize={11} fill="#94a3b8" interval={'preserveStartEnd'} />
                    <YAxis domain={[chartMin, chartMax]} hide />
                    <Tooltip
                      formatter={chartTooltipFormatter}
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                      itemStyle={{ color: '#10b981' }}
                      cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <ReferenceLine y={investedBase} stroke="#94a3b8" strokeDasharray="6 4" strokeWidth={1} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
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
                    <ResponsiveContainer width={100} height={40}>
                      <AreaChart data={sparkData} margin={{top:4,right:0,left:0,bottom:4}}>
                        <defs>
                          <linearGradient id={`spark-${plot.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={1.5} fill={`url(#spark-${plot.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
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
                        <h5>Price</h5>
                        <p>{plot.price}</p>
                      </div>
                      <div className="metric">
                        <h5>Size</h5>
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
                center={mapFocusPlot ? { lat: mapFocusPlot.lat, lng: mapFocusPlot.lng } : defaultCenter}
                zoom={mapFocusPlot ? 16 : 6}
                onLoad={onMapLoad}
                options={mapOptions}
                onClick={() => { setBuyerMapSelectedPlotId(null); setSelectedMarker(null); }}
              >
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
        <form className="listing-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our agent will contact you shortly.'); navigate('home'); }}>
          <div className="form-group mb-8">
            <label>Full Name</label>
            <input type="text" className="form-input" placeholder="Your full name" required />
          </div>
          <div className="form-group mb-8">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com" required />
          </div>
          <div className="form-group mb-8">
            <label>Phone Number</label>
            <input type="tel" className="form-input" placeholder="+91 98765 43210" />
          </div>
          <div className="form-group mb-12">
            <label>Message</label>
            <textarea className="form-input" rows="4" placeholder="I'm interested in investing in land parcels..."></textarea>
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{padding: '1rem'}}>Send Message</button>
        </form>
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

        <form className="listing-form" onSubmit={(e) => { e.preventDefault(); alert('Request sent! Our buying agent will prepare the documents for you.'); navigate('interested'); }}>
          <div className="form-group mb-8">
            <label>Select Documents Needed</label>
            <div className="flex gap-4" style={{flexWrap: 'wrap', marginTop: '0.5rem'}}>
              <label className="flex items-center gap-2" style={{cursor: 'pointer'}}><input type="checkbox" defaultChecked /> Title Deed</label>
              <label className="flex items-center gap-2" style={{cursor: 'pointer'}}><input type="checkbox" defaultChecked /> Encumbrance Certificate (EC)</label>
              <label className="flex items-center gap-2" style={{cursor: 'pointer'}}><input type="checkbox" /> Layout Plan</label>
              <label className="flex items-center gap-2" style={{cursor: 'pointer'}}><input type="checkbox" /> Khata Certificate</label>
            </div>
          </div>
          <div className="form-group mb-12">
            <label>Any Specific Queries?</label>
            <textarea className="form-input" rows="3" placeholder="Is the property bank approved? What are the payment terms?"></textarea>
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
            <button type="submit" className="btn btn-primary" style={{flex: 1, opacity: legalAgreed ? 1 : 0.5, cursor: legalAgreed ? 'pointer' : 'not-allowed'}} disabled={!legalAgreed}>
              Submit Request to Buying Agent
            </button>
          </div>
        </form>
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
          <img src="/assets/logo.png" alt="A1Plot" style={{height: '56px', marginBottom: '2rem'}} />
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
    <section className="section bg-white" style={{paddingTop: '6rem'}}>
      <div className="container" style={{maxWidth: '800px'}}>
        <div className="section-header">
          <h2 className="section-title">Admin Property Details & Edit</h2>
          <p className="text-muted">Review and update details for "{adminEditingPlot?.title}"</p>
        </div>
        <form className="listing-form" onSubmit={handleAdminUpdateProperty}>
          <div className="form-group mb-8">
            <label>Plot Title</label>
            <input type="text" className="form-input" required value={adminNewPlot.title} onChange={(e) => setAdminNewPlot({...adminNewPlot, title: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Expected Price</label>
            <input type="text" className="form-input" required value={adminNewPlot.price} onChange={(e) => setAdminNewPlot({...adminNewPlot, price: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Size</label>
            <input type="text" className="form-input" required value={adminNewPlot.size} onChange={(e) => setAdminNewPlot({...adminNewPlot, size: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Key Features</label>
            <input type="text" className="form-input" value={adminNewPlot.features} onChange={(e) => setAdminNewPlot({...adminNewPlot, features: e.target.value})} />
          </div>
          <div className="form-group mb-8">
            <label>Location (Text)</label>
            <input type="text" className="form-input" required value={adminNewPlot.location} onChange={(e) => setAdminNewPlot({...adminNewPlot, location: e.target.value})} />
          </div>

          {/* ── Property Location on Map ── */}
          <div className="form-group mb-8">
            <label><MapPin size={16} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.35rem'}} />Property Location Map</label>
            {isLoaded ? (
              <>
                <div className="location-map-container" style={{ position: 'relative' }}>
                  {isDrawingMode && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.9)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', zIndex: 10, pointerEvents: 'none' }}>
                      Click on the map to draw your land boundaries
                    </div>
                  )}
                  <GoogleMap
                    mapContainerStyle={{width: '100%', height: '320px', borderRadius: '0.75rem', cursor: isDrawingMode ? 'crosshair' : 'grab'}}
                    center={plotLocation}
                    zoom={14}
                    onClick={handleMapClickForDrawing}
                    options={{ mapTypeId: 'hybrid', disableDefaultUI: true, zoomControl: true, mapTypeControl: true, draggableCursor: isDrawingMode ? 'crosshair' : 'grab', styles: mapOptions.styles }}
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
                </div>
                
                {/* Mobile-optimized Map Controls */}
                <div className="map-drawing-controls" style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', width: '100%', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Boundary Tools
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <button 
                      type="button"
                      className={`btn ${isDrawingMode ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }}
                      onClick={handleToggleDrawingMode}
                    >
                      <Edit3 size={14} style={{display: 'inline', marginRight: '4px'}} /> {isDrawingMode ? 'Stop' : 'Draw'}
                    </button>
                    {polygonPath.length > 0 && (
                      <>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }} onClick={() => setPolygonPath(polygonPath.slice(0, -1))}>
                          <Undo size={14} style={{display: 'inline', marginRight: '4px'}} /> Undo
                        </button>
                        <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444', whiteSpace: 'nowrap', flex: '1 1 auto', maxWidth: '120px' }} onClick={() => { setPolygonPath([]); setMediaFiles(prev => prev.filter(f => !f.isStaticMap)); }}>
                          <Trash2 size={14} style={{display: 'inline', marginRight: '4px'}} /> Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '0.75rem'}}>
                <p className="text-muted">Loading map...</p>
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
          <div className="form-group mb-8">
            <label>Visibility</label>
            <select className="form-input" value={adminNewPlot.visibility} onChange={(e) => setAdminNewPlot({...adminNewPlot, visibility: e.target.value})}>
              <option value="public">Public</option>
              <option value="private">Private</option>
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
     ADMIN PANEL
     ============================================ */
  const renderAdminPanel = () => {
    const pendingPlots = plots.filter(p => p.status === 'Verification Pending');
    const verifiedPlots = plots.filter(p => p.status === 'Verified');
    const rejectedPlots = plots.filter(p => p.status === 'Rejected');
    const allListedPlots = plots.filter(p => p.developer === 'Self Listed');

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

          {allListedPlots.length === 0 ? (
            <div className="text-center" style={{padding: '4rem 2rem'}}>
              <p className="text-muted" style={{fontSize: '1.1rem'}}>No user-submitted listings yet.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allListedPlots.map(plot => (
                    <tr key={plot.id} onClick={() => handleAdminEditClick(plot)} style={{cursor: 'pointer'}} className="admin-table-row-clickable">
                      <td>
                        <div className="admin-plot-title">
                          <img src={plot.image} alt="" className="admin-plot-thumb" />
                          <span>{plot.title}</span>
                        </div>
                      </td>
                      <td className="text-muted">{plot.location}</td>
                      <td className="font-semibold">{plot.price}</td>
                      <td>{plot.size}</td>
                      <td>
                        <div className="admin-docs">
                          {(plot.documentsAvailable || []).map((d, i) => (
                            <span key={i} className="admin-doc-chip">{d}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-status admin-status-${plot.status.toLowerCase().replace(/\s+/g,'-')}`}>
                          {plot.status}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-actions">
                          <button className="admin-btn" style={{backgroundColor: '#e2e8f0', color: '#1e293b', border: '1px solid #cbd5e1'}} onClick={(e) => { e.stopPropagation(); handleAdminEditClick(plot); }}>
                            <Edit3 size={14} /> Edit
                          </button>
                          {plot.status === 'Verification Pending' ? (
                            <>
                              <button className="admin-btn admin-btn-verify" onClick={(e) => { e.stopPropagation(); handleVerifyPlot(plot.id); }}>
                                <Check size={14} /> Verify
                              </button>
                              <button className="admin-btn admin-btn-reject" onClick={(e) => { e.stopPropagation(); handleRejectPlot(plot.id); }}>
                                <X size={14} /> Reject
                              </button>
                            </>
                          ) : plot.status === 'Rejected' ? (
                            <button className="admin-btn admin-btn-verify" onClick={(e) => { e.stopPropagation(); handleVerifyPlot(plot.id); }}>
                              <Check size={14} /> Verify
                            </button>
                          ) : (
                            <button className="admin-btn admin-btn-reject" onClick={(e) => { e.stopPropagation(); handleRejectPlot(plot.id); }}>
                              <X size={14} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

    return (
      <section className="section bg-light" style={{paddingTop: '6rem', minHeight: '100vh'}}>
        <div className="container" style={{maxWidth: '1000px'}}>
          <button className="btn btn-outline mb-6" onClick={() => navigate('buyer-map')} style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white'}}>
            <ArrowRight size={16} style={{transform: 'rotate(180deg)'}} /> Back to Explore
          </button>
          
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
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
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
                  <p style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>{plot.features}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: '1'}}>{plot.price}</div>
                  <div style={{fontSize: '1rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Size: {plot.size}</div>
                </div>
              </div>

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

  /* ============================================
     MAIN RENDER
     ============================================ */
  if (authLoading || plotsLoading) {
    return (
      <div className="global-loader-container">
        <div className="global-loader-card">
          <div className="logo-spinner-wrapper">
            <div className="spinner-ring"></div>
            <img src="/assets/logo.png" alt="A1Plot" className="spinner-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div className="loader-text">Securing Verified Land Plots...</div>
          <div className="loader-subtext">Connecting to registry & satellite imagery data</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container flex items-center justify-between">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button type="button" className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ marginRight: '0.5rem' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="navbar-brand" onClick={() => navigate('home')} style={{cursor: 'pointer'}}>
              <img src="/assets/logo.png" alt="A1Plot Logo" className="logo-img" />
            </div>
          </div>
          <div className="nav-links">
            <a className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Explore Plots</a>
            <a className={`nav-link ${view === 'seller-list' || view === 'seller-edit' ? 'active' : ''}`} onClick={() => requireAuth('seller-list')}>Sell Your Land</a>
            <a className={`nav-link ${view === 'buyer-map' ? 'active' : ''}`} onClick={() => navigate('buyer-map')}>Buy Land</a>
            <a className={`nav-link ${view === 'contact' ? 'active' : ''}`} onClick={() => navigate('contact')}>Contact</a>
            <a className={`nav-link ${view === 'about' ? 'active' : ''}`} onClick={() => navigate('about')}>About Us</a>
            {isAdmin && (
              <a className={`nav-link ${view === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')} style={{color: view === 'admin' ? 'var(--primary)' : '#e11d48', fontWeight: 600}}>
                <Shield size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem'}} />Admin
              </a>
            )}
          </div>
          <div className="nav-actions">
            {user ? (
              <div className="profile-dropdown-wrapper">
                <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="user-avatar" />
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
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="profile-dropdown-avatar" />
                        ) : (
                          <div className="profile-dropdown-avatar-placeholder"><User size={20} /></div>
                        )}
                        <div>
                          <div className="profile-dropdown-name">{user.displayName || 'User'}</div>
                          <div className="profile-dropdown-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="profile-dropdown-divider" />
                      <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('seller-dashboard'); }}>
                        <Building size={16} /> My Lands
                      </button>
                      <button className="profile-dropdown-item" onClick={() => { setProfileOpen(false); navigate('interested'); }}>
                        <MapPin size={16} /> My Interests
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
              <button className="btn btn-primary" onClick={() => { setAuthMode('login'); navigate('login'); }}>Log In</button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <a className={`mobile-menu-link ${view === 'home' ? 'active' : ''}`} onClick={() => navigate('home')}>Explore Plots</a>
              <a className={`mobile-menu-link ${view === 'seller-list' || view === 'seller-edit' ? 'active' : ''}`} onClick={() => requireAuth('seller-list')}>Sell Your Land</a>
              <a className={`mobile-menu-link ${view === 'buyer-map' ? 'active' : ''}`} onClick={() => navigate('buyer-map')}>Buy Land</a>
              <a className={`mobile-menu-link ${view === 'contact' ? 'active' : ''}`} onClick={() => navigate('contact')}>Contact</a>
              <a className={`mobile-menu-link ${view === 'about' ? 'active' : ''}`} onClick={() => navigate('about')}>About Us</a>
              {isAdmin && (
                <a className={`mobile-menu-link ${view === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')} style={{color: '#e11d48', fontWeight: 600}}>
                  <Shield size={14} style={{display: 'inline', verticalAlign: 'middle', marginRight: '0.2rem'}} />Admin Panel
                </a>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {view === 'home' && renderHome()}
        {view === 'login' && renderAuth()}
        {(view === 'seller-list' || view === 'seller-edit') && (user ? renderSellerForm() : renderAuth())}
        {view === 'seller-dashboard' && (user ? renderSellerDashboard() : renderAuth())}
        {view === 'buyer-map' && renderBuyerMap()}
        {view === 'interested' && renderInterested()}
        {view === 'contact' && renderContact()}
        {view === 'buy-request' && renderBuyRequest()}
        {view === 'admin' && (isAdmin ? renderAdminPanel() : renderAuth())}
        {view === 'admin-edit' && (isAdmin ? renderAdminEditForm() : renderAuth())}
        {view === 'property-detail' && renderPropertyDetail()}
        {view === 'privacy' && renderPrivacy()}
        {view === 'terms' && renderTerms()}
        {view === 'about' && renderAbout()}
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
      {view !== 'login' && (
        <footer>
          <div className="container">
            <div className="footer-grid">
              <div>
                <div className="navbar-brand footer-brand">
                  <img src="/assets/logo.png" alt="A1Plot Logo" className="logo-img" />
                </div>
                <p className="footer-desc">
                  Bringing stock-market velocity, liquidity, and transparency to Indian real estate investments.
                </p>
              </div>
              <div className="footer-links">
                <h4>Platform</h4>
                <ul>
                  <li><a onClick={() => navigate('buyer-map')}>Browse Plots</a></li>
                  <li><a onClick={() => navigate('home')}>How it Works</a></li>
                  <li><a onClick={() => navigate('interested')}>Interested Plots</a></li>
                  <li><a onClick={() => requireAuth('seller-list')}>List Land</a></li>
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
}

export default App;
