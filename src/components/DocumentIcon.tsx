"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { toast } from "sonner";

const EMOJI_OPTIONS = [
  "📄", "📝", "📋", "📌", "📎", "📚", "📖", "🗒️",
  "💡", "🎯", "🚀", "⭐", "🔥", "✅", "📊", "📈",
  "🗓️", "💬", "🎨", "🛠️", "🔬", "🌱", "🎉", "🏆",
];

export function DocumentIcon({
  documentId,
  icon,
  editable,
}: {
  documentId: string;
  icon: string | null;
  editable: boolean;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(icon);
  const [open, setOpen] = useState(false);

  async function setIcon(next: string | null) {
    setCurrent(next);
    setOpen(false);
    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: next }),
    });
    if (!res.ok) {
      toast.error("Couldn't update icon");
      setCurrent(icon);
      return;
    }
    router.refresh();
  }

  const trigger = (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xl text-[var(--accent-hover)]">
      {current ?? <FileText className="h-4.5 w-4.5" />}
    </span>
  );

  if (!editable) return trigger;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger className="rounded-lg outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-50 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Choose an icon</span>
            {current && (
              <button
                type="button"
                onClick={() => setIcon(null)}
                className="flex items-center gap-1 text-xs text-[var(--muted-2)] hover:text-[var(--foreground)]"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-[var(--accent-soft)]"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
