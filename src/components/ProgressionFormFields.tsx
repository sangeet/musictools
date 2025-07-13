import { allNoteTypes, allChordTypes, ChordType, NoteType } from "@/types/music";
import { ChordNumberReference } from "@/types/progression";
import { generateChordFromReference } from "@/lib/chords";

interface ProgressionFormFieldsProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  rows: ChordNumberReference[][];
  rootNote: NoteType;
  setRootNote: (v: NoteType) => void;
  loading: boolean;
  error: string;
  success: boolean;
  handleAddRow: () => void;
  handleAddSlot: (rowIdx: number) => void;
  handleRemoveRow: (rowIdx: number) => void;
  handleRemoveSlot: (rowIdx: number, slotIdx: number) => void;
  handleSlotChange: (rowIdx: number, slotIdx: number, field: keyof ChordNumberReference, value: number | ChordType) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitLabel: string;
}

export function ProgressionFormFields(props: ProgressionFormFieldsProps) {
  const {
    name, setName, description, setDescription, rows, rootNote, setRootNote,
    loading, error, success, handleAddRow, handleAddSlot, handleRemoveRow, handleRemoveSlot, handleSlotChange, handleSubmit, onClose, submitLabel
  } = props;

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
        <button type="submit" className="button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
        <button type="button" className="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}
