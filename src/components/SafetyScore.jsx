import React from 'react';

/**
 * Accessibly renders the quantitative safety score UI element.
 */
const SafetyScore = ({ score }) => {
  let tier = 'AVOID';
  let color = 'var(--avoid)';
  let desc = 'Avoid / Unsafe';

  if (score >= 75) {
    tier = 'SAFE';
    color = 'var(--safe)';
    desc = 'Very Safe';
  } else if (score >= 45) {
    tier = 'CAUTION';
    color = 'var(--caution)';
    desc = 'Moderate Risk';
  }

  return (
    <div aria-label={`Safety Score: ${score} out of 100, marked as ${desc}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>SAFETY SCORE</span>
        <span style={{ background: color, color: '#000', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
          {tier}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 800, color: color, fontFamily: 'Syne, sans-serif' }}>{score}</span>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
      </div>
    </div>
  );
};

export default SafetyScore;
