import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Badge, Flash, Pop, shake} from '../components/Motion';
import {PinIcon, TruckIcon} from '../components/Icons';
import {Product} from '../components/Product';
import {COLORS, FONTS, OFFER} from '../config';
import {HERO, PRODUCTS} from '../media';
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
        const y = 960 + Math.sin(a) * v * t + 0.9 * t * t;
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
  const tOnly = 1;
  const tSlam = Math.max(6, at('offer', 23) - 1);
  const tTruck = at('offer', 24);
  const tPin = at('offer', 25);
  const slam = spring({frame: frame - tSlam, fps, config: {damping: 7, stiffness: 240, mass: 0.7}});
  const shk = frame >= tSlam ? shake(frame, interpolate(frame, [tSlam, tSlam + 12], [18, 0], {extrapolateRight: 'clamp'})) : {x: 0, y: 0};
  const glow = 0.6 + 0.4 * Math.sin(frame / 5);
  const truck = spring({frame: frame - tTruck, fps, config: {damping: 15, stiffness: 120, mass: 0.9}});
  const product = PRODUCTS.trioCutout ?? HERO;

  return (
    <AbsoluteFill style={{transform: `translate(${shk.x}px, ${shk.y}px)`}}>
      <Background variant="price" bubbles={12} seed="offer" />
      {/* rotating sunburst */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 1.2}deg at 50% 52%, rgba(255,214,10,0.16) 0deg 9deg, rgba(255,214,10,0) 9deg 18deg)`,
          maskImage: 'radial-gradient(circle at 50% 52%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 52%, black 10%, transparent 70%)',
        }}
      />
      {/* product */}
      <div style={{position: 'absolute', left: '50%', top: 170, transform: 'translateX(-50%)'}}>
        <Pop at={0} from={0.5} y={200} bouncy={false}>
          <Product src={product} width={product === PRODUCTS.trioCutout ? 760 : 380} />
        </Pop>
      </div>
      {/* "غير بـ" */}
      <div style={{position: 'absolute', top: 760, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={tOnly} from={0.4}>
          <div dir="rtl" style={{fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 80, color: COLORS.white, background: COLORS.danger, padding: '0 40px 8px', borderRadius: 24, transform: 'rotate(-4deg)', boxShadow: '0 10px 0 #9E0F16'}}>
            غير بـ
          </div>
        </Pop>
      </div>
      {/* price */}
      {frame >= tSlam && (
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 870,
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
      {/* free delivery in <city> */}
      {frame >= tTruck && (
        <div style={{position: 'absolute', top: 1180, width: '100%', display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - truck) * 1100}px)`}}>
          <Badge fontSize={OFFER.city.length > 6 ? 58 : 66} icon={<TruckIcon size={OFFER.city.length > 6 ? 96 : 110} />} style={{paddingLeft: 40}}>
            {OFFER.delivery}{' '}
            {frame >= tPin && (
              <span style={{color: COLORS.danger, display: 'inline-flex', alignItems: 'center', gap: 6}}>
                <Pop at={tPin} from={0.2} y={-60}>
                  <PinIcon size={58} />
                </Pop>
                {OFFER.city}
              </span>
            )}
          </Badge>
        </div>
      )}
      <Flash at={tSlam} opacity={0.7} />
      <Confetti start={tSlam} />
    </AbsoluteFill>
  );
};
