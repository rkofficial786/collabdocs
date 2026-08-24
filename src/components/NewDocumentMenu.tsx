"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus, Upload, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACCEPTED = ".txt,.md,.markdown,.docx";

export function NewDocumentMenu() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function createBlank() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const { document } = await res.json();
      router.push(`/doc/${document.id}`);
    } catch {
      toast.error("Couldn't create document");
      setLoading(false);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/documents/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      toast.success(`Imported "${data.document.title}"`);
      router.push(`/doc/${data.document.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
      setLoading(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFile}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={loading}>
          <Button disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={createBlank}>
            <FilePlus className="h-4 w-4" />
            Blank document
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import file…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
