"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StarToggle({ documentId, starred: initial }: { documentId: string; starred: boolean }) {
  const router = useRouter();
  const [starred, setStarred] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    const next = !starred;
    setStarred(next);
    setPending(true);
    const res = await fetch(`/api/documents/${documentId}/star`, { method: next ? "POST" : "DELETE" });
    setPending(false);
    if (!res.ok) {
      setStarred(!next);
      toast.error("Couldn't update star");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={starred ? "Unstar document" : "Star document"}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-black/5",
        starred ? "text-amber-500" : "text-[var(--muted)]"
      )}
    >
      <Star className={cn("h-4 w-4", starred && "fill-current")} />
    </button>
  );
}
