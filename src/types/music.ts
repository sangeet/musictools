// Music theory types

export type NoteType = "C" | "Db" | "D" | "Eb" | "E" | "F" | "Gb" | "G" | "Ab" | "A" | "Bb" | "B";

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
