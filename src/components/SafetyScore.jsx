import React from 'react';

const SafetyScore = ({ score }) => {
  let tierLabel = '';
  let colorVar = '';
  
  if (score >= 90) {
    tierLabel = 'Very Safe';
    colorVar = '#22c55e'; // --safe
  } else if (score >= 75) {
    tierLabel = 'Safe';
    colorVar = '#22c55e'; // --safe
  } else if (score >= 50) {
    tierLabel = 'Moderate Risk';
    colorVar = '#f59e0b'; // --caution
  } else if (score >= 25) {
    tierLabel = 'High Risk';
    colorVar = '#ef4444'; // --avoid
  } else {
    tierLabel = 'Unsafe';
    colorVar = '#ef4444'; // --avoid
  }

  const filledDots = Math.round(score / 20);
  
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  };

  const topRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 500
  };

  const badgeStyle = {
    backgroundColor: colorVar,
    width: '12px',
    height: '12px',
    borderRadius: '4px',
    display: 'inline-block'
  };

  const bottomRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const labelStyle = {
    color: colorVar,
    fontWeight: 700,
    fontSize: '14px'
  };

  const dotsStyle = {
    color: colorVar,
    fontSize: '14px',
    letterSpacing: '2px'
  };

  const dots = Array.from({ length: 5 }).map((_, i) => (i < filledDots ? '●' : '○')).join('');

  return (
    <div style={containerStyle}>
      <div style={topRowStyle}>
        <span style={badgeStyle}></span>
        Safety Score: <span style={{color: '#fff', fontWeight: 700}}>{score}/100</span>
      </div>
      <div style={bottomRowStyle}>
        <span style={labelStyle}>{tierLabel}</span>
        <span style={dotsStyle}>{dots}</span>
      </div>
    </div>
  );
};

export default SafetyScore;
