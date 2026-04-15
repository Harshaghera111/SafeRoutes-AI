export const generateRouteSimulations = (destination, userType = 'default', realData = null) => {
  const getTier = (score) => {
    if (score >= 75) return 'SAFE';
    if (score >= 45) return 'CAUTION';
    return 'AVOID';
  };

  const now = new Date();
  const hour = now.getHours();
  const isNight = hour >= 20 || hour < 6;
  const isEvening = hour >= 17 && hour < 20;

  const timeLabel = isNight ? 'night' : (isEvening ? 'evening' : 'day');
  const scoreShift = isNight ? -10 : (isEvening ? -4 : 3);
  const etaShift = isNight ? 2 : (isEvening ? 3 : -1);

  const fastestScore = clampScore(Math.floor(Math.random() * 30) + 40 + scoreShift);
  const safestScore = clampScore(Math.floor(Math.random() * 10) + 90 + Math.floor(scoreShift / 2));

  const fTier = getTier(fastestScore);
  const sTier = getTier(safestScore);

  const fastestReasons = isNight
    ? ["Direct route", "Low lighting pockets", "Fewer active storefronts"]
    : ["Direct route", "Moderate activity", "Avoids major traffic"];
  const safestReasons = isNight
    ? ["Well-lit roads", "High foot traffic", "Camera coverage"]
    : ["Main roads", "Active commercial streets", "Reliable visibility"];

  const fExplanation = getCachedExplanation(fastestScore, fTier, fastestReasons, timeLabel, userType);
  const sExplanation = getCachedExplanation(safestScore, sTier, safestReasons, timeLabel, userType);

  // Use real data if provided
  const fastestTime = realData ? realData.fastestReal.timeMin : (12 + etaShift);
  const safestTime = realData ? realData.safestReal.timeMin : (18 + Math.max(0, etaShift));
  const fastestDistance = realData ? realData.fastestReal.distance : '2.1 mi';
  const safestDistance = realData ? realData.safestReal.distance : '2.8 mi';
  const fEta = realData ? realData.fastestReal.eta : `${fastestTime} min`;
  const sEta = realData ? realData.safestReal.eta : `${safestTime} min`;
  const fCoords = realData ? realData.fastestReal.coords : [[37.7786, -122.4140], [37.7749, -122.4045], [37.7686, -122.3929]];
  const sCoords = realData ? realData.safestReal.coords : [[37.7786, -122.4140], [37.7836, -122.4015], [37.7766, -122.3909], [37.7686, -122.3929]];

  const fastestRisk = clampHeat(100 - fastestScore + (isNight ? 8 : 0));
  const safestRisk = clampHeat(100 - safestScore + (isNight ? 5 : 0));

  return {
    fastest: {
      id: 'fastest',
      title: 'Fastest Route',
      timeMin: fastestTime,
      eta: fEta,
      distance: fastestDistance,
      score: fastestScore,
      confidence: getConfidence(fastestScore, isNight),
      tier: fTier,
      reasons: fastestReasons,
      riskTags: isNight ? ["Low Lighting", "Isolated Zone", "Sparse Footfall"] : ["Moderate Lighting", "Mixed Activity"],
      timePeriod: timeLabel,
      riskHeat: fastestRisk,
      userType,
      explanation: fExplanation,
      status: fastestScore < 45 ? 'unsafe' : 'caution',
      color: '#a0a0a0',
      coords: fCoords
    },
    safest: {
      id: 'safest',
      title: 'Safest Route',
      timeMin: safestTime,
      eta: sEta,
      distance: safestDistance,
      score: safestScore,
      confidence: getConfidence(safestScore, isNight),
      tier: sTier,
      reasons: safestReasons,
      riskTags: isNight ? ["Well Lit", "Active Area", "Patrol Visibility"] : ["Well Lit", "Busy Area"],
      timePeriod: timeLabel,
      riskHeat: safestRisk,
      userType,
      explanation: sExplanation,
      status: 'safe',
      color: '#10b981',
      coords: sCoords
    }
  };
};

const explanationCache = new Map();

const clampScore = (value) => Math.max(10, Math.min(99, value));
const clampHeat = (value) => Math.max(5, Math.min(95, value));
const getConfidence = (score, isNight) => {
  const noise = Math.floor(Math.random() * 6);
  const base = score >= 80 ? 93 : (score >= 60 ? 88 : 82);
  return Math.max(75, Math.min(98, base - (isNight ? 4 : 0) + noise));
};

export const buildSafetyPrompt = (score, tier, reasons, timePeriod, userType) => `
You are a safety navigation assistant. Generate a single, natural-language 
sentence explaining why this route is ${tier} for a ${userType} traveler 
at ${timePeriod}.

Safety data:
- Score: ${score}/100
- Key factors: ${reasons.join(", ")}

Rules:
- Maximum 30 words
- Sound human, not robotic
- Reference time of day naturally (e.g. "at this hour", "this late")
- Reference user type naturally only if not "default"
- Never say "safety score" or use numbers in the explanation
- Start with "This route..." or "Your route..."

Output ONLY the sentence. No preamble, no punctuation at end.
`;

export const getCachedExplanation = (score, tier, reasons, timePeriod, userType) => {
  const key = `${userType}-${tier}-${timePeriod}`;
  if (explanationCache.has(key)) {
    return explanationCache.get(key);
  }
  
  // Here we simulate the LLM output locally based on the prompt
  let explanation = `This route relies on well-lit paths prioritizing safety at this hour.`;
  if (userType !== 'default') {
      explanation = `Your route prioritizes brightly lit avenues ensuring a safe environment for a ${userType} traveling this late.`;
  }
  if (tier === 'AVOID') {
      explanation = `This route includes isolated zones that are best avoided at this hour.`;
  }
  
  explanationCache.set(key, explanation);
  return explanation;
};
