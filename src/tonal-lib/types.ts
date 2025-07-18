// Types for Tonal-based chord and progression logic
// Deprecated: TonalLib namespace

export type NoteType = string; // e.g., "C", "Db", etc. (Tonal uses string)
export type ChordType = string; // e.g., "major", "minor", etc.
export type ScaleType = string; // e.g., "major", "minor", etc.

export type Chord = {
  root: NoteType;
  type: ChordType;
  notes: NoteType[];
  symbol: string;
};

export type ChordNumberReference = {
  number: number;
  type: ChordType;
};

export type ScaleRecommendation = {
  scale: ScaleType;
};

export type ChordProgressionReference = {
  name: string;
  defaultNote: NoteType;
  description: string;
  source: "custom" | "default" | "ai";
  creationDate: number;
  progression: ChordNumberReference[][];
  recommendedScales: ScaleRecommendation[];
};

export type ChordProgression = Chord[][];

// Export allNotes, allChordTypes, allScaleTypes for use everywhere
export const allNotes: NoteType[] = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
];
export const allChordTypes: ChordType[] = [
  "major", "minor", "7", "m7", "dim", "aug", "sus4", "sus2", "6", "maj7", "9", "11", "13", "add9", "add11", "add13", "m9", "m11", "m13"
];
export const allScaleTypes: ScaleType[] = [
  "major", "minor", "blues", "pentatonic", "mixolydian", "locrian", "whole tone", "dorian"
];
