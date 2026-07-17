import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-indigo-100 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:bg-black dark:text-white dark:placeholder:text-white/45 dark:focus-visible:ring-white dark:focus-visible:border-white/40",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
