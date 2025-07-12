"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allNotes, generateProgression, generateScale, NoteType } from "@/lib/chords";
import { listProgressions } from "../../../lib/progressions";
import { KeyboardVisual } from "@/components/music/keyboard-visual";
import { ChordProgressionSection } from "@/components/music/chord-progression";
import Layout from "@/components/Layout";

const BluesPage = () => {
    const [selectedKey, setselectedKey] = useState<NoteType>("C");
    const [selectedProgression, setSelectedProgression] = useState(listProgressions[0])
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const progression = generateProgression(selectedProgression.progression, selectedKey)
    // Get unique chords by root and type
    const allChordsInProgression = progression
        .flat()
        .filter((chord, idx, arr) =>
            arr.findIndex(c => c.root === chord.root && c.type === chord.type) === idx
        );

    return (
        <Layout>
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <span>Select Key:</span>
                    {allNotes.map((note, index) =>
                        <button
                            key={`${note}-${index}`}
                            onClick={() => setselectedKey(note)}
                            className={`button ${note === selectedKey ? "border-gray-400" : ""}`}
                        >{note}</button>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <span>Select Progression Variant:</span>
                    <select
                        className="button min-w-[180px]"
                        value={selectedProgression.name}
                        onChange={e => {
                            const prog = listProgressions.find(p => p.name === e.target.value);
                            if (prog) setSelectedProgression(prog);
                        }}
                    >
                        {listProgressions.map((prog) => (
                            <option key={prog.name} value={prog.name}>{prog.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-center my-8">
                    <div className="flex flex-wrap sm:gap-16 w-full justify-center">
                        {allChordsInProgression.map((chord, index) => {
                            return <div
                                key={`${chord.root}-${index}`}
                            >
                                <KeyboardVisual highlightedNotes={chord.notes} width={150} />
                                <span>{chord.symbol} ({chord.notes.join(" ")})</span>
                            </div>;
                        }
                        )}
                    </div>
                </div>
                <ChordProgressionSection progresssion={progression} />
                <div className="flex flex-col justify-center">
                    <h2 className="text-lg mb-2">Recommended Scales:</h2>
                    <div className="flex flex-wrap justify-around gap-5">
                        {
                            allChordsInProgression
                                .map(chord => ([
                                    selectedProgression.recommendedScales.map(sc => ({
                                        name: `${chord.root} ${sc.name}`,
                                        notes: generateScale(chord.root, sc.scale)
                                    }))
                                ].flat())).flat()
                                .map(scaleData => <ScaleRecommendation key={scaleData.name} {...scaleData} />)
                        }
                    </div>
                </div>
            </div>
        </Layout>
    )
}

const ScaleRecommendation = ({ name, notes }: { name: string, notes: NoteType[] }) => {
    return (
        <div className="flex flex-col">
            <KeyboardVisual highlightedNotes={notes} width={100} />
            <span>{name}</span>
            <span>{notes.join(" ")}</span>
        </div>
    )
}

export default BluesPage;
