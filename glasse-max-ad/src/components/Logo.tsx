import React from 'react';
import {Img, staticFile} from 'remotion';
import {LOGO} from '../media';

/**
 * WATER MAROC logo. If assets/logo.png is set in media.json the original file is used;
 * otherwise this vector re-drawing of the supplied logo is rendered.
 */
export const Logo: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => {
  if (LOGO) {
    return <Img src={staticFile(LOGO)} style={{width, height: 'auto', ...style}} />;
  }
  const stroke = '#0B2451';
  const fill = '#15B4F2';
  return (
    <svg viewBox="95 322 1118 488" width={width} style={style}>
      <g fill={fill} stroke={stroke} strokeWidth={9} strokeLinejoin="round">
        <path d="M440,690 C380,650 300,560 245,480 C215,440 190,432 165,435 C120,440 100,480 108,525 C120,590 190,650 270,675 C330,693 400,695 440,690 Z" />
        <path d="M420,588 C418,520 430,470 455,410 C470,375 468,345 440,338 C395,328 345,360 335,410 C325,470 370,540 420,588 Z" />
        <path d="M370,740 C320,722 260,700 210,692 C170,686 148,700 147,725 C147,755 175,775 220,772 C270,768 320,755 370,740 Z" />
      </g>
      <text
        x={435}
        y={796}
        fontFamily="Open Sans"
        fontStyle="italic"
        fontWeight={700}
        fontSize={122}
        textLength={768}
        lengthAdjust="spacingAndGlyphs"
      >
        <tspan fill="#14AEEF">WATER </tspan>
        <tspan fill="#0D2350">MAROC</tspan>
      </text>
    </svg>
  );
};
