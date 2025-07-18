import { NoteType, ChordType, ScaleType, Chord, ChordNumberReference, ScaleRecommendation, ChordProgressionReference, ChordProgression, allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/types";

export const KeyboardVisual = ({
  highlightedNotes,
  octaves = 1,
  width = 210 // default width in px for 1 octave (7 white keys * 30px)
}: {
  highlightedNotes: TonalLib.NoteType[],
  octaves?: number,
  width?: number
}) => {
  const whiteKeyCount = 7 * octaves;
  const whiteKeyWidth = width / whiteKeyCount;
  const whiteKeyHeight = whiteKeyWidth * 3.3;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyHeight = whiteKeyHeight * 0.6;

  // White and black key order for each octave
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackNotes = [
    { note: "Db", pos: 0.7 },
    { note: "Eb", pos: 1.7 },
    // skip E-F
    { note: "Gb", pos: 3.7 },
    { note: "Ab", pos: 4.7 },
    { note: "Bb", pos: 5.7 }
  ];

  function logOnClick() {
    console.log(highlightedNotes)
  }

  return (
    <div
      className="relative"
      onClick={logOnClick}
      style={{
        width: width,
        height: whiteKeyHeight,
        minWidth: width,
        minHeight: whiteKeyHeight,
        maxWidth: width,
        maxHeight: whiteKeyHeight,
        userSelect: "none"
      }}
    >
      {/* White keys */}
      <div className="absolute left-0 top-0 flex" style={{ zIndex: 1 }}>
        {Array.from({ length: octaves }).flatMap((_, oct) =>
          whiteNotes.map((n) => {
            const note = n as TonalLib.NoteType;
            return (
              <div
                key={`w-${oct}-${n}`}
                style={{
                  width: whiteKeyWidth,
                  height: whiteKeyHeight
                }}
                className={`border border-black ${highlightedNotes.includes(note) ? "bg-yellow-400" : "bg-white"}`}
              />
            );
          })
        )}
      </div>
      {/* Black keys */}
      <div className="absolute top-0" style={{ zIndex: 2, width: "100%", height: blackKeyHeight, left: width / 25.0 }}>
        {Array.from({ length: octaves }).flatMap((_, oct) =>
          blackNotes.map(({ note, pos }) => {
            const left = ((oct * 7 + pos) * whiteKeyWidth) - blackKeyWidth / 2;
            return (
              <div
                key={`b-${oct}-${note}`}
                style={{
                  position: "absolute",
                  left,
                  width: blackKeyWidth,
                  height: blackKeyHeight
                }}
                className={`${highlightedNotes.includes(note as TonalLib.NoteType) ? "bg-yellow-500" : "bg-gray-800"} border border-black rounded-b`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
