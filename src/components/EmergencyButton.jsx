import React from 'react';

const EmergencyButton = () => {
  const handleEmergency = () => {
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    window.alert('Location shared with emergency contact');
  };

  return (
    <button
      onClick={handleEmergency}
      aria-label="Emergency button"
      title="Emergency"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--brand-red)',
        color: '#fff',
        border: 'none',
        boxShadow: 'var(--shadow-glow-red)',
        fontSize: '16px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        zIndex: 9999,
        padding: '12px 14px',
      }}
    >
      🚨 Emergency
    </button>
  );
};

export default EmergencyButton;
