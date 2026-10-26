import { ICONS } from "./icons";
import type { Region, Teacher } from "./story";

export type { Region, Teacher };

export type Skill = {
  id: string;
  region: Region;
  title: string;
  xp: number;
  tutorialQuery: string;
  pixelIcon: string[];
  done?: boolean;
  teacher?: Teacher;
  teacherName?: string; // "Uncle Minh"
  memory?: string;
  year?: number;
};

export const tutorialUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query).replace(/%20/g, "+")}`;

// The demo opens with the `done: true` entries already checked.
// Every seeded answer is a placeholder until you replace it with the real one.
export const SKILLS: Skill[] = [
  // ── Grooming ──────────────────────────────────────────────
  {
    id: "shave", region: "grooming", title: "Shave", xp: 50,
    tutorialQuery: "how to shave for beginners", pixelIcon: ICONS.razor,
    // TODO(Kai): your real answer
    done: true, teacher: "youtube", teacherName: "YouTube", year: 2014,
    memory: "Paused the video every ten seconds. Cut my chin anyway.",
  },
  {
    id: "tie", region: "grooming", title: "Tie a tie", xp: 50,
    tutorialQuery: "how to tie a tie step by step", pixelIcon: ICONS.tie,
    // TODO(Kai): your real answer
    done: true, teacher: "youtube", teacherName: "YouTube", year: 2015,
    memory: "Grade 10 formal. Phone propped against the mirror.",
  },
  {
    id: "iron", region: "grooming", title: "Iron a shirt", xp: 40,
    tutorialQuery: "how to iron a dress shirt", pixelIcon: ICONS.iron,
    // TODO(Kai): your real answer
    done: true, teacher: "mom", teacherName: "Mom", year: 2013,
    memory: "Collar first, then the cuffs. She made me redo it twice.",
  },
  {
    id: "nails", region: "grooming", title: "Cut your nails right", xp: 20,
    tutorialQuery: "how to cut fingernails and toenails properly", pixelIcon: ICONS.clipper,
  },
  {
    id: "cologne", region: "grooming", title: "Pick a cologne", xp: 30,
    tutorialQuery: "how to choose a cologne for beginners", pixelIcon: ICONS.bottle,
  },

  // ── Hands ─────────────────────────────────────────────────
  {
    id: "tire", region: "hands", title: "Change a tire", xp: 80,
    tutorialQuery: "how to change a flat tire", pixelIcon: ICONS.tire,
    // TODO(Kai): your real answer
    done: true, teacher: "uncle", teacherName: "Uncle Minh", year: 2012,
    memory: "Summer 2012, in the parking lot. He let me do every bolt.",
  },
  {
    id: "jump", region: "hands", title: "Jump-start a car", xp: 70,
    tutorialQuery: "how to jump start a car safely", pixelIcon: ICONS.bolt,
    // TODO(Kai): your real answer
    done: true, teacher: "reddit", teacherName: "r/MechanicAdvice", year: 2017,
    memory: "Red to dead, red to good, black to good, black to metal.",
  },
  {
    id: "drill", region: "hands", title: "Use a drill", xp: 50,
    tutorialQuery: "how to use a power drill for beginners", pixelIcon: ICONS.drill,
    // TODO(Kai): your real answer
    done: true, teacher: "self", teacherName: "Trial & Error", year: 2016,
    memory: "Three holes in the wall where one shelf should be.",
  },
  {
    id: "tap", region: "hands", title: "Fix a leaky tap", xp: 60,
    tutorialQuery: "how to fix a leaky faucet", pixelIcon: ICONS.drop,
  },
  {
    id: "steak", region: "hands", title: "Grill a steak", xp: 50,
    tutorialQuery: "how to grill a steak perfectly", pixelIcon: ICONS.flame,
    // TODO(Kai): your real answer
    done: true, teacher: "friend", teacherName: "Tuan", year: 2018,
    memory: "His backyard. \"Stop poking it.\"",
  },

  // ── Money ─────────────────────────────────────────────────
  {
    id: "bank", region: "money", title: "Open a bank account", xp: 40,
    tutorialQuery: "how to open a bank account first time", pixelIcon: ICONS.bank,
    // TODO(Kai): your real answer
    done: true, teacher: "mom", teacherName: "Mom", year: 2011,
    memory: "She took a morning off work to sit in the branch with me.",
  },
  {
    id: "taxes", region: "money", title: "File taxes", xp: 90,
    tutorialQuery: "how to file taxes for the first time", pixelIcon: ICONS.paper,
    // TODO(Kai): your real answer
    done: true, teacher: "youtube", teacherName: "YouTube", year: 2019,
    memory: "Two videos and a lot of hoping.",
  },
  {
    id: "salary", region: "money", title: "Negotiate salary", xp: 100,
    tutorialQuery: "how to negotiate salary job offer", pixelIcon: ICONS.coin,
  },
  {
    id: "credit", region: "money", title: "Build credit", xp: 70,
    tutorialQuery: "how to build credit from scratch", pixelIcon: ICONS.card,
  },

  // ── People ────────────────────────────────────────────────
  {
    id: "handshake", region: "people", title: "Firm handshake", xp: 30,
    tutorialQuery: "how to give a good handshake", pixelIcon: ICONS.hand,
    // TODO(Kai): your real answer
    done: true, teacher: "teacher", teacherName: "Coach Daniel", year: 2013,
    memory: "Eye contact, two pumps, let go. Made the whole team practise.",
  },
  {
    id: "askout", region: "people", title: "Ask someone out", xp: 80,
    tutorialQuery: "how to ask someone out confidently", pixelIcon: ICONS.heart,
  },
  {
    id: "apologise", region: "people", title: "Apologise properly", xp: 70,
    tutorialQuery: "how to apologize sincerely", pixelIcon: ICONS.speech,
  },
  {
    id: "breakup", region: "people", title: "Handle a breakup", xp: 90,
    tutorialQuery: "how to deal with a breakup", pixelIcon: ICONS.brokenHeart,
    // TODO(Kai): your real answer
    done: true, teacher: "friend", teacherName: "Tuan", year: 2020,
    memory: "Showed up with pho and didn't ask questions.",
  },

  // ── Inner ─────────────────────────────────────────────────
  {
    id: "notokay", region: "inner", title: "Say \"I'm not okay\"", xp: 120,
    tutorialQuery: "how to tell someone you are not okay", pixelIcon: ICONS.sadFace,
  },
  {
    id: "cry", region: "inner", title: "Cry without shame", xp: 120,
    tutorialQuery: "why it is okay for men to cry", pixelIcon: ICONS.tear,
  },
  {
    id: "anger", region: "inner", title: "Control anger", xp: 100,
    tutorialQuery: "how to control anger techniques", pixelIcon: ICONS.calm,
  },
  {
    id: "help", region: "inner", title: "Ask for help", xp: 120,
    tutorialQuery: "how to ask for help when you need it", pixelIcon: ICONS.lifebuoy,
  },
];
