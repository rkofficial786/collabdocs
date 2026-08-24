import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const SNAPSHOT_THROTTLE_MS = 3 * 60 * 1000; // one checkpoint per 3 minutes of active editing, at most

/**
 * Snapshots a document's *current* content as a version, right before it gets
 * overwritten by a new save — throttled so continuous autosave (every ~700ms)
 * doesn't produce a version per keystroke pause. Call this before applying an
 * incoming content update, passing the document's state as it is right now.
 */
export async function maybeSnapshotVersion(
  document: { id: string; title: string; content: Prisma.JsonValue },
  authorId: string
) {
  const latest = await db.documentVersion.findFirst({
    where: { documentId: document.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const dueForSnapshot =
    !latest || Date.now() - latest.createdAt.getTime() > SNAPSHOT_THROTTLE_MS;
  if (!dueForSnapshot) return;

  await db.documentVersion.create({
    data: {
      documentId: document.id,
      title: document.title,
      content: document.content as Prisma.InputJsonValue,
      authorId,
    },
  });
}
