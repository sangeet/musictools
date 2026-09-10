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
  category?: string;
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

const BASE_CAGFD_ARCHETYPES: Record<string, Array<{ name: string; frets: number[]; root: number }>> = {
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

// Tablature orientation (A string at top, G string at bottom)
const HORIZONTAL_STRINGS = [
  { stringNum: 1, name: 'A', midiHighG: 69, midiLowG: 69, semitone: 9, y: 22,  gauge: 1.8 },
  { stringNum: 2, name: 'E', midiHighG: 64, midiLowG: 64, semitone: 4, y: 44,  gauge: 2.2 },
  { stringNum: 3, name: 'C', midiHighG: 60, midiLowG: 60, semitone: 0, y: 66,  gauge: 3.0 },
  { stringNum: 4, name: 'G', midiHighG: 67, midiLowG: 55, semitone: 7, y: 88,  gauge: 2.4 }
];

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
  cagfdShape: string;
  minFret: number;
  maxFret: number;
}

export default function UkuleleChordMelody() {
  const [rootSemitone, setRootSemitone] = useState<number>(7); // Default: G
  const [qualityKey, setQualityKey] = useState<string>('min'); // Default: Minor
  const [accidental, setAccidental] = useState<'b' | '#'>('b');
  const [tuning, setTuning] = useState<'high-g' | 'low-g'>('high-g');
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

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5, 4500), t);
    filter.frequency.exponentialRampToValueAtTime(320, t + duration * 0.7);

    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.linearRampToValueAtTime(0.28, t + 0.006);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }, [getAudioContext]);

  const strumChord = useCallback((frets: number[]) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const midiPitches = [
      (tuning === 'low-g' ? 55 : 67) + frets[0], // String 4 (G)
      60 + frets[1],                             // String 3 (C)
      64 + frets[2],                             // String 2 (E)
      69 + frets[3]                              // String 1 (A)
    ];

    const strumSpeed = 0.035;
    midiPitches.forEach((pitch, i) => {
      playNote(pitch, now + i * strumSpeed, 2.0);
    });
  }, [getAudioContext, playNote, tuning]);

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

  const classifyCAGFDShape = useCallback((frets: number[], root: number, qKey: string) => {
    const archetypes = BASE_CAGFD_ARCHETYPES[qKey] || BASE_CAGFD_ARCHETYPES['maj'];

    // 1. Exact transposed shape match
    for (const arch of archetypes) {
      const shift = (root - arch.root + 12) % 12;
      const exactFrets = arch.frets.map(f => f + shift);
      if (frets.every((f, i) => f === exactFrets[i])) {
        return arch.name;
      }
    }

    // 2. 3-string match (Melody extension or alternate bass)
    for (const arch of archetypes) {
      const shift = (root - arch.root + 12) % 12;
      const exactFrets = arch.frets.map(f => f + shift);

      // Strings 4, 3, 2 match and string 1 (melody) differs -> Melody extension
      if (frets[0] === exactFrets[0] && frets[1] === exactFrets[1] && frets[2] === exactFrets[2]) {
        return `${arch.name} (Ext)`;
      }
      // Strings 3, 2, 1 match and string 4 (bass) differs -> Alternate bass
      if (frets[1] === exactFrets[1] && frets[2] === exactFrets[2] && frets[3] === exactFrets[3]) {
        return `${arch.name} (Alt Bass)`;
      }
    }

    // 3. Structural root position fallback
    const notes = [
      (7 + frets[0]) % 12,
      (0 + frets[1]) % 12,
      (4 + frets[2]) % 12,
      (9 + frets[3]) % 12
    ];
    if (notes[2] === root && frets[0] >= frets[2]) return 'D-Shape (Ext)';
    if (notes[3] === root) return 'C-Shape (Ext)';
    if (notes[0] === root && notes[2] === root) return 'F-Shape (Ext)';
    if (notes[0] === root) return 'A-Shape (Ext)';
    if (notes[1] === root) return 'G-Shape (Ext)';

    const nonZero = frets.filter(f => f > 0);
    const avgFret = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    const positions = [
      { name: 'C-Shape', fret: (root - 0 + 12) % 12 },
      { name: 'A-Shape', fret: (root - 9 + 12) % 12 },
      { name: 'G-Shape', fret: (root - 7 + 12) % 12 },
      { name: 'F-Shape', fret: (root - 5 + 12) % 12 },
      { name: 'D-Shape', fret: (root - 2 + 12) % 12 }
    ];
    positions.sort((a, b) => Math.abs(a.fret - avgFret) - Math.abs(b.fret - avgFret));
    return `${positions[0].name} (Var)`;
  }, []);

  // Generate Voicings
  const voicings = useMemo(() => {
    const quality = CHORD_DEFINITIONS[qualityKey];
    if (!quality) return [];
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

      const candidates = stringNotes.map(notes => {
        return notes.filter(n => {
          if (!targetChordSemitones.has(n.semitone)) return false;
          if (n.fret === 0) return minF <= 2;
          return n.fret >= minF && n.fret <= maxF;
        });
      });

      for (const s4 of candidates[0]) {
        for (const s3 of candidates[1]) {
          for (const s2 of candidates[2]) {
            for (const s1 of candidates[3]) {
              const frets = [s4.fret, s3.fret, s2.fret, s1.fret];
              const key = frets.join('-');
              if (seenFretKeys.has(key)) continue;

              const nonZero = frets.filter(f => f > 0);
              if (nonZero.length > 0) {
                const span = Math.max(...nonZero) - Math.min(...nonZero);
                if (span > 3) continue;
              }

              const chordNotesPresent = new Set([s4.semitone, s3.semitone, s2.semitone, s1.semitone]);
              if (requiredNotes.length === 3) {
                const hasAll = requiredNotes.every(r => chordNotesPresent.has(r));
                if (!hasAll) continue;
              } else if (requiredNotes.length >= 4) {
                const rootSemi = requiredNotes[0];
                const thirdSemi = requiredNotes[1];
                const seventhSemi = requiredNotes[3];
                if (!chordNotesPresent.has(rootSemi) || !chordNotesPresent.has(thirdSemi) || !chordNotesPresent.has(seventhSemi)) {
                  continue;
                }
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
              if (bassInterval === 3 || bassInterval === 4) {
                inversionLabel = '1st Inversion (3rd in bass)';
              } else if (bassInterval === 6 || bassInterval === 7 || bassInterval === 8) {
                inversionLabel = '2nd Inversion (5th in bass)';
              } else if (bassInterval === 10 || bassInterval === 11 || bassInterval === 9) {
                inversionLabel = '3rd Inversion (7th in bass)';
              }

              const cagfdShape = classifyCAGFDShape(frets, rootSemitone, qualityKey);

              seenFretKeys.add(key);
              validVoicings.push({
                frets,
                midiValues,
                topVoice,
                bassVoice,
                inversionLabel,
                cagfdShape,
                minFret: Math.min(...nonZero.length ? nonZero : [0]),
                maxFret: Math.max(...frets)
              });
            }
          }
        }
      }
    }

    validVoicings.sort((a, b) => (a.minFret !== b.minFret ? a.minFret - b.minFret : a.maxFret - b.maxFret));

    if (validVoicings.length <= 6) return validVoicings;

    const groups = [
      validVoicings.filter(v => v.minFret <= 3),
      validVoicings.filter(v => v.minFret >= 2 && v.minFret <= 5),
      validVoicings.filter(v => v.minFret >= 5 && v.minFret <= 8),
      validVoicings.filter(v => v.minFret >= 7 && v.minFret <= 11),
      validVoicings.filter(v => v.minFret >= 10)
    ];

    const selected: Voicing[] = [];
    const seenCombo = new Set<string>();

    groups.forEach(group => {
      group.sort((a, b) => {
        const spanA = Math.max(...a.frets) - Math.min(...a.frets.filter(f => f > 0) || [0]);
        const spanB = Math.max(...b.frets) - Math.min(...b.frets.filter(f => f > 0) || [0]);
        return spanA - spanB;
      });

      for (const v of group) {
        const key = v.frets.join('-');
        if (!seenCombo.has(key)) {
          seenCombo.add(key);
          selected.push(v);
          break;
        }
      }
    });

    for (const v of validVoicings) {
      if (selected.length >= 8) break;
      const key = v.frets.join('-');
      if (!seenCombo.has(key)) {
        seenCombo.add(key);
        selected.push(v);
      }
    }

    selected.sort((a, b) => a.minFret - b.minFret);
    return selected;
  }, [qualityKey, rootSemitone, tuning, classifyCAGFDShape]);

  const displayedVoicings = useMemo(() => {
    if (melodyFilter === 'all') return voicings;
    return voicings.filter(v => v.topVoice.semitone === melodyFilter);
  }, [voicings, melodyFilter]);

  const activeQuality = CHORD_DEFINITIONS[qualityKey] || CHORD_DEFINITIONS['maj'];
  const chordName = `${getNoteName(rootSemitone)}${activeQuality.symbol}`;

  // Logarithmic fret positions
  const numFrets = 14;
  const width = 890;
  const height = 110;
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
    <div className="space-y-4">
      {/* 1. ULTRA-COMPACT APP BAR: Instrument, Tuning, & Display Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌴</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">Ukulele Chord Melody</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              CAGFD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {/* Tuning */}
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

          {/* Label Mode */}
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

          {/* Guide button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition"
            title="CAGFD Guide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. SLIM, SHRUNK SELECTOR & MELODY FILTER TOOLBAR (Single Consolidated Card) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-2.5">
        {/* Row 1: Shrunk Root Notes + Flat/Sharp Toggle */}
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

        {/* Row 2: Shrunk Qualities Carousel */}
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

        {/* Row 3: Active Chord + Melody Filter Pills (Consolidated inline) */}
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

      {/* 3. FRETBOARD RIGHT AT TOP (Sleek, Compact, Immediately Accessible) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Fretboard</span>
            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              Bottom to Top: G · C · E · A
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> 1 (Root)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> 3rd</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span> 5th</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span> 7th</span>
          </div>
        </div>

        {/* Fretboard SVG */}
        <div className="overflow-x-auto pb-1">
          <div className="min-w-[760px] rounded-lg border border-slate-700/80 p-2.5 select-none relative bg-gradient-to-b from-[#181512] via-[#241f1c] to-[#151311] shadow-inner">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ userSelect: 'none' }}>
              {/* Markers */}
              <g opacity="0.55">
                <circle cx={(fretX[4] + fretX[5]) / 2} cy="55" r="4" fill="#f8fafc" />
                <circle cx={(fretX[6] + fretX[7]) / 2} cy="55" r="4" fill="#f8fafc" />
                <circle cx={(fretX[9] + fretX[10]) / 2} cy="55" r="4" fill="#f8fafc" />
                <circle cx={(fretX[11] + fretX[12]) / 2} cy="38" r="3.5" fill="#f8fafc" />
                <circle cx={(fretX[11] + fretX[12]) / 2} cy="72" r="3.5" fill="#f8fafc" />
              </g>

              {/* String Names Column (Left of Nut) */}
              {HORIZONTAL_STRINGS.map((str) => (
                <text
                  key={`name-${str.name}`}
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
              <rect x={nutWidth} y="10" width="8" height="90" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x={nutWidth + 4} y="7" fill="#94a3b8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
                NUT
              </text>

              {/* Fret Wires */}
              {fretX.map((x, f) => {
                if (f === 0) return null;
                return (
                  <g key={`fret-${f}`}>
                    <line x1={x} y1="12" x2={x} y2="98" stroke="#cbd5e1" strokeWidth="2" />
                    <line x1={x + 1} y1="12" x2={x + 1} y2="98" stroke="#475569" strokeWidth="0.8" />
                    <text x={(fretX[f - 1] + x) / 2} y="107" fill="#64748b" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
                      {f}
                    </text>
                  </g>
                );
              })}

              {/* Strings */}
              {HORIZONTAL_STRINGS.map((str) => (
                <g key={`str-${str.name}`}>
                  <line x1={nutWidth + 8} y1={str.y} x2={width - 15} y2={str.y} stroke="#1e293b" strokeWidth={str.gauge + 1.5} opacity="0.8" />
                  <line x1={nutWidth + 8} y1={str.y} x2={width - 15} y2={str.y} stroke="#f1f5f9" strokeWidth={str.gauge} />
                </g>
              ))}

              {/* Notes */}
              <g id="notes-layer">
                {HORIZONTAL_STRINGS.map((str) => {
                  const y = str.y;
                  const baseMidi = (str.stringNum === 4 && tuning === 'low-g') ? str.midiLowG : str.midiHighG;
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
                        key={`note-${str.name}-${f}`}
                        className="cursor-pointer group"
                        onClick={() => playNote(midiPitch, 0, 1.8)}
                      >
                        {isMelodyHighlighted && (
                          <circle cx={cx} cy={y} r="12.5" fill="none" stroke="#fbbf24" strokeWidth="2" className="animate-pulse" />
                        )}
                        <circle
                          cx={cx}
                          cy={y}
                          r="9"
                          fill={info.bgHex}
                          stroke="#0f172a"
                          strokeWidth="1.5"
                          className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[2px] drop-shadow"
                        />
                        <text
                          x={cx}
                          y={y + 3.2}
                          fill={info.name === '1' ? '#ffffff' : '#090d16'}
                          fontSize="8.5"
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

      {/* 4. VOICINGS IMMEDIATELY BELOW (Zero scrolling needed to see positions!) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              CAGFD Voicings
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700">
              {displayedVoicings.length} {displayedVoicings.length === 1 ? 'Shape' : 'Shapes'}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Click <strong className="text-amber-400">Strum</strong> or chord box to hear
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
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
                    <div className="flex items-center justify-between text-[11px] gap-1">
                      <span
                        className="px-1.5 py-0.5 rounded font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 truncate max-w-[110px]"
                        title={voicing.cagfdShape}
                      >
                        {voicing.cagfdShape}
                      </span>
                      <span className="font-mono text-slate-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] shrink-0">
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
                        getNoteName={getNoteName}
                        getIntervalInfo={getIntervalInfo}
                      />
                    </div>

                    {/* Tab Notation */}
                    <div className="text-center font-mono text-[11px] font-bold text-slate-300 bg-slate-950/60 py-1 rounded border border-slate-800/60">
                      [ {voicing.frets.join(' ')} ]
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
                <span>Ukulele CAGFD &amp; Chord Melody</span>
              </h3>
              <button onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-white text-xl leading-none">
                &times;
              </button>
            </div>
            <div className="space-y-2.5 text-slate-300 leading-relaxed">
              <p>
                In chord melody, the listener hears the highest note as the melody line. On the ukulele (G-C-E-A), that note is played on String 1 or 2.
              </p>
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
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs">
                <li><strong>C-Shape:</strong> Root on String 1.</li>
                <li><strong>A-Shape:</strong> Root on String 4, 5th on String 1.</li>
                <li><strong>G-Shape:</strong> 3rd on String 1, Root on String 2.</li>
                <li><strong>F-Shape:</strong> Barre chord, Root on Strings 4 &amp; 2.</li>
                <li><strong>D-Shape:</strong> 5th on String 1, Root on String 2.</li>
              </ul>
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

function MiniChordDiagram({
  frets,
  topVoice,
  rootSemitone,
  quality,
  labelMode,
  getNoteName,
  getIntervalInfo
}: {
  frets: number[];
  topVoice: VoiceNote;
  rootSemitone: number;
  quality: ChordDefinition;
  labelMode: 'notes' | 'degrees';
  getNoteName: (s: number) => string;
  getIntervalInfo: (i: number, q: ChordDefinition) => { name: string; role: string; colorClass: string; bgHex: string };
}) {
  const w = 120;
  const h = 145;
  const padX = 22;
  const padTop = 26;
  const stringGap = 24;
  const fretGap = 21;
  const numFretRows = 5;

  const nonZero = frets.filter(f => f > 0);
  const minFret = nonZero.length ? Math.min(...nonZero) : 1;
  const baseFret = minFret <= 2 ? 1 : minFret;
  const isNut = baseFret === 1;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-28 mx-auto select-none">
      {!isNut && (
        <text x="4" y={padTop + 14} fill="#94a3b8" fontSize="9.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          {baseFret}fr
        </text>
      )}

      {/* Nut */}
      <line x1={padX} y1={padTop} x2={padX + stringGap * 3} y2={padTop} stroke={isNut ? '#f8fafc' : '#64748b'} strokeWidth={isNut ? '3.5' : '1.2'} />

      {/* Frets */}
      {Array.from({ length: numFretRows }, (_, i) => {
        const y = padTop + (i + 1) * fretGap;
        return <line key={`wire-${i}`} x1={padX} y1={y} x2={padX + stringGap * 3} y2={y} stroke="#334155" strokeWidth="1" />;
      })}

      {/* Strings */}
      {[0, 1, 2, 3].map(i => {
        const x = padX + i * stringGap;
        return (
          <g key={`str-vert-${i}`}>
            <line x1={x} y1={padTop} x2={x} y2={padTop + numFretRows * fretGap} stroke="#475569" strokeWidth="1.2" />
            <text x={x} y={padTop + numFretRows * fretGap + 13} fill="#64748b" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
              {['G', 'C', 'E', 'A'][i]}
            </text>
          </g>
        );
      })}

      {/* Dots */}
      {frets.map((fret, strIdx) => {
        const x = padX + strIdx * stringGap;
        const stringBaseSemitone = [7, 0, 4, 9][strIdx];
        const semitone = (stringBaseSemitone + fret) % 12;
        const interval = (semitone - rootSemitone + 12) % 12;
        const info = getIntervalInfo(interval, quality);
        const isMelodyString = strIdx === 4 - topVoice.string;

        if (fret === 0) {
          return (
            <g key={`dot-${strIdx}`}>
              <circle cx={x} cy={padTop - 10} r="4.5" fill="none" stroke={isMelodyString ? '#fbbf24' : '#cbd5e1'} strokeWidth={isMelodyString ? '2' : '1.2'} />
              {isMelodyString && <circle cx={x} cy={padTop - 10} r="1.5" fill="#fbbf24" />}
            </g>
          );
        }

        const row = fret - baseFret;
        if (row >= 0 && row < numFretRows) {
          const y = padTop + row * fretGap + fretGap / 2;
          const displayText = labelMode === 'notes' ? getNoteName(semitone) : info.name;
          return (
            <g key={`dot-${strIdx}`}>
              {isMelodyString && <circle cx={x} cy={y} r="9.5" fill="none" stroke="#fbbf24" strokeWidth="1.8" className="animate-pulse" />}
              <circle cx={x} cy={y} r="7" fill={info.bgHex} stroke="#0f172a" strokeWidth="1.2" />
              <text x={x} y={y + 2.8} fill={info.name === '1' ? '#ffffff' : '#090d16'} fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold" textAnchor="middle">
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
