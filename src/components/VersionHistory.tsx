"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { History, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Version = {
  id: string;
  title: string;
  excerpt: string;
  authorName: string;
  createdAt: string;
};

export function VersionHistory({ documentId, editable }: { documentId: string; editable: boolean }) {
  const [versions, setVersions] = useState<Version[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`);
      const data = await res.json();
      if (res.ok) setVersions(data.versions);
    } finally {
      setLoading(false);
    }
  }

  async function restore(versionId: string) {
    if (!confirm("Restore this version? Your current content will be saved as a version too, so you can undo this.")) {
      return;
    }
    setRestoringId(versionId);
    const res = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
      method: "POST",
    });
    if (!res.ok) {
      toast.error("Couldn't restore this version");
      setRestoringId(null);
      return;
    }
    toast.success("Version restored");
    // Full reload so the editor remounts with the restored content — Tiptap
    // only reads its `content` prop once, at creation.
    window.location.reload();
  }

  return (
    <Dialog onOpenChange={(open) => open && load()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Version history" title="Version history">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version history</DialogTitle>
          <DialogDescription>
            Checkpoints are saved automatically as you edit.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--muted-2)]" />
          </div>
        )}

        {!loading && versions?.length === 0 && (
          <p className="py-6 text-center text-sm text-[var(--muted-2)]">
            No earlier versions yet — keep editing and checkpoints will appear here.
          </p>
        )}

        {!loading && versions && versions.length > 0 && (
          <div className="flex max-h-96 flex-col gap-1 overflow-y-auto">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(v.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-[var(--muted-2)]">by {v.authorName}</p>
                  {v.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-xs text-[var(--muted)]">{v.excerpt}</p>
                  )}
                </div>
                {editable && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={restoringId !== null}
                    onClick={() => restore(v.id)}
                  >
                    {restoringId === v.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restore
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
