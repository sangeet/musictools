import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest } from 'next/server';
import { allChordTypes } from "@/lib/chords";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Gemini API key' }), { status: 500 });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Add instructions for strict typing
    const systemPrompt = `Return a JSON object with this exact structure:
{
  "progression": [
    [
      { "number": 1-7, "type": one of [${allChordTypes.join(", ")}] },
      ...
    ],
    ...
  ]
}
Only use numbers 1-7 for 'number'. Only use these chord types for 'type': [${allChordTypes.join(", ")}]. Do not use chord names or text. Do not include any explanation or extra text.`;
    const fullPrompt = `${prompt}\n\n${systemPrompt}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-preview-06-17",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
            }
          },
          propertyOrdering: ["progression"]
        }
      }
    });
    return new Response(JSON.stringify({ result: response.text }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Gemini API request failed', details: String(err) }), { status: 500 });
  }
}
