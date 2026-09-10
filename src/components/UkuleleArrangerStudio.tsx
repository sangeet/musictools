"use client";

import React, { useState, useRef, useCallback } from "react";
import UkuleleTabStaff from "./UkuleleTabStaff";
import { CANT_HELP_FALLING_IN_LOVE, TabBeat, TabMeasure } from "@/lib/presetArrangements";

export default function UkuleleArrangerStudio() {
  const [song, setSong] = useState(CANT_HELP_FALLING_IN_LOVE);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState<number>(CANT_HELP_FALLING_IN_LOVE.tempoBpm);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopRequestedRef = useRef(false);

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
    (midiPitch: number, startTime = 0, duration = 1.1) => {
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
      filter.frequency.setValueAtTime(Math.min(freq * 5, 4500), t);

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
    (frets: [number, number, number, number], startTime = 0) => {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = startTime || ctx.currentTime;
      // High-G uke: String 4 (g=67), String 3 (C=60), String 2 (E=64), String 1 (A=69)
      const baseMidis = [67, 60, 64, 69];
      const strumSpeed = 0.032;

      frets.forEach((fret, i) => {
        if (fret >= 0) {
          playPitch(baseMidis[i] + fret, t + i * strumSpeed, 1.8);
        }
      });
    },
    [getAudioContext, playPitch]
  );

  const handleBeatClick = (beat: TabBeat) => {
    setActiveBeatId(beat.id);
    if (beat.isChordStrike) {
      strumUkuleleFrets(beat.frets);
    } else {
      playPitch(beat.melodyMidi);
    }
  };

  // Synchronized Playback
  const handlePlayArrangement = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    setIsPlaying(true);
    stopRequestedRef.current = false;

    // Collect all beats in sequence
    const sequence: TabBeat[] = [];
    song.measures.forEach((m) => {
      m.beats.forEach((b) => sequence.push(b));
    });

    let currentDelaySec = 0.1;
    const tempoMultiplier = 68 / tempo;

    sequence.forEach((beat, index) => {
      const scheduledTime = ctx.currentTime + currentDelaySec;
      const beatDuration = beat.durationSec * tempoMultiplier;

      // Schedule Audio
      if (beat.isChordStrike) {
        strumUkuleleFrets(beat.frets, scheduledTime);
      } else {
        playPitch(beat.melodyMidi, scheduledTime, 0.8);
      }

      // Schedule Visual cursor
      const delayMs = currentDelaySec * 1000;
      setTimeout(() => {
        if (!stopRequestedRef.current) {
          setActiveBeatId(beat.id);
        }
      }, delayMs);

      currentDelaySec += beatDuration;

      // End of song
      if (index === sequence.length - 1) {
        setTimeout(() => {
          setIsPlaying(false);
          setActiveBeatId(null);
        }, (currentDelaySec + 0.6) * 1000);
      }
    });
  };

  const handleStop = () => {
    stopRequestedRef.current = true;
    setIsPlaying(false);
    setActiveBeatId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold mb-2">
            <span>✨</span>
            <span>Chord-Melody Tablature Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{song.title}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
              {song.key}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Arranged for Ukulele (G-C-E-A). The vocal melody pitch is placed on the top vibrating string for clear melodic projection.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono">
            <span className="text-slate-500 font-bold">TEMPO:</span>
            <input
              type="range"
              min={50}
              max={110}
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-20 accent-amber-500"
            />
            <span className="font-bold text-amber-400 w-8">{tempo}</span>
          </div>

          <button
            onClick={isPlaying ? handleStop : handlePlayArrangement}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition shadow-lg ${
              isPlaying
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 active:scale-95"
            }`}
          >
            {isPlaying ? (
              <>
                <span>■</span>
                <span>Stop Playback</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Play Arrangement</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The Continuous Horizontal Tab Staff */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interactive Ukulele Tablature (Click any beat to audition)
          </span>
          <span className="text-xs text-slate-500">
            Top melody highlighted in <strong className="text-amber-400">amber</strong>
          </span>
        </div>

        <UkuleleTabStaff
          measures={song.measures}
          activeBeatId={activeBeatId}
          onBeatClick={handleBeatClick}
        />
      </div>

      {/* Harmony & Melody Legend Breakdown */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Arrangement Structure &amp; Voice-Leading Guide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-amber-400">1. Chord Strums (Full Shapes)</span>
            <p className="text-slate-400 leading-relaxed">
              White circles show chord tones fretted across the strings. The highest sounded note (in gold) matches the vocal lyric syllable.
            </p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-sky-400">2. Passing Single Notes</span>
            <p className="text-slate-400 leading-relaxed">
              Blue dots indicate single-note melodic fills (like the climbing triplet <strong className="text-slate-300">A &rarr; B &rarr; C</strong> on <em>&quot;on-ly&quot;</em>) connecting major chords.
            </p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="font-bold text-emerald-400">3. Pinky Chord Extensions</span>
            <p className="text-slate-400 leading-relaxed">
              On <em>&quot;fools&quot;</em>, the standard <strong className="text-slate-300">F chord [2,0,1,0]</strong> extends the pinky to Fret 3 on String 1 to hit <strong className="text-slate-300">C5</strong> on top!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
