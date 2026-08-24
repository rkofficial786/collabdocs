"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DocumentTitle({
  documentId,
  initialTitle,
  editable,
}: {
  documentId: string;
  initialTitle: string;
  editable: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const lastSaved = useRef(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  async function save() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(lastSaved.current);
      return;
    }
    if (trimmed === lastSaved.current) return;

    const res = await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
    if (!res.ok) {
      toast.error("Couldn't rename document");
      setTitle(lastSaved.current);
      return;
    }
    lastSaved.current = trimmed;
    setTitle(trimmed);
    router.refresh();
  }

  return (
    <input
      ref={inputRef}
      value={title}
      disabled={!editable}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") inputRef.current?.blur();
        if (e.key === "Escape") {
          setTitle(lastSaved.current);
          inputRef.current?.blur();
        }
      }}
      className="w-full max-w-md truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-[var(--foreground)] outline-none transition-colors hover:border-[var(--border)] focus:border-[var(--border-strong)] focus:bg-[var(--background)] disabled:hover:border-transparent"
      aria-label="Document title"
    />
  );
}
