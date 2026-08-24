import type { JSONContent } from "@tiptap/react";

/** Flattens a Tiptap JSON document into plain text, for excerpts/search — not for re-rendering. */
export function extractPlainText(doc: JSONContent | null | undefined): string {
  if (!doc) return "";
  const parts: string[] = [];

  function walk(node: JSONContent) {
    if (typeof node.text === "string") parts.push(node.text);
    node.content?.forEach(walk);
  }
  walk(doc);

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function excerpt(doc: JSONContent | null | undefined, maxLength = 140): string {
  const text = extractPlainText(doc);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
