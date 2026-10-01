import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../config';

/**
 * A cut-out product PNG (transparent background) with float, soft shadow and an
 * optional light sweep masked to the product's own shape.
 * If the file is missing, a clearly-labelled placeholder is drawn (drafts only).
 */
export const Product: React.FC<{
  src: string | null;
  width: number;
  float?: boolean;
  shine?: number | null; // frame at which a light sweep crosses the product
  shadow?: boolean;
  style?: React.CSSProperties;
  label?: string;
}> = ({src, width, float = true, shine = null, shadow = true, style, label = 'GLASSE MAX'}) => {
  const frame = useCurrentFrame();
  const bob = float ? Math.sin(frame / 18) * 10 : 0;
  const shineX = shine === null ? -200 : interpolate(frame, [shine, shine + 22], [-60, 160], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{position: 'relative', width, ...style}}>
      {shadow && (
        <div
          style={{
            position: 'absolute',
            left: '12%',
            right: '12%',
            bottom: -width * 0.035,
            height: width * 0.09,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(0,20,50,0.45), rgba(0,20,50,0))',
            transform: `scaleX(${1 - bob / 200})`,
            filter: 'blur(4px)',
          }}
        />
      )}
      <div style={{position: 'relative', transform: `translateY(${bob - 10}px)`}}>
        {src ? (
          <>
            <Img src={staticFile(src)} style={{width: '100%', display: 'block'}} />
            {shine !== null && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(105deg, transparent ${shineX - 18}%, rgba(255,255,255,0.75) ${shineX}%, transparent ${shineX + 18}%)`,
                  mixBlendMode: 'screen',
                  WebkitMaskImage: `url(${staticFile(src)})`,
                  maskImage: `url(${staticFile(src)})`,
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }}
              />
            )}
          </>
        ) : (
          <div
            style={{
              width: '100%',
              aspectRatio: '0.8',
              borderRadius: width * 0.08,
              border: `6px dashed ${COLORS.deepBlue}`,
              background: 'rgba(255,255,255,0.55)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.deepBlue,
              fontFamily: 'Montserrat',
              fontWeight: 900,
              fontSize: width * 0.07,
              textAlign: 'center',
              gap: 10,
            }}
          >
            <div>PRODUCT IMAGE</div>
            <div style={{fontSize: width * 0.05, opacity: 0.7}}>{label}</div>
          </div>
        )}
      </div>
    </div>
  );
};
