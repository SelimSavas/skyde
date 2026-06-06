import { type ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          width: 420,
          height: 880,
          borderRadius: 60,
          background: 'radial-gradient(ellipse, rgba(100,150,255,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Phone body */}
      <div
        style={{
          position: 'relative',
          width: 393,
          height: 852,
          borderRadius: 54,
          background: 'linear-gradient(160deg, #2A2A2A 0%, #1A1A1A 100%)',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.12),
            0 0 0 2px #111,
            0 40px 120px rgba(0,0,0,0.9),
            0 8px 32px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08)
          `,
          flexShrink: 0,
        }}
      >
        {/* Left side buttons */}
        {/* Silent toggle */}
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 120,
            width: 3,
            height: 32,
            borderRadius: '3px 0 0 3px',
            background: 'linear-gradient(180deg, #2C2C2C 0%, #222 100%)',
            boxShadow: '-1px 0 0 rgba(255,255,255,0.06)',
          }}
        />
        {/* Volume up */}
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 170,
            width: 3,
            height: 64,
            borderRadius: '3px 0 0 3px',
            background: 'linear-gradient(180deg, #2C2C2C 0%, #222 100%)',
            boxShadow: '-1px 0 0 rgba(255,255,255,0.06)',
          }}
        />
        {/* Volume down */}
        <div
          style={{
            position: 'absolute',
            left: -3,
            top: 248,
            width: 3,
            height: 64,
            borderRadius: '3px 0 0 3px',
            background: 'linear-gradient(180deg, #2C2C2C 0%, #222 100%)',
            boxShadow: '-1px 0 0 rgba(255,255,255,0.06)',
          }}
        />
        {/* Right power button */}
        <div
          style={{
            position: 'absolute',
            right: -3,
            top: 190,
            width: 3,
            height: 80,
            borderRadius: '0 3px 3px 0',
            background: 'linear-gradient(180deg, #2C2C2C 0%, #222 100%)',
            boxShadow: '1px 0 0 rgba(255,255,255,0.06)',
          }}
        />

        {/* Screen area */}
        <div
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: 46,
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {/* Dynamic Island */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 126,
              height: 37,
              borderRadius: 20,
              background: '#000',
              zIndex: 100,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
            }}
          />

          {/* App content */}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {children}
          </div>
        </div>

        {/* Screen edge reflection */}
        <div
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: 46,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      </div>
    </div>
  );
}
