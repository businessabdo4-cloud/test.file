import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {ChatIcon, CheckIcon, TruckIcon} from '../components/Icons';
import {Logo} from '../components/Logo';
import {Pop} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, FONTS, OFFER} from '../config';
import {HERO, PRODUCTS} from '../media';
import {at} from '../timeline';

const Ripple: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const p = ((frame + delay) % 36) / 36;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 760,
        height: 150,
        borderRadius: 999,
        border: `8px solid ${COLORS.chat}`,
        transform: `translate(-50%, -50%) scale(${1 + p * 0.22}, ${1 + p * 0.9})`,
        opacity: 1 - p,
      }}
    />
  );
};

/** Pointer hand that taps the button at `tap`. */
const Tap: React.FC<{tap: number}> = ({tap}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inn = spring({frame: frame - tap + 10, fps, config: {damping: 14, stiffness: 160}});
  const press = interpolate(frame, [tap - 2, tap, tap + 4], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < tap - 10) return null;
  return (
    <svg
      width={170}
      height={170}
      viewBox="0 0 100 100"
      style={{position: 'absolute', left: 700 + (1 - inn) * 300, top: 960 + (1 - inn) * 300, transform: `scale(${1 - press * 0.15}) rotate(-18deg)`, filter: 'drop-shadow(0 10px 18px rgba(6,26,58,0.35))'}}
    >
      <path
        d="M38 8 q8 0 8 8 v30 l4 -2 q8 -3 10 4 l2 -1 q8 -3 10 4 l2 -1 q8 -2 9 6 v20 q0 18 -18 22 h-14 q-12 0 -18 -10 l-16 -26 q-4 -8 3 -11 q6 -2 10 4 l4 6 v-45 q0 -8 8 -8z"
        fill="#FFFFFF"
        stroke={COLORS.navy}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** "صيفط لينا دابا ميساج وخلي الباقي علينا" — end card. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const beat = 1 + 0.07 * Math.max(0, Math.sin(frame / 4.5));
  const tTap = Math.max(16, at('cta', 26, 0.7));
  const tRest = at('cta', 27);
  const pressed = frame >= tTap;
  const dots = pressed ? 3 : Math.floor(frame / 5) % 4;
  const btn = spring({frame: frame - tTap, fps, config: {damping: 8, stiffness: 300, mass: 0.5}});
  const product = PRODUCTS.trioCutout ?? HERO;

  return (
    <AbsoluteFill>
      <Background variant="cta" bubbles={16} seed="cta" />
      <div style={{position: 'absolute', top: 120, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={0} from={0.5} y={-80}>
          <Logo width={560} />
        </Pop>
      </div>
      {/* products */}
      <div style={{position: 'absolute', left: '50%', top: 390, transform: 'translateX(-50%)'}}>
        <Pop at={3} from={0.5} y={150} bouncy={false}>
          <Product src={product} width={product === PRODUCTS.trioCutout ? 720 : 330} shine={20} />
        </Pop>
      </div>
      {/* the button */}
      <div style={{position: 'absolute', left: 540, top: 912, width: 0, height: 0}}>{frame > 8 && [0, 12, 24].map((d) => <Ripple key={d} delay={d} />)}</div>
      <div style={{position: 'absolute', top: 840, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={6} from={0.3} y={80}>
          <div
            dir="rtl"
            style={{
              background: pressed ? COLORS.eco : COLORS.chat,
              color: COLORS.white,
              fontFamily: FONTS.arabic,
              fontWeight: 900,
              fontSize: 84,
              padding: '6px 60px 16px',
              borderRadius: 999,
              boxShadow: `0 ${14 - 8 * btn}px 0 ${pressed ? '#15803D' : '#0B6FC0'}, 0 26px 50px rgba(6,26,58,0.3)`,
              border: '6px solid white',
              whiteSpace: 'nowrap',
              transform: `translateY(${8 * btn}px) scale(${1 + 0.06 * Math.sin(frame / 4)})`,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {pressed ? (
              <CheckIcon size={86} progress={interpolate(frame, [tTap, tTap + 8], [0, 1], {extrapolateRight: 'clamp'})} />
            ) : (
              <ChatIcon size={90} dots={dots} color={COLORS.deepBlue} style={{transform: `scale(${beat})`}} />
            )}
            صيفط لينا ميساج
          </div>
        </Pop>
      </div>
      <Tap tap={tTap} />
      {/* recap: price + delivery */}
      <div style={{position: 'absolute', top: 1060, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={Math.max(14, tRest - 6)} from={0.4} y={60}>
          <div
            dir="rtl"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              fontFamily: FONTS.arabic,
              fontWeight: 900,
              // shrink for long city names so the recap always fits the 1080 px frame
              fontSize: OFFER.city.length > 6 ? 42 : 52,
              color: COLORS.navy,
              background: 'rgba(255,255,255,0.92)',
              padding: '8px 34px 14px',
              borderRadius: 26,
              boxShadow: '0 12px 30px rgba(6,26,58,0.18)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>
              <span style={{fontFamily: FONTS.latin, color: COLORS.deepBlue}}>{OFFER.price}</span> {OFFER.currency}
            </span>
            <span style={{width: 4, height: 54, background: COLORS.sky, borderRadius: 2}} />
            <TruckIcon size={74} />
            <span>
              {OFFER.delivery} {OFFER.city}
            </span>
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
