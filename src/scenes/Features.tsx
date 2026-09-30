import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {CrossIcon, DropIcon} from '../components/Icons';
import {GRADES, StockVideo} from '../components/Media';
import {Badge, Pop, countUp} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, FEATURE_BADGES, FONTS} from '../config';
import {PRODUCTS, STOCK} from '../media';
import {at} from '../timeline';

/** Headline that pops in at `from` and scales away at `to`. */
const Headline: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 10, stiffness: 200, mass: 0.6}});
  const out = interpolate(frame, [to - 5, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 170,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(1, s * 2) * out,
        transform: `scale(${(0.4 + 0.6 * s) * (0.8 + 0.2 * out)})`,
      }}
    >
      {children}
    </div>
  );
};

/** Circular close-up inset (crop of the real product photo). */
const Inset: React.FC<{src: string; at: number; x: number; y: number; size?: number; label?: string}> = ({src, at: t, x, y, size = 330, label}) => (
  <Pop at={t} from={0.2} style={{position: 'absolute', left: x, top: y}}>
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `8px solid ${COLORS.white}`,
        boxShadow: `0 0 0 5px ${COLORS.water}, 0 20px 40px rgba(6,26,58,0.35)`,
        background: COLORS.white,
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    {label && (
      <div dir="rtl" style={{marginTop: 10, textAlign: 'center', fontFamily: FONTS.arabic, fontWeight: 800, fontSize: 38, color: COLORS.navy}}>
        {label}
      </div>
    )}
  </Pop>
);

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const tStages = Math.max(0, at('features', 9));
  const tRemove = at('features', 11);
  const tLiters = at('features', 14);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);
  const stages = countUp(frame, tStages + 4, 20, FEATURE_BADGES.stages.value);
  const liters = countUp(frame, tLiters + 18, 28, FEATURE_BADGES.liters.value);
  const product = PRODUCTS.blueCutout ?? PRODUCTS.pairCutout;
  const install = PRODUCTS.underSinkBlue;
  // product steps aside for the chips (beat 2) and further for the installation photo (beat 3)
  const aside2 = spring({frame: frame - tRemove, fps, config: {damping: 16, stiffness: 140}});
  const aside3 = install ? spring({frame: frame - tLiters - 4, fps, config: {damping: 16, stiffness: 140}}) : 0;
  const aside = frame < tLiters ? 0.65 * aside2 : 0.65 + 0.35 * aside3 - (install ? 0 : 0.65 * aside3);

  return (
    <AbsoluteFill>
      <Background variant="bright" bubbles={16} seed="features" />
      {STOCK.features && (
        <>
          <StockVideo clip={STOCK.features} grade={GRADES.blurBg} zoom={[1.2, 1.3]} />
          <AbsoluteFill style={{background: 'rgba(234,247,255,0.55)'}} />
        </>
      )}
      {/* product, slow push-in; steps aside for the real installation photo in beat 3 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 430,
          transform: `translateX(calc(-50% + ${-230 * aside}px)) scale(${zoom * (1 - 0.18 * aside)})`,
          transformOrigin: '50% 40%',
        }}
      >
        <Product src={product} width={600} shine={tLiters + 6} />
      </div>
      {install && frame >= tLiters + 8 && (
        <Pop at={tLiters + 8} from={0.4} x={400} rotate={12} bouncy={false} style={{position: 'absolute', right: 50, top: 520}}>
          <div
            style={{
              width: 470,
              height: 700,
              borderRadius: 36,
              overflow: 'hidden',
              border: `10px solid ${COLORS.white}`,
              boxShadow: '0 30px 60px rgba(6,26,58,0.35)',
              transform: 'rotate(3deg)',
            }}
          >
            <Img
              src={staticFile(install)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: '66% 60%',
                transform: `scale(${interpolate(frame, [tLiters, durationInFrames], [1.15, 1.3])})`,
              }}
            />
          </div>
        </Pop>
      )}

      {/* Beat 1 — 6 stages */}
      <Headline from={tStages} to={tRemove}>
        <Badge fontSize={72} icon={<span style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 118, color: COLORS.water, lineHeight: 1}}>{stages}</span>}>
          {FEATURE_BADGES.stages.label}
        </Badge>
      </Headline>
      {frame >= tStages && frame < tRemove && (
        <div style={{position: 'absolute', top: 360, width: '100%', display: 'flex', justifyContent: 'center', gap: 18, direction: 'rtl'}}>
          {new Array(6).fill(0).map((_, i) => {
            const on = spring({frame: frame - tStages - 6 - i * 4, fps, config: {damping: 12, stiffness: 220}});
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Montserrat',
                  fontWeight: 900,
                  fontSize: 34,
                  color: on > 0.5 ? COLORS.white : COLORS.water,
                  background: on > 0.5 ? COLORS.water : 'rgba(255,255,255,0.8)',
                  border: `4px solid ${COLORS.water}`,
                  transform: `scale(${0.6 + 0.4 * on})`,
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      )}
      {PRODUCTS.filtersCloseup && frame < tRemove && <Inset src={PRODUCTS.filtersCloseup} at={tStages + 14} x={670} y={880} size={360} />}

      {/* Beat 2 — removes chlorine / limescale / impurities */}
      <Headline from={tRemove} to={tLiters}>
        <Badge fontSize={66} icon={<DropIcon size={80} />}>
          {FEATURE_BADGES.removes}
        </Badge>
      </Headline>
      {frame >= tRemove && frame < tLiters &&
        FEATURE_BADGES.removesChips.map((chip, i) => {
          const t = at('features', 11 + i);
          return (
            <Pop key={chip} at={t} x={-200} from={0.5} style={{position: 'absolute', right: 60, top: 470 + i * 190}}>
              <Badge fontSize={54} icon={<CrossIcon size={66} />} bg="rgba(255,255,255,0.95)">
                {chip}
              </Badge>
            </Pop>
          );
        })}

      {/* Beat 3 — 300 L per day */}
      <Headline from={tLiters} to={durationInFrames + 1}>
        <div
          dir="rtl"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            padding: '6px 44px',
            borderRadius: 40,
            background: `linear-gradient(135deg, ${COLORS.water}, ${COLORS.deepBlue})`,
            boxShadow: '0 20px 40px rgba(6,26,58,0.35)',
            color: COLORS.white,
          }}
        >
          <span style={{fontFamily: 'Montserrat', fontWeight: 900, fontSize: 140, direction: 'ltr'}}>+{liters}</span>
          <span style={{fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 64, lineHeight: 1.1}}>{FEATURE_BADGES.liters.label}</span>
        </div>
      </Headline>
      {PRODUCTS.faucetCutout && !install && frame >= tLiters && (
        <Pop at={tLiters + 10} from={0.3} x={200} style={{position: 'absolute', right: 40, top: 560}}>
          <Img src={staticFile(PRODUCTS.faucetCutout)} style={{height: 560, filter: 'drop-shadow(0 18px 24px rgba(6,26,58,0.35))'}} />
        </Pop>
      )}
    </AbsoluteFill>
  );
};
