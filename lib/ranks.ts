import { RANKS } from "@/data/story";

export const XP_PER_LEVEL = 100;
export const levelFor = (xp: number) => Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
export const rankFor = (level: number) => (RANKS.find((r) => level >= r.min) ?? RANKS[RANKS.length - 1]).title;
