// Pre-crafted canonical chord-melody arrangements

export interface TabBeat {
  id: string;
  lyric: string;
  melodyPitch: string;      // e.g. "G4", "C5"
  melodyMidi: number;
  chord?: string;           // Chord symbol above the beat (if chord strike)
  isChordStrike: boolean;
  frets: [number, number, number, number]; // [g, C, E, A] strings (-1 = muted/unplayed)
  durationSec: number;
}

export interface TabMeasure {
  measureNumber: number;
  beats: TabBeat[];
}

export interface PresetSong {
  id: string;
  title: string;
  artist: string;
  key: string;
  timeSignature: string;
  tempoBpm: number;
  measures: TabMeasure[];
}

export const CANT_HELP_FALLING_IN_LOVE: PresetSong = {
  id: "cant-help-falling-in-love",
  title: "Can't Help Falling in Love",
  artist: "Elvis Presley",
  key: "C Major",
  timeSignature: "6/8",
  tempoBpm: 68,
  measures: [
    // Measure 1: Wise (C chord with G4 melody on top)
    {
      measureNumber: 1,
      beats: [
        {
          id: "m1-b1",
          lyric: "Wise",
          melodyPitch: "G4",
          melodyMidi: 67,
          chord: "C",
          isChordStrike: true,
          frets: [0, 0, 3, -1], // g(0), C(0), E(3)=G4, A muted -> G4 is top note!
          durationSec: 1.1
        }
      ]
    },
    // Measure 2: men (Em chord with B4 melody on 1st string 2nd fret)
    {
      measureNumber: 2,
      beats: [
        {
          id: "m2-b1",
          lyric: "men",
          melodyPitch: "B4",
          melodyMidi: 71,
          chord: "Em",
          isChordStrike: true,
          frets: [0, 4, 3, 2], // Standard Em, 1st string fret 2 = B4 on top!
          durationSec: 1.1
        }
      ]
    },
    // Measure 3: say (Am chord with G4 melody note)
    {
      measureNumber: 3,
      beats: [
        {
          id: "m3-b1",
          lyric: "say",
          melodyPitch: "G4",
          melodyMidi: 67,
          chord: "Am7",
          isChordStrike: true,
          frets: [0, 0, 0, -1], // Open strings with G4 ringing
          durationSec: 1.2
        }
      ]
    },
    // Measure 4: on - ly (Am passing melody A4 -> B4 -> C5)
    {
      measureNumber: 4,
      beats: [
        {
          id: "m4-b1",
          lyric: "on-",
          melodyPitch: "A4",
          melodyMidi: 69,
          isChordStrike: false,
          frets: [-1, -1, -1, 0], // String 1 open A4
          durationSec: 0.45
        },
        {
          id: "m4-b2",
          lyric: "ly",
          melodyPitch: "B4",
          melodyMidi: 71,
          isChordStrike: false,
          frets: [-1, -1, -1, 2], // String 1 fret 2 B4
          durationSec: 0.45
        }
      ]
    },
    // Measure 5: fools (F chord with C5 melody on 1st string 3rd fret pinky!)
    {
      measureNumber: 5,
      beats: [
        {
          id: "m5-b1",
          lyric: "fools",
          melodyPitch: "C5",
          melodyMidi: 72,
          chord: "F (C-lead)",
          isChordStrike: true,
          frets: [2, 0, 1, 3], // F shape with C5 on top!
          durationSec: 1.1
        }
      ]
    },
    // Measure 6: rush (C chord with B4 melody passing down)
    {
      measureNumber: 6,
      beats: [
        {
          id: "m6-b1",
          lyric: "rush",
          melodyPitch: "B4",
          melodyMidi: 71,
          chord: "Cmaj7",
          isChordStrike: true,
          frets: [0, 0, 0, 2], // Cmaj7 has B4 on top!
          durationSec: 1.0
        }
      ]
    },
    // Measure 7: in (G chord with G4 melody)
    {
      measureNumber: 7,
      beats: [
        {
          id: "m7-b1",
          lyric: "in,",
          melodyPitch: "G4",
          melodyMidi: 67,
          chord: "G",
          isChordStrike: true,
          frets: [0, 2, 3, -1], // G with G4 on top
          durationSec: 1.2
        }
      ]
    },
    // Measure 8: but I (pickup passing notes G4 -> F4)
    {
      measureNumber: 8,
      beats: [
        {
          id: "m8-b1",
          lyric: "but",
          melodyPitch: "G4",
          melodyMidi: 67,
          isChordStrike: false,
          frets: [-1, -1, 3, -1], // E-string fret 3 = G4
          durationSec: 0.45
        },
        {
          id: "m8-b2",
          lyric: "I",
          melodyPitch: "F4",
          melodyMidi: 65,
          isChordStrike: false,
          frets: [-1, -1, 1, -1], // E-string fret 1 = F4
          durationSec: 0.5
        }
      ]
    },
    // Measure 9: can't (F chord with F4)
    {
      measureNumber: 9,
      beats: [
        {
          id: "m9-b1",
          lyric: "can't",
          melodyPitch: "F4",
          melodyMidi: 65,
          chord: "F",
          isChordStrike: true,
          frets: [2, 0, 1, -1], // F chord with F4 on E-string
          durationSec: 0.9
        }
      ]
    },
    // Measure 10: help (G chord with G4)
    {
      measureNumber: 10,
      beats: [
        {
          id: "m10-b1",
          lyric: "help",
          melodyPitch: "G4",
          melodyMidi: 67,
          chord: "G",
          isChordStrike: true,
          frets: [0, 2, 3, -1],
          durationSec: 0.9
        }
      ]
    },
    // Measure 11: fall-ing in (Am chord with A4 -> B4 -> C5)
    {
      measureNumber: 11,
      beats: [
        {
          id: "m11-b1",
          lyric: "fall-",
          melodyPitch: "A4",
          melodyMidi: 69,
          chord: "Am",
          isChordStrike: true,
          frets: [2, 0, 0, 0], // Standard Am with open A4 on top!
          durationSec: 0.6
        },
        {
          id: "m11-b2",
          lyric: "ing",
          melodyPitch: "B4",
          melodyMidi: 71,
          isChordStrike: false,
          frets: [-1, -1, -1, 2],
          durationSec: 0.45
        },
        {
          id: "m11-b3",
          lyric: "in",
          melodyPitch: "C5",
          melodyMidi: 72,
          isChordStrike: false,
          frets: [-1, -1, -1, 3],
          durationSec: 0.5
        }
      ]
    },
    // Measure 12: love (C chord with C5 melody on top!)
    {
      measureNumber: 12,
      beats: [
        {
          id: "m12-b1",
          lyric: "love",
          melodyPitch: "C5",
          melodyMidi: 72,
          chord: "C",
          isChordStrike: true,
          frets: [0, 0, 0, 3], // Classic open C with C5 on top!
          durationSec: 1.0
        }
      ]
    },
    // Measure 13: with (G chord with B4 or D5 melody)
    {
      measureNumber: 13,
      beats: [
        {
          id: "m13-b1",
          lyric: "with",
          melodyPitch: "B4",
          melodyMidi: 71,
          chord: "G",
          isChordStrike: true,
          frets: [0, 2, 3, 2], // Standard G with B4 on 1st string 2nd fret!
          durationSec: 0.9
        }
      ]
    },
    // Measure 14: you (C chord resolution)
    {
      measureNumber: 14,
      beats: [
        {
          id: "m14-b1",
          lyric: "you.",
          melodyPitch: "C5",
          melodyMidi: 72,
          chord: "C",
          isChordStrike: true,
          frets: [0, 0, 0, 3],
          durationSec: 1.6
        }
      ]
    }
  ]
};
