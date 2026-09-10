"use client";

import React from "react";
import { TabMeasure, TabBeat } from "@/lib/presetArrangements";

interface UkuleleTabStaffProps {
  measures: TabMeasure[];
  activeBeatId: string | null;
  onBeatClick: (beat: TabBeat) => void;
}

export default function UkuleleTabStaff({
  measures,
  activeBeatId,
  onBeatClick
}: UkuleleTabStaffProps) {
  // String definitions for Ukulele Tab Staff (Top to Bottom: A, E, C, g)
  const strings = [
    { name: "A", idx: 3 },
    { name: "E", idx: 2 },
    { name: "C", idx: 1 },
    { name: "g", idx: 0 }
  ];

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 overflow-x-auto select-none">
      {/* Tab Staff Track */}
      <div className="flex items-stretch min-w-max pb-3 font-mono">
        {/* Left String Headers */}
        <div className="flex flex-col justify-between py-7 pr-3 border-r-2 border-slate-700 text-xs font-extrabold text-amber-400 select-none">
          <span className="h-5 flex items-center">A</span>
          <span className="h-5 flex items-center">E</span>
          <span className="h-5 flex items-center">C</span>
          <span className="h-5 flex items-center">g</span>
        </div>

        {/* Measures Stream */}
        <div className="flex items-stretch">
          {measures.map((measure, mIdx) => {
            return (
              <div
                key={`staff-measure-${mIdx}`}
                className="flex flex-col justify-between border-r-2 border-slate-700/80 px-3 relative min-w-[130px]"
              >
                {/* Top: Measure Number & Chord Tag */}
                <div className="flex items-center justify-between pb-1.5 h-6">
                  <span className="text-[10px] font-bold text-slate-500">
                    M{measure.measureNumber}
                  </span>
                  {measure.beats[0]?.chord && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                      {measure.beats[0].chord}
                    </span>
                  )}
                </div>

                {/* 4-Line Horizontal Tablature Area */}
                <div className="relative py-2 flex items-center justify-around gap-4 my-auto">
                  {/* The 4 Horizontal Wire Lines */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col justify-between h-[84px] pointer-events-none opacity-40">
                    <div className="border-b border-slate-500 w-full" />
                    <div className="border-b border-slate-500 w-full" />
                    <div className="border-b border-slate-500 w-full" />
                    <div className="border-b border-slate-500 w-full" />
                  </div>

                  {/* Beats / Strum Columns */}
                  {measure.beats.map((beat) => {
                    const isActive = activeBeatId === beat.id;

                    return (
                      <button
                        key={beat.id}
                        onClick={() => onBeatClick(beat)}
                        className={`relative z-10 flex flex-col justify-between items-center h-[84px] px-2 py-0.5 rounded-lg transition-all ${
                          isActive
                            ? "bg-amber-500/25 ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/20"
                            : "hover:bg-slate-800/60 hover:scale-105"
                        }`}
                        title={`Click to play ${beat.lyric || beat.melodyPitch}`}
                      >
                        {/* 4 String Fret Numbers (Top to Bottom: A, E, C, g) */}
                        {strings.map((str) => {
                          const fretVal = beat.frets[str.idx];
                          const hasFret = fretVal >= 0;

                          return (
                            <div
                              key={`${beat.id}-str-${str.name}`}
                              className="h-5 flex items-center justify-center"
                            >
                              {hasFret ? (
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm ${
                                    beat.isChordStrike && str.idx === 3 && fretVal >= 0
                                      ? "bg-amber-400 text-slate-950 font-black ring-1 ring-amber-300"
                                      : beat.isChordStrike
                                      ? "bg-slate-200 text-slate-950"
                                      : "bg-sky-400 text-slate-950 ring-1 ring-sky-300"
                                  }`}
                                >
                                  {fretVal}
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs font-bold leading-none select-none">
                                  —
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom: Lyrics and Melody Pitch */}
                <div className="pt-2 flex items-center justify-around gap-4 border-t border-slate-800/80">
                  {measure.beats.map((beat) => (
                    <div
                      key={`lyric-${beat.id}`}
                      className="text-center min-w-[36px]"
                    >
                      <p
                        className={`text-xs font-bold tracking-tight truncate max-w-[70px] ${
                          activeBeatId === beat.id
                            ? "text-amber-300 font-extrabold"
                            : "text-white"
                        }`}
                        title={beat.lyric}
                      >
                        {beat.lyric || "—"}
                      </p>
                      <span className="text-[10px] font-mono text-amber-400/90 font-semibold">
                        {beat.melodyPitch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
