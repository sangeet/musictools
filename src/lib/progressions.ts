import { allScales, ChordProgreessionReference, Scale, ScaleLogic } from "./chords";

const twelveBarBluesProgression: ChordProgreessionReference = [
    [{ number: 1, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
    [{ number: 4, type: "dominant" }, { number: 4, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
    [{ number: 5, type: "dominant" }, { number: 4, type: "dominant" }, { number: 1, type: "dominant" }, { number: 1, type: "dominant" }],
];

const twelveBarFiveTurnaround: ChordProgreessionReference = [
    [{ number: 1, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 5, type: "major" }],
];

const twelveBarQuickChange: ChordProgreessionReference = [
    [{ number: 1, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
];

const twelveBarQuickChangeFiveTurnaround: ChordProgreessionReference = [
    [{ number: 1, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 4, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 1, type: "major" }],
    [{ number: 5, type: "major" }, { number: 4, type: "major" }, { number: 1, type: "major" }, { number: 5, type: "major" }],
];

const majorMinorMixTest: ChordProgreessionReference = [
    [
        { number: 1, type: "major" },
        { number: 5, type: "major" },
        { number: 6, type: "minor" },
        { number: 4, type: "major" },
    ]
];

const jazzTwoFiveOne: ChordProgreessionReference = [
    [
        { number: 2, type: "minor" },
        { number: 5, type: "dominant" },
        { number: 1, type: "major" },
        { number: 1, type: "major" },
    ]
];

const jazzTurnaround: ChordProgreessionReference = [
    [
        { number: 1, type: "major" },
        { number: 6, type: "minor" },
        { number: 2, type: "minor" },
        { number: 5, type: "dominant" },
    ]
];

type ScaleRecommendation = {
    name: string;
    scale: ScaleLogic;
}

const recommendedBluesScales: ScaleRecommendation[] = [
    {
        name: "Blues",
        scale: allScales.minorBluesScale,
    },
    {
        name: "Mixolydian",
        scale: allScales.mixolydian,
    }
];

const jazzScales: ScaleRecommendation[] = [
    {
        name: "Major",
        scale: allScales.major,
    },
    {
        name: "Dorian",
        scale: allScales.dorian,
    },
    {
        name: "Mixolydian",
        scale: allScales.mixolydian,
    },
];

const listProgressions: {
    name: string,
    progression: ChordProgreessionReference,
    recommendedScales: ScaleRecommendation[],
}[] = [
    {
        name: "Standard Blues",
        progression: twelveBarBluesProgression,
        recommendedScales: recommendedBluesScales,
    },
    {
        name: "Standard Blues V Turnaround",
        progression: twelveBarFiveTurnaround,
        recommendedScales: recommendedBluesScales,
    },
    {
        name: "Quick Change Blues",
        progression: twelveBarQuickChange,
        recommendedScales: recommendedBluesScales,
    },
    {
        name: "Quick Change Blues V Turnaround",
        progression: twelveBarQuickChangeFiveTurnaround,
        recommendedScales: recommendedBluesScales,
    },
    {
        name: "Jazz 2-5-1",
        progression: jazzTwoFiveOne,
        recommendedScales: jazzScales,
    },
    {
        name: "Jazz Turnaround",
        progression: jazzTurnaround,
        recommendedScales: jazzScales,
    },
];

export { listProgressions }