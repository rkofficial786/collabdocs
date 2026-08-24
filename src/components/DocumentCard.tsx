"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FileText, MoreHorizontal, Trash2, Eye, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DocumentCard({
  id,
  title,
  icon,
  updatedAt,
  ownerName,
  permission,
  isOwner,
  starred: initialStarred,
}: {
  id: string;
  title: string;
  icon?: string | null;
  updatedAt: string | Date;
  ownerName?: string;
  permission?: "VIEW" | "EDIT";
  isOwner: boolean;
  starred?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [starred, setStarred] = useState(!!initialStarred);
  const [starPending, setStarPending] = useState(false);

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

  async function toggleStar(e: React.MouseEvent) {
    e.preventDefault();
    if (starPending) return;
    const next = !starred;
    setStarred(next);
    setStarPending(true);
    const res = await fetch(`/api/documents/${id}/star`, { method: next ? "POST" : "DELETE" });
    setStarPending(false);
    if (!res.ok) {
      setStarred(!next);
      toast.error("Couldn't update star");
      return;
    }
    router.refresh();
  }

  return (
    <Link
      href={`/doc/${id}`}
      className={`group relative flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-md ${deleting ? "pointer-events-none opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-lg text-[var(--accent-hover)]">
          {icon ?? <FileText className="h-4.5 w-4.5" />}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleStar}
            aria-label={starred ? "Unstar" : "Star"}
            className={cn(
              "rounded-md p-1.5 transition-colors hover:bg-black/5",
              starred ? "text-amber-500" : "text-[var(--muted-2)] hover:text-[var(--foreground)]"
            )}
          >
            <Star className={cn("h-4 w-4", starred && "fill-current")} />
          </button>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.preventDefault()}
                className="rounded-md p-1.5 text-[var(--muted-2)] outline-none transition-colors hover:bg-black/5 hover:text-[var(--foreground)]"
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
