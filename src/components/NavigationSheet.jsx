import React, { useEffect, useRef, useState } from 'react';
import { Search, ChevronLeft, Navigation2 } from 'lucide-react';
import RouteCard from './RouteCard';
import ContextBanner from './ContextBanner';
import { generateRouteSimulations } from '../utils/aiLogic';

const LOADING_MESSAGES = [
  'Scanning route context...',
  'Checking low-light segments...',
  'Evaluating crowd and traffic patterns...',
  'Re-ranking routes by safety confidence...'
];

const PULSE_MESSAGES = [
  'AI is monitoring active route risk...',
  'Live safety context refreshed just now',
  'No critical alerts detected in selected path',
  'Confidence updated from latest signals'
];

const TimeTradeoffCallout = ({ fastest, safest }) => {
  if (!fastest || !safest) return null;
  const timeDiff = safest.timeMin - fastest.timeMin;

  let text = "";
  if (timeDiff <= 0) text = "Same time · Safer route · No reason not to ✓";
  else if (timeDiff <= 5) text = `+${timeDiff} min · Worth it for safety ✓`;
  else if (timeDiff <= 15) text = `+${timeDiff} min · Significantly safer · Recommended ✓`;
  else text = `+${timeDiff} min · Much safer · Your call`;

  const tierColor = safest.tier === 'SAFE' ? '#22c55e' : (safest.tier === 'CAUTION' ? '#f59e0b' : '#ef4444');

  const style = {
    textAlign: 'center',
    border: `1px solid ${tierColor}`,
    borderRadius: '16px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '6px 0',
    width: 'fit-content',
    alignSelf: 'center'
  };

  return <div style={style}>{text}</div>;
};

const NavigationSheet = ({ onRoutesGenerated, selectedRouteId, onRouteSelect }) => {
  const [step, setStep] = useState('input'); // 'input' | 'loading' | 'results'
  const [destination, setDestination] = useState('');
  const [userType, setUserType] = useState('default');
  const [routes, setRoutes] = useState(null);
  const [loadingText, setLoadingText] = useState('Scanning route context...');
  const [livePulseText, setLivePulseText] = useState('AI is monitoring active route risk...');
  const loadingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (step !== 'loading') return undefined;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[index]);
    }, 700);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== 'results') return undefined;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % PULSE_MESSAGES.length;
      setLivePulseText(PULSE_MESSAGES[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [step]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!destination) return;

    setStep('loading');
    setLoadingText(LOADING_MESSAGES[0]);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Lightweight "real-time AI" simulation with a short delayed result.
    loadingTimeoutRef.current = setTimeout(() => {
      const calculatedRoutes = generateRouteSimulations(destination, userType);
      setRoutes(calculatedRoutes);
      onRoutesGenerated(calculatedRoutes);
      onRouteSelect('safest');
      setStep('results');
    }, 2100);
  };

  const handleBack = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setStep('input');
    onRoutesGenerated(null);
  };

  return (
    <div className="bottom-sheet glass-panel">
      <div className="sheet-handle"></div>
      
      {step === 'input' ? (
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Where to?</label>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '14px', color: '#a0a0a0' }} size={20} />
              <input 
                type="text" 
                className="styled-input" 
                placeholder="Search destination..." 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">AI Context Profile</label>
            <select 
              className="styled-select"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="default">General / Default</option>
              <option value="woman">Solo Traveler (Woman)</option>
              <option value="elderly">Elderly / Limited Mobility</option>
              <option value="tourist">Tourist / Unfamiliar</option>
            </select>
          </div>

          <button type="submit" className="primary-btn">
            <Navigation2 size={20} />
            Find Safest Route
          </button>
        </form>
      ) : step === 'loading' ? (
        <div className="ai-loading-wrap">
          <div className="ai-loading-spinner" />
          <div className="ai-loading-title">SafeRoute AI is analyzing</div>
          <div className="ai-loading-text">{loadingText}</div>
          <div className="ai-loading-bar">
            <span className="ai-loading-progress" />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button className="back-btn" onClick={handleBack} style={{ marginBottom: '8px' }}>
            <ChevronLeft size={16} /> Edit Search
          </button>
          
          <ContextBanner userType={userType} />
          
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
            Routes to {destination}
          </div>

          <div className="live-pulse-chip">{livePulseText}</div>
          
          {routes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <RouteCard 
                route={routes.safest} 
                isSelected={selectedRouteId === 'safest'} 
                onClick={() => onRouteSelect('safest')} 
              />
              <TimeTradeoffCallout fastest={routes.fastest} safest={routes.safest} />
              <RouteCard 
                route={routes.fastest} 
                isSelected={selectedRouteId === 'fastest'} 
                onClick={() => onRouteSelect('fastest')} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavigationSheet;
