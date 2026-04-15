import React, { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindow, Marker, Polyline } from '@react-google-maps/api';

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };

const mapContainerStyle = { width: '100%', height: '420px' };
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'cooperative',
};

const getRouteStyle = (routeIndex, safestRouteIndex, fastestRouteIndex) => {
  if (routeIndex === safestRouteIndex) {
    return { strokeColor: '#22c55e', strokeWeight: 5, strokeOpacity: 1, zIndex: 10 };
  }
  if (routeIndex === fastestRouteIndex) {
    return { strokeColor: '#94a3b8', strokeWeight: 3, strokeOpacity: 0.6, zIndex: 5 };
  }
  return { strokeColor: '#cbd5e1', strokeWeight: 2, strokeOpacity: 0.4, zIndex: 1 };
};

const routeCenter = (route) => {
  const path = route?.polylinePath || [];
  return path[Math.floor(path.length / 2)] || null;
};

const MapView = ({
  scoredRoutes,
  safestRouteIndex,
  fastestRouteIndex,
  loading = false,
}) => {
  const [map, setMap] = useState(null);
  const [hoveredRoute, setHoveredRoute] = useState(null);

  const allPoints = useMemo(
    () => scoredRoutes.flatMap((route) => route.polylinePath || []),
    [scoredRoutes]
  );

  useEffect(() => {
    if (!map || allPoints.length === 0 || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    allPoints.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, 40);
  }, [allPoints, map]);

  const origin = scoredRoutes?.[0]?.polylinePath?.[0] || null;
  const destination =
    scoredRoutes?.[0]?.polylinePath?.[scoredRoutes?.[0]?.polylinePath?.length - 1] || null;

  return (
    <div className="map-shell">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_CENTER}
        zoom={14}
        options={mapOptions}
        onLoad={setMap}
      >
        {scoredRoutes.map((route) => (
          <Polyline
            key={route.routeIndex}
            path={route.polylinePath}
            options={getRouteStyle(route.routeIndex, safestRouteIndex, fastestRouteIndex)}
            onMouseOver={() => setHoveredRoute(route)}
            onMouseOut={() => setHoveredRoute(null)}
          />
        ))}

        {origin && (
          <Marker
            position={origin}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )}
        {destination && (
          <Marker
            position={destination}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        )}

        {hoveredRoute && routeCenter(hoveredRoute) && (
          <InfoWindow position={routeCenter(hoveredRoute)} onCloseClick={() => setHoveredRoute(null)}>
            <div style={{ color: '#111827', fontWeight: 600 }}>
              Score {hoveredRoute.score} · {hoveredRoute.tier}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {loading && (
        <div className="map-spinner-overlay">
          <div className="ai-loading-spinner" />
          <p>Finding your safest route...</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
