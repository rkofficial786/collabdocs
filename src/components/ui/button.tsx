import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--ring)]",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-sm",
        secondary: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[var(--background)]",
        ghost: "text-[var(--foreground)] hover:bg-black/5",
        outline: "border border-[var(--border-strong)] bg-transparent hover:bg-black/5",
        destructive: "bg-[var(--danger)] text-white hover:opacity-90",
        link: "text-[var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
