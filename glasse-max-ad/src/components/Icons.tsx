import React from 'react';
import {COLORS} from '../config';

type P = {size?: number; style?: React.CSSProperties};

const svg = (size: number, style: React.CSSProperties | undefined, children: React.ReactNode, vb = '0 0 100 100') => (
  <svg width={size} height={size} viewBox={vb} style={{overflow: 'visible', ...style}}>
    {children}
  </svg>
);

export const WarningIcon: React.FC<P> = ({size = 200, style}) =>
  svg(
    size,
    style,
    <>
      <defs>
        <linearGradient id="warn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE14D" />
          <stop offset="1" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <path d="M50 6 L96 88 Q98 94 92 94 L8 94 Q2 94 4 88 Z" fill="url(#warn)" stroke="#1A1A1A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="45" y="32" width="10" height="34" rx="5" fill="#1A1A1A" />
      <circle cx="50" cy="78" r="6" fill="#1A1A1A" />
    </>,
  );

export const QuestionIcon: React.FC<P> = ({size = 200, style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="50" cy="50" r="46" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="5" />
      <text x="50" y="72" textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize="64" fill={COLORS.danger}>
        ?
      </text>
    </>,
  );

// Generic plastic water bottle — deliberately unbranded.
export const BottleIcon: React.FC<P & {tint?: string}> = ({size = 120, style, tint = '#8FD3FF'}) =>
  svg(
    size,
    style,
    <>
      <rect x="40" y="2" width="20" height="10" rx="3" fill="#2F6FD6" />
      <path d="M41 12 h18 v8 q12 8 12 22 v48 q0 8 -8 8 h-26 q-8 0 -8 -8 v-48 q0 -14 12 -22z" fill={tint} fillOpacity="0.75" stroke="#2F6FD6" strokeWidth="3" />
      <path d="M29 46 h42 M29 60 h42 M29 74 h42" stroke="#2F6FD6" strokeWidth="2.5" strokeOpacity="0.6" />
      <path d="M36 30 q-4 10 -4 22 v30" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" strokeOpacity="0.8" />
    </>,
  );

export const MoneyIcon: React.FC<P> = ({size = 140, style}) =>
  svg(
    size,
    style,
    <>
      <g transform="rotate(-12 50 50)">
        <rect x="6" y="24" width="88" height="52" rx="8" fill="#2DBE6C" stroke="#0F5E33" strokeWidth="4" />
        <rect x="14" y="32" width="72" height="36" rx="5" fill="none" stroke="#0F5E33" strokeWidth="2.5" strokeOpacity="0.6" />
        <circle cx="50" cy="50" r="12" fill="#0F5E33" fillOpacity="0.25" stroke="#0F5E33" strokeWidth="3" />
        <text x="50" y="57" textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize="18" fill="#0F5E33">
          DH
        </text>
      </g>
      <path d="M8 16 l8 -8 M90 90 l6 6 M88 12 l8 -4" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
    </>,
  );

// Moroccan tea glass with mint
export const TeaGlassIcon: React.FC<P> = ({size = 200, style}) =>
  svg(
    size,
    style,
    <>
      <defs>
        <linearGradient id="tea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2B84B" />
          <stop offset="1" stopColor="#B8661A" />
        </linearGradient>
      </defs>
      <path d="M22 14 L78 14 L70 92 Q69 96 64 96 L36 96 Q31 96 30 92 Z" fill="url(#tea)" fillOpacity="0.9" />
      <path d="M22 14 L78 14 L70 92 Q69 96 64 96 L36 96 Q31 96 30 92 Z" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeOpacity="0.9" />
      <rect x="22" y="20" width="56" height="14" fill="#E0B040" opacity="0.95" />
      <path d="M26 27 q6 -6 12 0 t12 0 t12 0 t12 0" stroke="#8A1E1E" strokeWidth="3" fill="none" />
      <path d="M58 6 q14 -10 22 4 q-12 6 -22 -4z" fill="#3DBE5A" stroke="#1E7A33" strokeWidth="2" />
      <path d="M52 10 q-4 -12 10 -14 q2 12 -10 14z" fill="#4FD46C" stroke="#1E7A33" strokeWidth="2" />
      <path d="M34 44 q-3 20 0 44" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.55" fill="none" />
    </>,
  );

export const CoffeeIcon: React.FC<P> = ({size = 200, style}) =>
  svg(
    size,
    style,
    <>
      <ellipse cx="46" cy="88" rx="40" ry="7" fill="#FFFFFF" stroke="#6B3E1F" strokeWidth="3" />
      <path d="M16 44 h60 v18 q0 22 -30 22 q-30 0 -30 -22z" fill="#FFFFFF" stroke="#6B3E1F" strokeWidth="4" />
      <ellipse cx="46" cy="44" rx="30" ry="6" fill="#6B3E1F" />
      <path d="M76 50 q16 0 14 12 q-2 10 -16 8" fill="none" stroke="#6B3E1F" strokeWidth="5" />
    </>,
  );

export const SteamIcon: React.FC<P & {t: number}> = ({size = 120, style, t}) =>
  svg(
    size,
    style,
    <>
      {[0, 1, 2].map((i) => {
        const y = ((t * 0.6 + i * 20) % 60) / 60;
        return (
          <path
            key={i}
            d={`M${30 + i * 20} ${90 - y * 30} q-10 -15 0 -30 t0 -30`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={Math.sin(y * Math.PI) * 0.8}
          />
        );
      })}
    </>,
  );

export const HeartIcon: React.FC<P & {color?: string}> = ({size = 120, style, color = '#FF4D6D'}) =>
  svg(
    size,
    style,
    <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z" fill={color} stroke="#FFFFFF" strokeWidth="4" />,
  );

export const FamilyIcon: React.FC<P> = ({size = 220, style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="28" cy="24" r="12" fill="#FFFFFF" />
      <path d="M10 92 v-30 q0 -22 18 -22 q18 0 18 22 v30z" fill="#FFFFFF" />
      <circle cx="72" cy="24" r="12" fill="#FFFFFF" />
      <path d="M54 92 v-30 q0 -22 18 -22 q18 0 18 22 v30z" fill="#FFFFFF" />
      <circle cx="50" cy="52" r="9" fill="#FFD60A" />
      <path d="M37 92 v-16 q0 -14 13 -14 q13 0 13 14 v16z" fill="#FFD60A" />
    </>,
  );

export const TruckIcon: React.FC<P> = ({size = 110, style}) =>
  svg(
    size,
    style,
    <>
      <rect x="4" y="24" width="56" height="44" rx="6" fill={COLORS.water} />
      <path d="M60 36 h20 l14 16 v16 h-34z" fill={COLORS.deepBlue} />
      <rect x="66" y="41" width="12" height="10" rx="2" fill="#BFE6FF" />
      <circle cx="24" cy="72" r="10" fill="#1A1A1A" stroke="#FFFFFF" strokeWidth="4" />
      <circle cx="76" cy="72" r="10" fill="#1A1A1A" stroke="#FFFFFF" strokeWidth="4" />
      <path d="M14 38 h30 M14 50 h22" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
    </>,
  );

export const CashIcon: React.FC<P> = ({size = 110, style}) =>
  svg(
    size,
    style,
    <>
      <rect x="10" y="30" width="84" height="46" rx="7" fill="#1E9E55" />
      <rect x="4" y="22" width="84" height="46" rx="7" fill="#2DBE6C" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="46" cy="45" r="11" fill="none" stroke="#FFFFFF" strokeWidth="4" />
      <circle cx="18" cy="45" r="4" fill="#FFFFFF" />
      <circle cx="74" cy="45" r="4" fill="#FFFFFF" />
    </>,
  );

export const ShieldIcon: React.FC<P> = ({size = 110, style}) =>
  svg(
    size,
    style,
    <>
      <path d="M50 4 L88 18 V46 Q88 78 50 96 Q12 78 12 46 V18 Z" fill={COLORS.deepBlue} stroke="#FFFFFF" strokeWidth="4" />
      <path d="M32 50 L45 63 L70 36" fill="none" stroke="#FFD60A" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  );

export const CheckIcon: React.FC<P & {progress?: number}> = ({size = 80, style, progress = 1}) =>
  svg(
    size,
    style,
    <>
      <circle cx="50" cy="50" r="46" fill={COLORS.whatsapp} />
      <path
        d="M28 52 L44 67 L73 36"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="70"
        strokeDashoffset={70 * (1 - progress)}
      />
    </>,
  );

export const CrossIcon: React.FC<P> = ({size = 70, style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="50" cy="50" r="46" fill={COLORS.danger} />
      <path d="M32 32 L68 68 M68 32 L32 68" stroke="#FFFFFF" strokeWidth="11" strokeLinecap="round" />
    </>,
  );

export const PinIcon: React.FC<P> = ({size = 70, style}) =>
  svg(
    size,
    style,
    <>
      <path d="M50 96 C50 96 16 60 16 36 A34 34 0 0 1 84 36 C84 60 50 96 50 96Z" fill={COLORS.danger} />
      <circle cx="50" cy="36" r="13" fill="#FFFFFF" />
    </>,
  );

export const DropIcon: React.FC<P & {color?: string}> = ({size = 80, style, color = COLORS.water}) =>
  svg(
    size,
    style,
    <>
      <path d="M50 4 C50 4 14 48 14 66 A36 36 0 0 0 86 66 C86 48 50 4 50 4Z" fill={color} />
      <path d="M32 64 q0 14 12 20" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
    </>,
  );

export const WhatsAppIcon: React.FC<P> = ({size = 300, style}) => (
  <svg width={size} height={size} viewBox="-6 -6 36 36" style={{overflow: 'visible', ...style}}>
    <circle cx="12" cy="12" r="17" fill={COLORS.whatsapp} />
    <path
      fill="#FFFFFF"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
    />
  </svg>
);

/** Generic chat bubble (no platform branding) for the "send us a message" CTA. */
export const ChatIcon: React.FC<P & {color?: string; dots?: number}> = ({size = 260, style, color = COLORS.chat, dots = 3}) =>
  svg(
    size,
    style,
    <>
      <path d="M50 6 C76 6 96 23 96 45 C96 67 76 84 50 84 C44 84 38 83 33 81 L12 94 L17 72 C9 64 4 55 4 45 C4 23 24 6 50 6Z" fill={color} stroke="#FFFFFF" strokeWidth="4" />
      {[34, 50, 66].map((x, i) => (
        <circle key={x} cx={x} cy={46} r={6.5} fill="#FFFFFF" opacity={i < dots ? 1 : 0.35} />
      ))}
    </>,
  );

/** Booster pump: motor body + blue head + spinning impeller. */
export const PumpIcon: React.FC<P & {spin?: number}> = ({size = 260, style, spin = 0}) =>
  svg(
    size,
    style,
    <>
      <defs>
        <linearGradient id="pumpBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A4250" />
          <stop offset="0.5" stopColor="#1C222B" />
          <stop offset="1" stopColor="#0E1217" />
        </linearGradient>
        <linearGradient id="pumpHead" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E9F6FF" />
          <stop offset="1" stopColor="#A8C8DF" />
        </linearGradient>
      </defs>
      <rect x="8" y="30" width="56" height="44" rx="10" fill="url(#pumpBody)" />
      {[38, 46, 54, 62].map((y) => (
        <rect key={y} x="14" y={y - 4} width="44" height="3" rx="1.5" fill="#566070" />
      ))}
      <path d="M62 26 h18 q12 0 12 12 v28 q0 12 -12 12 h-18z" fill="url(#pumpHead)" stroke="#5E7A92" strokeWidth="2" />
      <rect x="70" y="14" width="12" height="14" rx="3" fill="#F2F7FB" stroke="#5E7A92" strokeWidth="2" />
      <rect x="70" y="76" width="12" height="14" rx="3" fill="#F2F7FB" stroke="#5E7A92" strokeWidth="2" />
      <g transform={`rotate(${spin} 77 52)`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M77 52 q2 -9 9 -11 q-4 6 -9 11z" fill={COLORS.water} transform={`rotate(${a} 77 52)`} />
        ))}
        <circle cx="77" cy="52" r="3.5" fill={COLORS.deepBlue} />
      </g>
    </>,
  );

/** Spiral-wound RO membrane seen end-on. */
export const MembraneIcon: React.FC<P & {spin?: number}> = ({size = 260, style, spin = 0}) => {
  let d = 'M50 50';
  for (let a = 0; a < Math.PI * 9; a += 0.15) {
    const r = 2 + a * 1.55;
    d += ` L${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`;
  }
  return svg(
    size,
    style,
    <>
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke={COLORS.deepBlue} strokeWidth="4" />
      <circle cx="50" cy="50" r="44" fill="#DDF1FF" />
      <g transform={`rotate(${spin} 50 50)`}>
        <path d={d} fill="none" stroke={COLORS.water} strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="6" fill={COLORS.deepBlue} />
    </>,
  );
};

/** A filter cartridge (used for the 6 stages). */
export const CartridgeIcon: React.FC<P & {fill?: string; level?: number}> = ({size = 120, style, fill = COLORS.water, level = 1}) =>
  svg(
    size,
    style,
    <>
      <rect x="22" y="4" width="56" height="10" rx="4" fill="#E9F2F8" stroke="#7C93A8" strokeWidth="2" />
      <rect x="18" y="14" width="64" height="76" rx="12" fill="rgba(255,255,255,0.85)" stroke="#7C93A8" strokeWidth="3" />
      <clipPath id="cartClip">
        <rect x="21" y="17" width="58" height="70" rx="10" />
      </clipPath>
      <g clipPath="url(#cartClip)">
        <rect x="21" y={17 + 70 * (1 - level)} width="58" height="70" fill={fill} />
        {[30, 42, 54, 66, 78].map((y) => (
          <rect key={y} x="21" y={y} width="58" height="2.5" fill="rgba(255,255,255,0.35)" />
        ))}
      </g>
      <rect x="26" y="20" width="7" height="62" rx="3.5" fill="#FFFFFF" opacity="0.6" />
      <rect x="40" y="90" width="20" height="7" rx="2" fill="#E9F2F8" stroke="#7C93A8" strokeWidth="2" />
    </>,
  );

export const SparkleIcon: React.FC<P & {color?: string}> = ({size = 80, style, color = '#FFFFFF'}) =>
  svg(size, style, <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0Z" fill={color} />);

export const CoinIcon: React.FC<P> = ({size = 110, style}) =>
  svg(
    size,
    style,
    <>
      <circle cx="50" cy="50" r="44" fill="#FFC928" stroke="#B88400" strokeWidth="5" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#FFE68A" strokeWidth="4" />
      <text x="50" y="62" textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize="32" fill="#9A6B00">
        DH
      </text>
    </>,
  );

export const ICONS = {
  truck: TruckIcon,
  cash: CashIcon,
  shield: ShieldIcon,
};
