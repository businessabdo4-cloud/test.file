import React, { createContext, useContext } from "react";

export type Box = { x: number; y: number; w: number; h: number };
export type BotPlace = { cx: number; bottom: number; width: number };
export type SubsPlace = { x: number; bottom: number; w: number; align: "left" | "center"; size: number };

export interface Layout {
  w: number;
  h: number;
  portrait: boolean;
  /** Platform safe zone (9:16 avoids the top bar, the bottom ~20 % and the right-hand action column). */
  safe: { top: number; bottom: number; left: number; right: number };
  bot: { hook: BotPlace; corner: BotPlace; end: BotPlace };
  subs: { hook: SubsPlace; corner: SubsPlace; end: SubsPlace };
  /** Unit scale for type and graphics (1 = 9:16 design size). */
  s: number;
}

export const LAYOUT_9x16: Layout = {
  w: 1080,
  h: 1920,
  portrait: true,
  safe: { top: 220, bottom: 1530, left: 60, right: 950 },
  bot: {
    hook: { cx: 505, bottom: 1372, width: 420 },
    corner: { cx: 190, bottom: 1505, width: 260 },
    end: { cx: 290, bottom: 1510, width: 355 },
  },
  subs: {
    hook: { x: 60, bottom: 1505, w: 890, align: "center", size: 54 },
    corner: { x: 340, bottom: 1490, w: 610, align: "left", size: 50 },
    end: { x: 520, bottom: 1440, w: 430, align: "left", size: 54 },
  },
  s: 1,
};

export const LAYOUT_1x1: Layout = {
  w: 1080,
  h: 1080,
  portrait: false,
  safe: { top: 50, bottom: 1035, left: 50, right: 1030 },
  bot: {
    hook: { cx: 540, bottom: 925, width: 285 },
    corner: { cx: 140, bottom: 1040, width: 185 },
    end: { cx: 855, bottom: 900, width: 300 },
  },
  subs: {
    hook: { x: 60, bottom: 1035, w: 960, align: "center", size: 42 },
    corner: { x: 270, bottom: 1020, w: 760, align: "left", size: 42 },
    end: { x: 60, bottom: 1035, w: 960, align: "center", size: 44 },
  },
  s: 0.72,
};

const Ctx = createContext<Layout>(LAYOUT_9x16);
export const LayoutProvider: React.FC<{ layout: Layout; children: React.ReactNode }> = ({ layout, children }) =>
  React.createElement(Ctx.Provider, { value: layout }, children);
export const useLayout = () => useContext(Ctx);
