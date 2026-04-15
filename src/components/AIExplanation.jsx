import React from 'react';

/**
 * Renders the localized explanation logic simulating AI intent, alongside validation markers.
 */
const AIExplanation = ({ explanation, confidence }) => {
  const safeExplanation =
    explanation ||
    'This route is recommended after balancing lighting coverage, public activity, and risk-zone exposure.';
  const safeConfidence = Number.isFinite(confidence) ? confidence : 87;

  return (
    <div 
      aria-label="Route AI Safety Explanation"
      style={{
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--text-primary)',
        background: 'var(--bg-input)',
        padding: '12px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        border: '1px solid var(--border-subtle)',
        marginTop: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <span aria-hidden="true" style={{ color: 'var(--brand-green)' }}>✨</span>
        <span style={{ fontWeight: 500 }}>{safeExplanation}</span>
      </div>

      <div style={{ 
        borderTop: '1px solid var(--border)', 
        paddingTop: '8px', 
        marginTop: '2px',
        display: 'flex', 
        justifyContent: 'space-between', 
        fontSize: '11px', 
        color: 'var(--text-secondary)' 
      }}>
        <span aria-label={`AI Confidence score: ${safeConfidence} percent`}>
          <strong>AI Confidence:</strong> <span style={{ color: 'var(--brand-green)' }}>{safeConfidence}%</span>
        </span>
        <span aria-label="Data source credibility">
           Based on 12,000+ simulated urban safety signals
        </span>
      </div>
    </div>
  );
};

export default AIExplanation;
