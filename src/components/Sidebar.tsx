"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutGrid, LogOut, Search, Star, FileText } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NewDocumentMenu } from "@/components/NewDocumentMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SidebarDocument } from "@/lib/documents";

function DocRow({ doc, active }: { doc: SidebarDocument; active: boolean }) {
  return (
    <Link
      href={`/doc/${doc.id}`}
      className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-hover)] font-medium"
          : "text-[var(--foreground)]/85 hover:bg-black/5"
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[15px] leading-none">
        {doc.icon ?? <FileText className="h-3.5 w-3.5 text-[var(--muted-2)]" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{doc.title}</span>
      {doc.role !== "owner" && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-2)]"
          title={doc.role === "edit" ? "Shared — can edit" : "Shared — view only"}
        />
      )}
    </Link>
  );
}

export function Sidebar({
  user,
  documents,
  onSearchClick,
  activeDocId,
}: {
  user: { name: string; email: string };
  documents: SidebarDocument[];
  onSearchClick: () => void;
  activeDocId?: string;
}) {
  const pathname = usePathname();
  const starred = documents.filter((d) => d.starred);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 px-4 pt-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-sm font-bold text-white">
          C
        </div>
        <span className="text-sm font-semibold tracking-tight">CollabDocs</span>
      </div>

      <div className="flex flex-col gap-2 px-3 pt-4">
        <NewDocumentMenu fullWidth />
        <button
          type="button"
          onClick={onSearchClick}
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-left text-sm text-[var(--muted-2)] transition-colors hover:border-[var(--border-strong)]"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search</span>
          <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1 text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
        <Link
          href="/"
          className={`mb-3 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            pathname === "/"
              ? "bg-[var(--accent-soft)] text-[var(--accent-hover)] font-medium"
              : "text-[var(--foreground)]/85 hover:bg-black/5"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          All documents
        </Link>

        {starred.length > 0 && (
          <div className="mb-4">
            <div className="mb-1 flex items-center gap-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-2)]">
              <Star className="h-3 w-3 fill-current" />
              Starred
            </div>
            <div className="flex flex-col gap-0.5">
              {starred.map((doc) => (
                <DocRow key={doc.id} doc={doc} active={doc.id === activeDocId} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-2)]">
            Documents
          </div>
          <div className="flex flex-col gap-0.5">
            {documents.length === 0 && (
              <p className="px-2.5 py-2 text-xs text-[var(--muted-2)]">No documents yet</p>
            )}
            {documents.map((doc) => (
              <DocRow key={doc.id} doc={doc} active={doc.id === activeDocId} />
            ))}
          </div>
        </div>
      </nav>

      <div className="flex items-center gap-2 border-t border-[var(--border)] px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-lg p-1 text-left outline-none transition-colors hover:bg-black/5">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="truncate text-[11px] text-[var(--muted-2)]">{user.email}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuLabel>
              <div className="font-medium text-[var(--foreground)]">{user.name}</div>
              <div className="truncate">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </aside>
  );
}
