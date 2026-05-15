'use client';
import { useEffect, useState } from 'react';
import { V1 } from './V1Atoms';

export type HeroEventItem = {
  day: string;        // 'Lun' / 'Mar' ...
  time: string;       // '21:00 — 06:00'
  name: string;
  price: string;      // '18€' / '-26 ans : 10€'
  badge?: string;     // optional sticker label, e.g. 'NEW'
  accent?: 'yellow' | 'red' | 'cream'; // chooses the highlight colour
};

const DAY_FR: Record<string, string> = {
  MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MER',
  THURSDAY: 'JEU', FRIDAY: 'VEN', SATURDAY: 'SAM', SUNDAY: 'DIM',
};

/**
 * Vertical scrolling event ticker for the right side of the V1 Acid hero.
 * Auto-cycles every 4s. Keyboard-accessible via tab.
 */
export function V1HeroEvents({ items }: { items: HeroEventItem[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        right: 80,
        bottom: 80,
        width: 'min(46%, 560px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      {/* Eyebrow label */}
      <div
        style={{
          fontFamily: 'var(--font-big-shoulders), Impact, sans-serif',
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: 6,
          color: V1.yellow,
          textTransform: 'uppercase',
          textAlign: 'right',
          opacity: 0.9,
          marginTop: 8,
        }}
      >
        ► AGENDA · CETTE SEMAINE
      </div>

      {/* Stack rotatif (les events défilent) */}
      <div style={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden' }}>
        {items.map((ev, i) => {
          const offset = i - idx;
          const isActive = offset === 0;
          const accent = ev.accent === 'red' ? V1.red : ev.accent === 'cream' ? V1.cream : V1.yellow;
          return (
            <div
              key={`${ev.day}-${ev.name}-${i}`}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: isActive ? 1 : 0,
                transform: `translateY(${offset * 24}px) scale(${isActive ? 1 : 0.96})`,
                transition: 'opacity 600ms ease, transform 600ms ease',
                pointerEvents: isActive ? 'auto' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Day badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 24px',
                  background: V1.black,
                  border: `3px solid ${accent}`,
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.5}deg)`,
                  boxShadow: `6px 6px 0 ${accent}33`,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-big-shoulders), Impact, sans-serif',
                    fontSize: 36,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: accent,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {ev.day}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-big-shoulders), Impact, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    color: V1.cream,
                    letterSpacing: 1,
                  }}
                >
                  {ev.time}
                </span>
                {ev.badge && (
                  <span
                    style={{
                      background: V1.red,
                      color: V1.white,
                      fontFamily: 'var(--font-big-shoulders), sans-serif',
                      fontWeight: 900,
                      fontSize: 11,
                      letterSpacing: 1.5,
                      padding: '3px 8px',
                    }}
                  >
                    {ev.badge}
                  </span>
                )}
              </div>

              {/* Event name */}
              <div
                style={{
                  fontFamily: 'var(--font-big-shoulders), Impact, sans-serif',
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 0.92,
                  letterSpacing: '-0.02em',
                  color: V1.cream,
                  textAlign: 'right',
                  textTransform: 'uppercase',
                  transform: 'skewX(-3deg)',
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                }}
              >
                {ev.name}
              </div>

              {/* Price sticker */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 18px',
                  background: accent,
                  color: V1.black,
                  fontFamily: 'var(--font-big-shoulders), Impact, sans-serif',
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: 2,
                  transform: `rotate(${(i % 2 === 0 ? 2 : -2)}deg)`,
                }}
              >
                ▸ {ev.price}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
        {items.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === idx ? 24 : 8,
              height: 4,
              background: i === idx ? V1.yellow : V1.cream,
              opacity: i === idx ? 1 : 0.3,
              transition: 'all 400ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { DAY_FR };
