import { useState } from "react";
import { ChordProgressionReference, ChordNumberReference } from "@/types/progression";
import { ProgressionFormFields } from "@/components/ProgressionFormFields";
import { ChordType, NoteType } from "@/types/music";

interface AddProgressionFormProps {
  onSave: (prog: ChordProgressionReference) => void;
  onClose: () => void;
}

export function AddProgressionForm({ onSave, onClose }: AddProgressionFormProps) {
  const defaultRow: ChordNumberReference[] = [
    { number: 1, type: "major" },
    { number: 6, type: "major" },
    { number: 5, type: "major" },
    { number: 1, type: "major" },
  ];
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      recommendedScales: []
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
      submitLabel="Add"
    />
  );
}
