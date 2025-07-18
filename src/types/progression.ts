import { NoteType, ChordType, ScaleType, ChordNumberReference } from "@/tonal-lib/types";

// Chord progression types
// Use TonalLib types for full compatibility

export type ScaleRecommendation = {
  scale: TonalLib.ScaleType; // Use TonalJS scale type names: "major", "minor", "blues", "pentatonic", etc.
};

export type ChordProgressionReference = {
  name: string;
  defaultNote: TonalLib.NoteType;
  description: string;
  source: "custom" | "default" | "ai";
  creationDate: number;
  progression: ChordNumberReference[][];
  recommendedScales: ScaleRecommendation[];
};