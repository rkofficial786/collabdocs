import { generateJSON } from "@tiptap/html";
import mammoth from "mammoth";
import type { JSONContent } from "@tiptap/react";
import { tiptapExtensions } from "@/lib/tiptap-extensions";
import { markdownToHtml, textToHtml } from "@/lib/markdown";

export const SUPPORTED_IMPORT_EXTENSIONS = ["txt", "md", "markdown", "docx"] as const;

export class UnsupportedFileTypeError extends Error {
  constructor(ext: string) {
    super(
      `Unsupported file type ".${ext}". Supported types: ${SUPPORTED_IMPORT_EXTENSIONS.join(", ")}.`
    );
    this.name = "UnsupportedFileTypeError";
  }
}

function titleFromFilename(filename: string): string {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  return withoutExt.trim() || "Imported document";
}

export async function importFile(
  filename: string,
  buffer: Buffer
): Promise<{ title: string; content: JSONContent }> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  let html: string;
  if (ext === "txt") {
    html = textToHtml(buffer.toString("utf-8"));
  } else if (ext === "md" || ext === "markdown") {
    html = markdownToHtml(buffer.toString("utf-8"));
  } else if (ext === "docx") {
    const result = await mammoth.convertToHtml({ buffer });
    html = result.value || "<p></p>";
  } else {
    throw new UnsupportedFileTypeError(ext);
  }

  const content = generateJSON(html, tiptapExtensions) as JSONContent;
  return { title: titleFromFilename(filename), content };
}
