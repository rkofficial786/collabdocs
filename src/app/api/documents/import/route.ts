import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { importFile, UnsupportedFileTypeError } from "@/lib/import";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB — stays under Vercel's serverless request body cap

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is too large (5MB max)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { title, content } = await importFile(file.name, buffer);

    const document = await db.document.create({
      data: {
        title,
        content: content as object,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Import failed", error);
    return NextResponse.json({ error: "Could not import this file" }, { status: 500 });
  }
}
