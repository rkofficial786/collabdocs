import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentWithRole } from "@/lib/access";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const result = await getDocumentWithRole(id, session.user.id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.star.upsert({
    where: { documentId_userId: { documentId: id, userId: session.user.id } },
    update: {},
    create: { documentId: id, userId: session.user.id },
  });

  return NextResponse.json({ starred: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  await db.star.deleteMany({ where: { documentId: id, userId: session.user.id } });
  return NextResponse.json({ starred: false });
}
