"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";

// ==========================================
// 1. MUSIC THEORY CONSTANTS
// ==========================================
const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

interface ChordDefinition {
  name: string;
  symbol: string;
  intervals: number[];
  intervalNames: string[];
  intervalRoles: string[];
}

const CHORD_DEFINITIONS: Record<string, ChordDefinition> = {
  maj: { name: 'Major', symbol: '', intervals: [0, 4, 7], intervalNames: ['1', '3', '5'], intervalRoles: ['Root', '3rd', '5th'] },
  min: { name: 'Minor', symbol: 'm', intervals: [0, 3, 7], intervalNames: ['1', 'b3', '5'], intervalRoles: ['Root', 'Min 3rd', '5th'] },
  '7': { name: 'Dom 7th', symbol: '7', intervals: [0, 4, 7, 10], intervalNames: ['1', '3', '5', 'b7'], intervalRoles: ['Root', '3rd', '5th', 'Dom 7th'] },
  m7: { name: 'Min 7th', symbol: 'm7', intervals: [0, 3, 7, 10], intervalNames: ['1', 'b3', '5', 'b7'], intervalRoles: ['Root', 'Min 3rd', '5th', 'Min 7th'] },
  maj7: { name: 'Maj 7th', symbol: 'maj7', intervals: [0, 4, 7, 11], intervalNames: ['1', '3', '5', '7'], intervalRoles: ['Root', '3rd', '5th', 'Maj 7th'] },
  dim: { name: 'Dim', symbol: 'dim', intervals: [0, 3, 6], intervalNames: ['1', 'b3', 'b5'], intervalRoles: ['Root', 'Min 3rd', 'Dim 5th'] },
  dim7: { name: 'Dim 7th', symbol: 'dim7', intervals: [0, 3, 6, 9], intervalNames: ['1', 'b3', 'b5', 'bb7'], intervalRoles: ['Root', 'Min 3rd', 'Dim 5th', 'Dim 7th'] },
  m7b5: { name: 'm7b5', symbol: 'm7b5', intervals: [0, 3, 6, 10], intervalNames: ['1', 'b3', 'b5', 'b7'], intervalRoles: ['Root', 'Min 3rd', 'Dim 5th', 'Min 7th'] },
  aug: { name: 'Aug', symbol: 'aug', intervals: [0, 4, 8], intervalNames: ['1', '3', '#5'], intervalRoles: ['Root', '3rd', 'Aug 5th'] },
  sus4: { name: 'Sus4', symbol: 'sus4', intervals: [0, 5, 7], intervalNames: ['1', '4', '5'], intervalRoles: ['Root', '4th', '5th'] },
  sus2: { name: 'Sus2', symbol: 'sus2', intervals: [0, 2, 7], intervalNames: ['1', '2', '5'], intervalRoles: ['Root', '2nd', '5th'] },
  '6': { name: '6th', symbol: '6', intervals: [0, 4, 7, 9], intervalNames: ['1', '3', '5', '6'], intervalRoles: ['Root', '3rd', '5th', '6th'] },
  m6: { name: 'Min 6th', symbol: 'm6', intervals: [0, 3, 7, 9], intervalNames: ['1', 'b3', '5', '6'], intervalRoles: ['Root', 'Min 3rd', '5th', '6th'] }
};

// Instrument Configs
export type InstrumentType = 'ukulele' | 'guitar';

interface InstrumentString {
  stringNum: number;
  name: string;
  midi: number;
  midiLow?: number;
  semitone: number;
  y: number;
  gauge: number;
}

const UKULELE_STRINGS: InstrumentString[] = [
  { stringNum: 1, name: 'A', midi: 69, midiLow: 69, semitone: 9, y: 20, gauge: 1.8 },
  { stringNum: 2, name: 'E', midi: 64, midiLow: 64, semitone: 4, y: 40, gauge: 2.2 },
  { stringNum: 3, name: 'C', midi: 60, midiLow: 60, semitone: 0, y: 60, gauge: 3.0 },
  { stringNum: 4, name: 'G', midi: 67, midiLow: 55, semitone: 7, y: 80, gauge: 2.4 }
];

const GUITAR_STRINGS: InstrumentString[] = [
  { stringNum: 1, name: 'E', midi: 64, semitone: 4, y: 15, gauge: 1.5 },
  { stringNum: 2, name: 'B', midi: 59, semitone: 11, y: 31, gauge: 1.8 },
  { stringNum: 3, name: 'G', midi: 55, semitone: 7, y: 47, gauge: 2.2 },
  { stringNum: 4, name: 'D', midi: 50, semitone: 2, y: 63, gauge: 2.6 },
  { stringNum: 5, name: 'A', midi: 45, semitone: 9, y: 79, gauge: 3.0 },
  { stringNum: 6, name: 'E', midi: 40, semitone: 4, y: 95, gauge: 3.6 }
];

const UKULELE_CAGFD_ARCHETYPES: Record<string, Array<{ name: string; frets: number[]; root: number }>> = {
  maj: [
    { name: 'C-Shape', frets: [0, 0, 0, 3], root: 0 },
    { name: 'A-Shape', frets: [2, 1, 0, 0], root: 9 },
    { name: 'G-Shape', frets: [0, 2, 3, 2], root: 7 },
    { name: 'F-Shape', frets: [2, 0, 1, 0], root: 5 },
    { name: 'D-Shape', frets: [2, 2, 2, 0], root: 2 }
  ],
  min: [
    { name: 'Cm-Shape (C)', frets: [0, 3, 3, 3], root: 0 },
    { name: 'Am-Shape (A)', frets: [2, 0, 0, 0], root: 9 },
    { name: 'Gm-Shape (G)', frets: [0, 2, 3, 1], root: 7 },
    { name: 'Fm-Shape (F)', frets: [1, 0, 1, 3], root: 5 },
    { name: 'Dm-Shape (D)', frets: [2, 2, 1, 0], root: 2 }
  ],
  '7': [
    { name: 'C7-Shape (C)', frets: [0, 0, 0, 1], root: 0 },
    { name: 'A7-Shape (A)', frets: [0, 1, 0, 0], root: 9 },
    { name: 'G7-Shape (G)', frets: [0, 2, 1, 2], root: 7 },
    { name: 'F7-Shape (F)', frets: [2, 3, 1, 3], root: 5 },
    { name: 'D7-Shape (D)', frets: [2, 0, 2, 0], root: 2 }
  ]
};

// Guitar CAGED base shapes (String order: 6, 5, 4, 3, 2, 1)
const GUITAR_CAGED_SHAPES: Record<string, Array<{ name: string; baseFrets: number[]; rootString: number; baseFretOffset: number }>> = {
  maj: [
    { name: 'C-Shape', baseFrets: [-1, 3, 2, 0, 1, 0], rootString: 5, baseFretOffset: 3 },
    { name: 'A-Shape', baseFrets: [-1, 0, 2, 2, 2, 0], rootString: 5, baseFretOffset: 0 },
    { name: 'G-Shape', baseFrets: [3, 2, 0, 0, 0, 3],  rootString: 6, baseFretOffset: 3 },
    { name: 'E-Shape', baseFrets: [0, 2, 2, 1, 0, 0],  rootString: 6, baseFretOffset: 0 },
    { name: 'D-Shape', baseFrets: [-1, -1, 0, 2, 3, 2], rootString: 4, baseFretOffset: 0 }
  ],
  min: [
    { name: 'Cm-Shape', baseFrets: [-1, 3, 5, 5, 4, 3], rootString: 5, baseFretOffset: 3 },
    { name: 'Am-Shape', baseFrets: [-1, 0, 2, 2, 1, 0], rootString: 5, baseFretOffset: 0 },
    { name: 'Gm-Shape', baseFrets: [3, 5, 5, 3, 3, 3],  rootString: 6, baseFretOffset: 3 },
    { name: 'Em-Shape', baseFrets: [0, 2, 2, 0, 0, 0],  rootString: 6, baseFretOffset: 0 },
    { name: 'Dm-Shape', baseFrets: [-1, -1, 0, 2, 3, 1], rootString: 4, baseFretOffset: 0 }
  ],
  '7': [
    { name: 'C7-Shape', baseFrets: [-1, 3, 2, 3, 1, 0], rootString: 5, baseFretOffset: 3 },
    { name: 'A7-Shape', baseFrets: [-1, 0, 2, 0, 2, 0], rootString: 5, baseFretOffset: 0 },
    { name: 'G7-Shape', baseFrets: [3, 2, 0, 0, 0, 1],  rootString: 6, baseFretOffset: 3 },
    { name: 'E7-Shape', baseFrets: [0, 2, 0, 1, 0, 0],  rootString: 6, baseFretOffset: 0 },
    { name: 'D7-Shape', baseFrets: [-1, -1, 0, 2, 1, 2], rootString: 4, baseFretOffset: 0 }
  ],
  m7: [
    { name: 'Cm7-Shape', baseFrets: [-1, 3, 5, 3, 4, 3], rootString: 5, baseFretOffset: 3 },
    { name: 'Am7-Shape', baseFrets: [-1, 0, 2, 0, 1, 0], rootString: 5, baseFretOffset: 0 },
    { name: 'Gm7-Shape', baseFrets: [3, 5, 3, 3, 3, 3],  rootString: 6, baseFretOffset: 3 },
    { name: 'Em7-Shape', baseFrets: [0, 2, 0, 0, 0, 0],  rootString: 6, baseFretOffset: 0 },
    { name: 'Dm7-Shape', baseFrets: [-1, -1, 0, 2, 1, 1], rootString: 4, baseFretOffset: 0 }
  ],
  maj7: [
    { name: 'Cmaj7-Shape', baseFrets: [-1, 3, 2, 0, 0, 0], rootString: 5, baseFretOffset: 3 },
    { name: 'Amaj7-Shape', baseFrets: [-1, 0, 2, 1, 2, 0], rootString: 5, baseFretOffset: 0 },
    { name: 'Gmaj7-Shape', baseFrets: [3, 2, 0, 0, 0, 2],  rootString: 6, baseFretOffset: 3 },
    { name: 'Emaj7-Shape', baseFrets: [0, 2, 1, 1, 0, 0],  rootString: 6, baseFretOffset: 0 },
    { name: 'Dmaj7-Shape', baseFrets: [-1, -1, 0, 2, 2, 2], rootString: 4, baseFretOffset: 0 }
  ]
};

export interface VoiceNote {
  string: number;
  stringName: string;
  fret: number;
  midi: number;
  semitone: number;
}

export interface Voicing {
  frets: number[];
  midiValues: VoiceNote[];
  topVoice: VoiceNote;
  bassVoice: VoiceNote;
  inversionLabel: string;
  shapeName: string;
  minFret: number;
  maxFret: number;
}

interface Props {
  initialInstrument?: InstrumentType;
}

export default function ChordMelodyStudio({ initialInstrument = 'ukulele' }: Props) {
  const [instrument, setInstrument] = useState<InstrumentType>(initialInstrument);
  const [rootSemitone, setRootSemitone] = useState<number>(7); // G default
  const [qualityKey, setQualityKey] = useState<string>('min'); // Minor default
  const [accidental, setAccidental] = useState<'b' | '#'>('b');
  const [tuning, setTuning] = useState<'high-g' | 'low-g'>('high-g'); // For Uke
  const [labelMode, setLabelMode] = useState<'notes' | 'degrees'>('notes');
  const [melodyFilter, setMelodyFilter] = useState<string | number>('all');
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playNote = useCallback((midiPitch: number, startTime = 0, duration = 1.6) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = startTime || ctx.currentTime;
    const freq = 440 * Math.pow(2, (midiPitch - 69) / 12);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = instrument === 'guitar' ? 'sawtooth' : 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);

    filter.type = 'lowpass';
    const cutoff = instrument === 'guitar' ? Math.min(freq * 4, 3800) : Math.min(freq * 5, 4500);
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(instrument === 'guitar' ? 180 : 320, t + duration * 0.7);

    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(instrument === 'guitar' ? 0.22 : 0.28, t + 0.007);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }, [getAudioContext, instrument]);

  const strumChord = useCallback((frets: number[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    let midiPitches: number[] = [];
    if (instrument === 'ukulele') {
      midiPitches = [
        (tuning === 'low-g' ? 55 : 67) + frets[0], // String 4 (G)
        60 + frets[1],                             // String 3 (C)
        64 + frets[2],                             // String 2 (E)
        69 + frets[3]                              // String 1 (A)
      ];
    } else {
      // Guitar: Strings 6, 5, 4, 3, 2, 1
      const baseMidis = [40, 45, 50, 55, 59, 64];
      midiPitches = frets
        .map((f, i) => (f >= 0 ? baseMidis[i] + f : null))
        .filter((p): p is number => p !== null);
    }

    const strumSpeed = 0.032;
    midiPitches.forEach((pitch, i) => {
      playNote(pitch, now + i * strumSpeed, 2.2);
    });
  }, [getAudioContext, playNote, instrument, tuning]);

  const getNoteName = useCallback((semitone: number, acc = accidental) => {
    const normalized = ((semitone % 12) + 12) % 12;
    return acc === 'b' ? CHROMATIC_FLATS[normalized] : CHROMATIC_SHARPS[normalized];
  }, [accidental]);

  const getIntervalInfo = useCallback((intervalSemitone: number, qualityDef: ChordDefinition) => {
    const idx = qualityDef.intervals.indexOf(intervalSemitone);
    if (idx !== -1) {
      const name = qualityDef.intervalNames[idx];
      const role = qualityDef.intervalRoles[idx];
      let colorClass = 'bg-slate-700 text-slate-200';
      let bgHex = '#475569';
      if (name === '1') {
        colorClass = 'bg-rose-500 text-white font-bold shadow-rose-500/50';
        bgHex = '#f43f5e';
      } else if (name.includes('3')) {
        colorClass = 'bg-amber-400 text-slate-950 font-bold shadow-amber-400/50';
        bgHex = '#fbbf24';
      } else if (name.includes('5')) {
        colorClass = 'bg-sky-400 text-slate-950 font-bold shadow-sky-400/50';
        bgHex = '#38bdf8';
      } else if (name.includes('7') || name.includes('6')) {
        colorClass = 'bg-purple-400 text-slate-950 font-bold shadow-purple-400/50';
        bgHex = '#c084fc';
      }
      return { name, role, colorClass, bgHex };
    }
    return { name: 'Ext', role: 'Color Note', colorClass: 'bg-teal-500 text-white', bgHex: '#14b8a6' };
  }, []);

  // Ukulele CAGFD shape classifier
  const classifyUkuleleShape = useCallback((frets: number[], root: number, qKey: string) => {
    const archetypes = UKULELE_CAGFD_ARCHETYPES[qKey] || UKULELE_CAGFD_ARCHETYPES['maj'];
    for (const arch of archetypes) {
      const diffs = frets.map((f, i) => f - arch.frets[i]);
      if (diffs.every(d => d === diffs[0]) && diffs[0] >= 0) {
        return `${arch.name}`;
      }
    }
    const notes = [
      (7 + frets[0]) % 12,
      (0 + frets[1]) % 12,
      (4 + frets[2]) % 12,
      (9 + frets[3]) % 12
    ];
    if (notes[2] === root && frets[0] >= frets[2]) return 'D-Shape';
    if (notes[3] === root) return 'C-Shape';
    if (notes[0] === root && notes[2] === root) return 'F-Shape';
    if (notes[0] === root) return 'A-Shape';
    if (notes[1] === root) return 'G-Shape';

    const minF = Math.min(...frets.filter(f => f > 0));
    const cycle = ['C-Shape', 'A-Shape', 'G-Shape', 'F-Shape', 'D-Shape'];
    const cycleIdx = Math.floor((minF || 0) / 2.5) % 5;
    return cycle[cycleIdx];
  }, []);

  // Generate Ukulele Voicings
  const generateUkuleleVoicings = useCallback(() => {
    const quality = CHORD_DEFINITIONS[qualityKey] || CHORD_DEFINITIONS['maj'];
    const targetChordSemitones = new Set(quality.intervals.map(i => (rootSemitone + i) % 12));
    const requiredNotes = quality.intervals.map(i => (rootSemitone + i) % 12);
    const maxFret = 14;

    const stringNotes = [
      Array.from({ length: maxFret + 1 }, (_, f) => ({ fret: f, semitone: (7 + f) % 12, midi: (tuning === 'low-g' ? 55 : 67) + f })),
      Array.from({ length: maxFret + 1 }, (_, f) => ({ fret: f, semitone: (0 + f) % 12, midi: 60 + f })),
      Array.from({ length: maxFret + 1 }, (_, f) => ({ fret: f, semitone: (4 + f) % 12, midi: 64 + f })),
      Array.from({ length: maxFret + 1 }, (_, f) => ({ fret: f, semitone: (9 + f) % 12, midi: 69 + f }))
    ];

    const validVoicings: Voicing[] = [];
    const seenFretKeys = new Set<string>();

    for (let minF = 0; minF <= 11; minF++) {
      const maxF = minF === 0 ? 4 : minF + 3;
      const candidates = stringNotes.map(notes => notes.filter(n => {
        if (!targetChordSemitones.has(n.semitone)) return false;
        if (n.fret === 0) return minF <= 2;
        return n.fret >= minF && n.fret <= maxF;
      }));

      for (const s4 of candidates[0]) {
        for (const s3 of candidates[1]) {
          for (const s2 of candidates[2]) {
            for (const s1 of candidates[3]) {
              const frets = [s4.fret, s3.fret, s2.fret, s1.fret];
              const key = frets.join('-');
              if (seenFretKeys.has(key)) continue;

              const nonZero = frets.filter(f => f > 0);
              if (nonZero.length > 0 && Math.max(...nonZero) - Math.min(...nonZero) > 3) continue;

              const chordNotesPresent = new Set([s4.semitone, s3.semitone, s2.semitone, s1.semitone]);
              if (requiredNotes.length === 3 && !requiredNotes.every(r => chordNotesPresent.has(r))) continue;
              if (requiredNotes.length >= 4) {
                if (!chordNotesPresent.has(requiredNotes[0]) || !chordNotesPresent.has(requiredNotes[1]) || !chordNotesPresent.has(requiredNotes[3])) continue;
              }

              const midiValues: VoiceNote[] = [
                { string: 4, stringName: 'G', fret: s4.fret, midi: s4.midi, semitone: s4.semitone },
                { string: 3, stringName: 'C', fret: s3.fret, midi: s3.midi, semitone: s3.semitone },
                { string: 2, stringName: 'E', fret: s2.fret, midi: s2.midi, semitone: s2.semitone },
                { string: 1, stringName: 'A', fret: s1.fret, midi: s1.midi, semitone: s1.semitone }
              ];

              midiValues.sort((a, b) => (b.midi - a.midi) || (a.string - b.string));
              const topVoice = midiValues[0];
              const bassVoice = [...midiValues].sort((a, b) => a.midi - b.midi)[0];

              const bassInterval = (bassVoice.semitone - rootSemitone + 12) % 12;
              let inversionLabel = 'Root Position';
              if (bassInterval === 3 || bassInterval === 4) inversionLabel = '1st Inversion (3rd in bass)';
              else if (bassInterval === 6 || bassInterval === 7 || bassInterval === 8) inversionLabel = '2nd Inversion (5th in bass)';
              else if (bassInterval >= 9) inversionLabel = '3rd Inversion (7th in bass)';

              const shapeName = classifyUkuleleShape(frets, rootSemitone, qualityKey);
              seenFretKeys.add(key);
              validVoicings.push({
                frets,
                midiValues,
                topVoice,
                bassVoice,
                inversionLabel,
                shapeName,
                minFret: Math.min(...(nonZero.length ? nonZero : [0])),
                maxFret: Math.max(...frets)
              });
            }
          }
        }
      }
    }

    validVoicings.sort((a, b) => (a.minFret !== b.minFret ? a.minFret - b.minFret : a.maxFret - b.maxFret));
    return validVoicings.slice(0, 10);
  }, [qualityKey, rootSemitone, tuning, classifyUkuleleShape]);

  // Generate Guitar CAGED Voicings
  const generateGuitarVoicings = useCallback(() => {
    const quality = CHORD_DEFINITIONS[qualityKey] || CHORD_DEFINITIONS['maj'];
    const shapes = GUITAR_CAGED_SHAPES[qualityKey] || GUITAR_CAGED_SHAPES['maj'];
    const guitarBaseMidis = [40, 45, 50, 55, 59, 64]; // Strings 6, 5, 4, 3, 2, 1
    const stringBaseSemitones = [4, 9, 2, 7, 11, 4];
    const stringNames = ['E', 'A', 'D', 'G', 'B', 'E'];

    const validVoicings: Voicing[] = [];

    for (const s of shapes) {
      const rootStrIdx = 6 - s.rootString; // 6th string = idx 0, 5th string = idx 1, 4th string = idx 2
      const strBaseSemi = stringBaseSemitones[rootStrIdx];
      const targetRootFret = ((rootSemitone - strBaseSemi) % 12 + 12) % 12;

      let shift = targetRootFret - s.baseFretOffset;
      if (shift < 0) shift += 12;

      // Primary position
      const frets = s.baseFrets.map(f => (f === -1 ? -1 : f + shift));
      if (frets.every(f => f <= 14 && f >= -1)) {
        // Collect voiced notes
        const midiValues: VoiceNote[] = [];
        frets.forEach((f, idx) => {
          if (f >= 0) {
            const stringNum = 6 - idx;
            const semi = (stringBaseSemitones[idx] + f) % 12;
            const midi = guitarBaseMidis[idx] + f;
            midiValues.push({ string: stringNum, stringName: stringNames[idx], fret: f, midi, semitone: semi });
          }
        });

        if (midiValues.length >= 3) {
          // Top voice (highest pitch note, tie-break by higher string number towards 1)
          midiValues.sort((a, b) => (b.midi - a.midi) || (a.string - b.string));
          const topVoice = midiValues[0];
          const bassVoice = [...midiValues].sort((a, b) => a.midi - b.midi)[0];

          const bassInterval = (bassVoice.semitone - rootSemitone + 12) % 12;
          let inversionLabel = 'Root Position';
          if (bassInterval === 3 || bassInterval === 4) inversionLabel = '1st Inversion (3rd in bass)';
          else if (bassInterval === 6 || bassInterval === 7 || bassInterval === 8) inversionLabel = '2nd Inversion (5th in bass)';
          else if (bassInterval >= 9) inversionLabel = '3rd Inversion (7th in bass)';

          const nonZero = frets.filter(f => f > 0);
          validVoicings.push({
            frets,
            midiValues,
            topVoice,
            bassVoice,
            inversionLabel,
            shapeName: s.name,
            minFret: nonZero.length ? Math.min(...nonZero) : 0,
            maxFret: Math.max(...frets)
          });
        }
      }

      // Also check lower octave if shift was large (e.g. shift - 12 >= 0)
      if (shift - 12 >= 0) {
        const lowerShift = shift - 12;
        const lowerFrets = s.baseFrets.map(f => (f === -1 ? -1 : f + lowerShift));
        if (lowerFrets.every(f => f <= 14 && f >= -1)) {
          const midiValues: VoiceNote[] = [];
          lowerFrets.forEach((f, idx) => {
            if (f >= 0) {
              const stringNum = 6 - idx;
              const semi = (stringBaseSemitones[idx] + f) % 12;
              const midi = guitarBaseMidis[idx] + f;
              midiValues.push({ string: stringNum, stringName: stringNames[idx], fret: f, midi, semitone: semi });
            }
          });

          if (midiValues.length >= 3) {
            midiValues.sort((a, b) => (b.midi - a.midi) || (a.string - b.string));
            const topVoice = midiValues[0];
            const bassVoice = [...midiValues].sort((a, b) => a.midi - b.midi)[0];

            const bassInterval = (bassVoice.semitone - rootSemitone + 12) % 12;
            let inversionLabel = 'Root Position';
            if (bassInterval === 3 || bassInterval === 4) inversionLabel = '1st Inversion (3rd in bass)';
            else if (bassInterval === 6 || bassInterval === 7 || bassInterval === 8) inversionLabel = '2nd Inversion (5th in bass)';
            else if (bassInterval >= 9) inversionLabel = '3rd Inversion (7th in bass)';

            const nonZero = lowerFrets.filter(f => f > 0);
            validVoicings.push({
              frets: lowerFrets,
              midiValues,
              topVoice,
              bassVoice,
              inversionLabel,
              shapeName: s.name,
              minFret: nonZero.length ? Math.min(...nonZero) : 0,
              maxFret: Math.max(...lowerFrets)
            });
          }
        }
      }
    }

    validVoicings.sort((a, b) => a.minFret - b.minFret);
    return validVoicings;
  }, [qualityKey, rootSemitone]);

  // Active Voicings
  const voicings = useMemo(() => {
    return instrument === 'ukulele' ? generateUkuleleVoicings() : generateGuitarVoicings();
  }, [instrument, generateUkuleleVoicings, generateGuitarVoicings]);

  // Filtered Voicings
  const displayedVoicings = useMemo(() => {
    if (melodyFilter === 'all') return voicings;
    return voicings.filter(v => v.topVoice.semitone === melodyFilter);
  }, [voicings, melodyFilter]);

  const activeQuality = CHORD_DEFINITIONS[qualityKey] || CHORD_DEFINITIONS['maj'];
  const chordName = `${getNoteName(rootSemitone)}${activeQuality.symbol}`;
  const currentStrings = instrument === 'ukulele' ? UKULELE_STRINGS : GUITAR_STRINGS;

  // Logarithmic fret positions
  const numFrets = 14;
  const width = 890;
  const height = instrument === 'guitar' ? 116 : 100;
  const nutWidth = 26;
  const fret0Width = 45;
  const startX = nutWidth + fret0Width;
  const fretboardWidth = width - startX - 20;

  const fretX = useMemo(() => {
    const arr = [startX];
    for (let i = 1; i <= numFrets; i++) {
      const fraction = 1 - Math.pow(2, -i / 17.817);
      arr.push(startX + fraction * fretboardWidth * 1.8);
    }
    return arr;
  }, [startX, fretboardWidth]);

  return (
    <div className="space-y-3.5">
      {/* 1. SLIM APP BAR: Unified Instrument Toggle + Tuning & Display Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 shadow-sm">
        {/* Instrument Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex items-center font-medium">
            <button
              onClick={() => {
                setInstrument('ukulele');
                setMelodyFilter('all');
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                instrument === 'ukulele'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌴</span>
              <span>Ukulele</span>
              <span className="text-[9px] opacity-75 font-mono">CAGFD</span>
            </button>
            <button
              onClick={() => {
                setInstrument('guitar');
                setMelodyFilter('all');
              }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                instrument === 'guitar'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎸</span>
              <span>Guitar</span>
              <span className="text-[9px] opacity-75 font-mono">CAGED</span>
            </button>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2 text-xs">
          {/* Ukulele Tuning Toggle */}
          {instrument === 'ukulele' && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex items-center font-medium">
              <button
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${tuning === 'high-g' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setTuning('high-g')}
              >
                High-G
              </button>
              <button
                className={`px-2 py-1 rounded text-[11px] font-bold transition ${tuning === 'low-g' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setTuning('low-g')}
              >
                Low-G
              </button>
            </div>
          )}

          {/* Notes / Intervals */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-0.5 flex items-center font-medium">
            <button
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${labelMode === 'notes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setLabelMode('notes')}
            >
              Notes
            </button>
            <button
              className={`px-2 py-1 rounded text-[11px] font-bold transition ${labelMode === 'degrees' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setLabelMode('degrees')}
            >
              Intervals
            </button>
          </div>

          {/* Help button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
            title={`${instrument === 'ukulele' ? 'CAGFD' : 'CAGED'} Guide`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. SHRUNK CONSOLIDATED SELECTOR & MELODY FILTER TOOLBAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-2.5">
        {/* Row 1: Shrunk Root Notes */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Root:</span>
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: 12 }, (_, i) => {
              const note = getNoteName(i);
              const isSelected = i === rootSemitone;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setRootSemitone(i);
                    setMelodyFilter('all');
                  }}
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow scale-105 z-10'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 ml-auto shrink-0 pl-2">
            <button
              onClick={() => setAccidental(accidental === 'b' ? '#' : 'b')}
              className="px-2 py-1 rounded bg-slate-950 text-amber-400 font-mono text-xs border border-slate-800 hover:border-slate-700 font-bold"
              title="Toggle Accidentals"
            >
              {accidental === 'b' ? '♭' : '♯'}
            </button>
          </div>
        </div>

        {/* Row 2: Shrunk Qualities */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Type:</span>
          {Object.entries(CHORD_DEFINITIONS).map(([key, chord]) => {
            const isSelected = key === qualityKey;
            return (
              <button
                key={key}
                onClick={() => {
                  setQualityKey(key);
                  setMelodyFilter('all');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm font-bold scale-105'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700/50 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {chord.name}
              </button>
            );
          })}
        </div>

        {/* Row 3: Active Chord + Melody Filter Pills */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-base font-mono">
              {chordName}
            </span>
            <div className="flex items-center gap-1">
              {activeQuality.intervals.map((interval) => {
                const semitone = (rootSemitone + interval) % 12;
                const noteName = getNoteName(semitone);
                const info = getIntervalInfo(interval, activeQuality);
                return (
                  <span
                    key={interval}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${info.colorClass}`}
                  >
                    {noteName} <span className="opacity-75 text-[9px]">({info.name})</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Melody Filter Inline */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-amber-400 whitespace-nowrap flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              Top Melody:
            </span>
            <button
              onClick={() => setMelodyFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                melodyFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {activeQuality.intervals.map((interval) => {
              const semitone = (rootSemitone + interval) % 12;
              const noteName = getNoteName(semitone);
              const info = getIntervalInfo(interval, activeQuality);
              const isSelected = melodyFilter === semitone;
              return (
                <button
                  key={interval}
                  onClick={() => setMelodyFilter(semitone)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: info.bgHex }}></span>
                  <span>{noteName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. FRETBOARD RIGHT AT TOP */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              {instrument === 'ukulele' ? 'Ukulele Fretboard' : 'Guitar Fretboard'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              {instrument === 'ukulele' ? 'Bottom to Top: G · C · E · A' : 'Bottom to Top: E · A · D · G · B · E'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> 1 (Root)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 3rd</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> 5th</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span> 7th</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="min-w-[760px] rounded-lg border border-slate-700/80 p-2 select-none relative bg-gradient-to-b from-[#181512] via-[#241f1c] to-[#151311] shadow-inner">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ userSelect: 'none' }}>
              {/* Markers */}
              <g opacity="0.55">
                <circle cx={(fretX[4] + fretX[5]) / 2} cy={height / 2} r="4" fill="#f8fafc" />
                <circle cx={(fretX[6] + fretX[7]) / 2} cy={height / 2} r="4" fill="#f8fafc" />
                <circle cx={(fretX[9] + fretX[10]) / 2} cy={height / 2} r="4" fill="#f8fafc" />
                <circle cx={(fretX[11] + fretX[12]) / 2} cy={height * 0.32} r="3.5" fill="#f8fafc" />
                <circle cx={(fretX[11] + fretX[12]) / 2} cy={height * 0.68} r="3.5" fill="#f8fafc" />
              </g>

              {/* String Names Column (Left of Nut) */}
              {currentStrings.map((str) => (
                <text
                  key={`name-${str.stringNum}`}
                  x="11"
                  y={str.y + 3.5}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {str.name}
                </text>
              ))}

              {/* Nut */}
              <rect x={nutWidth} y="8" width="8" height={height - 18} rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x={nutWidth + 4} y="6" fill="#94a3b8" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
                NUT
              </text>

              {/* Fret Wires */}
              {fretX.map((x, f) => {
                if (f === 0) return null;
                return (
                  <g key={`fret-${f}`}>
                    <line x1={x} y1="10" x2={x} y2={height - 10} stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={x + 1} y1="10" x2={x + 1} y2={height - 10} stroke="#475569" strokeWidth="0.8" />
                    <text x={(fretX[f - 1] + x) / 2} y={height - 1} fill="#64748b" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
                      {f}
                    </text>
                  </g>
                );
              })}

              {/* Strings */}
              {currentStrings.map((str) => (
                <g key={`str-${str.stringNum}`}>
                  <line x1={nutWidth + 8} y1={str.y} x2={width - 15} y2={str.y} stroke="#1e293b" strokeWidth={str.gauge + 1.5} opacity="0.8" />
                  <line x1={nutWidth + 8} y1={str.y} x2={width - 15} y2={str.y} stroke="#f1f5f9" strokeWidth={str.gauge} />
                </g>
              ))}

              {/* Notes */}
              <g id="notes-layer">
                {currentStrings.map((str) => {
                  const y = str.y;
                  const baseMidi = (instrument === 'ukulele' && str.stringNum === 4 && tuning === 'low-g')
                    ? str.midiLow!
                    : str.midi;
                  const targetSemitones = new Set(activeQuality.intervals.map(i => (rootSemitone + i) % 12));

                  return Array.from({ length: numFrets + 1 }, (_, f) => {
                    const semitone = (str.semitone + f) % 12;
                    const midiPitch = baseMidi + f;
                    const isChordTone = targetSemitones.has(semitone);
                    if (!isChordTone) return null;

                    const cx = f === 0 ? nutWidth + 4 : (fretX[f - 1] + fretX[f]) / 2;
                    const intervalFromRoot = (semitone - rootSemitone + 12) % 12;
                    const info = getIntervalInfo(intervalFromRoot, activeQuality);
                    const isMelodyHighlighted = melodyFilter !== 'all' && melodyFilter === semitone;
                    const displayText = labelMode === 'notes' ? getNoteName(semitone) : info.name;

                    return (
                      <g
                        key={`note-${str.stringNum}-${f}`}
                        className="cursor-pointer group"
                        onClick={() => playNote(midiPitch, 0, 1.8)}
                      >
                        {isMelodyHighlighted && (
                          <circle cx={cx} cy={y} r={instrument === 'guitar' ? 10.5 : 12.5} fill="none" stroke="#fbbf24" strokeWidth="2" className="animate-pulse" />
                        )}
                        <circle
                          cx={cx}
                          cy={y}
                          r={instrument === 'guitar' ? 7.5 : 9}
                          fill={info.bgHex}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[2px] drop-shadow"
                        />
                        <text
                          x={cx}
                          y={y + (instrument === 'guitar' ? 2.6 : 3.2)}
                          fill={info.name === '1' ? '#ffffff' : '#090d16'}
                          fontSize={instrument === 'guitar' ? '7.5' : '8.5'}
                          fontFamily="JetBrains Mono, monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {displayText}
                        </text>
                      </g>
                    );
                  });
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 4. VOICINGS IMMEDIATELY ACCESSIBLE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {instrument === 'ukulele' ? 'CAGFD Voicings' : 'CAGED Voicings'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700">
              {displayedVoicings.length} {displayedVoicings.length === 1 ? 'Shape' : 'Shapes'}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Click <strong className="text-amber-400">Strum</strong> or chord box to preview
          </span>
        </div>

        {displayedVoicings.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800 space-y-2">
            <p className="font-medium text-white text-sm">No voicings with {getNoteName(Number(melodyFilter))} on top.</p>
            <button
              onClick={() => setMelodyFilter('all')}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {displayedVoicings.map((voicing, vIdx) => {
              const topSemi = voicing.topVoice.semitone;
              const topName = getNoteName(topSemi);
              const topInterval = (topSemi - rootSemitone + 12) % 12;
              const topInfo = getIntervalInfo(topInterval, activeQuality);
              const isFiltered = melodyFilter === topSemi;

              return (
                <div
                  key={`voicing-${vIdx}`}
                  className={`bg-slate-900/90 border rounded-xl p-3 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all group ${
                    isFiltered ? 'border-amber-500/80 bg-amber-950/15' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top: Shape name & Fret */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-1.5 py-0.5 rounded font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 truncate max-w-[95px]">
                        {voicing.shapeName.split(' ')[0]}
                      </span>
                      <span className="font-mono text-slate-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                        Fret {voicing.minFret}
                      </span>
                    </div>

                    {/* Melody Badge */}
                    <div className="px-1.5 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Melody:</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${topInfo.colorClass}`}>
                        {topName} ({topInfo.name})
                      </span>
                    </div>

                    {/* Mini Chord Box */}
                    <div
                      className="flex justify-center cursor-pointer py-0.5"
                      onClick={() => strumChord(voicing.frets)}
                      title="Click to Strum"
                    >
                      <MiniChordDiagram
                        frets={voicing.frets}
                        topVoice={voicing.topVoice}
                        rootSemitone={rootSemitone}
                        quality={activeQuality}
                        labelMode={labelMode}
                        instrument={instrument}
                        getNoteName={getNoteName}
                        getIntervalInfo={getIntervalInfo}
                      />
                    </div>

                    {/* Tab Notation */}
                    <div className="text-center font-mono text-[10.5px] font-bold text-slate-300 bg-slate-950/60 py-1 rounded border border-slate-800/60">
                      [ {voicing.frets.map(f => (f === -1 ? 'x' : f)).join(' ')} ]
                    </div>
                  </div>

                  {/* Strum button */}
                  <div className="pt-2 mt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => strumChord(voicing.frets)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      <span>Strum</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guide Modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl p-5 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{instrument === 'ukulele' ? 'Ukulele CAGFD & Chord Melody' : 'Guitar CAGED System & Chord Melody'}</span>
              </h3>
              <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">
                &times;
              </button>
            </div>
            <div className="space-y-2.5 text-slate-300 leading-relaxed">
              <p>
                In chord melody, the human ear instinctively identifies the <strong>highest note</strong> in any chord as the vocal or lead melody.
              </p>
              {instrument === 'ukulele' ? (
                <>
                  <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap font-mono font-bold text-xs">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">C-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">A-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">G-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">F-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">D-Shape</span>
                  </div>
                  <p className="text-slate-400 text-xs">Ukulele tuning is G-C-E-A, cycling through 5 open movable shapes.</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-1.5 py-1 flex-wrap font-mono font-bold text-xs">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">C-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">A-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">G-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">E-Shape</span>
                    <span className="text-slate-500">&rarr;</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">D-Shape</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Guitar tuning is E-A-D-G-B-E. Every chord shape cycles C &rarr; A &rarr; G &rarr; E &rarr; D up the neck, placing different chord tones on the high E, B, and G strings.
                  </p>
                </>
              )}
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setHelpOpen(false)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mini Vertical Chord Diagram (Supports 4-string Uke & 6-string Guitar)
function MiniChordDiagram({
  frets,
  topVoice,
  rootSemitone,
  quality,
  labelMode,
  instrument,
  getNoteName,
  getIntervalInfo
}: {
  frets: number[];
  topVoice: VoiceNote;
  rootSemitone: number;
  quality: ChordDefinition;
  labelMode: 'notes' | 'degrees';
  instrument: InstrumentType;
  getNoteName: (s: number) => string;
  getIntervalInfo: (i: number, q: ChordDefinition) => { name: string; role: string; colorClass: string; bgHex: string };
}) {
  const isGuitar = instrument === 'guitar';
  const numStrings = isGuitar ? 6 : 4;
  const stringNames = isGuitar ? ['E', 'A', 'D', 'G', 'B', 'E'] : ['G', 'C', 'E', 'A'];
  const stringBaseSemitones = isGuitar ? [4, 9, 2, 7, 11, 4] : [7, 0, 4, 9];

  const w = isGuitar ? 135 : 115;
  const h = 145;
  const padX = 18;
  const padTop = 26;
  const stringGap = isGuitar ? 20 : 25;
  const fretGap = 21;
  const numFretRows = 5;

  const nonZero = frets.filter(f => f > 0);
  const minFret = nonZero.length ? Math.min(...nonZero) : 1;
  const baseFret = minFret <= 2 ? 1 : minFret;
  const isNut = baseFret === 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 mx-auto select-none">
      {!isNut && (
        <text x="3" y={padTop + 14} fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          {baseFret}fr
        </text>
      )}

      {/* Nut */}
      <line x1={padX} y1={padTop} x2={padX + stringGap * (numStrings - 1)} y2={padTop} stroke={isNut ? '#f8fafc' : '#64748b'} strokeWidth={isNut ? '3.5' : '1.2'} />

      {/* Frets */}
      {Array.from({ length: numFretRows }, (_, i) => {
        const y = padTop + (i + 1) * fretGap;
        return <line key={`wire-${i}`} x1={padX} y1={y} x2={padX + stringGap * (numStrings - 1)} y2={y} stroke="#334155" strokeWidth="1" />;
      })}

      {/* Strings */}
      {Array.from({ length: numStrings }, (_, i) => {
        const x = padX + i * stringGap;
        return (
          <g key={`str-vert-${i}`}>
            <line x1={x} y1={padTop} x2={x} y2={padTop + numFretRows * fretGap} stroke="#475569" strokeWidth="1.2" />
            <text x={x} y={padTop + numFretRows * fretGap + 13} fill="#64748b" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
              {stringNames[i]}
            </text>
          </g>
        );
      })}

      {/* Dots & Muted Strings */}
      {frets.map((fret, strIdx) => {
        const x = padX + strIdx * stringGap;
        const stringNum = isGuitar ? 6 - strIdx : 4 - strIdx;
        const isMelodyString = stringNum === topVoice.string;

        if (fret === -1) {
          // Muted string 'x'
          return (
            <text key={`mute-${strIdx}`} x={x} y={padTop - 7} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
              &times;
            </text>
          );
        }

        if (fret === 0) {
          return (
            <g key={`dot-${strIdx}`}>
              <circle cx={x} cy={padTop - 10} r="4" fill="none" stroke={isMelodyString ? '#fbbf24' : '#cbd5e1'} strokeWidth={isMelodyString ? '2' : '1.2'} />
              {isMelodyString && <circle cx={x} cy={padTop - 10} r="1.5" fill="#fbbf24" />}
            </g>
          );
        }

        const row = fret - baseFret;
        if (row >= 0 && row < numFretRows) {
          const y = padTop + row * fretGap + fretGap / 2;
          const semitone = (stringBaseSemitones[strIdx] + fret) % 12;
          const interval = (semitone - rootSemitone + 12) % 12;
          const info = getIntervalInfo(interval, quality);
          const displayText = labelMode === 'notes' ? getNoteName(semitone) : info.name;

          return (
            <g key={`dot-${strIdx}`}>
              {isMelodyString && <circle cx={x} cy={y} r="9" fill="none" stroke="#fbbf24" strokeWidth="1.8" className="animate-pulse" />}
              <circle cx={x} cy={y} r="6.5" fill={info.bgHex} stroke="#0f172a" strokeWidth="1.2" />
              <text x={x} y={y + 2.5} fill={info.name === '1' ? '#ffffff' : '#090d16'} fontSize="6.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
                {displayText}
              </text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
}
