// All the words in the game that aren't skill titles live here. Edit freely.

export type Teacher = "youtube" | "reddit" | "uncle" | "aunt" | "friend" | "mom" | "teacher" | "self" | "dad";
export type Region = "grooming" | "hands" | "money" | "people" | "inner";

export const TITLE = {
  title: "QUEST LOG",
  subtitle: "Skills I was supposed to learn from my dad.",
  start: "PRESS START",
};

export const REGIONS: { id: Region; name: string; blurb: string }[] = [
  { id: "grooming", name: "Grooming", blurb: "The bathroom-mirror lessons. Usually learned the morning you needed them." },
  { id: "hands", name: "Hands", blurb: "Things you fix in a parking lot while pretending you've done it before." },
  { id: "money", name: "Money", blurb: "Nobody explains this part. You find out by getting it wrong once." },
  { id: "people", name: "People", blurb: "Talking to humans. No tutorial covers the second attempt." },
  { id: "inner", name: "Inner", blurb: "The hardest region. No XP bar shows how long these take." },
];

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
  header: "git blame --life",
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
  epilogue: "QUEST LOG — for the kids still figuring it out alone.",
  startOwn: "START YOUR OWN QUEST",
  helpLine:
    "If you're going through something heavier, talk to someone you trust, or look up a mentoring program like Big Brothers Big Sisters.",
};
