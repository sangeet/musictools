"use client";

import { useEffect, useState } from "react";
import { allNotes, allScales, generateProgression, generateScale } from "@/lib/chords";
import { NoteType } from "@/types/music";
import { listProgressions } from "@/lib/progressions";
import { ChordProgressionReference } from "@/types/progression";
import { KeyboardVisual } from "@/components/music/keyboard-visual";
import { ChordProgressionSection } from "@/components/music/chord-progression";
import Layout from "@/components/Layout";
import { AddProgressionForm } from "@/components/AddProgressionForm";
import { EditProgressionForm } from "@/components/EditProgressionForm";
import { AIProgressionForm } from "@/components/AIProgressionForm";

const allScaleOptions = Object.keys(allScales);

function camelToTitle(str: string) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

const BluesPage = () => {
    const [selectedKey, setselectedKey] = useState<NoteType>(listProgressions[0].defaultNote);
    const [selectedProgression, setSelectedProgression] = useState(listProgressions[0]);
    const [showFormModal, setShowFormModal] = useState<{ mode: "add" | "edit" | "ai", data?: Partial<ChordProgressionReference> } | null>(null);
    // Use ChordProgressionReference[] for customProgressions
    const [customProgressions, setCustomProgressions] = useState<ChordProgressionReference[]>([]);
    const recommendedScaleKeys = selectedProgression.recommendedScales.map(s => s.scale);
    const [selectedScales, setSelectedScales] = useState<string[]>(recommendedScaleKeys);
    const progression = generateProgression(selectedProgression.progression, selectedKey);
    // Get unique chords by root and type
    const allChordsInProgression = progression
        .flat()
        .filter((chord, idx, arr) =>
            arr.findIndex(c => c.root === chord.root && c.type === chord.type) === idx
        );

    useEffect(() => {
        if (selectedProgression.defaultNote && selectedKey !== selectedProgression.defaultNote) {
            setselectedKey(selectedProgression.defaultNote);
        }
    }, [selectedProgression, selectedKey]);

    // When progression changes, overwrite selectedScales with its recommendedScales
    useEffect(() => {
        setSelectedScales(selectedProgression.recommendedScales.map(s => s.scale));
    }, [selectedProgression]);

    // Get unique recommended scales for UI
    const uniqueRecommendedScales = Array.from(new Set(selectedProgression.recommendedScales.map(s => s.scale)));

    // Get unique keys for UI
    const uniqueKeys = Array.from(new Set(progression.flat().map(chord => chord.root)));

    function handleScaleToggle(scale: string) {
        setSelectedScales(prev =>
            prev.includes(scale)
                ? prev.filter(s => s !== scale)
                : [...prev, scale]
        );
    }

    return (
        <Layout>
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <span>Select Key:</span>
                    {allNotes.map((note, index) =>
                        <button
                            key={`${note}-${index}`}
                            onClick={() => setselectedKey(note)}
                            className={`button border-2 transition-colors duration-150
                                ${note === selectedKey ? "button-selected" : ""}
                            `}
                            aria-pressed={note === selectedKey}
                        >{note}</button>
                    )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <span>Select Progression Variant:</span>
                    <select
                        className="button min-w-[180px]"
                        value={selectedProgression.name}
                        onChange={e => {
                            const prog = [...listProgressions, ...customProgressions].find(p => p.name === e.target.value);
                            if (prog) setSelectedProgression(prog as typeof selectedProgression);
                        }}
                    >
                        {[...listProgressions, ...customProgressions].map((prog) => (
                            <option key={prog.name} value={prog.name}>{prog.name}</option>
                        ))}
                    </select>
                    <button
                        className="button ml-2"
                        onClick={() => setShowFormModal({ mode: "add" })}
                    >
                        + Add
                    </button>
                    <button
                        className="button ml-2"
                        onClick={() => setShowFormModal({ mode: "edit", data: selectedProgression })}
                        disabled={!selectedProgression}
                    >
                        Edit
                    </button>
                    <button
                        className="button ml-2"
                        onClick={() => setShowFormModal({ mode: "ai" })}
                    >
                        Ask AI
                    </button>
                </div>
                {showFormModal && (
                    showFormModal.mode === "add" ? (
                        <AddProgressionForm
                            onSave={prog => {
                                setCustomProgressions(prev => [...prev, prog]);
                                setSelectedProgression(prog);
                                setShowFormModal(null);
                            }}
                            onClose={() => setShowFormModal(null)}
                        />
                    ) : showFormModal.mode === "edit" && showFormModal.data ? (
                        <EditProgressionForm
                            initialData={showFormModal.data as ChordProgressionReference}
                            onSave={prog => {
                                setCustomProgressions(prev => {
                                    const idx = prev.findIndex(p => p.name === showFormModal.data?.name);
                                    if (idx !== -1) {
                                        const updated = [...prev];
                                        updated[idx] = prog;
                                        return updated;
                                    }
                                    return [...prev, prog];
                                });
                                setSelectedProgression(prog);
                                setShowFormModal(null);
                            }}
                            onClose={() => setShowFormModal(null)}
                        />
                    ) : showFormModal.mode === "ai" ? (
                        <AIProgressionForm
                            onSave={prog => {
                                setCustomProgressions(prev => [...prev, prog]);
                                setSelectedProgression(prog);
                                setShowFormModal(null);
                            }}
                            onClose={() => setShowFormModal(null)}
                        />
                    ) : null
                )}
                <div className="flex flex-col gap-2 my-4">
                    <div className="text-md text-gray-700 dark:text-gray-300">{selectedProgression.description}</div>
                </div>
                <div className="flex justify-center my-4 sm:my-8">
                    <div className="flex flex-wrap gap-5 sm:gap-16 w-full justify-center">
                        {allChordsInProgression.map((chord, index) => (
                            <div key={`${chord.root}-${index}`}>
                                <KeyboardVisual highlightedNotes={chord.notes} width={150} />
                                <span>{chord.symbol} ({chord.notes.join(" ")})</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ChordProgressionSection progresssion={progression} />
                <div className="flex flex-col justify-center">
                    <h2 className="text-lg mb-2">Recommended Scales:</h2>
                    <div className="flex flex-wrap justify-around gap-5">
                        {
                            uniqueKeys.map(root => (
                                uniqueRecommendedScales.map(scaleKey => {
                                    const scaleLogic = allScales[scaleKey as keyof typeof allScales];
                                    return (
                                        <ScaleRecommendationSection
                                            key={`${root}-${scaleKey}`}
                                            name={`${root} ${scaleKey}`}
                                            notes={generateScale(root, scaleLogic)}
                                        />
                                    );
                                })
                            ))
                        }
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {allScaleOptions.map(scale => (
                            <button
                                key={scale}
                                className={`border-2 transition-colors duration-150 button
                                    ${selectedScales.includes(scale) ? "button-selected" : ""}
                                `}
                                onClick={() => handleScaleToggle(scale)}
                                aria-pressed={selectedScales.includes(scale)}
                            >
                                {camelToTitle(scale)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

const ScaleRecommendationSection = ({ name, notes }: { name: string, notes: NoteType[] }) => {
    // Split name into root and scale, then format scale part
    const [root, ...scaleParts] = name.split(" ");
    const scaleName = camelToTitle(scaleParts.join(" "));
    return (
        <div className="flex flex-col">
            <KeyboardVisual highlightedNotes={notes} width={100} />
            <span>{root} {scaleName}</span>
            <span className="text-sm">{notes.join(" ")}</span>
        </div>
    )
}

export default BluesPage;
