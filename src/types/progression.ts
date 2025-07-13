// Chord progression types
import type { ChordType, NoteType } from "./music";
import { ScaleType } from "./music";

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