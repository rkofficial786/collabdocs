"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreHorizontal, Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DocumentCard({
  id,
  title,
  updatedAt,
  ownerName,
  permission,
  isOwner,
}: {
  id: string;
  title: string;
  updatedAt: string | Date;
  ownerName?: string;
  permission?: "VIEW" | "EDIT";
  isOwner: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Couldn't delete document");
      setDeleting(false);
      return;
    }
    toast.success("Document deleted");
    router.refresh();
  }

  return (
    <Link
      href={`/doc/${id}`}
      className={`group relative flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md ${deleting ? "pointer-events-none opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-hover)]">
          <FileText className="h-4.5 w-4.5" />
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.preventDefault()}
              className="rounded-md p-1 text-[var(--muted-2)] opacity-0 outline-none transition-opacity hover:bg-black/5 hover:text-[var(--foreground)] group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={handleDelete}
                className="text-[var(--danger)] data-[highlighted]:bg-[var(--danger-soft)]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="mt-0.5 text-xs text-[var(--muted-2)]">
          Edited {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-1.5">
        {isOwner ? (
          <Badge variant="accent">Owned by you</Badge>
        ) : (
          <>
            <Badge>{ownerName}</Badge>
            <Badge variant="outline">
              {permission === "EDIT" ? (
                <>
                  <Pencil className="h-3 w-3" /> can edit
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" /> can view
                </>
              )}
            </Badge>
          </>
        )}
      </div>
    </Link>
  );
}
