import { cn, initials, avatarColor } from "@/lib/utils";

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims = { sm: "h-6 w-6 text-[10px]", md: "h-8 w-8 text-xs", lg: "h-11 w-11 text-sm" }[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        dims,
        className
      )}
      style={{ backgroundColor: avatarColor(name || "?") }}
      title={name}
    >
      {initials(name || "?")}
    </div>
  );
}
