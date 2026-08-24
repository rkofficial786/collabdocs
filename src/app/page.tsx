import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopBar } from "@/components/TopBar";
import { NewDocumentMenu } from "@/components/NewDocumentMenu";
import { DocumentCard } from "@/components/DocumentCard";
import { FileText, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const [owned, shared] = await Promise.all([
    db.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    }),
    db.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        owner: { select: { name: true } },
        shares: { where: { userId }, select: { permission: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <TopBar user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {owned.length + shared.length === 0
                ? "Create your first document to get started."
                : `${owned.length} owned · ${shared.length} shared with you`}
            </p>
          </div>
          <NewDocumentMenu />
        </div>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <FileText className="h-4 w-4" />
            My documents
          </div>
          {owned.length === 0 ? (
            <EmptyState label="No documents yet" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {owned.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  updatedAt={doc.updatedAt}
                  isOwner
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
          {shared.length === 0 ? (
            <EmptyState label="Nothing has been shared with you yet" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shared.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  id={doc.id}
                  title={doc.title}
                  updatedAt={doc.updatedAt}
                  isOwner={false}
                  ownerName={doc.owner.name}
                  permission={doc.shares[0]?.permission}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] text-sm text-[var(--muted-2)]">
      {label}
    </div>
  );
}
