# Architecture Note

## Summary

CollabDocs is a single Next.js application (App Router) doing both frontend and backend — server components read from Postgres directly for fast first paint, and a small set of REST-ish route handlers under `/api` handle mutations from client components. There's no separate backend service; for this scope, a monolith is strictly simpler to build, reason about, and deploy correctly in a few hours, and a take-home reviewer gets more value from a coherent, well-tested slice than from a "proper" microservice split that adds no real capability here.

## Data model

Three tables (`prisma/schema.prisma`):

- **User** — `id, name, email, passwordHash`. No roles/orgs — every user is a peer who can own and be shared documents.
- **Document** — `id, title, content (jsonb), ownerId, timestamps`. `content` stores Tiptap's native JSON document tree directly (not HTML, not Markdown). This means edits round-trip losslessly through the editor with no lossy serialization step, and Postgres's `jsonb` gives me a queryable, indexable column for free if I ever needed to search document contents.
- **DocumentShare** — join table: `documentId, userId, permission (VIEW | EDIT)`, unique on `(documentId, userId)`. Ownership itself is *not* modeled as a share — it's the `ownerId` foreign key on `Document`. A user's relationship to a document is always one of exactly three states (owner / share with EDIT / share with VIEW / none), resolved by a single pure function (`resolveRole` in `src/lib/access.ts`) that's unit-tested in isolation from the database.

## Access control

Every document-touching route (`GET/PATCH/DELETE /api/documents/[id]`, the share routes, the page itself) re-derives the caller's role from the database on every request — there's no cached/trusted client-side role. `resolveRole` is deliberately pure (no Prisma import) so it can be tested with plain objects instead of a live database; `getDocumentWithRole` wraps it with the actual query. Deleting and managing sharing are owner-only; editing requires `owner` or `edit`; everything else (including document `GET`) requires at least `view`. The editor component receives an `editable` boolean computed server-side and renders a completely different (read-only, no-toolbar) experience for viewers rather than disabling controls client-side after the fact.

## Editor & autosave

Tiptap (ProseMirror under the hood) gives real contenteditable behavior with a proper document schema, which is what makes bold/italic/lists/headings behave predictably instead of fighting `contenteditable` directly. Changes are debounced (700ms of no typing) before a `PATCH` fires, with a visible saving/saved/error indicator so the user isn't guessing. There's also a `navigator.sendBeacon` fallback on `beforeunload` so a save in flight when you close the tab still has a shot at landing — this required the document route to accept `POST` as well as `PATCH`, since `sendBeacon` can only send `POST`. **Tradeoff:** autosave is last-write-wins with no operational transform — good enough for "share and hand off," not for two people typing in the same document at the same instant.

## File import

Upload → parse to HTML → `generateJSON` (from `@tiptap/html`, which runs server-side without a real DOM) into the *exact same Tiptap extension set* the editor uses (`src/lib/tiptap-extensions.ts`), so an imported document opens looking like something the editor itself produced, not a foreign blob.

- `.docx` → `mammoth.convertToHtml` (industry-standard for this).
- `.md`/`.markdown` → a small hand-written converter (`src/lib/markdown.ts`) covering headings 1–3, bold, italic, bulleted/numbered lists, paragraphs. **Deliberately not a full CommonMark parser** — pulling in `remark`/`unified` for a take-home file-import feature is more dependency surface than value; the subset covers everything the editor itself can produce, which is the realistic "export from here, re-import elsewhere" loop.
- `.txt` → blank-line-separated paragraphs, single newlines become `<br>`.

All three share one code path into the same `Document.content` shape, so the rest of the app (editor, autosave, sharing) doesn't need to know or care whether a document was typed, imported, or seeded.

## Application shell & interaction layer

Dashboard and editor both live inside an `(app)` route group whose `layout.tsx` does one auth check and one `getUserDocuments` query, then hands the result to a client `AppShell` — a persistent sidebar (searchable document list, starred section, new-document entry point, theme toggle, user menu) plus a `⌘K` command palette wired at the shell level so it's available from any page, not bolted onto each one. This is the difference between "a CRUD page" and "an app": navigation state (which document is active, dark/light theme, the mobile drawer) lives above the page content instead of being re-derived per-route.

Inside the editor itself, three Tiptap pieces work together: a `BubbleMenu` (from `@tiptap/react/menus`) shows a floating format toolbar only when text is selected; a hand-built `SlashCommand` extension (`@tiptap/suggestion` + a small React menu, mounted through Tiptap's Floating UI-based `props.mount()` rather than the old tippy.js pattern) turns `/heading`, `/bulleted list`, etc. into structural inserts; and a live word/character count reads `editor.getText()` on every update. All three are edit-mode only — a viewer gets none of them, consistent with the read-only enforcement described above.

Document icons (an emoji per document, `Document.icon`) and starring (`Star`, a `(documentId, userId)` join table separate from `DocumentShare` because "I starred this" and "I have access to this" are unrelated facts) both round-trip through the same optimistic-update-then-`router.refresh()` pattern already used for rename/delete, so there's one mutation idiom across the app rather than a special case per feature.

## What I prioritized, and why

Given the 4–6 hour box, I spent the time on the things a reviewer can actually *feel*: an editor that behaves like a real editor (not a `<textarea>` with buttons), a sharing flow with real permission enforcement (not just a UI toggle), and file import that produces genuinely well-formatted documents rather than a wall of unstyled text. I deliberately did **not** build:

- Real-time multi-user collaboration (Yjs/CRDT) — huge scope for a feature the brief explicitly lists as optional stretch.
- Comments/suggestions, version history, PDF export — same reasoning; each is a separate, non-trivial feature.
- An org/team/roles model — every user is a flat peer; sharing is per-document per-user, which is all the brief asks for.

## What I'd build next with 2–4 more hours

1. **Real-time presence + basic conflict handling** — even without full CRDT collaboration, showing "Bob is viewing this doc" and doing an optimistic-lock check on save (reject/merge if the doc changed since you loaded it) would close the most visible gap versus Google Docs.
2. **Document version history** — since content is already a JSON snapshot, storing periodic snapshots (or a diff on each save) is a natural next step and was explicitly called out as a stretch option.
3. **Attachments separate from import** — right now file upload always *becomes* a document; letting a user attach a file *to* an existing document (the other example in the brief) is a distinct, smaller feature I cut for time.
4. **Rate limiting / stricter upload validation** (magic-byte sniffing instead of trusting the file extension) before this went anywhere near production traffic.
