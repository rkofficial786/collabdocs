import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDocumentWithRole } from "@/lib/access";
import { TopBar } from "@/components/TopBar";
import { DocumentTitle } from "@/components/DocumentTitle";
import { ShareDialog } from "@/components/ShareDialog";
import { Editor } from "@/components/Editor";
import { Badge } from "@/components/ui/badge";
import type { JSONContent } from "@tiptap/react";

export default async function DocumentPage({ params }: PageProps<"/doc/[id]">) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const result = await getDocumentWithRole(id, session.user.id);
  if (!result) notFound();

  const { document, role } = result;
  const editable = role !== "view";

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}
        center={
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-black/5 hover:text-[var(--foreground)]"
              aria-label="Back to documents"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <DocumentTitle documentId={document.id} initialTitle={document.title} editable={editable} />
            {role === "view" && (
              <Badge variant="outline">
                <Eye className="h-3 w-3" /> view only
              </Badge>
            )}
          </div>
        }
      />

      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-2.5">
          <p className="text-xs text-[var(--muted-2)]">
            {role === "owner" ? "Owned by you" : `Owned by ${document.owner.name}`}
          </p>
          {role === "owner" && (
            <ShareDialog
              documentId={document.id}
              owner={{ name: document.owner.name, email: document.owner.email }}
              initialShares={document.shares}
            />
          )}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <Editor
          documentId={document.id}
          initialContent={document.content as JSONContent}
          editable={editable}
        />
      </main>
    </div>
  );
}
