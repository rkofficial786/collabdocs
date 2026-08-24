"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import type { SidebarDocument } from "@/lib/documents";

export function AppShell({
  user,
  documents,
  children,
}: {
  user: { name: string; email: string };
  documents: SidebarDocument[];
  children: React.ReactNode;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const activeDocId = pathname?.startsWith("/doc/") ? pathname.split("/doc/")[1] : undefined;

  // Close the mobile drawer on navigation. Adjusted during render (not an
  // effect) per React's guidance for resetting state when a prop changes.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <Sidebar user={user} documents={documents} onSearchClick={() => setPaletteOpen(true)} activeDocId={activeDocId} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0" style={{ animation: "drawer-in 180ms ease-out" }}>
            <Sidebar
              user={user}
              documents={documents}
              onSearchClick={() => {
                setPaletteOpen(true);
                setMobileOpen(false);
              }}
              activeDocId={activeDocId}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="fixed left-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] shadow-sm md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} documents={documents} />
    </div>
  );
}
