import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-black/10 dark:bg-white/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
