import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {PinIcon, WhatsAppIcon} from '../components/Icons';
import {Logo} from '../components/Logo';
import {Pop} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, CONTACT, FONTS} from '../config';
import {PRODUCTS} from '../media';

const Ripple: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const p = ((frame + delay) % 36) / 36;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        border: `8px solid ${COLORS.whatsapp}`,
        transform: `translate(-50%, -50%) scale(${1 + p * 0.9})`,
        opacity: 1 - p,
      }}
    />
  );
};

export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = 1 + 0.07 * Math.max(0, Math.sin(frame / 4.5));
  return (
    <AbsoluteFill>
      <Background variant="cta" bubbles={16} seed="cta" />
      <div style={{position: 'absolute', top: 140, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={0} from={0.5} y={-80}>
          <Logo width={470} />
        </Pop>
      </div>
      {/* WhatsApp icon */}
      <div style={{position: 'absolute', left: 540, top: 640, width: 0, height: 0}}>
        {frame > 4 && [0, 12, 24].map((d) => <Ripple key={d} delay={d} />)}
        <Pop at={2} from={0.1} rotate={-40} style={{position: 'absolute', left: -150, top: -150}}>
          <div style={{transform: `scale(${beat})`, filter: 'drop-shadow(0 20px 40px rgba(37,211,102,0.55))'}}>
            <WhatsAppIcon size={300} />
          </div>
        </Pop>
      </div>
      {/* phone number */}
      <div style={{position: 'absolute', top: 850, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={8} from={0.3} y={80}>
          <div
            dir="ltr"
            style={{
              background: COLORS.whatsapp,
              color: COLORS.white,
              fontFamily: 'Montserrat',
              fontWeight: 900,
              fontSize: 104,
              padding: '10px 48px',
              borderRadius: 999,
              letterSpacing: 2,
              boxShadow: '0 14px 0 #169C4B, 0 26px 50px rgba(6,26,58,0.3)',
              border: '6px solid white',
              whiteSpace: 'nowrap',
            }}
          >
            {CONTACT.phone}
          </div>
        </Pop>
      </div>
      {/* address */}
      <div style={{position: 'absolute', top: 1030, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={14} from={0.4} y={60}>
          <div dir="rtl" style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 64, color: COLORS.navy}}>
            <PinIcon size={72} />
            <span>{CONTACT.address}</span>
          </div>
        </Pop>
      </div>
      {/* product pair */}
      <div style={{position: 'absolute', left: '50%', top: 1150, transform: 'translateX(-50%)', opacity: interpolate(frame, [16, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <Product src={PRODUCTS.pairCutout ?? PRODUCTS.blueCutout} width={PRODUCTS.pairCutout ? 560 : 330} />
      </div>
    </AbsoluteFill>
  );
};
