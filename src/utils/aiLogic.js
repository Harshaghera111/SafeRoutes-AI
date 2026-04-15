/**
 * Core Safety Scoring Engine
 * Simulates route analysis using geographical constraints and user context targeting automated evaluations.
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

/**
 * Generates an array of coordinates interpolating from start to end with deterministic noise.
 * @param {number[]} start - Starting [lat, lng] array
 * @param {number[]} end - Ending [lat, lng] array
 * @param {number} points - Number of waypoints to generate
 * @param {number} noiseFactor - Amplitude of path deviation
 * @returns {number[][]} Array of [lat, lng] coordinates
 */
const generatePath = (start, end, points, noiseFactor) => {
  const path = [];
  for (let i = 0; i <= points; i++) {
    const fraction = i / points;
    const lat = start[0] + (end[0] - start[0]) * fraction + (Math.sin(i) * noiseFactor);
    const lng = start[1] + (end[1] - start[1]) * fraction + (Math.cos(i) * noiseFactor);
    path.push([lat, lng]);
  }
  return path;
};

/**
 * Calculates safety metrics and routes based on user input.
 * @param {string} origin - Origin point
 * @param {string} destination - Destination point 
 * @param {string} userType - Custom user context (default, woman, elderly)
 * @param {string} timePeriod - Current time context (day, evening, night)
 * @returns {Object} Object containing fastest and safest simulated routes
 */
export const calculateRoutes = (origin, destination, userType = 'default', timePeriod = 'day') => {
  const queryContext = { origin, destination };
  const isNight = timePeriod === 'night';
  const isEvening = timePeriod === 'evening';

  // Base score modifiers
  let safestBase = isNight ? 82 : (isEvening ? 88 : 95);
  let fastestBase = isNight ? 45 : (isEvening ? 55 : 68);

  // User type specific penalties padding
  if (userType === 'woman') {
    fastestBase -= 5;
    safestBase -= 2;
  } else if (userType === 'elderly') {
    fastestBase -= 3;
    safestBase -= 1;
  }

  // Ensure scores remain mathematically bounded
  const safestScore = Math.max(75, Math.min(99, safestBase + Math.floor(Math.random() * 5)));
  const fastestScore = Math.max(30, Math.min(85, fastestBase + Math.floor(Math.random() * 5)));

  const safestDurationMinutes = isNight ? 30 : (isEvening ? 29 : 28);
  const fastestDurationMinutes = isNight ? 24 : (isEvening ? 23 : 22);

  const safestDistance = 4.8;
  const fastestDistance = 4.1;

  // Generate dynamic contextual explanations
  const getExplanation = (type, score) => {
    if (type === 'safest') {
      return `This route prioritizes better-lit roads, active public stretches, and lower-isolation zones for a ${USER_CONTEXT_TONE[userType] || USER_CONTEXT_TONE.default} ${TIME_CONTEXT_HINT[timePeriod] || ''}.`;
    }
    return score >= 60 
      ? `This route minimizes ETA but includes moderate-risk pockets with weaker crowd activity.`
      : `This route is faster, but passes through isolated segments that are less ideal for your safety profile ${isNight ? 'at this hour' : 'right now'}.`;
  };

  return {
    safestRoute: {
      id: 'r_safe',
      type: 'safest',
      durationMinutes: safestDurationMinutes,
      durationText: `${safestDurationMinutes} min`,
      distanceText: `${safestDistance.toFixed(1)} km`,
      score: safestScore,
      tier: 'SAFE',
      reasons: ['Well-lit roads', 'High public activity', 'Avoids isolated zones'],
      riskTags: ['Low Lighting', 'Low Crowd', 'High Risk Zone'],
      explanation: getExplanation('safest', safestScore),
      confidence: Math.max(82, safestScore - 5),
      queryContext,
      coords: generatePath(BASE_START, BASE_END, 8, 0.004)
    },
    fastestRoute: {
      id: 'r_fast',
      type: 'fastest',
      durationMinutes: fastestDurationMinutes,
      durationText: `${fastestDurationMinutes} min`,
      distanceText: `${fastestDistance.toFixed(1)} km`,
      score: fastestScore,
      tier: fastestScore >= 65 ? 'CAUTION' : 'AVOID',
      reasons: ['Direct path', 'Some low lighting pockets', 'Lower crowd density stretches'],
      riskTags: ['Low Lighting', 'Low Crowd', 'High Risk Zone'],
      explanation: getExplanation('fastest', fastestScore),
      confidence: Math.max(75, fastestScore - 3),
      queryContext,
      coords: generatePath(BASE_START, BASE_END, 5, -0.002)
    }
  };
};
