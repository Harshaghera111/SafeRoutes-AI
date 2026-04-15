import React, { useEffect, useState } from 'react';
import SafetyScore from './SafetyScore';
import RiskTagRow from './RiskTagRow';
import AIExplanation from './AIExplanation';
import WhyThisRoute from './WhyThisRoute';

const TradeoffCallout = ({ fastestRoute, safestRoute }) => {
  if (!fastestRoute || !safestRoute) return null;
  const timeDiff = Math.max(0, Math.round((safestRoute.duration - fastestRoute.duration) / 60));
  
  let label = "";
  if (timeDiff <= 0) label = "⚡ Same ETA · Take the safer route ✓";
  else if (timeDiff <= 5) label = `+${timeDiff} min · Small price for safety ✓`;
  else if (timeDiff <= 15) label = `+${timeDiff} min · Significantly safer · Recommended ✓`;
  else label = `+${timeDiff} min · Much safer · Your call`;

  return (
    <div style={{
      border: '1px solid var(--safe)', color: 'var(--brand-green)', background: 'rgba(34,197,94,0.08)',
      padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '13px', fontWeight: 600,
      textAlign: 'center', margin: '0 auto 12px auto', width: 'fit-content'
    }}>
      {label}
    </div>
  );
};

const RouteCard = ({ route, type, delay }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const isSafest = type === 'safest' || type === 'merged';
  const showBadge = isSafest;

  const style = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginBottom: '16px',
    borderLeft: `4px solid ${isSafest ? 'var(--safe)' : 'var(--border)'}`,
    boxShadow: isSafest ? 'var(--shadow-glow-green)' : 'var(--shadow-card)',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative'
  };

  const headerTitle = type === 'merged' ? "⚡🛡️ Fastest & Safest Route" : (isSafest ? "🛡️ Safest Route" : "⚡ Fastest Route");

  return (
    <div style={style}>
      {showBadge && (
        <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(34,197,94,0.1)', color: 'var(--brand-green)', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: 700 }}>
          {type === 'merged' ? "Best of Both ✓" : "Recommended ✓"}
        </span>
      )}

      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{headerTitle}</h3>
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

      <AIExplanation route={route} routeType={type === 'fastest' ? 'faster' : 'safest'} />
      
      {isSafest && <WhyThisRoute reasons={route.reasons} color="var(--safe)" />}
    </div>
  );
};

export const ResultsView = ({ fastestRoute, safestRoute }) => {
  const isMerged = fastestRoute.id === safestRoute.id;

  return (
    <div id="route-results" style={{ padding: '0 16px', marginTop: '16px', paddingBottom: '100px' }}>
      {isMerged ? (
        <RouteCard route={safestRoute} type="merged" delay={0} />
      ) : (
        <>
          <RouteCard route={safestRoute} type="safest" delay={0} />
          <TradeoffCallout fastestRoute={fastestRoute} safestRoute={safestRoute} />
          <RouteCard route={fastestRoute} type="fastest" delay={150} />
        </>
      )}
    </div>
  );
};

export default RouteCard;
