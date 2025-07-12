"use client";
import { useState } from "react";
import { allNotes, ChordType, NoteType, ChordProgreessionReference, ChordNumberReference, generateChordFromReference } from "@/lib/chords";

// Chord slot type for visual builder
interface ChordSlot {
  number: number; // 1-7 (degree in scale)
  type: ChordType;
}

type ChordRow = ChordSlot[];

export default function CustomProgressionForm({ onClose, onAdd }: {
  onClose: () => void,
  onAdd?: (prog: { name: string, progression: ChordProgreessionReference, recommendedScales: ChordNumberReference[] }) => void
}) {
  const defaultRow: ChordRow = [
    { number: 1, type: "major" },
    { number: 4, type: "major" },
    { number: 5, type: "major" },
    { number: 1, type: "major" },
  ];
  const [name, setName] = useState("");
  const [rows, setRows] = useState<ChordNumberReference[][]>([defaultRow]);
  const [rootNote, setRootNote] = useState<NoteType>("C");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setRows(rows => [...rows, [
      { number: 1, type: "major" }
    ]]);
  }

  function handleRemoveRow(rowIdx: number) {
    setRows(rows => rows.filter((_, i) => i !== rowIdx));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const progression: ChordProgreessionReference = rows.map(row => row.map(slot => ({ number: slot.number, type: slot.type })));
    if (onAdd) {
      onAdd({ name, progression, recommendedScales: [] });
    }
    setLoading(false);
    setSuccess(true);
    setName("");
    setRows([defaultRow]);
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

  return (
    <form className="flex flex-col gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 w-full mx-auto mt-4" onSubmit={handleSubmit}>
      <h3 className="text-lg font-bold">Add Custom Progression</h3>
      <input
        type="text"
        className="button w-full"
        placeholder="Progression Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <div className="flex gap-2 items-center">
        <label className="text-sm">Root Note:</label>
        <select className="button" value={rootNote} onChange={e => setRootNote(e.target.value as NoteType)}>
          {allNotes.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-semibold">Progression Rows:</span>
          <button type="button" className="button px-2 py-1 text-xs" onClick={handleAddRow}>+ Add Row</button>
        </div>
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex flex-col gap-2 border rounded p-2 bg-gray-100 dark:bg-gray-800">
            <div className="flex gap-2 items-center mb-1">
              <span className="text-xs font-semibold">Row {rowIdx + 1}</span>
              <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleAddSlot(rowIdx)}>+ Add Slot</button>
              <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleRemoveRow(rowIdx)} disabled={rows.length <= 1}>Remove Row</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {row.map((slot, slotIdx) => (
                <div key={slotIdx} className="flex flex-col items-center gap-1 border rounded p-2 bg-gray-200 dark:bg-gray-700">
                  <select className="button" value={slot.number} onChange={e => handleSlotChange(rowIdx, slotIdx, "number", Number(e.target.value))}>
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <select className="button" value={slot.type} onChange={e => handleSlotChange(rowIdx, slotIdx, "type", e.target.value as ChordType)}>
                    {["major","minor","dominant","diminished","augmented","sus4","sus2","sixth","maj7","ninth","eleventh","thirteenth","add9","add11","add13"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" className="button px-2 py-1 text-xs" onClick={() => handleRemoveSlot(rowIdx, slotIdx)} disabled={row.length <= 1}>Remove</button>
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
        <button type="submit" className="button" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        <button type="button" className="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
