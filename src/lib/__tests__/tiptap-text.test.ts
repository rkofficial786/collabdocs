import { describe, it, expect } from "vitest";
import { extractPlainText, excerpt } from "@/lib/tiptap-text";

const doc = {
  type: "doc",
  content: [
    { type: "heading", content: [{ type: "text", text: "Title" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Hello" },
        { type: "text", text: "world" },
      ],
    },
  ],
};

describe("extractPlainText", () => {
  it("flattens nested text nodes with whitespace between them", () => {
    expect(extractPlainText(doc)).toBe("Title Hello world");
  });

  it("returns an empty string for null/undefined", () => {
    expect(extractPlainText(null)).toBe("");
    expect(extractPlainText(undefined)).toBe("");
  });
});

describe("excerpt", () => {
  it("returns short text unchanged", () => {
    expect(excerpt(doc, 100)).toBe("Title Hello world");
  });

  it("truncates long text with an ellipsis", () => {
    const long = { type: "doc", content: [{ type: "text", text: "a".repeat(200) }] };
    const result = excerpt(long, 10);
    expect(result).toBe("a".repeat(10) + "…");
  });
});
