import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { SlashCommandItem } from "@/lib/slash-command-extension";

export type SlashCommandMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  { items: SlashCommandItem[]; command: (item: SlashCommandItem) => void }
>(function SlashCommandMenu({ items, command }, ref) {
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown(event) {
      if (event.key === "ArrowDown") {
        setSelected((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelected((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        if (items[selected]) command(items[selected]);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--muted-2)] shadow-xl">
        No matches
      </div>
    );
  }

  return (
    <div className="w-64 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onMouseEnter={() => setSelected(i)}
          onClick={() => command(item)}
          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
            i === selected ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "text-[var(--foreground)]"
          }`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)]">
            {item.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{item.title}</span>
            <span className="block truncate text-xs text-[var(--muted-2)]">{item.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
});
