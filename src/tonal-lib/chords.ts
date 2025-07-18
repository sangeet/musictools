// Functions for Tonal-based chord and progression logic
import { Chord, Scale } from "tonal";
import { NoteType, ChordType, ScaleType, ChordNumberReference, allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/types";

function normalizeNotes(notes: string[]): NoteType[] {
  // Only allow notes that are in allNotes
  return notes.filter(n => allNotes.includes(n as NoteType));
}

function normalizeSymbol(symbol: string, chordType: ChordType): string {
  // Map Tonal chord symbols to standard display
  if (symbol) return symbol;
  // Fallback mapping for common types
  const typeMap: Record<string, string> = {
    major: "",
    minor: "m",
    dominant7: "7",
    diminished: "dim",
    augmented: "aug",
    sus4: "sus4",
    sus2: "sus2",
    "6": "6",
    maj7: "maj7",
    "9": "9",
    "11": "11",
    "13": "13",
    add9: "add9",
    add11: "add11",
    add13: "add13",
    m7: "m7",
    m9: "m9",
    m11: "m11",
    m13: "m13"
  };
  return typeMap[chordType] !== undefined ? typeMap[chordType] : chordType;
}

export function generateScale(rootNote: NoteType, scaleType: ScaleType): NoteType[] {
  return normalizeNotes(Scale.get(`${rootNote} ${scaleType}`).notes);
}

export function generateChord(rootNote: NoteType, chordType: ChordType): TonalLib.Chord {
  const chord = Chord.get(`${rootNote} ${chordType}`);
  return {
    root: rootNote,
    type: chordType,
    notes: normalizeNotes(chord.notes),
    symbol: chord.symbol ? chord.symbol : `${rootNote}${normalizeSymbol("", chordType)}`
  };
}

export function generateChordFromReference(
  rootNote: NoteType,
  chordReference: ChordNumberReference
): TonalLib.Chord {
  const scaleNotes = generateScale(rootNote, "major");
  const chordRoot = scaleNotes[(chordReference.number - 1) % scaleNotes.length];
  return generateChord(chordRoot, chordReference.type);
}

export function generateProgression(
  chordProgression: ChordNumberReference[][],
  rootNote: NoteType
): TonalLib.ChordProgression {
  return chordProgression.map(line => line.map(chord => generateChordFromReference(rootNote, chord)));
}
