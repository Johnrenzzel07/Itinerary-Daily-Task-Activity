"use client";

import { useState } from "react";
import { Loader2, SpellCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AiTextMode = "grammar" | "paraphrase";

interface AiTextToolsProps {
  text: string;
  onResult: (text: string) => void;
  disabled?: boolean;
}

export function AiTextTools({ text, onResult, disabled }: AiTextToolsProps) {
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
        body: JSON.stringify({ text, mode }),
      });

      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "AI request failed");
      }

      if (data.text) {
        onResult(data.text);
        toast.success(mode === "grammar" ? "Grammar fixed" : "Text paraphrased");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
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
        disabled={disabled || !!loadingMode}
        onClick={() => runAi("paraphrase")}
      >
        {loadingMode === "paraphrase" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Paraphrase
      </Button>
    </div>
  );
}
