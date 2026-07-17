import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { improveText, type AiTextContext, type AiTextMode } from "@/lib/groq";
import { z } from "zod";

const requestSchema = z.object({
  text: z.string().min(1, "Text is required").max(4000, "Text is too long"),
  mode: z.enum(["grammar", "paraphrase"]),
  context: z.enum(["activity", "remarks"]).default("activity"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { text, mode, context } = parsed.data;
    const result = await improveText(text, mode as AiTextMode, context as AiTextContext);

    return NextResponse.json({ success: true, text: result, mode, context });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
