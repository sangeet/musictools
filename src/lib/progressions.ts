import { ChordProgressionReference } from "../types/progression";

const now = Date.now();

const listProgressions: ChordProgressionReference[] = [
    {
        name: "Standard Blues",
        defaultNote: "C",
        description: "Classic 12-bar blues progression in dominant chords.",
        source: "default",
        creationDate: now,
        progression: [
            [{ number: 1, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
            [{ number: 4, type: "dominant" }, { number: 4, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
            [{ number: 5, type: "dominant" }, { number: 4, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
        ],
        recommendedScales: [
            { scale: "mixolydian" },
            { scale: "majorBlues" }
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
            { scale: "majorBlues" }
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
        defaultNote: "C",
        description: "Classic jazz 2-5-1 turnaround progression.",
        source: "default",
        creationDate: now,
        progression: [
            [
                { number: 2, type: "minor" },
                { number: 5, type: "dominant" },
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
                { number: 5, type: "dominant" },
            ],
        ],
        recommendedScales: [
            { scale: "major" },
            { scale: "dorian" }
        ]
    },
];

export { listProgressions };