/**
 * Core Safety Scoring Engine
 * Simulates route intelligence with no paid API dependency.
 * @module aiLogic
 */

const BASE_START = [12.9716, 77.5946];
const BASE_END = [12.9351, 77.6245];

const USER_CONTEXT_TONE = {
  default: 'daily commuter',
  woman: 'woman traveler',
  elderly: 'senior traveler',
  tourist: 'new visitor in the city',
};

const TIME_CONTEXT_HINT = {
  day: 'in daytime conditions',
  evening: 'during evening transition hours',
  night: 'at late-night hours',
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const safeHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 9973;
  }
  return hash;
};

/**
 * Designed to integrate with Google Maps Directions API for real-time routing.
 * Current implementation uses simulated deterministic geometry for demos.
 */
const generatePath = (start, end, points, noiseFactor) => {
  const path = [];
  for (let i = 0; i <= points; i += 1) {
    const fraction = i / points;
    const lat = start[0] + (end[0] - start[0]) * fraction + Math.sin(i) * noiseFactor;
    const lng = start[1] + (end[1] - start[1]) * fraction + Math.cos(i) * noiseFactor;
    path.push([lat, lng]);
  }
  return path;
};

/**
 * Calculates user-profile safety influence using contextual risk sensitivity.
 */
export const getUserContextImpact = (userType = 'default', timePeriod = 'day') => {
  const nightPenalty = timePeriod === 'night' ? -6 : timePeriod === 'evening' ? -3 : 0;

  const profileMap = {
    default: { scoreAdjustment: 0, confidenceBoost: 0, routeBias: 'balanced' },
    woman: { scoreAdjustment: -3, confidenceBoost: 2, routeBias: 'well-lit-first' },
    elderly: { scoreAdjustment: -2, confidenceBoost: 1, routeBias: 'active-zones-first' },
    tourist: { scoreAdjustment: -1, confidenceBoost: 3, routeBias: 'landmark-corridor' },
  };

  const profileImpact = profileMap[userType] || profileMap.default;
  return {
    ...profileImpact,
    scoreAdjustment: profileImpact.scoreAdjustment + nightPenalty,
  };
};

/**
 * Calculates safety score using lighting, crowd density, and risk zones.
 */
export const calculateSafetyScore = ({
  routeType,
  lightingScore,
  crowdScore,
  riskZonePenalty,
  userType,
  timePeriod,
  routeHashSeed,
}) => {
  const context = getUserContextImpact(userType, timePeriod);
  const routeModifier = routeType === 'safest' ? 8 : -10;
  const deterministicVariance = routeHashSeed % 5;

  const rawScore =
    lightingScore * 0.42 +
    crowdScore * 0.36 +
    (100 - riskZonePenalty) * 0.22 +
    context.scoreAdjustment +
    routeModifier +
    deterministicVariance;

  return clamp(Math.round(rawScore), 30, 99);
};

/**
 * Generates human-like AI explanation varying by route, user profile and time.
 */
export const generateSafetyExplanation = ({ routeType, score, userType, timePeriod }) => {
  const userTone = USER_CONTEXT_TONE[userType] || USER_CONTEXT_TONE.default;
  const timeHint = TIME_CONTEXT_HINT[timePeriod] || TIME_CONTEXT_HINT.day;
  const routePrefix =
    routeType === 'safest'
      ? 'This route avoids poorly lit streets and passes through active areas'
      : 'This route minimizes travel time but includes mixed-safety pockets';
  const certaintyLine =
    score >= 80
      ? 'making it a high-confidence safer choice right now.'
      : 'so caution is advised for this time window.';

  return `${routePrefix}, which is optimized for a ${userTone} ${timeHint}, ${certaintyLine}`;
};

const getTierLabel = (score) => {
  if (score >= 75) return 'SAFE';
  if (score >= 50) return 'CAUTION';
  return 'AVOID';
};

export const calculateRoutes = (origin, destination, userType = 'default', timePeriod = 'day') => {
  const queryContext = { origin, destination };
  const contextImpact = getUserContextImpact(userType, timePeriod);
  const routeSeed = safeHash(`${origin}|${destination}|${userType}|${timePeriod}`);

  const safestDurationMinutes = timePeriod === 'night' ? 30 : timePeriod === 'evening' ? 29 : 28;
  const fastestDurationMinutes = timePeriod === 'night' ? 24 : timePeriod === 'evening' ? 23 : 22;

  const safestScore = calculateSafetyScore({
    routeType: 'safest',
    lightingScore: 92,
    crowdScore: 86,
    riskZonePenalty: 22,
    userType,
    timePeriod,
    routeHashSeed: routeSeed,
  });

  const fastestScore = calculateSafetyScore({
    routeType: 'fastest',
    lightingScore: 58,
    crowdScore: 55,
    riskZonePenalty: 52,
    userType,
    timePeriod,
    routeHashSeed: routeSeed + 19,
  });

  return {
    safestRoute: {
      id: 'r_safe',
      type: 'safest',
      durationMinutes: safestDurationMinutes,
      durationText: `${safestDurationMinutes} min`,
      distanceText: '4.8 km',
      score: safestScore,
      tier: getTierLabel(safestScore),
      reasons: ['Better lighting coverage', 'More public activity', 'Avoids risky zones'],
      riskTags: ['Low Lighting', 'Low Crowd', 'High Risk Zone'],
      explanation: generateSafetyExplanation({ routeType: 'safest', score: safestScore, userType, timePeriod }),
      confidence: clamp(84 + contextImpact.confidenceBoost + (routeSeed % 6), 80, 97),
      userContextImpact: `Optimized for: ${userType} -> Safer route selection (${contextImpact.routeBias})`,
      queryContext,
      coords: generatePath(BASE_START, BASE_END, 8, 0.004),
    },
    fastestRoute: {
      id: 'r_fast',
      type: 'fastest',
      durationMinutes: fastestDurationMinutes,
      durationText: `${fastestDurationMinutes} min`,
      distanceText: '4.1 km',
      score: fastestScore,
      tier: getTierLabel(fastestScore),
      reasons: ['Lower ETA corridor', 'Fewer turns', 'Traffic-light optimized timing'],
      riskTags: ['Low Lighting', 'Low Crowd', 'High Risk Zone'],
      explanation: generateSafetyExplanation({ routeType: 'fastest', score: fastestScore, userType, timePeriod }),
      confidence: clamp(76 + contextImpact.confidenceBoost + (routeSeed % 5), 72, 91),
      userContextImpact: `Optimized for: ${userType} -> Faster route selection (${contextImpact.routeBias})`,
      queryContext,
      coords: generatePath(BASE_START, BASE_END, 5, -0.002),
    },
  };
};
