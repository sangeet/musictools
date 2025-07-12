"use client"

import { useRef, useState } from "react";
import { PlayIcon } from "@/components/icons/play";
import { ChordProgression } from "@/lib/chords";
import { StopIcon } from "@/components/icons/stop";

export const ChordProgressionSection = ({ progresssion }: { progresssion: ChordProgression}) => {
    const numBars = progresssion.flat().length
    const beatsPerBar = 4;
    const [barState, setBarState] = useState<{ bar: number; beat: number }>({ bar: 1, beat: 0 });

    // Use ReturnType<typeof setInterval> for timer types
    const [timeInterval, setTimeInterval] = useState<ReturnType<typeof setInterval> | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null); // <-- AudioContext for metronome
    const [bpm, setBpm] = useState(90);
    const timerDurationinMs = 1000 / (bpm / 60);

    // --- Count-in state ---
    const [countIn, setCountIn] = useState(false);
    const [countInBeat, setCountInBeat] = useState(0);
    const countInIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --- Timer active state ---
    const [timerActive, setTimerActive] = useState(false);

    // --- Web Audio API Metronome ---
    function playMetronome() {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        if (ctx.state === "suspended") {
            ctx.resume();
        }

        // Oscillator beep (always sine)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 1000;
        gain.gain.value = 0.18;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }

    // --- Count-in logic ---
    function startCountIn() {
        setCountIn(true);
        setCountInBeat(0);
        if (countInIntervalRef.current) clearInterval(countInIntervalRef.current);

        let localCount = 0;
        playMetronome();
        countInIntervalRef.current = setInterval(() => {
            localCount += 1;
            setCountInBeat(localCount);
            playMetronome();
            if (localCount >= 4) {
                // Clear count-in timer BEFORE starting main timer
                if (countInIntervalRef.current) {
                    globalThis.clearInterval(countInIntervalRef.current);
                    countInIntervalRef.current = null;
                }
                setCountIn(false);
                setCountInBeat(0);
                setTimerActive(true); // <-- Move here
                startTimer();
            }
        }, timerDurationinMs);
    }

    function startTimer() {
        setBarState({ bar: 1, beat: 0 });
        playMetronome();
        setTimeInterval(
            setInterval(increaseBeat, timerDurationinMs)
        );
        setTimerActive(true);
    }

    function resetTimer() {
        setBarState({ bar: 1, beat: 0 });
        setCountIn(false);
        setCountInBeat(0);
        setTimerActive(false);
        if (timeInterval !== null) {
            globalThis.clearInterval(timeInterval);
            setTimeInterval(null);
        }
        if (countInIntervalRef.current) {
            globalThis.clearInterval(countInIntervalRef.current);
            countInIntervalRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "running") {
            audioCtxRef.current.suspend();
        }
    }

    function increaseBeat() {
        playMetronome();
        setBarState(({ bar, beat }) => {
            if (beat === beatsPerBar - 1) {
                return {
                    bar: bar === numBars ? 1 : bar + 1,
                    beat: 0
                };
            }
            return {
                bar,
                beat: beat + 1
            };
        });
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10">
            <div className="flex flex-wrap sm:flex-col gap-3 sm:gap-5 items-center p-3 sm:p-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex flex-wrap gap-2 items-center">
                    <label htmlFor="bpm-input">BPM:</label>
                    <input
                        className="button w-[80px] px-2 py-2"
                        type="number"
                        name="bpm-input"
                        id="bpm-input" value={bpm}
                        onChange={e => setBpm(parseInt(e.target.value))}
                    />
                </div>
                <div className="flex gap-3 items-center">
                    <button onClick={startCountIn} disabled={countIn || timeInterval !== null} className="icon-button" aria-label="Play">
                        <PlayIcon className="h-4 sm:h-8 mx-auto" />
                    </button>
                    <button onClick={resetTimer} className="icon-button" aria-label="Stop">
                        <StopIcon className="h-4 sm:h-8 mx-auto" />
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-4 items-center text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded p-4">
                {progresssion.map((lines, lineNum) => (
                    <div
                        key={lines.join("-").concat(lineNum.toString())}
                        className={`flex gap-x-8 font-mono`}
                    >
                        {lines.map((chord, index) => {
                            const bar = (lineNum * lines.length) + index + 1;
                            // Only highlight if timerActive
                            const isCurrentBar = timerActive && bar === barState.bar;
                            return <div
                                onClick={() => {
                                    setBarState({ bar, beat: 0 });
                                } }
                                key={index}
                                className={`w-12 text-2xl pt-1.5  ${isCurrentBar ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"} rounded transition-all duration-100 ease-in`}
                                tabIndex={0}
                                role="button"
                                aria-label={`Bar ${bar}: ${chord.symbol}`}
                            >
                                <span>{chord.symbol}</span>
                                <div className="flex gap-1 justify-between mt-1">
                                    {[0, 1, 2, 3].map(beat =>
                                        <div
                                            key={`bar-${bar}-beat-${beat}`}
                                            className={`w-full h-1 ${isCurrentBar && (timerActive && barState.beat % beatsPerBar === beat) ? "bg-red-500" : "bg-gray-300 dark:bg-gray-700"} transition-all duration-100 ease-in`}
                                        />)}
                                </div>
                            </div>;
                        }
                        )}
                    </div>
                ))}
            </div>
            <div className="dark:text-yellow-500 text-red-500 w-full text-lg md:text-xl text-center">
                {countIn && <span> {countInBeat < 4 ? `Count In: ${countInBeat + 1}` : ""} </span>}
            </div>
        </div>
    )
}
