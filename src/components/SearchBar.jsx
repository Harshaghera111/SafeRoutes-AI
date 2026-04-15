import React from 'react';

const SearchBar = ({ 
  origin, setOrigin, 
  destination, setDestination, 
  userType, setUserType, 
  timePeriod, setTimePeriod, 
  handleSearch, disabled, inputError
}) => {

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
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s ease'
  });

  return (
    <section aria-label="Route Search Section" style={{ padding: '16px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Origin field with A11y bindings */}
        <div style={{ position: 'relative' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '16px' }}>📍</span>
          <input 
            type="text" 
            aria-label="Enter origin"
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !disabled) handleSearch();
            }}
            disabled={disabled}
            placeholder="Starting from..."
            style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Destination & Action */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '16px' }}>🎯</span>
            <input 
              type="text" 
              aria-label="Enter destination"
              value={destination} 
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !disabled) handleSearch();
              }}
              disabled={disabled}
              placeholder="Where to?"
              style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            aria-label="Search Route"
            onClick={handleSearch}
            disabled={!destination || !origin || disabled}
            style={{ 
              background: 'var(--brand-green)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0 20px', fontWeight: 'bold', fontFamily: 'Syne, sans-serif', fontSize: '16px',
              opacity: (!destination || !origin || disabled) ? 0.5 : 1, cursor: 'pointer'
            }}
          >
            Go →
          </button>
        </div>

        {inputError && (
          <p role="alert" style={{ margin: 0, color: '#fca5a5', fontSize: '12px', fontWeight: 600 }}>
            {inputError}
          </p>
        )}

        {/* User Context Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span id="user-type-group" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '4px' }}>👤 Profile:</span>
          <div role="group" aria-labelledby="user-type-group" style={{ display: 'flex', gap: '8px', flex: 1 }}>
            {["default", "woman", "elderly", "tourist"].map(t => (
              <button 
                key={t} 
                aria-label={`Set profile mode to ${t}`}
                aria-pressed={userType === t}
                onClick={() => setUserType(t)} 
                disabled={disabled} 
                style={pillStyle(userType === t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Context Banner mapping user type to context-aware string */}
        <div aria-live="polite" style={{ textAlign: 'center', fontSize: '12px', color: 'var(--brand-green)', background: 'rgba(34,197,94,0.08)', padding: '6px 10px', borderRadius: 'var(--radius-pill)', width: 'fit-content', margin: '4px auto 0 auto', fontWeight: 600 }}>
          Optimized for: {userType.charAt(0).toUpperCase() + userType.slice(1)} → Context-aware safety routing
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span id="time-period-group" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '4px' }}>🕒 Time:</span>
          <div role="group" aria-labelledby="time-period-group" style={{ display: 'flex', gap: '8px', flex: 1 }}>
            {["day", "evening", "night"].map((period) => (
              <button
                key={period}
                aria-label={`Set time period to ${period}`}
                aria-pressed={timePeriod === period}
                onClick={() => setTimePeriod(period)}
                disabled={disabled}
                style={pillStyle(timePeriod === period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SearchBar;
