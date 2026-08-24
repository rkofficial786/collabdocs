import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentWithRole, canEdit } from "@/lib/access";

type Params = { params: Promise<{ id: string; versionId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, versionId } = await params;

  const result = await getDocumentWithRole(id, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEdit(result.role)) {
    return NextResponse.json({ error: "You don't have edit access to this document" }, { status: 403 });
  }

  const version = await db.documentVersion.findUnique({ where: { id: versionId } });
  if (!version || version.documentId !== id) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  // Always snapshot the current state before restoring, regardless of the
  // usual throttle, so restoring is itself undoable.
  await db.documentVersion.create({
    data: {
      documentId: id,
      title: result.document.title,
      content: result.document.content as object,
      authorId: session.user.id,
    },
  });

  const document = await db.document.update({
    where: { id },
    data: { content: version.content as object },
  });

  return NextResponse.json({ document });
}
