"use client";

import { useSyncExternalStore } from "react";

// Tiny Web Audio chiptune kit. The AudioContext is only created on the first
// play() call, and every play() is triggered by a click or key press, so
// browsers' autoplay rules are satisfied.

const KEY = "questlog.muted";
let muted = false;
let loaded = false;
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    muted = window.localStorage.getItem(KEY) === "1";
  } catch {
    // storage blocked: default to sound on
  }
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function useMuted() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return muted;
    },
    () => false,
  );
}

function audio(): AudioContext | null {
  if (!ctx) {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Note = [freq: number, at: number, dur: number];

function notes(list: Note[], type: OscillatorType, vol: number) {
  load();
  if (muted) return;
  let c: AudioContext | null;
  try {
    c = audio();
  } catch {
    return;
  }
  if (!c) return;
  const t0 = c.currentTime + 0.01;
  for (const [freq, at, dur] of list) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t0 + at);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + dur + 0.02);
  }
}

export const sfx = {
  select: () => notes([[660, 0, 0.05]], "square", 0.04),
  save: () =>
    notes(
      [
        [523, 0, 0.08],
        [659, 0.08, 0.08],
        [784, 0.16, 0.08],
        [1047, 0.24, 0.18],
      ],
      "square",
      0.05,
    ),
  levelUp: () =>
    notes(
      [
        [523, 0, 0.1],
        [523, 0.1, 0.1],
        [784, 0.2, 0.1],
        [1047, 0.3, 0.12],
        [880, 0.42, 0.08],
        [1047, 0.5, 0.3],
      ],
      "square",
      0.05,
    ),
  key: () => notes([[1300 + Math.random() * 300, 0, 0.015]], "square", 0.012),
  line: () => notes([[330, 0, 0.04]], "triangle", 0.05),
  final: () =>
    notes(
      [
        [262, 0, 2.2],
        [330, 0.25, 1.95],
        [392, 0.5, 1.7],
        [523, 0.75, 1.45],
      ],
      "triangle",
      0.05,
    ),
};
