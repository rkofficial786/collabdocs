import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, userId } = await params;

  const document = await db.document.findUnique({ where: { id } });
  if (!document) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (document.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only the owner can manage sharing" }, { status: 403 });
  }

  await db.documentShare.deleteMany({ where: { documentId: id, userId } });
  return NextResponse.json({ ok: true });
}
