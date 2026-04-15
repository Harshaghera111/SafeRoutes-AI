import { useCallback, useEffect, useRef, useState } from 'react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const ROUTE_LIMIT_KEY = 'saferoute_route_calls';
const MAX_SESSION_CALLS = 20;
const DEBOUNCE_MS = 600;
const TIMEOUT_MS = 8000;

const sampleWaypoints = (path, sampleCount = 5) => {
  if (!path || path.length === 0) return [];
  if (path.length <= sampleCount) return path;

  const step = (path.length - 1) / (sampleCount - 1);
  return Array.from({ length: sampleCount }).map((_, index) => {
    const point = path[Math.round(index * step)];
    return { lat: point.lat, lng: point.lng };
  });
};

const mapGoogleRoute = (route, index) => {
  const encodedPolyline = route.overview_polyline?.points;
  const overviewPath =
    encodedPolyline && window.google?.maps?.geometry?.encoding
      ? window.google.maps.geometry.encoding.decodePath(encodedPolyline)
      : route.overview_path || [];
  const polylinePath = overviewPath.map((point) => ({
    lat: point.lat(),
    lng: point.lng(),
  }));

  const leg = route.legs?.[0];
  return {
    index,
    polylinePath,
    distanceText: leg?.distance?.text || '-',
    durationText: leg?.duration?.text || '-',
    durationSeconds: leg?.duration?.value || 0,
    waypointCoords: sampleWaypoints(polylinePath, 5),
    rawRoute: route,
  };
};

/** DirectionsService.route() is callback-only — wrap for async/await + timeout. */
function routeWithCallback(directionsService, request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS);
    directionsService.route(request, (response, status) => {
      clearTimeout(timer);
      if (status === window.google.maps.DirectionsStatus.OK && response) {
        resolve(response);
      } else {
        const err = new Error(status);
        err.status = status;
        reject(err);
      }
    });
  });
}

const readCallCount = () => Number(sessionStorage.getItem(ROUTE_LIMIT_KEY) || '0');

const bumpCallCount = () => {
  const next = readCallCount() + 1;
  sessionStorage.setItem(ROUTE_LIMIT_KEY, String(next));
  return next;
};

/** User-facing copy for Google Directions status codes */
function messageForStatus(status) {
  switch (status) {
    case 'ZERO_RESULTS':
      return 'No walking route found. Try a fuller address (e.g. “DSU, Bengaluru”).';
    case 'NOT_FOUND':
      return 'Could not find that place. Check spelling or use a landmark + city.';
    case 'REQUEST_DENIED':
      return 'Maps request denied. Enable Maps JavaScript API + Directions API, billing, and allow this site’s URL in API key restrictions.';
    case 'OVER_QUERY_LIMIT':
      return 'Route quota exceeded. Try again in a minute or check billing in Google Cloud.';
    case 'INVALID_REQUEST':
      return 'Invalid origin or destination. Try more specific addresses.';
    case 'TIMEOUT':
      return 'Route request timed out. Check network and try again.';
    default:
      return 'Could not load routes. Check your connection or try again.';
  }
}

export default function useDirections(origin, destination) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [warning, setWarning] = useState('');
  const debounceRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastSuccessRef = useRef([]);
  const directionsRef = useRef(null);

  const runFetch = useCallback(async (o, d) => {
    if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key_here') {
      setRoutes([]);
      setLoading(false);
      setError(null);
      setErrorMessage('');
      return;
    }

    if (!window.google?.maps || !o || !d) {
      setRoutes([]);
      setLoading(false);
      setError(null);
      setErrorMessage('');
      return;
    }

    const key = `${o}||${d}`;
    if (cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      setRoutes(cached);
      setWarning('');
      setError(null);
      setErrorMessage('');
      setToastMessage('');
      setLoading(false);
      return;
    }

    if (readCallCount() > MAX_SESSION_CALLS) {
      const cachedFallback = lastSuccessRef.current;
      if (cachedFallback.length > 0) {
        setWarning('Demo mode: Route limit reached. Showing cached route.');
        setRoutes(cachedFallback);
        setError(null);
        setErrorMessage('');
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setErrorMessage('');
    setToastMessage('');
    setWarning('');

    if (!directionsRef.current) {
      directionsRef.current = new window.google.maps.DirectionsService();
    }

    const request = {
      origin: o,
      destination: d,
      travelMode: window.google.maps.TravelMode.WALKING,
      provideRouteAlternatives: true,
    };

    try {
      const result = await routeWithCallback(directionsRef.current, request);

      bumpCallCount();
      const parsed = (result.routes || []).slice(0, 3).map(mapGoogleRoute);
      cacheRef.current.set(key, parsed);
      lastSuccessRef.current = parsed;
      setRoutes(parsed);
      setError(null);
      setErrorMessage('');
    } catch (err) {
      const status = err?.status || err?.message || 'UNKNOWN_ERROR';
      const msg = messageForStatus(status);

      setToastMessage(msg);
      setErrorMessage(msg);
      setError(status);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (!origin || !destination) return;
    runFetch(origin, destination);
  }, [destination, origin, runFetch]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!origin || !destination) {
      setRoutes([]);
      setLoading(false);
      setError(null);
      setErrorMessage('');
      setToastMessage('');
      return undefined;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      runFetch(origin, destination);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [destination, origin, runFetch]);

  return { routes, loading, error, errorMessage, toastMessage, warning, refetch };
}
