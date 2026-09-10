// Ukulele Chord-Melody Arrangement & Voicing Solver Engine

export interface VoicedTabItem {
  lyric: string;
  melodyPitch: string;      // e.g. "G4", "C5"
  melodyMidi: number;       // e.g. 67, 72
  chordName?: string;       // e.g. "C", "Em"
  isChordStrike: boolean;
  frets: number[];          // [g, C, E, A] (String 4 to 1), -1 = muted
  fretboardRange: [number, number]; // [minFret, maxFret]
  shapeLabel?: string;      // e.g. "C-Shape", "Melody Solo"
}

export interface MeasureArrangement {
  measureNumber: number;
  chord: string;
  items: VoicedTabItem[];
}

export interface ArrangementResult {
  songTitle: string;
  key: string;
  tempo?: number;
  timeSignature?: string;
  measures: MeasureArrangement[];
}

// Convert Scientific Pitch Notation (e.g. "C4", "G#4", "Eb5") to MIDI number
export function pitchToMidi(pitch: string): number {
  if (!pitch) return 60;
  const match = pitch.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return 60;

  const letter = match[1].toUpperCase();
  const acc = match[2];
  const octave = parseInt(match[3], 10);

  const semitones: Record<string, number> = {
    C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11
  };

  let semi = semitones[letter] ?? 0;
  if (acc === '#') semi += 1;
  else if (acc === 'b') semi -= 1;

  // C4 is MIDI 60
  return (octave + 1) * 12 + semi;
}

// MIDI to Pitch Name
export function midiToPitchName(midi: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = notes[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

// Parse chord name into root semitone (0-11) and quality key
export function parseChordName(chordStr: string): { root: number; quality: string } {
  const clean = chordStr.trim();
  const match = clean.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return { root: 0, quality: 'maj' };

  const rootStr = match[1];
  const rawQuality = match[2].toLowerCase();

  const rootMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
    'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8,
    'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11
  };

  const root = rootMap[rootStr.toUpperCase()] ?? 0;

  let quality = 'maj';
  if (rawQuality.startsWith('m') && !rawQuality.startsWith('maj')) {
    quality = rawQuality.includes('7') ? 'm7' : 'min';
  } else if (rawQuality.includes('maj7')) {
    quality = 'maj7';
  } else if (rawQuality.includes('7')) {
    quality = '7';
  } else if (rawQuality.includes('dim')) {
    quality = 'dim';
  } else if (rawQuality.includes('aug')) {
    quality = 'aug';
  } else if (rawQuality.includes('sus4')) {
    quality = 'sus4';
  }

  return { root, quality };
}

// Basic chord intervals
const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus4: [0, 5, 7]
};

// Ukulele open string MIDI pitches: G4(67), C4(60), E4(64), A4(69)
const UKE_STRINGS_MIDI = [67, 60, 64, 69];

/**
 * Solve Ukulele Voicing for a given Chord + Target Top Melody MIDI Note
 */
export function solveUkuleleChordMelodyVoicing(
  chordName: string,
  melodyMidi: number
): { frets: number[]; label: string } {
  const { root, quality } = parseChordName(chordName);
  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
  const chordTones = intervals.map(int => (root + int) % 12);

  // We want the highest pitch in the voicing to equal melodyMidi
  // String 1 (A4=69) is the natural top melody string, but String 2 (E4=64) can also hold top melody if String 1 is muted.
  const candidates: Array<{ frets: number[]; score: number; label: string }> = [];

  // Case A: Melody note is placed on String 1 (A-string)
  const s1Fret = melodyMidi - UKE_STRINGS_MIDI[3];
  if (s1Fret >= 0 && s1Fret <= 14) {
    // Search possible frets for strings 4, 3, 2 within reachable span of s1Fret (+/- 4 frets)
    const minSearchFret = Math.max(0, s1Fret - 4);
    const maxSearchFret = Math.min(14, s1Fret + 3);

    for (let f4 = minSearchFret; f4 <= maxSearchFret; f4++) {
      const p4 = UKE_STRINGS_MIDI[0] + f4;
      if (p4 >= melodyMidi) continue; // Must be strictly lower than top voice
      if (!chordTones.includes(p4 % 12)) continue;

      for (let f3 = minSearchFret; f3 <= maxSearchFret; f3++) {
        const p3 = UKE_STRINGS_MIDI[1] + f3;
        if (p3 >= melodyMidi) continue;
        if (!chordTones.includes(p3 % 12)) continue;

        for (let f2 = minSearchFret; f2 <= maxSearchFret; f2++) {
          const p2 = UKE_STRINGS_MIDI[2] + f2;
          if (p2 >= melodyMidi) continue;
          if (!chordTones.includes(p2 % 12)) continue;

          // Check if root tone is voiced in the chord
          const frets = [f4, f3, f2, s1Fret];
          const voicedSemis = [p4 % 12, p3 % 12, p2 % 12, melodyMidi % 12];
          const hasRoot = voicedSemis.includes(root);
          
          // Ergonomic span penalty
          const nonZero = frets.filter(f => f > 0);
          const span = nonZero.length > 1 ? Math.max(...nonZero) - Math.min(...nonZero) : 0;
          if (span > 3) continue; // Unplayable stretch

          // Score preferred: open strings, low span, includes root
          let score = 100 - span * 15 - Math.max(...frets) * 2;
          if (hasRoot) score += 30;
          if (frets.includes(0)) score += 10; // Open strings ring nicely on uke

          candidates.push({ frets, score, label: `${chordName} (Lead A)` });
        }
      }
    }
  }

  // Case B: Melody note is on String 2 (E-string), String 1 is muted (-1)
  const s2Fret = melodyMidi - UKE_STRINGS_MIDI[2];
  if (s2Fret >= 0 && s2Fret <= 14) {
    const minSearchFret = Math.max(0, s2Fret - 3);
    const maxSearchFret = Math.min(14, s2Fret + 3);

    for (let f4 = minSearchFret; f4 <= maxSearchFret; f4++) {
      const p4 = UKE_STRINGS_MIDI[0] + f4;
      if (p4 >= melodyMidi) continue;
      if (!chordTones.includes(p4 % 12)) continue;

      for (let f3 = minSearchFret; f3 <= maxSearchFret; f3++) {
        const p3 = UKE_STRINGS_MIDI[1] + f3;
        if (p3 >= melodyMidi) continue;
        if (!chordTones.includes(p3 % 12)) continue;

        const frets = [f4, f3, s2Fret, -1];
        const span = Math.max(f4, f3, s2Fret) - Math.min(f4, f3, s2Fret);
        if (span <= 3) {
          candidates.push({
            frets,
            score: 75 - span * 12 - s2Fret,
            label: `${chordName} (Lead E)`
          });
        }
      }
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    return { frets: candidates[0].frets, label: candidates[0].label };
  }

  // Fallback: Single-note melody placement on the most ergonomic string
  return solveUkuleleSingleMelodyNote(melodyMidi);
}

/**
 * Solve single melody note placement on the Ukulele fretboard
 */
export function solveUkuleleSingleMelodyNote(midi: number): { frets: number[]; label: string } {
  // Try string 1 (A string) first
  const s1 = midi - UKE_STRINGS_MIDI[3];
  if (s1 >= 0 && s1 <= 15) {
    return { frets: [-1, -1, -1, s1], label: 'Melody' };
  }
  // Try string 2 (E string)
  const s2 = midi - UKE_STRINGS_MIDI[2];
  if (s2 >= 0 && s2 <= 15) {
    return { frets: [-1, -1, s2, -1], label: 'Melody' };
  }
  // Try string 3 (C string)
  const s3 = midi - UKE_STRINGS_MIDI[1];
  if (s3 >= 0 && s3 <= 15) {
    return { frets: [-1, s3, -1, -1], label: 'Melody' };
  }
  // Try string 4 (G string)
  const s4 = midi - UKE_STRINGS_MIDI[0];
  if (s4 >= 0 && s4 <= 15) {
    return { frets: [s4, -1, -1, -1], label: 'Melody' };
  }

  return { frets: [-1, -1, -1, 0], label: 'Melody' };
}
