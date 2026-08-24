function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*(.+?)\*/g, "<em>$1</em>");
  out = out.replace(/_(.+?)_/g, "<em>$1</em>");
  return out;
}

/**
 * Minimal, dependency-free Markdown -> HTML conversion covering the subset
 * of syntax the editor itself can produce (headings 1-3, bold, italic,
 * bullet/numbered lists, paragraphs). Not a full CommonMark implementation
 * by design: this only needs to round-trip content our own editor + the
 * "import a .md file" flow will realistically produce.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      para.push(inline(lines[i]));
      i++;
    }
    html.push(`<p>${para.join("<br>")}</p>`);
  }

  return html.join("") || "<p></p>";
}

/** Plain text: blank-line-separated blocks become paragraphs, single newlines become line breaks. */
export function textToHtml(text: string): string {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = blocks
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
  return html || "<p></p>";
}
