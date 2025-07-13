// Music theory types

export const allNoteTypes = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
] as const;
export type NoteType = typeof allNoteTypes[number];

export const allChordTypes = [
  "major", "minor", "dominant", "diminished", "augmented", "sus4", "sus2", "sixth", "maj7", "ninth", "eleventh", "thirteenth", "add9", "add11", "add13", "m7", "m9", "m11", "m13"
] as const;
export type ChordType = typeof allChordTypes[number];

export type Scale = NoteType[];
export type ScaleLogic = number[];

export type ChordLogic = {
  logic: number[];
  scaleLogic: ScaleLogic;
  suffix: string;
};

export type Chord = {
  root: NoteType;
  type: ChordType;
  notes: NoteType[];
  symbol: string;
};

export type ChordProgression = Chord[][];

export const allScaleTypes = [
  "major", "minor", "majorBlues", "minorBlues", "majorPentatonic", "minorPentatonic", "mixolydian", "locrian", "wholeTone", "dorian"
] as const;
export type ScaleType = typeof allScaleTypes[number];
