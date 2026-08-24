import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createDocumentSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [owned, shared] = await Promise.all([
    db.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true, createdAt: true },
    }),
    db.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
        owner: { select: { name: true, email: true } },
        shares: { where: { userId }, select: { permission: true } },
      },
    }),
  ]);

  return NextResponse.json({ owned, shared });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = createDocumentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const document = await db.document.create({
    data: {
      title: parsed.data.title ?? "Untitled document",
      ownerId: session.user.id,
    },
  });

  return NextResponse.json({ document }, { status: 201 });
}
