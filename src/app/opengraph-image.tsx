import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt =
  'LingoLandVerse — 79+ Free Interactive ESL, Math & Science Classroom Games & AI Suite for Teachers & Students';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#050814',
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(6, 182, 212, 0.28) 0%, transparent 45%), radial-gradient(circle at 82% 78%, rgba(168, 85, 247, 0.28) 0%, transparent 48%), linear-gradient(135deg, #040711 0%, #09122c 50%, #050814 100%)',
          padding: '54px 64px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(6, 182, 212, 0.14)',
              border: '2px solid rgba(34, 211, 238, 0.45)',
              borderRadius: '999px',
              padding: '10px 24px',
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 900, color: '#22d3ee', letterSpacing: '0.12em' }}>
              LINGOLANDVERSE.COM
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(16, 185, 129, 0.16)',
              border: '2px solid rgba(52, 211, 153, 0.45)',
              borderRadius: '999px',
              padding: '10px 22px',
              fontSize: 20,
              fontWeight: 800,
              color: '#6ee7b7',
              letterSpacing: '0.08em',
            }}
          >
            100% FREE FOR TEACHERS & STUDENTS
          </div>
        </div>

        {/* Main Hero Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            marginTop: '12px',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>The Cosmic EdTech Universe</span>
            <span style={{ color: '#22d3ee' }}>for Classrooms & Self-Study</span>
          </div>

          <div
            style={{
              fontSize: 28,
              color: '#cbd5e1',
              lineHeight: 1.4,
              maxWidth: '980px',
              fontWeight: 500,
            }}
          >
            79+ Interactive ESL, Math & Science Games • CEFR A1–C2 Reading Lab • AI Slide Deck Maker • Smartboard Classroom Tools • Lingo-Pet Companion
          </div>
        </div>

        {/* Bottom Feature Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid rgba(255, 255, 255, 0.14)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '14px',
                padding: '12px 20px',
                fontSize: 20,
                fontWeight: 700,
                color: '#f8fafc',
              }}
            >
              🎓 For Teachers: Smartboard & AI Lesson Suite
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '14px',
                padding: '12px 20px',
                fontSize: 20,
                fontWeight: 700,
                color: '#f8fafc',
              }}
            >
              🚀 For Students: 3D Games, Flashcards & Lingo-Pets
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#06b6d4',
              color: '#020617',
              borderRadius: '14px',
              padding: '14px 26px',
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            Play Now →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

