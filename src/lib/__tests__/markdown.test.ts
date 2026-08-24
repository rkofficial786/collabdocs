import { describe, it, expect } from "vitest";
import { markdownToHtml, textToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("converts headings", () => {
    expect(markdownToHtml("# Title")).toBe("<h1>Title</h1>");
    expect(markdownToHtml("## Sub")).toBe("<h2>Sub</h2>");
  });

  it("converts bold and italic inline formatting", () => {
    expect(markdownToHtml("**bold** and *italic*")).toBe(
      "<p><strong>bold</strong> and <em>italic</em></p>"
    );
  });

  it("groups consecutive bullet lines into one list", () => {
    expect(markdownToHtml("- one\n- two\n- three")).toBe(
      "<ul><li>one</li><li>two</li><li>three</li></ul>"
    );
  });

  it("groups consecutive numbered lines into one ordered list", () => {
    expect(markdownToHtml("1. one\n2. two")).toBe("<ol><li>one</li><li>two</li></ol>");
  });

  it("escapes raw HTML in the source text", () => {
    expect(markdownToHtml("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>"
    );
  });

  it("falls back to an empty paragraph for blank input", () => {
    expect(markdownToHtml("   \n\n  ")).toBe("<p></p>");
  });
});

describe("textToHtml", () => {
  it("splits blank-line-separated blocks into paragraphs", () => {
    expect(textToHtml("first\n\nsecond")).toBe("<p>first</p><p>second</p>");
  });

  it("turns single newlines within a block into line breaks", () => {
    expect(textToHtml("line one\nline two")).toBe("<p>line one<br>line two</p>");
  });

  it("escapes HTML special characters", () => {
    expect(textToHtml("a < b & c > d")).toBe("<p>a &lt; b &amp; c &gt; d</p>");
  });
});
