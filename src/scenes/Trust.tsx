import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {CheckIcon, ICONS} from '../components/Icons';
import {Logo} from '../components/Logo';
import {GRADES, StockVideo} from '../components/Media';
import {Pop} from '../components/Motion';
import {COLORS, FONTS, TRUST_BADGES} from '../config';
import {STOCK} from '../media';
import {at} from '../timeline';

const Row: React.FC<{icon: keyof typeof ICONS; text: string; t: number}> = ({icon, text, t}) => {
  const frame = useCurrentFrame();
  const Icon = ICONS[icon];
  const check = interpolate(frame, [t + 6, t + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <Pop at={t} from={0.4} x={300}>
      <div
        dir="rtl"
        style={{
          width: 960,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: '22px 36px',
          borderRadius: 36,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 18px 40px rgba(6,26,58,0.22)',
          border: `4px solid ${COLORS.white}`,
        }}
      >
        <Icon size={112} />
        <div style={{flex: 1, fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 58, color: COLORS.navy, lineHeight: 1.2, whiteSpace: 'nowrap'}}>{text}</div>
        <CheckIcon size={92} progress={check} />
      </div>
    </Pop>
  );
};

export const Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const times = [at('trust', 26), at('trust', 27), at('trust', 27, 0.6)];
  const tLimited = at('trust', 28);
  const pulse = 1 + 0.07 * Math.sin((frame - tLimited) / 3);

  return (
    <AbsoluteFill>
      <Background variant="bright" bubbles={14} seed="trust" />
      {STOCK.features && (
        <>
          <StockVideo clip={STOCK.features} grade={GRADES.blurBg} zoom={[1.3, 1.35]} />
          <AbsoluteFill style={{background: 'rgba(234,247,255,0.7)'}} />
        </>
      )}
      <div style={{position: 'absolute', top: 175, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={0} from={0.5}>
          <Logo width={520} />
        </Pop>
      </div>
      <div style={{position: 'absolute', top: 470, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        {TRUST_BADGES.map((b, i) => (
          <Row key={b.text} icon={b.icon} text={b.text} t={Math.max(0, times[i])} />
        ))}
      </div>
      <div style={{position: 'absolute', top: 1150, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={tLimited} from={0.2} rotate={-15}>
          <div
            dir="rtl"
            style={{
              transform: `scale(${pulse}) rotate(-3deg)`,
              background: COLORS.danger,
              color: COLORS.white,
              fontFamily: FONTS.arabic,
              fontWeight: 900,
              fontSize: 74,
              padding: '6px 50px',
              borderRadius: 999,
              boxShadow: `0 0 ${30 + 20 * Math.sin(frame / 3)}px rgba(255,59,59,0.8)`,
              border: '5px solid white',
            }}
          >
            ⏳ العرض محدود
          </div>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
