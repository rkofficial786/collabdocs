import { db } from "@/lib/db";

export type Role = "owner" | "edit" | "view";

type ShareLike = { userId: string; permission: "VIEW" | "EDIT" };
type DocLike = { ownerId: string };

/**
 * Pure access-control resolver: given a document's owner and its share list,
 * determine what role (if any) a given user has. Kept pure/DB-free so it's
 * cheap to unit test.
 */
export function resolveRole(
  doc: DocLike,
  shares: ShareLike[],
  userId: string | undefined | null
): Role | null {
  if (!userId) return null;
  if (doc.ownerId === userId) return "owner";
  const share = shares.find((s) => s.userId === userId);
  if (!share) return null;
  return share.permission === "EDIT" ? "edit" : "view";
}

export function canEdit(role: Role | null): boolean {
  return role === "owner" || role === "edit";
}

/** Loads a document and resolves the requesting user's role against it. */
export async function getDocumentWithRole(documentId: string, userId: string) {
  const document = await db.document.findUnique({
    where: { id: documentId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!document) return null;

  const role = resolveRole(document, document.shares, userId);
  if (!role) return null;

  return { document, role };
}
