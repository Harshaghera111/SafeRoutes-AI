import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

const SearchBar = ({ 
  origin, setOrigin, 
  destination, setDestination, 
  userType, setUserType, 
  timePeriod, setTimePeriod, 
  handleSearch, disabled, appStage 
}) => {
  const destRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation && !origin) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }, (res, status) => {
            if (status === 'OK' && res[0]) {
              setOrigin(res[0].formatted_address);
            } else {
              setOrigin("Bengaluru, Karnataka");
            }
          });
        },
        () => setOrigin("Bengaluru, Karnataka")
      );
    }
  }, [origin, setOrigin]);

  const onPlaceChanged = () => {
    if (destRef.current) {
      const place = destRef.current.getPlace();
      if (place && place.formatted_address) {
        setDestination(place.formatted_address);
        if (place.formatted_address.toLowerCase().includes("demo")) {
          // Demo trigger via name
          triggerDemo();
        }
      }
    }
  };

  const manuallyCheckDemo = (val) => {
    setDestination(val);
    if (val.toLowerCase() === "demo") {
      triggerDemo();
    }
  };

  const triggerDemo = () => {
    setOrigin("Koramangala 5th Block, Bengaluru");
    setDestination("Indiranagar 12th Main, Bengaluru");
    setUserType("woman");
    setTimePeriod("night");
    setTimeout(handleSearch, 300);
  };

  const pillStyle = (active) => ({
    padding: '8px 12px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid ' + (active ? 'var(--brand-green)' : 'var(--border-subtle)'),
    background: active ? 'var(--brand-green)' : 'var(--bg-card)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    flex: '1',
    textAlign: 'center',
    fontWeight: active ? '600' : '400'
  });

  const getContextBanner = () => {
    switch (userType) {
      case "woman": return "Prioritizing well-lit, high-activity corridors";
      case "elderly": return "Avoiding steep and isolated paths";
      case "tourist": return "Avoiding unfamiliar low-activity areas";
      default: return "Balanced safety and speed";
    }
  };

  return (
    <div style={{ padding: '16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Origin */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '16px' }}>📍</span>
          <input 
            type="text" 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)}
            disabled={disabled}
            placeholder="Your location..."
            style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Destination & Action */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '16px' }}>🎯</span>
            <Autocomplete onLoad={(ref) => destRef.current = ref} onPlaceChanged={onPlaceChanged} options={{ componentRestrictions: { country: "in" } }}>
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => manuallyCheckDemo(e.target.value)}
                disabled={disabled}
                placeholder="Where to?"
                style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </Autocomplete>
          </div>
          <button 
            onClick={handleSearch}
            disabled={!destination || disabled}
            style={{ 
              background: 'var(--brand-green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0 20px', fontWeight: 'bold', fontFamily: 'Syne, sans-serif', fontSize: '16px',
              opacity: (!destination || disabled) ? 0.5 : 1, cursor: 'pointer'
            }}
          >
            Go →
          </button>
        </div>

        {/* User Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '4px' }}>👤 I am:</span>
          {["default", "woman", "elderly", "tourist"].map(t => (
            <button key={t} onClick={() => setUserType(t)} disabled={disabled} style={pillStyle(userType === t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Context Banner */}
        <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 'var(--radius-pill)', width: 'fit-content', margin: '0 auto' }}>
          {getContextBanner()}
        </div>

      </div>
    </div>
  );
};

export default SearchBar;
