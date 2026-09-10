import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { chartText, songTitle, artist } = await request.json();

    if (!chartText || typeof chartText !== 'string') {
      return NextResponse.json({ error: 'Please provide chord chart text.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const prompt = `You are a world-class musician, ukulele arranger, and music theorist.
Analyze this song or chord chart snippet:
Song Title / Context: ${songTitle || 'Detect from chart'} (Artist: ${artist || 'Unknown'})

Chord Chart / Lyrics Input:
${chartText}

Your task:
1. Identify the song and key.
2. Determine the recognizable vocal/lead melody pitches (in scientific pitch notation, e.g. G4, A4, B4, C5, D5, E5, etc.) corresponding to each word or syllable.
3. Group into musical measures with the active chord.
4. Mark which notes represent a chord strike ("isChordStrike": true) versus single-note vocal passing notes ("isChordStrike": false).
5. For Ukulele G-C-E-A tuning, typical melody range is C4 to A5.

Return ONLY valid JSON with this schema:
{
  "songTitle": "Song Title",
  "key": "C",
  "tempo": 76,
  "measures": [
    {
      "measureNumber": 1,
      "chord": "C",
      "items": [
        { "lyric": "Wise", "melody": "G4", "isChordStrike": false },
        { "lyric": "man", "melody": "A4", "isChordStrike": false },
        { "lyric": "say", "melody": "G4", "isChordStrike": true }
      ]
    },
    {
      "measureNumber": 2,
      "chord": "Em",
      "items": [
        { "lyric": "on-", "melody": "B4", "isChordStrike": false },
        { "lyric": "ly", "melody": "G4", "isChordStrike": false },
        { "lyric": "fools", "melody": "B4", "isChordStrike": true }
      ]
    }
  ]
}`;

    // Prefer fast, modern models with automatic fallback
    const modelsToTry = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(cleaned);
            return NextResponse.json({ ...parsed, modelUsed: model });
          }
        } else {
          const errText = await resp.text();
          console.warn(`Model ${model} returned ${resp.status}:`, errText);
          lastError = `${model}: ${resp.statusText}`;
        }
      } catch (e: unknown) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }

    return NextResponse.json({ error: `Arranger service failed: ${lastError}` }, { status: 502 });
  } catch (err: unknown) {
    console.error('Arranger API route error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
