import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-white [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700 dark:bg-white dark:text-black dark:shadow-none dark:hover:bg-white/90",
        destructive:
          "border-2 border-rose-500 bg-rose-50 text-rose-700 hover:bg-rose-500 hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black",
        outline:
          "border-2 border-indigo-200 bg-white text-indigo-700 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black",
        secondary:
          "border-2 border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-500 dark:border-white/20 dark:bg-black dark:text-white dark:hover:border-white",
        ghost:
          "text-indigo-700 hover:bg-indigo-50 dark:text-white dark:hover:bg-white/10",
        link: "text-indigo-600 underline-offset-4 hover:underline dark:text-white",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-10 rounded-lg px-3 text-sm",
        lg: "h-12 rounded-xl px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
