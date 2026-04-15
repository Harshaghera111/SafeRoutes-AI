import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, Polyline, Marker } from '@react-google-maps/api';
import { DARK_MAP_STYLE } from '../config/mapStyle';

const MapView = ({ fastestRoute, safestRoute, originStr, destStr, appStage }) => {
  const mapRef = useRef(null);

  const containerStyle = { width: '100%', height: '380px', position: 'relative' };
  const center = { lat: 12.9716, lng: 77.5946 }; // Bengaluru default

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (mapRef.current && (fastestRoute || safestRoute) && appStage === 'results') {
      const bounds = new window.google.maps.LatLngBounds();
      
      const extendBounds = (route) => {
         if (route && route.coords) {
           route.coords.forEach(pt => bounds.extend({ lat: pt.lat(), lng: pt.lng() }));
         }
      };

      if (fastestRoute) extendBounds(fastestRoute);
      if (safestRoute) extendBounds(safestRoute);

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 48 });
      }
    }
  }, [fastestRoute, safestRoute, appStage]);

  return (
    <div style={containerStyle}>
      {appStage === 'loading' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.7)', zIndex: 100, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="spinner" style={{ marginBottom: '16px' }} />
          <div style={{ color: 'var(--brand-green)', fontWeight: 600, fontSize: '14px' }}>Finding your safest route...</div>
          <style>{`
            .spinner { width: 40px; height: 40px; border: 4px solid rgba(34,197,94,0.2); border-left-color: var(--brand-green); border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: "cooperative",
          styles: DARK_MAP_STYLE
        }}
      >
        {fastestRoute && fastestRoute.coords && (
          <Polyline
            path={fastestRoute.coords}
            options={{ strokeColor: "#94a3b8", strokeWeight: 3, strokeOpacity: 0.55, zIndex: 5 }}
          />
        )}
        
        {safestRoute && safestRoute.coords && (
          <Polyline
            path={safestRoute.coords}
            options={{
              strokeColor: "#22c55e",
              strokeWeight: 5,
              strokeOpacity: 1.0,
              zIndex: 10,
              icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "20px" }]
            }}
          />
        )}

        {safestRoute && safestRoute.coords && safelyGetMarkers(safestRoute.coords)}
      </GoogleMap>
    </div>
  );
};

// Helper to pull start and end markers safely
const safelyGetMarkers = (coords) => {
  if (!coords || coords.length === 0) return null;
  const start = coords[0];
  const end = coords[coords.length - 1];
  
  return (
    <>
      <Marker position={{ lat: start.lat(), lng: start.lng() }} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }} />
      <Marker position={{ lat: end.lat(), lng: end.lng() }} icon={{ path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW, scale: 6, fillColor: '#22c55e', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }} />
    </>
  );
}

export default MapView;
