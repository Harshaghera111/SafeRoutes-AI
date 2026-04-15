import React, { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import { ResultsView } from './components/RouteCard';
import SkeletonCard from './components/SkeletonCard';
import EmergencyButton from './components/EmergencyButton';
import { useDirections } from './hooks/useDirections';

const LIBRARIES = ["places"];

const autoDetectTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 18) return "day";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
};

const App = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [userType, setUserType] = useState("default");
  const [timePeriod, setTimePeriod] = useState(autoDetectTimePeriod());
  const [appStage, setAppStage] = useState("idle");

  const [routes, setRoutes] = useState(null);
  const { fetchDirections, error, isOffline, quotaWarning } = useDirections();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: LIBRARIES
  });

  const handleSearch = async () => {
    if (!origin || !destination) return;
    setAppStage('loading');
    setRoutes(null);

    const res = await fetchDirections(origin, destination, userType, timePeriod);
    
    if (res) {
      setRoutes(res);
      setAppStage('results');
      setTimeout(() => {
        document.getElementById("route-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
        if ("vibrate" in navigator) navigator.vibrate(50);
      }, 100);
    } else {
      setAppStage('error');
    }
  };

  const appContainerStyle = {
    maxWidth: '430px', margin: '0 auto', background: 'var(--bg-base)', minHeight: '100vh', 
    boxShadow: '0 0 40px rgba(0,0,0,0.5)', position: 'relative', overflowX: 'hidden'
  };

  const headerStyle = {
    height: '56px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
    color: 'var(--text-primary)', position: 'sticky', top: 0, zIndex: 100
  };

  if (loadError) return <div style={{padding: '24px', color: 'var(--brand-red)'}}>Error loading Google Maps. Is your key valid?</div>;
  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) return <div style={{padding: '24px', color: 'var(--brand-red)'}}>Missing VITE_GOOGLE_MAPS_KEY in .env file.</div>;

  return (
    <div style={appContainerStyle}>
      {/* Network / Error / Quota Banners */}
      {isOffline && <div style={{ background: 'var(--brand-red)', color: 'white', padding: '8px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>⚠ No internet connection. SafeRoute AI needs connectivity.</div>}
      {appStage === 'error' && error && <div style={{ background: 'var(--brand-red)', color: 'white', padding: '8px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
      {quotaWarning && <div style={{ background: 'var(--brand-amber)', color: '#000', padding: '8px', fontSize: '12px', textAlign: 'center', fontWeight: 'bold' }}>{quotaWarning}</div>}

      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px' }}>SafeRoute AI</span>
          {destination.toLowerCase() === "demo" && <span style={{ background: 'var(--brand-amber)', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>DEMO</span>}
        </div>
        <span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>⚙️</span>
      </header>
      
      {/* Main Layout body */}
      {isLoaded ? (
        <>
          <SearchBar 
             origin={origin} setOrigin={setOrigin} 
             destination={destination} setDestination={setDestination}
             userType={userType} setUserType={setUserType}
             timePeriod={timePeriod} setTimePeriod={setTimePeriod}
             handleSearch={handleSearch} disabled={appStage === 'loading'}
             appStage={appStage}
          />

          <MapView 
            fastestRoute={routes?.fastestRoute} 
            safestRoute={routes?.safestRoute} 
            originStr={origin} destStr={destination} 
            appStage={appStage} 
          />

          {appStage === 'loading' && (
            <div style={{ padding: '24px 16px' }}>
               <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                 <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>🛡️ Analyzing route safety...</h2>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Checking lighting, crowd data, and risk zones</div>
               </div>
               <SkeletonCard />
               <SkeletonCard />
            </div>
          )}

          {appStage === 'results' && routes && (
            <ResultsView fastestRoute={routes.fastestRoute} safestRoute={routes.safestRoute} />
          )}

          {appStage === 'idle' && (
             <div style={{ textAlign: 'center', padding: '48px 24px', opacity: 0.8, animation: 'fadeIn 0.5s ease-out' }}>
               <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
               <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Where are you headed?</h2>
               <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                 SafeRoute AI finds you the safest path, not just the fastest.
               </p>
               <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 0.8; transform: translateY(0) } }`}</style>
             </div>
          )}
        </>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Maps SDK...</div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', padding: '24px 0' }}>
         Built for safety. Powered by Gemini AI.
      </div>
      
      <EmergencyButton />
    </div>
  );
};

export default App;
