"use client";

import { useMemo, useState } from "react";
import { FileText, Users, Star, Search } from "lucide-react";
import { DocumentCard } from "@/components/DocumentCard";
import type { SidebarDocument } from "@/lib/documents";

type Doc = SidebarDocument;

function matches(doc: Doc, query: string) {
  return doc.title.toLowerCase().includes(query.toLowerCase());
}

export function DashboardContent({ documents, userName }: { documents: Doc[]; userName: string }) {
  const [query, setQuery] = useState("");

  const owned = useMemo(() => documents.filter((d) => d.role === "owner"), [documents]);
  const shared = useMemo(() => documents.filter((d) => d.role !== "owner"), [documents]);
  const starred = useMemo(() => documents.filter((d) => d.starred), [documents]);

  const filteredOwned = owned.filter((d) => matches(d, query));
  const filteredShared = shared.filter((d) => matches(d, query));
  const filteredStarred = starred.filter((d) => matches(d, query));

  const firstName = userName.split(" ")[0];
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, {firstName || "there"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {owned.length + shared.length === 0
              ? "Create your first document to get started."
              : `${owned.length} owned · ${shared.length} shared with you`}
          </p>
        </div>
        <div className="relative w-full max-w-xs sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter documents…"
            className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
      </div>

      {filteredStarred.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Star className="h-4 w-4 fill-current text-amber-500" />
            Starred
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStarred.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                icon={doc.icon}
                updatedAt={doc.updatedAt}
                isOwner={doc.role === "owner"}
                ownerName={doc.ownerName}
                permission={doc.role === "edit" ? "EDIT" : doc.role === "view" ? "VIEW" : undefined}
                starred
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
          <FileText className="h-4 w-4" />
          My documents
        </div>
        {filteredOwned.length === 0 ? (
          <EmptyState label={query ? "No matches" : "No documents yet"} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOwned.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                icon={doc.icon}
                updatedAt={doc.updatedAt}
                isOwner
                starred={doc.starred}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
          <Users className="h-4 w-4" />
          Shared with me
        </div>
        {filteredShared.length === 0 ? (
          <EmptyState label={query ? "No matches" : "Nothing has been shared with you yet"} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShared.map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                icon={doc.icon}
                updatedAt={doc.updatedAt}
                isOwner={false}
                ownerName={doc.ownerName}
                permission={doc.role === "edit" ? "EDIT" : "VIEW"}
                starred={doc.starred}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--muted-2)]">
      {label}
    </div>
  );
}
