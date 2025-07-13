import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest } from 'next/server';
import { allChordTypes, allScaleTypes, allNoteTypes } from "@/types/music";

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
  "defaultNote": one of [${allNoteTypes.join(", ")}],
  "description": string,
  "progression": [
    [
      { "number": 1-7, "type": one of [${allChordTypes.join(", ")}] },
      ...
    ],
    ...
  ],
  "recommendedScales": [
    { "scale": one of [${allScaleTypes.join(", ")}] },
    ...
  ]
}
- Only use integer values from 1 to 7 for 'number'.
- Always include both 'number' and 'type' in every chord object.
- Only use the scale variable name for recommendedScales, not scale logic arrays or display names.
- Always include a name, defaultNote, and description for the progression.
- Avoid ultra-popular progressions like CGAF (1 5 6 4) unless the prompt specifically asks for them.`;
    const fullPrompt = `${prompt}\n\n${systemPrompt}`;
    // Log token count for prompt
    // const countTokensResponse = await ai.models.countTokens({
    //   model: "gemini-2.5-flash-lite-preview-06-17",
    //   contents: fullPrompt
    // });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            defaultNote: { type: Type.STRING, enum: allNoteTypes },
            description: { type: Type.STRING },
            progression: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.NUMBER },
                    type: { type: Type.STRING, enum: allChordTypes }
                  },
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
                propertyOrdering: ["scale"]
              }
            }
          },
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
