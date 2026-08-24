"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

type Share = {
  id: string;
  permission: "VIEW" | "EDIT";
  user: { id: string; name: string; email: string };
};

export function ShareDialog({
  documentId,
  owner,
  initialShares,
}: {
  documentId: string;
  owner: { name: string; email: string };
  initialShares: Share[];
}) {
  const router = useRouter();
  const [shares, setShares] = useState(initialShares);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("EDIT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addShare(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permission }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't share document");

      setShares((prev) => {
        const withoutExisting = prev.filter((s) => s.user.id !== data.share.user.id);
        return [...withoutExisting, data.share];
      });
      setEmail("");
      toast.success(`Shared with ${data.share.user.name}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function removeShare(userId: string) {
    const prev = shares;
    setShares((s) => s.filter((share) => share.user.id !== userId));
    const res = await fetch(`/api/documents/${documentId}/share/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      setShares(prev);
      toast.error("Couldn't remove access");
      return;
    }
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share document</DialogTitle>
          <DialogDescription>People with access can view or edit this document.</DialogDescription>
        </DialogHeader>

        <form onSubmit={addShare} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              type="email"
              required
              placeholder="Enter an email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
          </div>
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as "VIEW" | "EDIT")}
            className="h-9 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <option value="EDIT">Can edit</option>
            <option value="VIEW">Can view</option>
          </select>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
          </Button>
        </form>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={owner.name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{owner.name}</p>
              <p className="truncate text-xs text-[var(--muted-2)]">{owner.email}</p>
            </div>
            <span className="text-xs text-[var(--muted-2)]">Owner</span>
          </div>

          {shares.map((share) => (
            <div key={share.id} className="flex items-center gap-2.5">
              <Avatar name={share.user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{share.user.name}</p>
                <p className="truncate text-xs text-[var(--muted-2)]">{share.user.email}</p>
              </div>
              <span className="text-xs text-[var(--muted-2)]">
                {share.permission === "EDIT" ? "Can edit" : "Can view"}
              </span>
              <button
                type="button"
                onClick={() => removeShare(share.user.id)}
                className="rounded-md p-1 text-[var(--muted-2)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                aria-label={`Remove ${share.user.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {shares.length === 0 && (
            <p className="text-center text-xs text-[var(--muted-2)]">
              Not shared with anyone yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
