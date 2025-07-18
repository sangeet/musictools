import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest } from 'next/server';
import { allNotes, allChordTypes, allScaleTypes } from "@/tonal-lib/chords";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Gemini API key' }), { status: 500 });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Minimal instructions for reliable output
    const systemPrompt = `Return a JSON object with this exact structure:
{
  "name": string,
  "defaultNote": one of [${allNotes.join(", ")}],
  "description": string,
  "progression": [
    Prefer progressions with more chords per line (horizontal), and fewer lines (vertical).
    Each line should represent a musical phrase or bar, and should contain multiple chords (ideally 3-6 per line).
    Avoid progressions where each line contains only one chord.
    Only use integer values from 1 to 7 for 'number'.
    Include all specified fields in response. No field should be omitted.
    The defaultNote should be the one most suited or commonly used for that progression.
    The progression should be minimal, suited for improvisation, looping and practice, so keep it simple.
    If a specific chord progression is specified, then use that as the basis for the progression with modifications requested if any.
    You are not allowed to return C G Am F or any variant of 1 5 6 4 progression.
    `;
    const fullPrompt = `${prompt}\n\n${systemPrompt}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            defaultNote: { type: Type.STRING, enum: allNotes },
            description: { type: Type.STRING },
            progression: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER, minimum: 1, maximum: 7 },
                    type: { type: Type.STRING, enum: allChordTypes }
                  },
                  required: ["number", "type"],
                  propertyOrdering: ["number", "type"]
                }
              }
            },
            recommendedScales: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scale: { type: Type.STRING, enum: allScaleTypes }
                },
                required: ["scale"],
                propertyOrdering: ["scale"]
              }
            }
          },
          required: ["name", "defaultNote", "description", "progression", "recommendedScales"],
          propertyOrdering: ["name", "defaultNote", "description", "progression", "recommendedScales"]
        }
      }
    });
    console.log("Gemini usage metadata (response):", response.usageMetadata);
    return new Response(JSON.stringify({ result: response.text }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gemini API request failed', details: String(err) }), { status: 500 });
  }
}
