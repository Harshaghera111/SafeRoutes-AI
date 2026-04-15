const RISK_ZONES = [
  { name: "Shivajinagar Bus Stand",   lat: 12.9830, lng: 77.6010, radius: 400, riskLevel: 0.8, tags: ["High Risk Zone","Low Lighting"] },
  { name: "Majestic Area",            lat: 12.9768, lng: 77.5713, radius: 500, riskLevel: 0.85, tags: ["High Risk Zone","Low Crowd"] },
  { name: "Hebbal Flyover Underpass", lat: 13.0354, lng: 77.5970, radius: 300, riskLevel: 0.7, tags: ["Low Lighting","Isolated Zone"] },
  { name: "Hosur Road Industrial",    lat: 12.9082, lng: 77.6476, radius: 600, riskLevel: 0.65, tags: ["Low Crowd","Low Lighting"] },
  { name: "Hennur Main Road",         lat: 13.0289, lng: 77.6391, radius: 350, riskLevel: 0.6, tags: ["Low Lighting"] },
]

const SAFE_ZONES = [
  { name: "MG Road",           lat: 12.9753, lng: 77.6069, radius: 600, safetyBonus: 0.9, tags: ["Well Lit","Active Area"] },
  { name: "Indiranagar 100ft", lat: 12.9784, lng: 77.6408, radius: 500, safetyBonus: 0.85, tags: ["Well Lit","Active Area"] },
  { name: "Koramangala 5th Block", lat: 12.9279, lng: 77.6271, radius: 450, safetyBonus: 0.8, tags: ["Active Area","Well Lit"] },
  { name: "Whitefield Main",   lat: 12.9698, lng: 77.7500, radius: 550, safetyBonus: 0.75, tags: ["Active Area"] },
]

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function countZoneIntersections(coords, zones) {
  let intersectedZones = [];
  for (const zone of zones) {
    for (const coord of coords) {
      if (typeof coord.lat === 'function') {
         if (getDistance(coord.lat(), coord.lng(), zone.lat, zone.lng) <= zone.radius) {
           intersectedZones.push(zone);
           break;
         }
      } else {
         if (getDistance(coord.lat, coord.lng, zone.lat, zone.lng) <= zone.radius) {
           intersectedZones.push(zone);
           break;
         }
      }
    }
  }
  return intersectedZones;
}

export function scoreRoute(waypointCoords, userType, timePeriod) {
  const riskIntersections = countZoneIntersections(waypointCoords, RISK_ZONES);
  const safeIntersections = countZoneIntersections(waypointCoords, SAFE_ZONES);
  const numRisk = riskIntersections.length;
  const numSafe = safeIntersections.length;

  let lightingScore = timePeriod === "night" ? 0.3 : (timePeriod === "evening" ? 0.6 : 0.9);
  lightingScore -= numRisk * 0.1;
  lightingScore = clamp(lightingScore, 0, 1);
  
  let crowdScore = timePeriod === "night" ? 0.4 : (timePeriod === "evening" ? 0.65 : 0.85);
  crowdScore += numSafe * 0.05;
  crowdScore = clamp(crowdScore, 0, 1);
  
  let isolationScore = 1 - (numRisk * 0.15);
  isolationScore = clamp(isolationScore, 0, 1);
  
  let incidentScore = 1 - (numRisk * 0.2);
  incidentScore = clamp(incidentScore, 0, 1);
  
  const weights = {
    default: { lighting:0.25, crowd:0.25, isolation:0.25, incident:0.25 },
    woman:   { lighting:0.35, crowd:0.30, isolation:0.25, incident:0.10 },
    elderly: { lighting:0.30, crowd:0.20, isolation:0.35, incident:0.15 },
    tourist: { lighting:0.25, crowd:0.35, isolation:0.25, incident:0.15 },
  };
  
  const w = weights[userType] || weights.default;
  const rawScore = (lightingScore * w.lighting + crowdScore * w.crowd + isolationScore * w.isolation + incidentScore * w.incident);
  
  const score = Math.round(rawScore * 100);
  const tier = score >= 75 ? "SAFE" : (score >= 45 ? "CAUTION" : "AVOID");
  
  const reasons = [];
  if (lightingScore > 0.7) reasons.push("Well-lit corridor");
  else reasons.push("Limited street lighting");
  if (crowdScore > 0.7) reasons.push("High public activity");
  else reasons.push("Low foot traffic at this hour");
  if (isolationScore > 0.7) reasons.push("Active commercial area nearby");
  else reasons.push("Passes through isolated stretch");
  
  let tags = new Set();
  riskIntersections.forEach(z => z.tags.forEach(t => tags.add(t)));
  if (numSafe > 0) {
    safeIntersections.forEach(z => z.tags.forEach(t => tags.add(t)));
  }
  const riskTags = Array.from(tags).slice(0, 5);
  
  return { score, tier, reasons, riskTags, timePeriod, userType };
}
