import React from 'react';

const USER_CONTEXT_MAPPING = {
  default: "Balanced safety and speed",
  solo: "Prioritizing well-lit, high-activity corridors", // added solo since my original code used solo
  woman: "Prioritizing well-lit, high-activity corridors",
  elderly: "Avoiding steep/isolated paths, preferring busy streets",
  tourist: "Avoiding unfamiliar low-activity areas"
};

const ContextBanner = ({ userType }) => {
  const reason = USER_CONTEXT_MAPPING[userType] || USER_CONTEXT_MAPPING.default;

  const bannerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '6px 12px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '8px',
    width: 'fit-content'
  };

  return (
    <div style={bannerStyle}>
      <span style={{ fontWeight: 600, marginRight: '6px', color: '#fff' }}>Optimized for:</span>
      <span style={{ textTransform: 'capitalize' }}>{userType === 'default' ? 'Everyone' : userType}</span>
      <span style={{ margin: '0 6px', color: '#a0a0a0' }}>→</span>
      <span>{reason}</span>
    </div>
  );
};

export default ContextBanner;
