import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import MapView from './components/MapView';
import { ResultsView } from './components/RouteCard';
import SkeletonCard from './components/SkeletonCard';
import EmergencyButton from './components/EmergencyButton';
import { calculateRoutes } from './utils/aiLogic';

const App = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [userType, setUserType] = useState("default");
  
  // Auto-detect time roughly
  const hour = new Date().getHours();
  const initialTime = (hour >= 6 && hour < 18) ? 'day' : (hour >= 18 && hour < 21 ? 'evening' : 'night');
  const [timePeriod, setTimePeriod] = useState(initialTime);
  
  const [appStage, setAppStage] = useState("idle");
  const [simStatus, setSimStatus] = useState(""); // "📡 Analyzing real-time urban signals..."
  const [routes, setRoutes] = useState(null);

  const handleSearch = () => {
    if (!origin || !destination) return;
    setAppStage('loading');
    setSimStatus("📡 Analyzing real-time urban signals...");
    
    // Simulate real-world fetch lag
    setTimeout(() => {
      const generated = calculateRoutes(origin, destination, userType, timePeriod);
      setRoutes(generated);
      setSimStatus("✅ Updated using simulated live data");
      setAppStage('results');
    }, 2000);
  };

  const appContainerStyle = {
    maxWidth: '430px', margin: '0 auto', background: 'var(--bg-base)', minHeight: '100vh', 
    boxShadow: '0 0 40px rgba(0,0,0,0.5)', position: 'relative', overflowX: 'hidden'
  };

  return (
    <main style={appContainerStyle}>
      {/* Semantic Top Header */}
      <header style={{
        height: '56px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
        color: 'var(--text-primary)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden="true" style={{ fontSize: '20px' }}>🛡️</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '18px', margin: 0 }}>SafeRoute AI</h1>
        </div>
      </header>
      
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
      />

      {/* Live Simulation Status Banner */}
      {simStatus && appStage !== 'idle' && (
        <div 
          role="status" 
          aria-live="polite" 
          style={{ 
            textAlign: 'center', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', 
            padding: '8px', fontSize: '12px', color: simStatus.includes('✅') ? 'var(--brand-green)' : 'var(--brand-amber)',
            fontWeight: 600
          }}>
          {simStatus}
        </div>
      )}

      {appStage === 'loading' && (
        <section aria-busy="true" aria-label="Loading Routes" style={{ padding: '24px 16px' }}>
           <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>🛡️ Compiling Safety Data...</h2>
             <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Aggregating illumination levels and footfall</div>
           </div>
           <SkeletonCard />
           <SkeletonCard />
        </section>
      )}

      {appStage === 'results' && routes && (
        <ResultsView fastestRoute={routes.fastestRoute} safestRoute={routes.safestRoute} />
      )}

      {appStage === 'idle' && (
         <section aria-label="Welcome screen" style={{ textAlign: 'center', padding: '48px 24px', opacity: 0.8 }}>
           <div aria-hidden="true" style={{ fontSize: '64px', marginBottom: '16px' }}>📍</div>
           <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Plot your safe path</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
             Ensure safety without risking your privacy.
           </p>
         </section>
      )}

      <EmergencyButton />
    </main>
  );
};

export default App;
