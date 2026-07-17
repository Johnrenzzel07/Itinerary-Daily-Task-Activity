const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type AiTextMode = "grammar" | "paraphrase";
export type AiTextContext = "activity" | "remarks";

const ACTIVITY_FEW_SHOT = `
EXAMPLES of correct ACTIVITY style (describe work done):
- "Reviewed incoming correspondence and routed documents to the appropriate departments."
- "Updated the mascot photo and background image on the Exhibits QR system to reflect current information."
- "Prepared the daily itinerary report and published updates to the public dashboard."
- "Coordinated with department heads regarding pending document approvals."
`;

const REMARKS_FEW_SHOT = `
EXAMPLES of correct REMARKS style (short notes, not full activities):
- "Pending manager approval."
- "Awaiting documents from the finance office."
- "To follow up tomorrow morning."
- "No issues encountered."
- "Needs revision before submission."
`;

const GRAMMAR_PROMPTS: Record<AiTextContext, string> = {
  activity: `You edit ACTIVITY entries for an official employee daily work itinerary.

An ACTIVITY describes work that was performed. Use clear complete sentences and past tense when work is done.

${ACTIVITY_FEW_SHOT}

Fix grammar and clarity only. Do NOT change the meaning. Do NOT write a short remark.
Return ONLY the corrected activity text.`,

  remarks: `You edit REMARKS for an official employee daily work itinerary.

REMARKS are short notes attached to an activity — status, follow-up, blocker, or extra info. They are NOT full activity descriptions.

${REMARKS_FEW_SHOT}

Fix grammar and clarity only. Keep it brief. Do NOT expand into a full activity sentence.
Return ONLY the corrected remarks text.`,
};

const PARAPHRASE_PROMPTS: Record<AiTextContext, string> = {
  activity: `You rewrite text into an ACTIVITY entry for a daily work itinerary log.

CRITICAL: Output type = ACTIVITY (work performed).

ACTIVITY rules:
- Describe what work was done using complete professional sentences.
- Start with strong action verbs in past tense: Reviewed, Updated, Prepared, Coordinated, Processed, Completed, Drafted, Verified, etc.
- Sound like an office/admin work log for public viewing.
- Usually 1-3 sentences. Keep similar length to the input unless input is very messy.
- NEVER output a short remark like "Pending approval" — that is REMARKS style, not ACTIVITY.

${ACTIVITY_FEW_SHOT}

WRONG (this is remarks style, do NOT output like this for activity):
- "Pending update."
- "Waiting for approval."
- "Needs follow-up."

Return ONLY the paraphrased ACTIVITY text with no labels or explanation.`,

  remarks: `You rewrite text into a REMARKS note for a daily work itinerary.

CRITICAL: Output type = REMARKS (short note).

REMARKS rules:
- Write a brief note: status, follow-up, pending item, blocker, or supplemental info.
- Usually ONE short sentence or phrase. Prefer under 25 words unless the input is long.
- Do NOT start with action verbs describing full tasks like "Reviewed...", "Updated...", "Prepared..." — that is ACTIVITY style.
- Do NOT describe a full work task. Do NOT write multiple detailed sentences about work performed.

${REMARKS_FEW_SHOT}

WRONG (this is activity style, do NOT output like this for remarks):
- "Reviewed and updated the mascot photo on the exhibits QR system to ensure accuracy."
- "Prepared the daily report and coordinated with team leads."

Return ONLY the paraphrased REMARKS text with no labels or explanation.`,
};

function buildUserMessage(text: string, mode: AiTextMode, context: AiTextContext): string {
  if (mode === "paraphrase") {
    if (context === "activity") {
      return `Rewrite the text below as an ACTIVITY entry (work performed, professional log style):

"""
${text}
"""`;
    }

    return `Rewrite the text below as a REMARKS note (short status/follow-up note, NOT a full activity):

"""
${text}
"""`;
  }

  if (context === "activity") {
    return `Fix grammar in this ACTIVITY entry:

"""
${text}
"""`;
  }

  return `Fix grammar in this REMARKS note:

"""
${text}
"""`;
}

function getSystemPrompt(mode: AiTextMode, context: AiTextContext): string {
  return mode === "grammar" ? GRAMMAR_PROMPTS[context] : PARAPHRASE_PROMPTS[context];
}

function cleanAiOutput(raw: string): string {
  return raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^(activity|remarks)\s*:\s*/i, "")
    .replace(/^here(?:'s| is)\s+(?:the|your)\s+(?:paraphrased|rewritten|corrected)\s+(?:text|entry|note)[:\s-]*/i, "")
    .trim();
}

export async function improveText(
  text: string,
  mode: AiTextMode,
  context: AiTextContext = "activity"
): Promise<string> {
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
        { role: "system", content: getSystemPrompt(mode, context) },
        { role: "user", content: buildUserMessage(trimmed, mode, context) },
      ],
      temperature: mode === "grammar" ? 0.15 : context === "remarks" ? 0.35 : 0.45,
      max_tokens: mode === "paraphrase" && context === "remarks" ? 180 : 1024,
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

  return cleanAiOutput(result);
}
