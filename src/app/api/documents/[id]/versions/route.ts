import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentWithRole } from "@/lib/access";
import { excerpt } from "@/lib/tiptap-text";
import type { JSONContent } from "@tiptap/react";

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

  const versions = await db.documentVersion.findMany({
    where: { documentId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json({
    versions: versions.map((v) => ({
      id: v.id,
      title: v.title,
      excerpt: excerpt(v.content as JSONContent),
      authorName: v.author?.name ?? "Unknown",
      createdAt: v.createdAt,
    })),
  });
}
