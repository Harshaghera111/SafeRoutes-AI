import { useState, useRef, useEffect } from 'react';
import { scoreRoute } from './useSafetyScore';

export function useDirections() {
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [quotaWarning, setQuotaWarning] = useState(null);
  
  const sessionCache = useRef(new Map());
  const callCount = useRef(Number(sessionStorage.getItem('sr_calls') || 0));

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDirections = async (origin, destination, userType, timePeriod) => {
    if (isOffline) {
      setError("⚠ No internet connection. SafeRoute AI needs connectivity.");
      return null;
    }
    if (!origin || !destination) return null;
    
    if (callCount.current > 25) {
      const lastCached = Array.from(sessionCache.current.values()).pop();
      setQuotaWarning("Demo mode active — showing cached route");
      setTimeout(() => setQuotaWarning(null), 4000);
      if (lastCached) return { ...lastCached, isQuotaGuarded: true };
    }

    const cacheKey = `${origin}||${destination}||${userType}||${timePeriod}`;
    if (sessionCache.current.has(cacheKey)) {
      return sessionCache.current.get(cacheKey);
    }

    try {
      const service = new window.google.maps.DirectionsService();
      
      const response = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Route fetch timed out. Check your connection.")), 8000);
        service.route(
          { origin, destination, travelMode: 'WALKING', provideRouteAlternatives: true },
          (res, status) => {
            clearTimeout(timer);
            if (status === 'OK') resolve(res);
            else reject(new Error(`Directions API failed: ${status}`));
          }
        );
      });
      
      callCount.current += 1;
      sessionStorage.setItem('sr_calls', callCount.current);

      let parsedRoutes = response.routes.map((route, i) => {
        const coords = route.overview_path;
        const safetyData = scoreRoute(coords, userType, timePeriod);
        return {
          id: i,
          raw: route,
          durationSeconds: route.legs[0].duration.value,
          durationText: route.legs[0].duration.text,
          distanceText: route.legs[0].distance.text,
          coords,
          ...safetyData
        };
      });

      parsedRoutes.sort((a, b) => a.durationSeconds - b.durationSeconds);
      const fastest = parsedRoutes[0];
      
      parsedRoutes.sort((a, b) => b.score - a.score);
      const safest = parsedRoutes[0];

      const out = { fastestRoute: fastest, safestRoute: safest, originalResponse: response, isQuotaGuarded: false };
      
      if (sessionCache.current.size >= 10) {
        const firstKey = sessionCache.current.keys().next().value;
        sessionCache.current.delete(firstKey);
      }
      sessionCache.current.set(cacheKey, out);

      return out;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return { fetchDirections, error, setError, isOffline, quotaWarning };
}
