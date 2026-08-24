import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "accent" }) {
  const variants = {
    default: "bg-black/5 text-[var(--muted)]",
    outline: "border border-[var(--border-strong)] text-[var(--muted)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-hover)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
