import { redirect, notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { auth } from "@/lib/auth";
import { getDocumentWithRole } from "@/lib/access";
import { DocumentIcon } from "@/components/DocumentIcon";
import { DocumentTitle } from "@/components/DocumentTitle";
import { ShareDialog } from "@/components/ShareDialog";
import { StarToggle } from "@/components/StarToggle";
import { VersionHistory } from "@/components/VersionHistory";
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
  const starred = document.stars.length > 0;

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-3 pl-14 md:pl-6">
          <DocumentIcon documentId={document.id} icon={document.icon} editable={editable} />
          <div className="min-w-0 flex-1">
            <DocumentTitle documentId={document.id} initialTitle={document.title} editable={editable} />
            <p className="px-2 text-xs text-[var(--muted-2)]">
              {role === "owner" ? "Owned by you" : `Owned by ${document.owner.name}`}
            </p>
          </div>
          {role === "view" && (
            <Badge variant="outline">
              <Eye className="h-3 w-3" /> view only
            </Badge>
          )}
          <StarToggle documentId={document.id} starred={starred} />
          <VersionHistory documentId={document.id} editable={editable} />
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
