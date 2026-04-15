export const loadGoogleMaps = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

export const fetchRealRoutes = async (destinationStr) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (!apiKey) throw new Error("Missing API Key");

  const maps = await loadGoogleMaps(apiKey);
  const directionsService = new maps.DirectionsService();

  // Default origin fixed at San Francisco Civic Center to match original mock
  const origin = new maps.LatLng(37.7786, -122.4140);
  
  const request = {
    origin: origin,
    destination: destinationStr,
    travelMode: 'WALKING',
    provideRouteAlternatives: true
  };

  const response = await directionsService.route(request);
  
  const fastestRaw = response.routes[0];
  const safestRaw = response.routes.length > 1 ? response.routes[1] : response.routes[0];

  // Map Google LatLng back into simple arrays for Leaflet consumption: [lat, lng]
  const getCoords = (route) => route.overview_path.map(p => [p.lat(), p.lng()]);
  const getEta = (route) => route.legs[0].duration.text;
  const getDist = (route) => route.legs[0].distance.text;
  const getTimeMin = (route) => Math.round(route.legs[0].duration.value / 60);

  return {
    fastestReal: { coords: getCoords(fastestRaw), eta: getEta(fastestRaw), distance: getDist(fastestRaw), timeMin: getTimeMin(fastestRaw) },
    safestReal: { coords: getCoords(safestRaw), eta: getEta(safestRaw), distance: getDist(safestRaw), timeMin: getTimeMin(safestRaw) }
  };
};
