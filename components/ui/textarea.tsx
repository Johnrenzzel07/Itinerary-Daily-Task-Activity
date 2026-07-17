import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black shadow-sm transition-colors placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-white/40 dark:focus-visible:ring-white",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
