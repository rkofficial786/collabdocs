import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-hover)]">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Document not found</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          It may have been deleted, or you don&apos;t have access to it.
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Back to documents
      </Link>
    </div>
  );
}
