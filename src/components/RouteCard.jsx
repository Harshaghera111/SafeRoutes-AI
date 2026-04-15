import React from 'react';
import SafetyScore from './SafetyScore';
import RiskTagRow from './RiskTagRow';
import AIExplanation from './AIExplanation';
import WhyThisRoute from './WhyThisRoute';

const SAFETY_BREAKDOWN = [
  { label: 'Lighting', value: 30 },
  { label: 'Crowd Density', value: 25 },
  { label: 'Risk Zones', value: 20 },
  { label: 'Context Adjustment', value: 25 },
];

const SafetyBreakdownPanel = () => (
  <section aria-label="Dynamic safety breakdown panel" style={{ marginTop: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-primary)' }}>Safety Score Breakdown</h4>
    {SAFETY_BREAKDOWN.map((item) => (
      <div key={item.label} style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <span>{item.label}</span>
          <span>{item.value}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          <span style={{ display: 'block', width: `${item.value}%`, height: '100%', background: 'var(--brand-green)' }} />
        </div>
      </div>
    ))}
  </section>
);

const AIRecommendationBadge = () => (
  <section aria-label="AI recommendation badge" style={{ marginBottom: '12px', border: '1px solid var(--safe)', color: 'var(--brand-green)', background: 'rgba(34,197,94,0.08)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ fontSize: '13px', fontWeight: 700 }}>🧠 AI Recommendation: Choose Safest Route</div>
    <div style={{ fontSize: '11px', marginTop: '2px', color: 'var(--text-secondary)' }}>Based on current context and safety signals</div>
  </section>
);

const TradeoffCallout = ({ fastestRoute, safestRoute }) => {
  if (!fastestRoute || !safestRoute) return null;
  
  // Extract minutes safely (assuming '22 min' string format)
  const fMin = parseInt(fastestRoute.durationText) || 0;
  const sMin = parseInt(safestRoute.durationText) || 0;
  const timeDiff = Math.max(0, sMin - fMin);
  
  const label = `+${timeDiff} min • 3x safer • Recommended`;

  return (
    <div 
      aria-label="Route comparison insight"
      style={{
        border: '1px solid var(--safe)', color: 'var(--brand-green)', background: 'rgba(34,197,94,0.08)',
        padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: 600,
        textAlign: 'center', margin: '0 auto 12px auto', width: 'fit-content'
      }}
    >
      {label}
    </div>
  );
};

const RouteCard = ({ route }) => {
  if (!route) return null;

  const isSafest = route.type === 'safest';
  
  const style = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginBottom: '16px',
    borderLeft: `4px solid ${isSafest ? 'var(--safe)' : 'var(--border)'}`,
    boxShadow: isSafest ? 'var(--shadow-glow-green)' : 'var(--shadow-card)',
    position: 'relative'
  };

  const headerTitle = isSafest ? "🛡️ Safest Route" : "⚡ Fastest Route";

  return (
    <article aria-labelledby={`route-header-${route.id}`} style={style}>
      {isSafest && (
        <span aria-hidden="true" style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(34,197,94,0.1)', color: 'var(--brand-green)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 700 }}>
          Recommended ✓
        </span>
      )}

      <div style={{ marginBottom: '12px' }}>
        <h3 id={`route-header-${route.id}`} style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{headerTitle}</h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <span style={{fontWeight: 600, color: '#fff'}}>{route.durationText}</span>
          <span>•</span>
          <span>{route.distanceText}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
         <RiskTagRow tags={route.riskTags} tier={route.tier} />
         <SafetyScore score={route.score} />
      </div>

      <AIExplanation explanation={route.explanation} confidence={route.confidence} />
      
      <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <strong>User Context Impact:</strong> {route.userContextImpact}
      </p>

      {isSafest && (
        <>
          <WhyThisRoute reasons={route.reasons} color="var(--safe)" />
          <SafetyBreakdownPanel />
        </>
      )}
    </article>
  );
};

export const ResultsView = ({ fastestRoute, safestRoute }) => {
  return (
    <div id="route-results" role="region" aria-label="Route Results" style={{ padding: '0 16px', marginTop: '16px', paddingBottom: '100px' }}>
      <AIRecommendationBadge />
      <RouteCard route={safestRoute} />
      <TradeoffCallout fastestRoute={fastestRoute} safestRoute={safestRoute} />
      <RouteCard route={fastestRoute} />
    </div>
  );
};

export default RouteCard;
