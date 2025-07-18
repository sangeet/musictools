import { useState } from "react";
import { NoteType, ChordType, ScaleType, ChordNumberReference, ChordProgressionReference, allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/types";

interface AIProgressionFormProps {
  onSave: (prog: ChordProgressionReference) => void;
  onClose: () => void;
}

export function AIProgressionForm({ onSave, onClose }: AIProgressionFormProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [success, setSuccess] = useState(false);

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
      let aiDescription = "";
      let aiDefaultNote: NoteType = "C";
      let aiRecommendedScales: TonalLib.ScaleRecommendation[] = [];
      if (typeof data.result === "string") {
        try {
          const json = JSON.parse(data.result);
          if (Array.isArray(json.progression)) progression = json.progression;
          if (json.name) aiName = json.name;
          if (json.description) aiDescription = json.description;
          if (json.defaultNote) aiDefaultNote = json.defaultNote as NoteType;
          if (Array.isArray(json.recommendedScales)) {
            aiRecommendedScales = json.recommendedScales.filter(
              (s: unknown): s is TonalLib.ScaleRecommendation => typeof s === "object" && s !== null && "scale" in s && typeof (s as TonalLib.ScaleRecommendation).scale === "string"
            );
          }
        } catch {
          // fallback parsing
        }
      }
      if (progression) {
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
