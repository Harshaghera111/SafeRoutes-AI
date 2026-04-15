import React, { memo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon rendering issue gracefully
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const SafeMarker = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--safe); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(34,197,94,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const BaseMarker = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

/**
 * MapView Component
 * Renders the localized Leaflet map instances ensuring UI responsiveness and zero paid-API dependencies.
 * Wrapped in React.memo to prevent expensive re-renders in the heavy DOM tree.
 */
const MapView = memo(({ safestRoute, fastestRoute }) => {
  const center = [12.9533, 77.6095]; // Midpoint Bengaluru
  
  const hasSafeRoute = Boolean(safestRoute?.coords?.length);

  return (
    <section style={{ height: '380px', width: '100%', zIndex: 1 }} aria-label="Interactive map displaying route options">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%', backgroundColor: 'var(--bg-base)' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {fastestRoute && (
          <Polyline 
            positions={fastestRoute.coords} 
            pathOptions={{ color: '#94a3b8', weight: 4, opacity: 0.6, dashArray: '8, 8' }} 
          />
        )}

        {hasSafeRoute && (
          <>
            <Polyline 
              positions={safestRoute.coords} 
              pathOptions={{ color: 'var(--safe)', weight: 6, opacity: 1 }} 
            />
            {/* Start and End Markers */}
            <Marker position={safestRoute.coords[0]} icon={BaseMarker}>
               <Popup>Start Location</Popup>
            </Marker>
            <Marker position={safestRoute.coords[safestRoute.coords.length - 1]} icon={SafeMarker}>
               <Popup>Secure Destination</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </section>
  );
});

MapView.displayName = 'MapView';
export default MapView;
