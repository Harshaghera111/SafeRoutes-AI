import React from 'react';

const RiskTagRow = ({ tags, tier }) => {
  if (!tags || tags.length === 0) return null;

  const getTierColor = () => {
    switch (tier) {
      case 'SAFE': return 'rgba(34, 197, 94, 0.2)'; // --safe
      case 'CAUTION': return 'rgba(245, 158, 11, 0.2)'; // --caution
      case 'AVOID': return 'rgba(239, 68, 68, 0.2)'; // --avoid
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const getTierTextColor = () => {
    switch (tier) {
      case 'SAFE': return '#4ade80'; 
      case 'CAUTION': return '#fbbf24';
      case 'AVOID': return '#f87171';
      default: return '#fff';
    }
  };

  const getIcon = (tagName) => {
    const lower = tagName.toLowerCase();
    if (lower.includes('lighting')) return '🔦';
    if (lower.includes('crowd')) return '👤';
    if (lower.includes('risk zone')) return '⚠️';
    if (lower.includes('well lit')) return '💡';
    if (lower.includes('active')) return '🏃';
    return '📍';
  };

  const displayTags = tags.slice(0, 4);
  const extraCount = tags.length > 4 ? tags.length - 4 : 0;

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px'
  };

  const tagStyle = {
    backgroundColor: getTierColor(),
    color: getTierTextColor(),
    border: `1px solid ${getTierColor()}`,
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap'
  };

  return (
    <div aria-label="Route risk indicators" style={containerStyle}>
      {displayTags.map((tag, i) => (
        <span key={i} style={tagStyle} aria-label={`Risk tag: ${tag}`}>
          <span>{getIcon(tag)}</span> {tag}
        </span>
      ))}
      {extraCount > 0 && (
        <span style={tagStyle}>+{extraCount} more</span>
      )}
    </div>
  );
};

export default RiskTagRow;
