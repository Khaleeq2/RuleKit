import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'RuleKit — Turn human judgment into rules that run themselves';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2b4c7e 40%, #3d6bab 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 80px',
          position: 'relative',
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse 80% 60% at 70% 20%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top bar — brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            R
          </div>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '-0.02em',
            }}
          >
            RuleKit
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '800px',
          }}
        >
          Turn human judgment into rules that run themselves
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
            marginTop: '24px',
            maxWidth: '640px',
          }}
        >
          Write rules in plain English. Run them on any input. Get instant, explainable verdicts.
        </div>

        {/* Bottom bar — feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '48px',
          }}
        >
          {['Plain-English Rules', 'Instant Verdicts', 'Full Audit Trail'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 20px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
