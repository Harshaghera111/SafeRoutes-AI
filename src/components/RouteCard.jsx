import React from 'react';
import SafetyScore from './SafetyScore';
import RiskTagRow from './RiskTagRow';
import AIExplanation from './AIExplanation';

const getTradeoffText = (fastest, safest) => {
  const diffMinutes = Math.max(0, Math.ceil((safest.durationSeconds - fastest.durationSeconds) / 60));
  if (diffMinutes <= 0) return 'Same ETA · Take the safer route ✓';
  if (diffMinutes <= 5) return `+${diffMinutes} min · A small price for safety ✓`;
  if (diffMinutes <= 15) return `+${diffMinutes} min · Significantly safer · Recommended ✓`;
  return `+${diffMinutes} min · Much safer · Your call`;
};

const ComparisonCard = ({ route, label, icon, recommended = false, merged = false }) => (
  <div className={`route-card status-${route.status} ${recommended ? 'recommended-card' : ''}`}>
    <div className="route-header">
      <div>
        <div className="route-title">
          <span>{icon}</span>
          <span>{label}</span>
          {recommended && <span className="recommended-pill">Recommended</span>}
          {merged && <span className="merged-pill">Fastest + Safest</span>}
        </div>
        <div className="route-stats">
          <span>{route.durationText}</span>
          <span>•</span>
          <span>{route.distanceText}</span>
          <span>•</span>
          <span>AI confidence {route.confidence}%</span>
        </div>
        <RiskTagRow tags={route.riskTags} tier={route.tier} />
      </div>
      <SafetyScore score={route.score} />
    </div>

    <AIExplanation text={route.explanation} />
  </div>
);

const RouteCard = ({ scoredRoutes, safestRouteIndex, fastestRouteIndex, sameRoute }) => {
  if (!scoredRoutes?.length) return null;

  const safest = scoredRoutes.find((route) => route.routeIndex === safestRouteIndex);
  const fastest = scoredRoutes.find((route) => route.routeIndex === fastestRouteIndex);

  if (!safest) return null;

  if (sameRoute || !fastest) {
    return (
      <div className="route-list">
        <ComparisonCard route={safest} label="This route is both fastest AND safest ✓" icon="🛡️" merged />
      </div>
    );
  }

  return (
    <div className="route-list">
      <ComparisonCard route={safest} label="Safest Route" icon="🛡️" recommended />
      <div className="tradeoff-callout">{getTradeoffText(fastest, safest)}</div>
      <ComparisonCard route={fastest} label="Fastest Route" icon="⚡" />
    </div>
  );
};

export default RouteCard;
