import { useState } from "react";
import { NoteType, ChordType, ScaleType, ChordNumberReference, ChordProgressionReference, allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/types";
import { ProgressionFormFields } from "@/components/ProgressionFormFields";

interface EditProgressionFormProps {
  initialData: ChordProgressionReference;
  onSave: (prog: ChordProgressionReference) => void;
  onClose: () => void;
}

export function EditProgressionForm({ initialData, onSave, onClose }: EditProgressionFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [rows, setRows] = useState<ChordNumberReference[][]>(initialData.progression as ChordNumberReference[][]);
  const [rootNote, setRootNote] = useState<NoteType>(initialData.defaultNote ?? "C");
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
      source: "custom",
      creationDate: Date.now(),
      progression: rows.map(row => row.map(slot => ({ number: slot.number, type: slot.type }))),
      recommendedScales: initialData.recommendedScales ?? []
    };
    onSave(progressionObj);
    setLoading(false);
    setSuccess(true);
    setTimeout(onClose, 1200);
  }

  return (
    <ProgressionFormFields
      name={name}
      setName={setName}
      description={description}
      setDescription={setDescription}
      rows={rows}
      rootNote={rootNote}
      setRootNote={setRootNote}
      loading={loading}
      error={error}
      success={success}
      handleAddRow={handleAddRow}
      handleAddSlot={handleAddSlot}
      handleRemoveRow={handleRemoveRow}
      handleRemoveSlot={handleRemoveSlot}
      handleSlotChange={handleSlotChange}
      handleSubmit={handleSubmit}
      onClose={onClose}
      submitLabel="Save"
    />
  );
}
