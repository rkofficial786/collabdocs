"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, FileText, Search, CornerDownLeft } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { SidebarDocument } from "@/lib/documents";

type Action = {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  onSelect: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  documents,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: SidebarDocument[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the query/selection whenever the palette opens. Adjusted during
  // render (not an effect) per React's guidance for resetting state on a prop change.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  async function createBlank() {
    onOpenChange(false);
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      const { document } = await res.json();
      router.push(`/doc/${document.id}`);
    }
  }

  const items: Action[] = useMemo(() => {
    const filtered = documents.filter((d) =>
      d.title.toLowerCase().includes(query.toLowerCase())
    );
    const docActions: Action[] = filtered.slice(0, 8).map((d) => ({
      id: d.id,
      label: d.title,
      sublabel: d.role === "owner" ? "Owned by you" : `Shared by ${d.ownerName}`,
      icon: d.icon ? (
        <span className="text-base leading-none">{d.icon}</span>
      ) : (
        <FileText className="h-4 w-4" />
      ),
      onSelect: () => {
        onOpenChange(false);
        router.push(`/doc/${d.id}`);
      },
    }));

    const createAction: Action = {
      id: "__create__",
      label: query ? `Create "${query}"` : "New blank document",
      icon: <FilePlus className="h-4 w-4" />,
      onSelect: createBlank,
    };

    return query ? [...docActions, createAction] : [createAction, ...docActions];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[activeIndex]?.onSelect();
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          style={{ animation: "overlay-in 120ms ease-out" }}
        />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl focus:outline-none"
          style={{ animation: "dialog-in 140ms ease-out" }}
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted-2)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search documents or create new…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-2)]"
            />
            <kbd className="rounded border border-[var(--border-strong)] px-1.5 py-0.5 text-[10px] text-[var(--muted-2)]">
              Esc
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-[var(--muted-2)]">No matches</p>
            )}
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={item.onSelect}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  i === activeIndex ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "text-[var(--foreground)]"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                    i === activeIndex ? "text-[var(--accent-hover)]" : "text-[var(--muted)]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                {item.sublabel && (
                  <span className="shrink-0 truncate text-xs text-[var(--muted-2)]">{item.sublabel}</span>
                )}
                {i === activeIndex && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 opacity-60" />}
              </button>
            ))}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
