import React, { useState, useEffect } from 'react';

const WhyThisRoute = ({ reasons, color }) => {
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const timers = reasons.map((_, i) => 
      setTimeout(() => {
        setVisibleItems((prev) => (prev.includes(i) ? prev : [...prev, i]));
      }, 150 * i)
    );
    return () => timers.forEach(clearTimeout);
  }, [reasons]);

  const getSentimentIcon = (reason) => {
    const lower = reason.toLowerCase();
    if (lower.includes('well-lit') || lower.includes('active') || lower.includes('safe') || lower.includes('direct')) {
      return <span style={{ color: '#22c55e', marginRight: '8px' }}>✔</span>;
    }
    return <span style={{ color: '#f59e0b', marginRight: '8px' }}>⚠</span>;
  };

  const containerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    borderLeft: `4px solid ${color}`,
    padding: '12px',
    marginTop: '12px',
    fontSize: '13px'
  };

  const itemStyle = (index) => ({
    opacity: visibleItems.includes(index) ? 1 : 0,
    transform: visibleItems.includes(index) ? 'translateY(0)' : 'translateY(5px)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    marginBottom: index === reasons.length - 1 ? '0' : '6px',
    color: 'rgba(255,255,255,0.9)'
  });

  return (
    <section aria-label="Why this route" style={containerStyle}>
      <h4 style={{ fontWeight: 700, margin: '0 0 8px 0', fontSize: '13px', opacity: 0.9 }}>Why this route?</h4>
      {reasons.slice(0, 3).map((reason, i) => (
        <div key={i} style={itemStyle(i)}>
          {getSentimentIcon(reason)}
          {reason}
        </div>
      ))}
    </section>
  );
};

export default WhyThisRoute;
