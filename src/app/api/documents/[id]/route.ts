import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentWithRole, canEdit } from "@/lib/access";
import { updateDocumentSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const result = await getDocumentWithRole(id, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ document: result.document, role: result.role });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const result = await getDocumentWithRole(id, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canEdit(result.role)) {
    return NextResponse.json({ error: "You don't have edit access to this document" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const document = await db.document.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.content !== undefined
        ? { content: parsed.data.content as object }
        : {}),
      ...(parsed.data.icon !== undefined ? { icon: parsed.data.icon } : {}),
    },
  });

  return NextResponse.json({ document });
}

// navigator.sendBeacon (used to flush a pending save on tab close) can only
// send POST, so it needs the same handler as PATCH.
export { PATCH as POST };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const document = await db.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (document.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only the owner can delete this document" }, { status: 403 });
  }

  await db.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
