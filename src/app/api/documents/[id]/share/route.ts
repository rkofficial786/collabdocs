import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { shareSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
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
    return NextResponse.json({ error: "Only the owner can share this document" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = shareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!targetUser) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }
  if (targetUser.id === document.ownerId) {
    return NextResponse.json({ error: "This user already owns the document" }, { status: 400 });
  }

  const share = await db.documentShare.upsert({
    where: { documentId_userId: { documentId: id, userId: targetUser.id } },
    update: { permission: parsed.data.permission },
    create: {
      documentId: id,
      userId: targetUser.id,
      permission: parsed.data.permission,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ share }, { status: 201 });
}
