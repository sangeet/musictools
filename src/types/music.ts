// Music theory types

export type NoteType = string;
export type ChordType = string;
export type ScaleType = string;

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
