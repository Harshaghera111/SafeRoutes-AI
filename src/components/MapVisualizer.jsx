import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create a simple SVG icon string to avoid complex lucide imports in Leaflet DivIcon
const getSvgIcon = (color) => {
  return `<svg xmlns="http://www.0000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
};

const createCustomIcon = (color) => {
  return L.divIcon({
    html: getSvgIcon(color),
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const FitBounds = ({ fastestCoords, safestCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (fastestCoords && safestCoords) {
      const allCoords = [...fastestCoords, ...safestCoords];
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 400] }); // Add bottom padding to account for bottom sheet
    }
  }, [fastestCoords, safestCoords, map]);
  return null;
};

const MapVisualizer = ({ routes, selectedRouteId }) => {
  if (!routes) {
    // Default empty dark map focused on SF
    return (
      <MapContainer center={[37.7749, -122.4194]} zoom={13} zoomControl={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer className="dark-tiles" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    );
  }

  const { fastest, safest } = routes;
  
  const startIcon = createCustomIcon('#3b82f6');
  const endColor = selectedRouteId === 'safest' ? '#10b981' : (fastest.status === 'unsafe' ? '#ef4444' : '#f59e0b');
  const endIcon = createCustomIcon(endColor);

  return (
    <MapContainer 
      center={safest.coords[0]} 
      zoom={14} 
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        className="dark-tiles"
        attribution='&copy; OSM'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <FitBounds fastestCoords={fastest.coords} safestCoords={safest.coords} />

      {/* Fastest path drawn underneath */}
      <Polyline 
        positions={fastest.coords} 
        color={selectedRouteId === 'fastest' ? (fastest.status === 'unsafe' ? '#ef4444' : '#f59e0b') : '#666666'} 
        weight={selectedRouteId === 'fastest' ? 6 : 4}
        opacity={selectedRouteId === 'fastest' ? 1 : 0.6}
        dashArray={selectedRouteId === 'fastest' ? null : '5, 10'}
      />

      {/* Safest Polyline */}
      <Polyline 
        positions={safest.coords} 
        color={selectedRouteId === 'safest' ? safest.color : '#2d6a4f'} 
        weight={selectedRouteId === 'safest' ? 6 : 4}
        opacity={selectedRouteId === 'safest' ? 1 : 0.5}
      />

      {/* Origin/Dest Markers */}
      <Marker position={safest.coords[0]} icon={startIcon}>
        <Popup>Start</Popup>
      </Marker>
      <Marker position={safest.coords[safest.coords.length - 1]} icon={endIcon}>
        <Popup>Destination</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapVisualizer;
