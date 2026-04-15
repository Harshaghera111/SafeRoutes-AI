import React, { useState, useEffect } from 'react';

const EmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [coords, setCoords] = useState("Locating...");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (showModal && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setCoords(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
      }, () => setCoords("Location unavailable"));

      const now = new Date();
      setTime(`Sent at: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
    }
  }, [showModal]);

  const handleClose = () => {
    setShowModal(false);
    setShowToast(true);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <>
      <style>{`
        @keyframes pulseAlert { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      {showToast && (
        <div style={{
          position: 'fixed', top: '16px', left: '16px', right: '16px', zIndex: 10001,
          background: 'var(--brand-green)', color: 'white', padding: '12px 16px',
          borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '14px',
          textAlign: 'center', boxShadow: 'var(--shadow-card)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          ✓ Alert sent · Stay in a visible, populated area
        </div>
      )}

      <button
        onClick={() => { setShowModal(true); if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
          borderRadius: '50%', backgroundColor: 'var(--brand-red)', color: '#fff',
          border: 'none', boxShadow: 'var(--shadow-glow-red)', fontSize: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          zIndex: 9999, animation: 'pulseAlert 2s infinite'
        }}
      >
        🚨
      </button>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '24px',
            maxWidth: '320px', width: '100%', color: 'var(--text-primary)', textAlign: 'center',
            boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--brand-red)' }}>
               🚨 Emergency Alert
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your location has been shared with your emergency contact and local authorities.
            </p>
            
            <div style={{ background: 'var(--bg-base)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '13px', textAlign: 'left', border: '1px solid var(--border-subtle)' }}>
               <div style={{ color: 'var(--text-muted)' }}>Location sent:</div>
               <div style={{ fontWeight: 600, marginBottom: '6px' }}>{coords}</div>
               <div style={{ color: 'var(--text-muted)' }}>{time}</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <button
                onClick={handleClose}
                style={{
                  width: '100%', padding: '14px', backgroundColor: 'transparent',
                  color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-pill)',
                  fontWeight: '600', cursor: 'pointer'
                }}
              >
                OK, I'm Safe
              </button>
              <a
                href="tel:112"
                style={{
                  width: '100%', padding: '14px', backgroundColor: 'var(--brand-red)', textDecoration: 'none',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius-pill)', display: 'block',
                  fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-glow-red)'
                }}
              >
                Call 112
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;
