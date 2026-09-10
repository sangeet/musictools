"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ArrangementResult,
  VoicedTabItem,
  pitchToMidi,
  solveUkuleleChordMelodyVoicing,
  solveUkuleleSingleMelodyNote
} from "@/lib/ukuleleArrangerEngine";

const DEFAULT_SAMPLE_CHART = `[Verse 1]
C    Em   Am       F     C   G
Wise man say only fools rush in
    F G     Am   F          C    G    C
But I can't help falling in love with you
C     Em Am            F   C  G
Shall I stay would it be  a  sin
   F G     Am   F          C   G    C
If I can't help falling in love with you`;

export default function UkuleleArrangerStudio() {
  const [chartInput, setChartInput] = useState(DEFAULT_SAMPLE_CHART);
  const [songTitleInput, setSongTitleInput] = useState("Can't Help Falling in Love");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [arrangement, setArrangement] = useState<ArrangementResult | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playPitch = useCallback(
    (midiPitch: number, startTime = 0, duration = 1.2) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = startTime || ctx.currentTime;
      const freq = 440 * Math.pow(2, (midiPitch - 69) / 12);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(Math.min(freq * 4.5, 4200), t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    },
    [getAudioContext]
  );

  const strumUkuleleFrets = useCallback(
    (frets: number[], startTime = 0) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = startTime || ctx.currentTime;
      // High-G uke: String 4 (G4=67), String 3 (C4=60), String 2 (E4=64), String 1 (A4=69)
      const baseMidis = [67, 60, 64, 69];
      const strumDelay = 0.035;

      frets.forEach((fret, i) => {
        if (fret >= 0) {
          playPitch(baseMidis[i] + fret, t + i * strumDelay, 1.8);
        }
      });
    },
    [getAudioContext, playPitch]
  );

  // Call Gemini API to extract melody and build chord melody tabs
  const handleGenerateArrangement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/arrange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartText: chartInput,
          songTitle: songTitleInput
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }

      const rawData = await res.json();
      setModelUsed(rawData.modelUsed || "Gemini Flash");

      // Now pass the raw measures through our deterministic CAGFD voicing solver!
      const enrichedMeasures = (rawData.measures || []).map(
        (m: { measureNumber: number; chord: string; items: Array<{ lyric: string; melody: string; isChordStrike?: boolean; chord?: string }> }) => {
          const chordName = m.chord || "C";
          const voicedItems: VoicedTabItem[] = (m.items || []).map(item => {
            const pitch = item.melody || "C5";
            const midi = pitchToMidi(pitch);
            const isStrike = Boolean(item.isChordStrike || item.chord);

            if (isStrike) {
              const solved = solveUkuleleChordMelodyVoicing(chordName, midi);
              const nonZero = solved.frets.filter(f => f > 0);
              return {
                lyric: item.lyric || "",
                melodyPitch: pitch,
                melodyMidi: midi,
                chordName,
                isChordStrike: true,
                frets: solved.frets,
                fretboardRange: [
                  nonZero.length ? Math.min(...nonZero) : 0,
                  Math.max(...solved.frets)
                ],
                shapeLabel: solved.label
              };
            } else {
              const single = solveUkuleleSingleMelodyNote(midi);
              return {
                lyric: item.lyric || "",
                melodyPitch: pitch,
                melodyMidi: midi,
                isChordStrike: false,
                frets: single.frets,
                fretboardRange: [0, Math.max(...single.frets)],
                shapeLabel: single.label
              };
            }
          });

          return {
            measureNumber: m.measureNumber,
            chord: chordName,
            items: voicedItems
          };
        }
      );

      setArrangement({
        songTitle: rawData.songTitle || songTitleInput || "Ukulele Arrangement",
        key: rawData.key || "C",
        tempo: rawData.tempo || 76,
        measures: enrichedMeasures
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate arrangement.");
    } finally {
      setLoading(false);
    }
  };

  // Full Song Playback
  const handlePlaySong = () => {
    if (!arrangement) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    isPlayingRef.current = true;
    let timeCursor = ctx.currentTime + 0.1;
    let globalIndex = 0;

    const allItems: Array<{ item: VoicedTabItem; globalIdx: number }> = [];
    arrangement.measures.forEach(m => {
      m.items.forEach(item => {
        allItems.push({ item, globalIdx: globalIndex++ });
      });
    });

    allItems.forEach(({ item, globalIdx }, i) => {
      const stepDelay = item.isChordStrike ? 0.9 : 0.45;
      const scheduledTime = timeCursor;
      timeCursor += stepDelay;

      // Schedule UI highlight
      const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (isPlayingRef.current) setPlayingIdx(globalIdx);
      }, delayMs);

      // Schedule audio
      if (item.isChordStrike) {
        strumUkuleleFrets(item.frets, scheduledTime);
      } else {
        playPitch(item.melodyMidi, scheduledTime, 0.8);
      }

      if (i === allItems.length - 1) {
        setTimeout(() => {
          setPlayingIdx(null);
          isPlayingRef.current = false;
        }, delayMs + 1000);
      }
    });
  };

  const handleStopPlayback = () => {
    isPlayingRef.current = false;
    setPlayingIdx(null);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <span>✨</span>
            <span>Gemini AI + CAGFD Theory Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Ukulele Chord-Melody Arranger
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Drop any chord chart and lyrics. Gemini detects the vocal melody pitches, and our mathematical fretboard engine solves ergonomic ukulele chord shapes with the melody singing on top.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {modelUsed && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
              ⚡ {modelUsed}
            </span>
          )}
        </div>
      </div>

      {/* Input Chart Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Song Title / Artist (Optional)
            </label>
            <input
              type="text"
              value={songTitleInput}
              onChange={e => setSongTitleInput(e.target.value)}
              placeholder="e.g. Can't Help Falling in Love - Elvis Presley"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSongTitleInput("Can't Help Falling in Love");
                setChartInput(DEFAULT_SAMPLE_CHART);
              }}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
            >
              Load Example Song
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Chord Chart &amp; Lyrics Input
          </label>
          <textarea
            rows={7}
            value={chartInput}
            onChange={e => setChartInput(e.target.value)}
            placeholder="Paste chord chart with lyrics here..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-amber-200/90 font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            Uses G-C-E-A tuning with automatic chord inversion voice leading.
          </span>
          <button
            onClick={handleGenerateArrangement}
            disabled={loading || !chartInput.trim()}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg ${
              loading
                ? "bg-amber-600/50 text-slate-300 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-slate-950"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Analyzing &amp; Harmonizing...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Generate Chord-Melody Arrangement</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Arrangement Results & Tablature Viewer */}
      {arrangement && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>🎶</span>
                <span>{arrangement.songTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Key: {arrangement.key}
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Click any chord block or note to audition individual strums, or hit Play Arrangement.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlaySong}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/15"
              >
                <span>▶</span>
                <span>Play Arrangement</span>
              </button>
              <button
                onClick={handleStopPlayback}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                ■ Stop
              </button>
            </div>
          </div>

          {/* Interactive Tablature Measures */}
          <div className="space-y-6 overflow-x-auto pb-2">
            {arrangement.measures.map((measure, mIdx) => (
              <div
                key={`measure-${mIdx}`}
                className="border border-slate-800 bg-slate-950/60 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      M{measure.measureNumber}
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono text-sm rounded-lg">
                      {measure.chord}
                    </span>
                  </div>
                </div>

                {/* Items in this measure */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {measure.items.map((item, itIdx) => {
                    return (
                      <div
                        key={`m-${mIdx}-it-${itIdx}`}
                        onClick={() => {
                          if (item.isChordStrike) {
                            strumUkuleleFrets(item.frets);
                          } else {
                            playPitch(item.melodyMidi);
                          }
                        }}
                        className={`cursor-pointer border rounded-xl p-2.5 flex flex-col justify-between transition-all select-none group ${
                          item.isChordStrike
                            ? "bg-slate-900 border-slate-700 hover:border-amber-400 hover:scale-105 shadow-md"
                            : "bg-slate-950/80 border-slate-800 hover:border-sky-400"
                        }`}
                      >
                        {/* Lyric & Pitch */}
                        <div className="text-center pb-1 border-b border-slate-800">
                          <p className="text-xs font-bold text-white truncate" title={item.lyric}>
                            {item.lyric || "—"}
                          </p>
                          <p className="text-[10px] font-mono text-amber-400 font-bold">
                            {item.melodyPitch}
                          </p>
                        </div>

                        {/* Ukulele Tab Representation */}
                        <div className="py-2 text-center font-mono">
                          {item.isChordStrike ? (
                            <div className="space-y-0.5 text-xs font-bold">
                              {/* String 1 (A) */}
                              <div className="flex justify-between text-[11px] px-1 text-slate-400">
                                <span>A</span>
                                <span className="text-amber-300 font-extrabold">
                                  {item.frets[3] >= 0 ? item.frets[3] : "x"}
                                </span>
                              </div>
                              {/* String 2 (E) */}
                              <div className="flex justify-between text-[11px] px-1 text-slate-400">
                                <span>E</span>
                                <span className="text-slate-200">
                                  {item.frets[2] >= 0 ? item.frets[2] : "x"}
                                </span>
                              </div>
                              {/* String 3 (C) */}
                              <div className="flex justify-between text-[11px] px-1 text-slate-400">
                                <span>C</span>
                                <span className="text-slate-200">
                                  {item.frets[1] >= 0 ? item.frets[1] : "x"}
                                </span>
                              </div>
                              {/* String 4 (G) */}
                              <div className="flex justify-between text-[11px] px-1 text-slate-400">
                                <span>g</span>
                                <span className="text-slate-200">
                                  {item.frets[0] >= 0 ? item.frets[0] : "x"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="py-2 text-center text-sky-400 text-xs font-bold font-mono">
                              Single Note
                              <div className="text-[10px] text-slate-400 mt-1">
                                {item.frets.map((f, i) =>
                                  f >= 0
                                    ? `Str ${4 - i} Fr ${f}`
                                    : null
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Type Tag */}
                        <div className="pt-1 border-t border-slate-800/80 text-center">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.isChordStrike
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-sky-500/10 text-sky-300 border border-sky-500/20"
                            }`}
                          >
                            {item.isChordStrike ? "Chord Strum" : "Passing Note"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
