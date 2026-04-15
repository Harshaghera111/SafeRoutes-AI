import React, { useMemo, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { ShieldCheck, Navigation2 } from 'lucide-react';
import MapView from './components/MapView';
import EmergencyButton from './components/EmergencyButton';
import RouteCard from './components/RouteCard';
import ContextBanner from './components/ContextBanner';
import SkeletonCard from './components/SkeletonCard';
import useDirections from './hooks/useDirections';
import useSafetyScore from './hooks/useSafetyScore';

const DEFAULT_ORIGIN = 'Kempegowda Bus Station, Bengaluru';
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

function App() {
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN);
  const [destinationInput, setDestinationInput] = useState('');
  const [destination, setDestination] = useState('');
  const [userType, setUserType] = useState('default');

  const { routes, loading, error, errorMessage, toastMessage, warning, refetch } = useDirections(
    origin,
    destination
  );
  const keyMissing = !MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key_here';
  const { scoredRoutes, safestRouteIndex, fastestRouteIndex, sameRoute } = useSafetyScore(routes, userType);

  const compareEnabled = routes.length > 1;
  const canFetch = useMemo(() => destination.trim().length > 0, [destination]);

  const onSubmit = (event) => {
    event.preventDefault();
    setDestination(destinationInput.trim());
  };

  return (
    <LoadScript googleMapsApiKey={MAPS_KEY || ''} libraries={['geometry']}>
      <div className="app-container">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            padding: '24px 20px',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.9) 0%, transparent 100%)',
          }}
        >
          <ShieldCheck color="#10b981" size={28} />
          <span style={{ fontWeight: '700', fontSize: '1.4rem', letterSpacing: '0.5px' }}>
            SafeRoute <span style={{ color: '#10b981' }}>AI</span>
          </span>
        </div>

        <div className="map-container">
          {keyMissing && (
            <div className="error-banner api-key-banner">
              <span>
                Missing <code>VITE_GOOGLE_MAPS_KEY</code>. Copy <code>.env.example</code> to{' '}
                <code>.env</code> and add your browser key (Maps JavaScript API + Directions API enabled).
              </span>
            </div>
          )}
          {!keyMissing && error && (
            <div className="error-banner">
              <span>⚠ {errorMessage || toastMessage}</span>
              <button type="button" onClick={refetch}>
                Retry
              </button>
            </div>
          )}
          {warning && <div className="warning-banner">{warning}</div>}
          {!error && toastMessage && <div className="warning-banner">{toastMessage}</div>}
          <MapView
            scoredRoutes={scoredRoutes}
            safestRouteIndex={safestRouteIndex}
            fastestRouteIndex={fastestRouteIndex}
            loading={loading && canFetch}
          />
        </div>

        <div className="bottom-sheet glass-panel">
          <div className="sheet-handle"></div>
          <form onSubmit={onSubmit} className="search-form">
            <div className="input-group">
              <label className="input-label">Starting Point</label>
              <input
                type="text"
                className="styled-input"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Enter origin"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Destination</label>
              <input
                type="text"
                className="styled-input"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                placeholder="e.g. Dayananda Sagar University, Bengaluru"
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">AI Context Profile</label>
              <select className="styled-select" value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="default">General / Default</option>
                <option value="woman">Solo Traveler (Woman)</option>
                <option value="elderly">Elderly / Limited Mobility</option>
                <option value="tourist">Tourist / Unfamiliar</option>
              </select>
            </div>
            <button type="submit" className="primary-btn">
              <Navigation2 size={20} />
              Find Safest Route
            </button>
          </form>

          {destination && <ContextBanner userType={userType} />}

          {loading && canFetch ? (
            <div className="route-list">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <RouteCard
              scoredRoutes={scoredRoutes}
              safestRouteIndex={safestRouteIndex}
              fastestRouteIndex={fastestRouteIndex}
              sameRoute={sameRoute || !compareEnabled}
            />
          )}
        </div>

        <EmergencyButton />
      </div>
    </LoadScript>
  );
}

export default App;
