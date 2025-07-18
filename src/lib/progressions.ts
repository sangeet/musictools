import { NoteType, ChordType, ScaleType, ChordNumberReference, ChordProgressionReference, ChordProgression, allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/types";

const now = Date.now();

const listProgressions: ChordProgressionReference[] = [
    {
        name: "Standard Blues",
        defaultNote: "C",
        description: "Classic 12-bar blues progression in dominant chords.",
        source: "default",
        creationDate: now,
        progression: [
            [{ number: 1, type: "7" }, { number: 1, type: "7" }, { number: 1, type: "7" }, { number: 1, type: "7" }],
            [{ number: 4, type: "7" }, { number: 4, type: "7" }, { number: 1, type: "7" }, { number: 1, type: "7" }],
            [{ number: 5, type: "7" }, { number: 4, type: "7" }, { number: 1, type: "7" }, { number: 1, type: "7" }],
        ],
        recommendedScales: [
            { scale: "mixolydian" },
            { scale: "blues" }
        ]
    },
    {
        name: "Standard Blues V Turnaround",
        defaultNote: "C",
        description: "12-bar blues with a V chord turnaround.",
        source: "default",
        creationDate: now,
        progression: [
            [{ number: 1, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 5, type: "major" }],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "mixolydian" }
        ]
    },
    {
        name: "Quick Change Blues",
        defaultNote: "C",
        description: "Blues progression with a quick change to the IV chord.",
        source: "default",
        creationDate: now,
        progression: [
            [{ number: 1, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "blues" }
        ]
    },
    {
        name: "Quick Change Blues V Turnaround",
        defaultNote: "C",
        description: "Quick change blues with a V chord turnaround.",
        source: "default",
        creationDate: now,
        progression: [
            [{ number: 1, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
            [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 5, type: "major" }],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "mixolydian" }
        ]
    },
    {
        name: "Jazz 2-5-1",
        defaultNote: "F",
        description: "Classic jazz 2-5-1 turnaround progression.",
        source: "default",
        creationDate: now,
        progression: [
            [
                { number: 2, type: "minor" },
                { number: 5, type: "7" },
                { number: 1, type: "major" },
                { number: 1, type: "major" },
            ],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "dorian" }
        ]
    },
    {
        name: "Jazz Turnaround",
        defaultNote: "C",
        description: "Jazz turnaround progression.",
        source: "default",
        creationDate: now,
        progression: [
            [
                { number: 1, type: "major" },
                { number: 6, type: "minor" },
                { number: 2, type: "minor" },
                { number: 5, type: "7" },
            ],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "dorian" }
        ]
    },
    {
        name: "All Chord Types Test",
        defaultNote: "C",
        description: "Test progression with all supported TonalJS chord types.",
        source: "default",
        creationDate: now,
        progression: [
            [
                { number: 1, type: "major" },
                { number: 1, type: "minor" },
                { number: 1, type: "7" },
                { number: 1, type: "m7" },
                { number: 1, type: "dim" },
                { number: 1, type: "aug" },
                { number: 1, type: "sus4" },
                { number: 1, type: "sus2" },
                { number: 1, type: "6" },
                { number: 1, type: "maj7" },
                { number: 1, type: "9" },
                { number: 1, type: "11" },
                { number: 1, type: "13" },
                { number: 1, type: "add9" },
                { number: 1, type: "add11" },
                { number: 1, type: "add13" },
            ],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "minor" },
            { scale: "blues" },
            { scale: "pentatonic" },
            { scale: "mixolydian" },
            { scale: "locrian" },
            { scale: "whole tone" },
            { scale: "dorian" }
        ]
    },
];

export { listProgressions };