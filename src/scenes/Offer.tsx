import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Flash, Pop, shake} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, FONTS, OFFER} from '../config';
import {PRODUCTS} from '../media';
import {at} from '../timeline';

const Confetti: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const colors = [COLORS.price, COLORS.white, COLORS.water, COLORS.redLight, '#7CFFB2'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(60).fill(0).map((_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const v = 18 + random(`cv${i}`) * 30;
        const x = 540 + Math.cos(a) * v * t;
        const y = 1180 + Math.sin(a) * v * t + 0.9 * t * t;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 16,
              height: 30,
              background: colors[i % colors.length],
              transform: `rotate(${t * 20 + i * 40}deg)`,
              opacity: interpolate(t, [0, 30, 45], [1, 1, 0], {extrapolateRight: 'clamp'}),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tOld = 3;
  const tStrike = Math.max(tOld + 10, at('offer', 24, 0.35));
  const tSlam = Math.max(tStrike + 6, at('offer', 25, 0.3));
  const strike = interpolate(frame, [tStrike, tStrike + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slam = spring({frame: frame - tSlam, fps, config: {damping: 7, stiffness: 240, mass: 0.7}});
  const shk = frame >= tSlam ? shake(frame, interpolate(frame, [tSlam, tSlam + 12], [18, 0], {extrapolateRight: 'clamp'})) : {x: 0, y: 0};
  const glow = 0.6 + 0.4 * Math.sin(frame / 5);
  const promoPulse = 1 + 0.06 * Math.sin(frame / 3.5);

  return (
    <AbsoluteFill style={{transform: `translate(${shk.x}px, ${shk.y}px)`}}>
      <Background variant="price" bubbles={12} seed="offer" />
      {/* rotating sunburst */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 1.2}deg at 50% 62%, rgba(255,214,10,0.16) 0deg 9deg, rgba(255,214,10,0) 9deg 18deg)`,
          maskImage: 'radial-gradient(circle at 50% 62%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 62%, black 10%, transparent 70%)',
        }}
      />
      {/* PROMO badge */}
      <div style={{position: 'absolute', top: 160, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={0} from={0.2} rotate={-30}>
          <div
            style={{
              transform: `rotate(-5deg) scale(${promoPulse})`,
              background: COLORS.danger,
              color: COLORS.white,
              fontFamily: 'Montserrat',
              fontWeight: 900,
              fontSize: 96,
              padding: '4px 50px',
              borderRadius: 24,
              letterSpacing: 4,
              boxShadow: '0 14px 0 #9E0F16, 0 24px 50px rgba(0,0,0,0.4)',
              border: '5px solid white',
            }}
          >
            {OFFER.promoLabel}
          </div>
        </Pop>
      </div>
      {/* product */}
      <div style={{position: 'absolute', left: '50%', top: 360, transform: 'translateX(-50%)'}}>
        <Pop at={1} from={0.5} y={200} bouncy={false}>
          <Product src={PRODUCTS.pairCutout ?? PRODUCTS.blueCutout} width={PRODUCTS.pairCutout ? 640 : 420} />
        </Pop>
      </div>
      {/* old price */}
      <div style={{position: 'absolute', top: 905, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={tOld} from={0.4}>
          <div dir="rtl" style={{position: 'relative', fontFamily: FONTS.arabic, fontWeight: 800, fontSize: 84, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2}}>
            <span style={{fontFamily: 'Montserrat', fontWeight: 800}}>{OFFER.oldPrice}</span> {OFFER.currency}
            <div
              style={{
                position: 'absolute',
                left: -16,
                top: '52%',
                height: 12,
                width: `calc(${strike * 100}% + ${strike * 32}px)`,
                background: COLORS.danger,
                borderRadius: 6,
                transform: 'rotate(-4deg)',
                transformOrigin: 'left center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            />
          </div>
        </Pop>
      </div>
      {/* new price */}
      {frame >= tSlam && (
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 1000,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'baseline',
            gap: 26,
            transform: `scale(${interpolate(slam, [0, 1], [3.2, 1])})`,
            opacity: Math.min(1, slam * 3),
            color: COLORS.price,
            textShadow: `0 0 ${40 * glow}px rgba(255,214,10,0.9), 0 10px 0 #B38F00, 0 20px 40px rgba(0,0,0,0.5)`,
          }}
        >
          <span style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 250, lineHeight: 1}}>{OFFER.price}</span>
          <span style={{fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 110}}>{OFFER.currency}</span>
        </div>
      )}
      <Flash at={tSlam} opacity={0.7} />
      <Confetti start={tSlam} />
    </AbsoluteFill>
  );
};
