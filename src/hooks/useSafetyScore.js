import { useMemo } from 'react';
import { getCachedExplanation } from '../utils/aiLogic';

const RISK_ZONES = [
  { id: 'market-square', lat: 12.9698, lng: 77.5905, radiusKm: 0.32, risk: 16 },
  { id: 'underpass', lat: 12.9781, lng: 77.6064, radiusKm: 0.28, risk: 20 },
  { id: 'park-edge', lat: 12.9629, lng: 77.5995, radiusKm: 0.24, risk: 12 },
];

const USER_MODIFIERS = {
  default: 1,
  woman: 1.15,
  elderly: 1.2,
  tourist: 1.1,
};

const toRad = (deg) => (deg * Math.PI) / 180;
const haversineKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const getTier = (score) => (score >= 75 ? 'SAFE' : score >= 45 ? 'CAUTION' : 'AVOID');
const getStatus = (tier) => (tier === 'SAFE' ? 'safe' : tier === 'CAUTION' ? 'caution' : 'unsafe');

const getTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 6) return 'night';
  if (hour >= 17) return 'evening';
  return 'day';
};

export const getLightingScore = (coords, timePeriod) => {
  if (!coords.length) return 55;
  const base = timePeriod === 'night' ? 52 : timePeriod === 'evening' ? 65 : 75;
  const spreadPenalty = coords.length > 4 ? 4 : 0;
  return clamp(base - spreadPenalty, 35, 88);
};

export const getCrowdScore = (coords, timePeriod) => {
  const base = timePeriod === 'night' ? 48 : timePeriod === 'evening' ? 66 : 74;
  const routeLengthBoost = coords.length > 3 ? 5 : 2;
  return clamp(base + routeLengthBoost, 30, 90);
};

export const getIsolationScore = (coords) => {
  const isolatedSegments = coords.length <= 3 ? 2 : 1;
  return clamp(78 - isolatedSegments * 10, 30, 90);
};

export const getIncidentProximity = (coords) => {
  if (!coords.length) return 60;
  let riskPenalty = 0;

  coords.forEach((coord) => {
    RISK_ZONES.forEach((zone) => {
      if (haversineKm(coord, zone) <= zone.radiusKm) {
        riskPenalty += zone.risk;
      }
    });
  });

  return clamp(92 - riskPenalty, 18, 95);
};

const createReasons = (score, lightingScore, crowdScore) => {
  if (score >= 80) {
    return [
      'Well-lit corridor',
      crowdScore >= 65 ? 'High foot traffic' : 'Steady local activity',
      'Active commercial area',
    ];
  }
  if (score >= 60) {
    return [
      lightingScore >= 65 ? 'Mostly lit streets' : 'Mixed lighting coverage',
      'Moderate crowd presence',
      'Some low-visibility stretches',
    ];
  }
  return ['Low-light patches', 'Sparse foot traffic', 'Higher risk zone overlap'];
};

const createRiskTags = (score, lightingScore) => {
  if (score >= 80) return ['Well Lit', 'Active Area'];
  if (score >= 60) return [lightingScore > 62 ? 'Mostly Lit' : 'Low Lighting', 'Mixed Activity'];
  return ['Low Lighting', 'Isolated Zone'];
};

export const scoreAllRoutes = (routes, userType = 'default', timePeriod = getTimePeriod()) => {
  const modifier = USER_MODIFIERS[userType] || 1;

  const scoredRoutes = routes.map((route) => {
    const waypointCoords = route.waypointCoords || [];
    const lightingScore = getLightingScore(waypointCoords, timePeriod);
    const crowdScore = getCrowdScore(waypointCoords, timePeriod);
    const isolationScore = getIsolationScore(waypointCoords);
    const incidentScore = getIncidentProximity(waypointCoords);

    const weightedRaw =
      lightingScore * 0.3 +
      crowdScore * 0.25 +
      isolationScore * 0.2 +
      incidentScore * 0.25;

    const score = clamp(Math.round(weightedRaw - (modifier - 1) * 14), 10, 99);
    const tier = getTier(score);
    const reasons = createReasons(score, lightingScore, crowdScore);
    const riskTags = createRiskTags(score, lightingScore);
    const explanation = getCachedExplanation(score, tier, reasons, timePeriod, userType);

    return {
      routeIndex: route.index,
      score,
      tier,
      reasons,
      riskTags,
      timePeriod,
      userType,
      confidence: clamp(Math.round(84 + score * 0.12 - (timePeriod === 'night' ? 4 : 0)), 75, 98),
      riskHeat: clamp(100 - score, 6, 92),
      explanation,
      durationText: route.durationText,
      distanceText: route.distanceText,
      durationSeconds: route.durationSeconds,
      polylinePath: route.polylinePath,
      waypointCoords,
      rawRoute: route.rawRoute,
      status: getStatus(tier),
    };
  });

  if (!scoredRoutes.length) {
    return { scoredRoutes: [], safestRouteIndex: -1, fastestRouteIndex: -1, sameRoute: false };
  }

  let safestRouteIndex = scoredRoutes[0].routeIndex;
  let fastestRouteIndex = scoredRoutes[0].routeIndex;
  let maxScore = scoredRoutes[0].score;
  let minDuration = scoredRoutes[0].durationSeconds;

  scoredRoutes.forEach((route) => {
    if (route.score > maxScore) {
      maxScore = route.score;
      safestRouteIndex = route.routeIndex;
    }
    if (route.durationSeconds < minDuration) {
      minDuration = route.durationSeconds;
      fastestRouteIndex = route.routeIndex;
    }
  });

  return {
    scoredRoutes,
    safestRouteIndex,
    fastestRouteIndex,
    sameRoute: safestRouteIndex === fastestRouteIndex,
  };
};

export default function useSafetyScore(routes, userType) {
  return useMemo(() => scoreAllRoutes(routes, userType), [routes, userType]);
}
