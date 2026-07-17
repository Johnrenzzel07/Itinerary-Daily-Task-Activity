"use client";

import { useState } from "react";
import { Loader2, Sparkles, SpellCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AiTextMode = "grammar" | "paraphrase";
type AiTextContext = "activity" | "remarks";

interface AiTextToolsProps {
  text: string;
  onResult: (text: string) => void;
  context: AiTextContext;
  disabled?: boolean;
  className?: string;
}

export function AiTextTools({ text, onResult, context, disabled, className }: AiTextToolsProps) {
  const [loadingMode, setLoadingMode] = useState<AiTextMode | null>(null);

  const runAi = async (mode: AiTextMode) => {
    if (!text.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    setLoadingMode(mode);

    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, context }),
      });

      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "AI request failed");
      }

      if (data.text) {
        onResult(data.text);
        if (mode === "grammar") {
          toast.success(context === "activity" ? "Activity grammar fixed" : "Remarks grammar fixed");
        } else {
          toast.success(
            context === "activity" ? "Activity paraphrased" : "Remarks paraphrased"
          );
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setLoadingMode(null);
    }
  };

  const hint =
    context === "activity"
      ? "Rewrites as a work activity log entry"
      : "Rewrites as a short remarks note";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 dark:border-white/15 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-white/80">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-white dark:text-black">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="font-semibold leading-none">AI Assist</p>
          <p className="admin-muted mt-0.5 text-xs font-normal">{hint}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-9 rounded-lg px-3 text-sm"
          disabled={disabled || !!loadingMode}
          onClick={() => runAi("grammar")}
        >
          {loadingMode === "grammar" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SpellCheck className="h-4 w-4" />
          )}
          Fix Grammar
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-lg px-3 text-sm"
          disabled={disabled || !!loadingMode}
          onClick={() => runAi("paraphrase")}
        >
          {loadingMode === "paraphrase" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Paraphrase {context === "activity" ? "Activity" : "Remarks"}
        </Button>
      </div>
    </div>
  );
}
