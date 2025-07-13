// This file is now deprecated and replaced by AddProgressionForm, EditProgressionForm, and AIProgressionForm.
// If you need to restore any logic, see backup/ProgressionFormModal.tsx.

import { useState } from "react";
import { allNoteTypes, allChordTypes, ChordType, NoteType } from "@/types/music";
import { ChordProgressionReference, ChordNumberReference, ScaleRecommendation } from "@/types/progression";
import { generateChordFromReference } from "@/lib/chords";

export type ProgressionFormMode = "add" | "edit" | "ai";

interface ProgressionFormModalProps {
  mode: ProgressionFormMode;
  initialData?: Partial<ChordProgressionReference>;
  onSave: (prog: ChordProgressionReference) => void;
  onClose: () => void;
}

export default function ProgressionFormModal({ mode, initialData, onSave, onClose }: ProgressionFormModalProps) {
  const defaultRow: ChordNumberReference[] = [
    { number: 1, type: "major" },
    { number: 6, type: "major" },
    { number: 5, type: "major" },
    { number: 1, type: "major" },
  ];
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [rows, setRows] = useState<ChordNumberReference[][]>(initialData?.progression as ChordNumberReference[][] ?? [defaultRow]);
  const [rootNote, setRootNote] = useState<NoteType>(initialData?.defaultNote ?? "C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  function handleSlotChange(rowIdx: number, slotIdx: number, field: keyof ChordNumberReference, value: number | ChordType) {
    setRows(rows => rows.map((row, i) =>
      i === rowIdx ? row.map((slot, j) => j === slotIdx ? { ...slot, [field]: value } : slot) : row
    ));
  }

  function handleAddSlot(rowIdx: number) {
    setRows(rows => rows.map((row, i) =>
      i === rowIdx ? [...row, { number: 1, type: "major" }] : row
    ));
  }

  function handleRemoveSlot(rowIdx: number, slotIdx: number) {
    setRows(rows => rows.map((row, i) =>
      i === rowIdx ? row.filter((_, j) => j !== slotIdx) : row
    ));
  }

  function handleAddRow() {
    setRows(rows => [...rows, [ { number: 1, type: "major" } ]]);
  }

  function handleRemoveRow(rowIdx: number) {
    setRows(rows => rows.filter((_, i) => i !== rowIdx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const progressionObj: ChordProgressionReference = {
      name,
      defaultNote: rootNote,
      description,
      source: mode === "edit" ? "custom" : "custom",
      creationDate: Date.now(),
      progression: rows.map(row => row.map(slot => ({ number: slot.number, type: slot.type }))),
      recommendedScales: []
    };
    onSave(progressionObj);
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1200);
  }

  // Live preview: generate chord symbols for each row
  const previewRows = rows.map((row) =>
    row.map(slot => {
      try {
        return generateChordFromReference(rootNote, slot).symbol;
      } catch {
        return "?";
      }
    })
  );

  async function handleAskAI() {
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      console.log("Gemini API response:", data);
      let progression: ChordNumberReference[][] | null = null;
      let aiName = "AI Progression";
      let aiDescription  = "";
      let aiDefaultNote: NoteType = "C";
      let aiRecommendedScales: ScaleRecommendation[] = [];
      if (typeof data.result === "string") {
        try {
          const json = JSON.parse(data.result);
          if (Array.isArray(json.progression)) progression = json.progression;
          if (json.name) aiName = json.name;
          if (json.description) aiDescription = json.description;
          if (json.defaultNote) aiDefaultNote = json.defaultNote as NoteType;
          if (Array.isArray(json.recommendedScales)) {
            aiRecommendedScales = json.recommendedScales.filter(
              (s: unknown): s is ScaleRecommendation => typeof s === "object" && s !== null && "scale" in s && typeof (s as ScaleRecommendation).scale === "string"
            );
          }
        } catch {
          // fallback parsing
        }
      }
      if (progression) {
        setName(aiName);
        setDescription(aiDescription);
        setRootNote(aiDefaultNote);
        // Optionally handle recommendedScales in form state if you want to allow editing
        const progressionObj: ChordProgressionReference = {
          name: aiName,
          defaultNote: aiDefaultNote,
          description: aiDescription,
          source: "ai",
          creationDate: Date.now(),
          progression,
          recommendedScales: aiRecommendedScales
        };
        onSave(progressionObj); // auto-save
        setSuccess(true);
        setTimeout(onClose, 1200);
      } else {
        setAiError("Could not parse AI response. Try a different prompt.");
      }
    } catch (err) {
      setAiError((err instanceof Error && err.message) ? err.message : "Unknown error");
    } finally {
      setAiLoading(false);
    }
  }

  if (mode === "ai") {
    return (
      <div className="flex flex-col gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 w-full mx-auto mt-4">
        <label className="font-semibold text-sm">AI Chord Progression Recommendation</label>
        <input
          className="button w-full"
          type="text"
          placeholder="Describe the style, mood, or progression you want..."
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          disabled={aiLoading}
        />
        <button className="button w-full" onClick={handleAskAI} type="button" disabled={aiLoading || !aiPrompt}>
          {aiLoading ? "Loading..." : "Ask AI"}
        </button>
        {aiError && <div className="text-red-500 text-sm">{aiError}</div>}
        {success && <div className="text-green-600 text-sm">Saved!</div>}
        <div className="text-xs text-gray-500">AI results are auto-saved. You can edit them later.</div>
        <button type="button" className="button" onClick={onClose}>Close</button>
      </div>
    );
  }

  // Add/Edit form
  return (
    <form className="flex flex-col gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 w-full mx-auto mt-4" onSubmit={handleSubmit}>
      <input
        type="text"
        className="button w-full"
        placeholder="Progression Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        className="button w-full"
        placeholder="Describe your progression, style, or mood..."
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
      />
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm">Default Key:</label>
          <div className="flex gap-1 flex-wrap">
            {allNoteTypes.map(n => (
              <button
                key={n}
                type="button"
                className={`border-2 transition-colors duration-150 button
                    ${rootNote === n ? "button-selected" : ""}
                `}
                onClick={() => setRootNote(n as NoteType)}
                aria-pressed={rootNote === n}
              >{n}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold">Progression Rows:</span>
          <button type="button" className="button px-2 py-1 text-xs" onClick={handleAddRow}>+ Add Row</button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-col gap-2 border rounded p-2 bg-gray-100 dark:bg-gray-800">
            <div className="flex gap-2 items-center mb-1">
              <span className="text-xs font-semibold">Row {rowIdx + 1}</span>
              <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleAddSlot(rowIdx)}>+ Add Slot</button>
              <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleRemoveRow(rowIdx)} disabled={rows.length <= 1}>Remove Row</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {row.map((slot, slotIdx) => (
                <div key={slotIdx} className="flex items-center gap-1 border rounded p-2 bg-gray-200 dark:bg-gray-700">
                  <select className="button" value={slot.number} onChange={e => handleSlotChange(rowIdx, slotIdx, "number", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select className="button" value={slot.type} onChange={e => handleSlotChange(rowIdx, slotIdx, "type", e.target.value as ChordType)}>
                    {allChordTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleRemoveSlot(rowIdx, slotIdx)} disabled={row.length <= 1}>X</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span className="text-sm font-semibold">Live Preview:</span>
        <div className="flex flex-col gap-1">
          {previewRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              {row.map((ch, j) => <span key={j} className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono">{ch}</span>)}
            </div>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">Saved!</div>}
      <div className="flex gap-2">
        <button type="submit" className="button" disabled={loading}>{loading ? "Saving..." : mode === "edit" ? "Save" : "Add"}</button>
        <button type="button" className="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}