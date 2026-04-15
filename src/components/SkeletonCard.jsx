import React from 'react';

const SkeletonCard = () => {
  const containerStyle = {
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    marginBottom: '12px',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const shimmerStyle = {
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '4px'
  };

  return (
    <>
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
           <div style={{ ...shimmerStyle, height: '24px', width: '40%' }}></div>
           <div style={{ ...shimmerStyle, height: '36px', width: '36px', borderRadius: '50%' }}></div>
        </div>
        <div style={{ ...shimmerStyle, height: '16px', width: '60%' }}></div>
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
           <div style={{ ...shimmerStyle, height: '20px', width: '80px', borderRadius: '12px' }}></div>
           <div style={{ ...shimmerStyle, height: '20px', width: '100px', borderRadius: '12px' }}></div>
        </div>
        <div style={{ ...shimmerStyle, height: '40px', width: '100%', marginTop: '6px' }}></div>
      </div>
    </>
  );
};

export default SkeletonCard;
