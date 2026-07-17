const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type AiTextMode = "grammar" | "paraphrase";

const PROMPTS: Record<AiTextMode, string> = {
  grammar:
    "You are a professional editor. Fix grammar, spelling, punctuation, and clarity in the user's text. Keep the original meaning and tone. Return ONLY the corrected text with no quotes, labels, or explanation.",
  paraphrase:
    "You are a professional writer. Paraphrase the user's text clearly and professionally while keeping the same meaning. Return ONLY the paraphrased text with no quotes, labels, or explanation.",
};

export async function improveText(text: string, mode: AiTextMode): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Please enter some text first");
  }

  if (trimmed.length > 4000) {
    throw new Error("Text is too long (max 4000 characters)");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: PROMPTS[mode] },
        { role: "user", content: trimmed },
      ],
      temperature: mode === "grammar" ? 0.2 : 0.6,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const result = data.choices?.[0]?.message?.content?.trim();

  if (!result) {
    throw new Error("No response from AI");
  }

  return result.replace(/^["']|["']$/g, "");
}
