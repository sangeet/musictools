import { ChordNumberReference, ChordProgressionReference } from "../types/progression";
import { NoteType, ChordType, Chord, ChordProgression, ScaleLogic, ChordLogic, Scale } from "../types/music";

function generateProgression(chordProgression: ChordProgressionReference["progression"], rootNote: NoteType): ChordProgression {
    const progression = chordProgression.map(line => line.map(chord => generateChordFromReference(rootNote, chord)));
    return progression
}

export const allNotes: NoteType[] = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export const majorScaleLogic: ScaleLogic = [2, 2, 1, 2, 2, 2, 1];
export const minorScaleLogic: ScaleLogic = [2, 1, 2, 2, 1, 2, 2];
export const majorBluesScale: ScaleLogic = [2, 1, 1, 3, 2];
export const minorBluesScale: ScaleLogic = [3, 2, 1, 1, 3];
export const majorPentatonic: ScaleLogic = [2, 2, 3, 2, 3];
export const minorPentatonic: ScaleLogic = [3, 2, 2, 3];
export const mixolydian: ScaleLogic = [2, 2, 1, 2, 2, 1, 2];
export const locrian: ScaleLogic = [1, 2, 2, 1, 2, 2, 2];
export const wholeToneScale: ScaleLogic = [2, 2, 2, 2, 2, 2];
export const dorian: ScaleLogic = [2, 1, 2, 2, 2, 1, 2];

export type ScaleType = "major" | "minor" | "majorBlues" | "minorBlues" | "majorPentatonic" | "minorPentatonic" | "mixolydian" | "locrian" | "wholeTone";

export const allScales: Record<ScaleType | "dorian", ScaleLogic> = {
    major: majorScaleLogic,
    minor: minorScaleLogic,
    majorBlues: majorBluesScale,
    minorBlues: minorBluesScale,
    majorPentatonic: majorPentatonic,
    minorPentatonic: minorPentatonic,
    mixolydian: mixolydian,
    locrian: locrian,
    wholeTone: wholeToneScale,
    dorian: dorian
};

export const majorChordLogic: ChordLogic = { logic: [1, 3, 5], scaleLogic: allScales.major, suffix: "" };
export const minorChordLogic: ChordLogic = { logic: [1, 3, 5], scaleLogic: allScales.minor, suffix: "m" };

export const allChordLogic: Record<ChordType, ChordLogic> = {
    major: { logic: [1, 3, 5], scaleLogic: allScales.major, suffix: "" },
    minor: { logic: [1, 3, 5], scaleLogic: allScales.minor, suffix: "m" },
    dominant: { logic: [1, 3, 5, 7], scaleLogic: allScales.mixolydian, suffix: "7" },
    diminished: { logic: [1, 3, 5], scaleLogic: allScales.locrian, suffix: "dim" },
    augmented: { logic: [1, 3, 5], scaleLogic: allScales.wholeTone, suffix: "aug" },
    sus4: { logic: [1, 4, 5], scaleLogic: allScales.major, suffix: "sus4" },
    sus2: { logic: [1, 2, 5], scaleLogic: allScales.major, suffix: "sus2" },
    sixth: { logic: [1, 3, 5, 6], scaleLogic: allScales.major, suffix: "6" },
    maj7: { logic: [1, 3, 5, 7], scaleLogic: allScales.major, suffix: "maj7" },
    ninth: { logic: [1, 3, 5, 7, 9], scaleLogic: allScales.major, suffix: "9" },
    eleventh: { logic: [1, 3, 5, 7, 9, 11], scaleLogic: allScales.major, suffix: "11" },
    thirteenth: { logic: [1, 3, 5, 7, 9, 11, 13], scaleLogic: allScales.major, suffix: "13" },
    add9: { logic: [1, 3, 5, 9], scaleLogic: allScales.major, suffix: "add9" },
    add11: { logic: [1, 3, 5, 11], scaleLogic: allScales.major, suffix: "add11" },
    add13: { logic: [1, 3, 5, 13], scaleLogic: allScales.major, suffix: "add13" },
    m7: { logic: [1, 3, 5, 7], scaleLogic: allScales.minor, suffix: "m7" },
    m9: { logic: [1, 3, 5, 7, 9], scaleLogic: allScales.minor, suffix: "m9" },
    m11: { logic: [1, 3, 5, 7, 9, 11], scaleLogic: allScales.minor, suffix: "m11" },
    m13: { logic: [1, 3, 5, 7, 9, 11, 13], scaleLogic: allScales.minor, suffix: "m13" }
};

function generateScale(rootNote: NoteType, scaleLogic: ScaleLogic): NoteType[] {
    const rootIndex = allNotes.indexOf(rootNote);
    const scale: NoteType[] = [];
    let currentIndex = rootIndex;

    scale.push(allNotes[currentIndex]);

    // Only add steps.length notes, not steps.length + 1
    for (let i = 0; i < scaleLogic.length; i++) {
        currentIndex = (currentIndex + scaleLogic[i]) % allNotes.length;
        scale.push(allNotes[currentIndex]);
    }

    const uniqueScale = Array.from(new Set(scale));

    return uniqueScale;
}

function generateScales(rootNote: NoteType): {
    majorScale: Scale;
    minorScale: Scale;
} {
    const majorScale = generateScale(rootNote, majorScaleLogic);
    const minorScale = generateScale(rootNote, minorScaleLogic);
    return {
        majorScale,
        minorScale
    };
}

function generateChord(rootNote: NoteType, chordLogic: ChordLogic): Chord {
    const notes: NoteType[] = [];
    const scale = generateScale(rootNote, chordLogic.scaleLogic);
    for (const step of chordLogic.logic) {
        notes.push(scale[(step - 1) % scale.length]);
    }
    return {
        root: rootNote,
        type: Object.keys(allChordLogic).find(key => allChordLogic[key as ChordType] === chordLogic) as ChordType ?? "major",
        notes,
        symbol: `${rootNote}${chordLogic.suffix}`
    };
}

function generateChordFromReference(
    rootNote: NoteType,
    chordReference: ChordNumberReference
): Chord {
    const chordLogic = allChordLogic[chordReference.type];
    const majorScale = generateScale(rootNote, allScales.major);
    const chordNote = majorScale[(chordReference.number - 1) % majorScale.length];
    if (!chordLogic) {
        throw new Error(`Chord type ${chordReference.type} not found`);
    }
    return generateChord(chordNote, chordLogic);
}

function generateChords(rootNote: NoteType): Record<ChordType, Chord> {
    const chords: Record<ChordType, Chord> = {} as Record<ChordType, Chord>;

    for (const [type, logic] of Object.entries(allChordLogic)) {
        const chord = generateChord(rootNote, logic);
        chords[type as ChordType] = {
            root: rootNote,
            type: type as ChordType,
            notes: chord.notes,
            symbol: `${rootNote}${logic.suffix}`
        };
    }

    return chords;
}

export { generateScales, generateChords, generateProgression, generateScale, generateChordFromReference};