"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
