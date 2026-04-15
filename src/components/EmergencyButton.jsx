import React, { useState } from 'react';

const EmergencyButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        🚨
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '320px',
            width: '100%',
            color: '#1a1a1a',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>🚨</span> Emergency Alert Sent
            </h3>
            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#404040' }}>
              Your current location has been shared with your emergency contact.
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#666', fontWeight: 600 }}>
              Stay calm. Help is on the way.
            </p>
            {/* TODO: integrate with Firebase + SMS API in V2 */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;
