// All the words in the game that aren't skill titles live here. Edit freely.

export type Teacher = "youtube" | "reddit" | "uncle" | "aunt" | "friend" | "mom" | "teacher" | "self" | "dad";
export type Region = "grooming" | "hands" | "money" | "people" | "inner" | "backyard" | "side";

export const TITLE = {
  title: "git blame --dad",
  subtitle: "Skills I was supposed to learn from my dad.",
  start: "PRESS START",
  continue: "CONTINUE",
  story: "WATCH KAI'S STORY",
  hall: "HALL OF BLAME",
  login: "LOG IN TO COMPARE",
};

export const REGIONS: { id: Region; name: string; blurb: string }[] = [
  { id: "grooming", name: "Grooming", blurb: "The bathroom-mirror lessons. Usually learned the morning you needed them." },
  { id: "hands", name: "Hands", blurb: "Things you fix in a parking lot while pretending you've done it before." },
  { id: "money", name: "Money", blurb: "Nobody explains this part. You find out by getting it wrong once." },
  { id: "people", name: "People", blurb: "Talking to humans. No tutorial covers the second attempt." },
  { id: "inner", name: "Inner", blurb: "The hardest region. No XP bar shows how long these take." },
  { id: "backyard", name: "Backyard", blurb: "What other kids learned on a Saturday afternoon. Some of us learned it at twenty-five." },
  { id: "side", name: "Side Quests", blurb: "The ones nobody put on the list. Write your own." },
];

/** Regions with a fixed quest list. Side quests are written by the player. */
export const MAP_REGIONS: Region[] = ["grooming", "hands", "money", "people", "inner", "backyard"];

export const TEACHERS: Record<Teacher, { label: string; short: string; color: string; icon: string[] }> = {
  youtube: {
    label: "YouTube",
    short: "YouTube",
    color: "#e04b3a",
    icon: ["kkkkkkk", "kkwkkkk", "kkwwkkk", "kkwwwkk", "kkwwkkk", "kkwkkkk", "kkkkkkk"],
  },
  reddit: {
    label: "Reddit / Forums",
    short: "Reddit",
    color: "#ff7a2f",
    icon: ["...k...", "..kkk..", ".k.k.k.", "kkkkkkk", "k.k.k.k", "kkkkkkk", ".k...k."],
  },
  uncle: {
    label: "Uncle",
    short: "Uncle",
    color: "#4f8fd9",
    icon: [".kkkkk.", "kkkkkkk", ".k.k.k.", ".kkkkk.", "..kkk..", ".kkkkk.", "kkkkkkk"],
  },
  aunt: {
    label: "Aunt",
    short: "Aunt",
    color: "#3fc1b0",
    icon: ["..kkk..", ".kkkkk.", "..kkk..", ".kkkkk.", "kkkkkkk", ".kkkkk.", "kk...kk"],
  },
  friend: {
    label: "Friend",
    short: "Friend",
    color: "#5fbf6a",
    icon: [".k...k.", "kkk.kkk", ".k...k.", "kkk.kkk", "kkkkkkk", "k.kkk.k", "k.k.k.k"],
  },
  mom: {
    label: "Mom",
    short: "Mom",
    color: "#d870b0",
    icon: [".kk.kk.", "kkkkkkk", "kkkkkkk", "kkkkkkk", ".kkkkk.", "..kkk..", "...k..."],
  },
  teacher: {
    label: "Teacher / Coach",
    short: "Coach",
    color: "#8f6ad6",
    icon: ["kkkkkkk", "k.....k", "k.kkk.k", "k.....k", "kkkkkkk", "...k...", "..kkk.."],
  },
  self: {
    label: "Trial & Error",
    short: "Trial&Error",
    color: "#a8a8a8",
    icon: ["..kkk..", ".k...k.", ".....k.", "....k..", "...k...", ".......", "...k..."],
  },
  dad: {
    label: "Dad",
    short: "Dad",
    color: "#f2a93b",
    icon: ["..kkk..", ".kkkkk.", ".kkkkk.", "..kkk..", ".kkkkk.", "kkkkkkk", "kkkkkkk"],
  },
};

export const TEACHER_ORDER: Teacher[] = ["youtube", "reddit", "uncle", "aunt", "friend", "mom", "teacher", "self", "dad"];

export const QUEST_LOG = {
  heading: "QUEST LOG",
  blameThreshold: 8,
  blameButton: "RUN git blame me",
  blameLocked: (n: number) => `Complete ${n} more quest${n === 1 ? "" : "s"} to run git blame`,
  tutorial: "Tutorial ▶",
  settings: "SETTINGS",
  resetSave: "Reset save",
  resetConfirm: "Back to Kai's save?",
  clearConfirm: "Wipe this log and start over?",
  clearSave: "Start over",
  achievements: "BADGES",
  addSide: "+ WRITE A SIDE QUEST",
  sideLimit: (max: number) => `Side quest log is full (${max}).`,
  deleteSide: "Delete this side quest",
};

/** Rank titles by level. The first entry whose min is <= level wins, so keep them descending. */
export const RANKS: { min: number; title: string }[] = [
  { min: 25, title: "The One Who Teaches" },
  { min: 20, title: "Village Elder" },
  { min: 15, title: "Self-Made" },
  { min: 10, title: "Self-Taught" },
  { min: 6, title: "Journeyman" },
  { min: 3, title: "Apprentice" },
  { min: 1, title: "Lost Kid" },
];

export const SIDE = {
  title: "NEW SIDE QUEST",
  label: "What did you have to figure out?",
  placeholder: "e.g. Talk to a landlord, Hold a baby",
  create: "ADD QUEST",
  xp: 40,
  max: 12,
};

export const NAV = {
  home: "git blame --dad",
  hall: "HALL OF BLAME",
  login: "LOG IN",
  story: "Kai's story",
  me: "MY PROFILE",
  offline: "Playing as a guest. Progress is saved in this browser only.",
};

export const MODAL = {
  question: "WHO TAUGHT YOU THIS?",
  namePlaceholder: "Their name (optional), e.g. Uncle Minh",
  memoryPlaceholder: "One line of memory, e.g. summer 2012, in the parking lot",
  yearLabel: "Year",
  save: "SAVE",
  cancel: "BACK",
  uncheck: "Uncheck this quest",
  photoLabel: "Photo of the moment (optional)",
  photoAdd: "+ ADD PHOTO",
  photoChange: "CHANGE",
  photoRemove: "remove",
  photoError: "Couldn't read that image. Try a JPG or PNG.",
  photoHeic: "That's an iPhone HEIC photo, which this browser can't open. Export it as JPG (or screenshot it) and try again.",
  photoDropHint: "or drag one here / paste",
  photoDropNow: "drop it!",
  viewPhoto: "View photo",
  close: "CLOSE",
  saveFailed: "Couldn't save the last change: storage is full or blocked. Try removing a photo.",
};

export const RECAP = {
  header: "git blame --dad",
  dadMeter: "DAD METER",
  dadPresent: "Dad present",
  showedUp: "Showed up",
  noPhoto: "no photo, just the memory",
  taughtBy: "TAUGHT BY",
  prev: "◀",
  next: "▶",
  pause: "PAUSE",
  play: "PLAY",
  skip: "TALLY ▶▶",
  tallyTitle: "THE TALLY",
  questsCleared: "Quests cleared",
  years: "Years on the road",
  xp: "XP earned",
  whoShowedUp: "WHO SHOWED UP",
  dadShare: "DAD'S SHARE OF MY GROWING UP",
  dadShareDetail: (quests: number, total: number, xp: number) =>
    `${quests} of ${total} quests · ${xp} XP`,
  continue: "CONTINUE ▶",
};

export const BLAME = {
  // TODO(Kai): your name for the final commit
  authorName: "Kai Nguyen",
  // TODO(Kai): your final line. Left blank, the game uses defaultFinalLine.
  finalLine: "",
  defaultFinalLine: "I'll teach these myself. Every line.",
  epilogue: "git blame --dad — for the kids still figuring it out alone.",
  startOwn: "START YOUR OWN QUEST",
  helpLine:
    "If you're going through something heavier, talk to someone you trust, or look up a mentoring program like Big Brothers Big Sisters.",
};
