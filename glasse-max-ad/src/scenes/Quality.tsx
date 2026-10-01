import React from 'react';
import {AbsoluteFill, Sequence, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {SparkleIcon} from '../components/Icons';
import {KenBurns} from '../components/Media';
import {Flash, Pop} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, FONTS} from '../config';
import {GENERATED, HERO, PRODUCTS} from '../media';
import {at} from '../timeline';

const Stars: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', gap: 14, justifyContent: 'center'}}>
      {[0, 1, 2, 3, 4].map((i) => {
        const s = spring({frame: frame - start - i * 2, fps, config: {damping: 8, stiffness: 260, mass: 0.5}});
        return (
          <svg key={i} width={64} height={64} viewBox="0 0 100 100" style={{transform: `scale(${s}) rotate(${(1 - s) * 90}deg)`}}>
            <path d="M50 5 L62 37 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 37Z" fill={COLORS.price} stroke="#B38F00" strokeWidth="4" />
          </svg>
        );
      })}
    </div>
  );
};

/** Square photo on a blurred copy of itself: framed card that punches in, slow push inside. */
const PhotoCard: React.FC<{src: string; tilt: number}> = ({src, tilt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame, fps, config: {damping: 13, stiffness: 200, mass: 0.6}});
  return (
    <AbsoluteFill>
      <KenBurns src={src} from={[1.9, 0, 0]} to={[2.0, 0, 0]} grade="blur(28px) brightness(0.8) saturate(1.1)" />
      <AbsoluteFill style={{background: 'rgba(6,26,58,0.25)'}} />
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 360,
          width: 940,
          height: 940,
          borderRadius: 44,
          overflow: 'hidden',
          border: '12px solid white',
          boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
          transform: `scale(${0.8 + 0.2 * pop}) rotate(${tilt * pop}deg)`,
        }}
      >
        <KenBurns src={src} from={[1.06, 0, 0]} to={[1.16, -2, -1]} />
      </div>
    </AbsoluteFill>
  );
};

/** "وهادشي كامل باش تحصل على ماء ذو جودة عالية" — the clean-water splash shot. */
export const Quality: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tBadge = at('quality', 21);
  const slide = spring({frame: frame - tBadge - 4, fps, config: {damping: 14, stiffness: 130}});
  // beat 1: the real installation photos (all three colours), quick cuts; beat 2: the splash shot
  const kitchens = (
    [PRODUCTS.kitchenTeal, PRODUCTS.kitchenBlack, PRODUCTS.kitchenWhite].some(Boolean)
      ? [PRODUCTS.kitchenTeal, PRODUCTS.kitchenBlack, PRODUCTS.kitchenWhite]
      : [PRODUCTS.underSinkTeal, PRODUCTS.underSinkBlack, PRODUCTS.underSinkWhite]
  ).filter(Boolean) as string[];
  const cutLen = kitchens.length ? Math.max(8, Math.floor((tBadge - 2) / kitchens.length)) : 0;
  const kIdx = Math.min(kitchens.length - 1, Math.floor(frame / Math.max(1, cutLen)));
  const showKitchen = kitchens.length > 0 && frame < tBadge - 2;

  return (
    <AbsoluteFill>
      {GENERATED.splashGlass ? (
        <KenBurns src={GENERATED.splashGlass} from={[1.28, 0, 4]} to={[1.06, 0, 0]} grade="saturate(1.1) contrast(1.05)" />
      ) : (
        <Background variant="bright" bubbles={30} seed="quality" />
      )}
      {showKitchen && (
        <Sequence key={kIdx} from={kIdx * cutLen} layout="none">
          <PhotoCard src={kitchens[kIdx]} tilt={[-3, 2.5, -2][kIdx % 3]} />
          <Flash at={0} duration={5} opacity={0.5} />
        </Sequence>
      )}
      {/* floating sparkles over the water */}
      {new Array(10).fill(0).map((_, i) => {
        const t = (frame + random(`qs${i}`) * 40) % 40;
        return (
          <div key={i} style={{position: 'absolute', left: 80 + random(`qx${i}`) * 900, top: 300 + random(`qy${i}`) * 900, opacity: Math.sin((t / 40) * Math.PI)}}>
            <SparkleIcon size={40 + random(`qz${i}`) * 50} />
          </div>
        );
      })}
      {/* bottom fade for subtitles */}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(6,26,58,0) 60%, rgba(6,26,58,0.55) 100%)'}} />
      {/* "جودة عالية" seal */}
      <div style={{position: 'absolute', top: 200, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={tBadge} from={0.2} rotate={-15}>
          <div
            style={{
              padding: '14px 56px 22px',
              borderRadius: 40,
              background: 'rgba(255,255,255,0.94)',
              boxShadow: '0 22px 50px rgba(6,26,58,0.35)',
              border: `6px solid ${COLORS.price}`,
              textAlign: 'center',
            }}
          >
            <div dir="rtl" style={{fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 96, color: COLORS.deepBlue, lineHeight: 1.25}}>
              جودة عالية
            </div>
            <Stars start={tBadge + 6} />
          </div>
        </Pop>
      </div>
      {/* product slides in beside the glass */}
      {HERO && frame >= tBadge && (
        <div style={{position: 'absolute', right: -20, top: 820, transform: `translateX(${(1 - slide) * 600}px) rotate(${(1 - slide) * 12}deg)`}}>
          <Product src={HERO} width={420} shine={tBadge + 16} />
        </div>
      )}
    </AbsoluteFill>
  );
};
