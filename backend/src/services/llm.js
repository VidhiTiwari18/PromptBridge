const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function summarizeConversation(messages, sourceName) {
  const transcript = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n")
    .slice(0, 60000);

  const prompt = `You convert AI chat transcripts into a compact "context package" that lets someone continue the exact same conversation on a different AI platform. Output ONLY the context package, in this structure:

## Context from ${sourceName}
**Goal:** <what the user is trying to accomplish, 1-2 sentences>
**Key facts established:** <bullet list of concrete facts, decisions, constraints already agreed on>
**Current state:** <where the conversation left off, what has been tried>
**Next step the user wants:** <if inferable>

Be dense and factual. Skip the pleasantries. No commentary outside the structure.

Here is the transcript:

${transcript}`;

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}