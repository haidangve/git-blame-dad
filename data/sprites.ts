// Original character sprites. "." = transparent; other chars map through the palette.

export const HERO_PALETTE: Record<string, string> = {
  k: "#1b1410", // outline
  h: "#3b2414", // hair
  s: "#e8b07a", // skin
  e: "#1b1410", // eyes
  m: "#b0563b", // mouth
  b: "#3f8f8a", // shirt
  r: "#2a5f5c", // backpack strap
  p: "#f2a93b", // backpack
  l: "#2f3a63", // jeans
  f: "#e8e2d0", // sneakers
  d: "#5a3a24", // stubble (older hero)
  w: "#c9c9c9", // grey streak (older hero)
};

/** The kid with the backpack. 13 x 16. */
export const HERO = [
  "....kkkkk....",
  "...khhhhhk...",
  "..khhhhhhhk..",
  "..khssssshk..",
  "..ksesssesk..",
  "..ksssmsssk..",
  "...kkssskkpp.",
  ".kbbrbbbrbbpk",
  ".kbbrbbbrbbpk",
  ".ksbbbbbbbspk",
  ".kkbbbbbbbkpk",
  "..klllllllk..",
  "..klllklllk..",
  "..klllklllk..",
  "..kffkkkffk..",
  ".kkkkk.kkkkk.",
];

/** Second idle frame: blink + backpack settles a pixel. */
export const HERO_IDLE = [
  "....kkkkk....",
  "...khhhhhk...",
  "..khhhhhhhk..",
  "..khssssshk..",
  "..ksssssssk..",
  "..ksssmsssk..",
  "...kkssskk...",
  ".kbbrbbbrbbpp",
  ".kbbrbbbrbbpk",
  ".ksbbbbbbbspk",
  ".kkbbbbbbbkpk",
  "..klllllllk..",
  "..klllklllk..",
  "..klllklllk..",
  "..kffkkkffk..",
  ".kkkkk.kkkkk.",
];

/** The same hero, grown up: taller, stubble, grey streak, no backpack. 13 x 20. */
export const HERO_OLDER = [
  "....kkkkk....",
  "...khhwhhk...",
  "..khhhwhhhk..",
  "..khssssshk..",
  "..ksesssesk..",
  "..ksssssssk..",
  "..ksdmmmdsk..",
  "...kdddddk...",
  "....kssk.....",
  ".kkbbbbbbbkk.",
  "kbbbbbbbbbbbk",
  "kbbbbbbbbbbbk",
  "ksbbbbbbbbbsk",
  "ksbbbbbbbbbsk",
  "kkkbbbbbbbkkk",
  "..klllllllk..",
  "..klllklllk..",
  "..klllklllk..",
  "..klllklllk..",
  "..kffk.kffk..",
  ".kkkkk.kkkkk.",
];

/** A small new kid, holding up a hand to the older hero. 9 x 11. */
export const NEW_KID = [
  "..kkkkk..",
  ".khhhhhk.",
  ".khssshk.",
  ".ksesesk.",
  ".ksssssk.",
  "..kkskk.k",
  ".kppppkks",
  ".kppppkk.",
  "..kllllk.",
  "..klkklk.",
  ".kkk.kkk.",
];

export const NEW_KID_PALETTE: Record<string, string> = { ...HERO_PALETTE, h: "#1b1410", p: "#d870b0" };

/** Pixel moon, cream with craters. */
export const MOON = [
  "..kkkk..",
  ".kwwwwk.",
  "kwwwgwwk",
  "kwgwwwwk",
  "kwwwwgwk",
  "kwwgwwwk",
  ".kwwwwk.",
  "..kkkk..",
];
export const MOON_PALETTE: Record<string, string> = { k: "#c9b98a", w: "#f4ecd0", g: "#d8cba0" };
