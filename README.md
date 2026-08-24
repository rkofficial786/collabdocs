# CollabDocs

A lightweight collaborative document editor — create documents, edit them with rich formatting, import files, and share access with other users. Built for the Ajaia Full Stack Product Engineer take-home assignment.

**Live demo:** https://collabdocs-kohl.vercel.app/
**Walkthrough video:** https://drive.google.com/file/d/17wjfCSEoZvuYa7UhDGPN0ihKQGYOK4Af/view?usp=sharing

## Demo accounts

The app uses real email/password login (seeded accounts, no self-signup UI). Password is the same for all three:

| Email | Password | Illustrates |
|---|---|---|
| `alice@demo.com` | `password123` | Owns a document, has shared it with Bob (edit) and Carol (view) |
| `bob@demo.com` | `password123` | Owns a separate document, has **edit** access to Alice's doc |
| `carol@demo.com` | `password123` | Has **view-only** access to Alice's doc |

The login page has one-click buttons for each of these so reviewers don't need to type credentials.

## Features

- **Document creation & editing** — create a blank doc or rename any doc you own, with autosave (debounced, ~700ms after you stop typing) and a save-status indicator.
- **Rich text formatting** — bold, italic, underline, headings (H1–H3), bulleted/numbered lists, blockquotes, undo/redo. Built on [Tiptap](https://tiptap.dev).
- **Slash commands** — type `/` on an empty-ish line for a Notion-style menu to insert headings, lists, or a quote.
- **Floating selection toolbar** — select any text to get an inline bold/italic/underline/heading/quote menu, instead of reaching for the top toolbar.
- **Command palette (⌘K / Ctrl+K)** — jump to any document or create a new one from anywhere in the app without touching the mouse.
- **Document icons** — pick an emoji per document (Notion-style); it shows in the sidebar, dashboard cards, and command palette.
- **Starring/favorites** — pin documents you care about; they surface in their own section on the dashboard and sidebar.
- **Version history** — checkpoints are saved automatically as you edit; open the history panel to see past versions with author and timestamp, and restore any of them (restoring itself is undoable — it snapshots your current content first).
- **Dark mode** — a real second theme (not just inverted colors), toggle persists across sessions.
- **Persistent sidebar app shell** — every document you own or have access to, searchable, with a mobile-responsive drawer.
- **File import** — upload a `.txt`, `.md`/`.markdown`, or `.docx` file and it becomes a new editable document, imported through the same schema the editor renders. Unsupported types are rejected with a clear error. 4MB upload limit.
- **Sharing** — the owner can grant another user (by email) **view** or **edit** access. The dashboard visually separates "My documents" from "Shared with me," and each shared card shows the owner and your permission level.
- **Persistence** — everything is stored in Postgres (Prisma). Refresh, close the tab, or come back later — your documents, formatting, sharing, stars, and icons are all still there.
- **Access control** — viewers get a genuinely read-only editor (no toolbar, no bubble menu, disabled title); only the owner can rename, delete, or manage sharing. Enforced server-side on every request, not just hidden in the UI.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + TypeScript
- **Tiptap** for the rich text editor
- **Prisma** + **PostgreSQL** (developed against [Neon](https://neon.tech), works with any Postgres)
- **NextAuth (Auth.js) v5** — credentials provider, JWT sessions
- **Tailwind CSS v4** + hand-built shadcn-style UI primitives (Radix underneath)
- **Vitest** for unit tests
- **mammoth** (.docx → HTML) for file import

## Local setup

**Requirements:** Node.js 20.9+, a Postgres database (a free [Neon](https://neon.tech) project takes ~1 minute to create).

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL and AUTH_SECRET (see below)
npx prisma migrate deploy   # or: npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"   # your deployed URL in production
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / start |
| `npm run db:push` | Push the Prisma schema to your database (no migration history) |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:seed` | Seed the three demo accounts and sample documents (idempotent — safe to re-run) |
| `npm run db:studio` | Open Prisma Studio to browse the database |
| `npm test` | Run the Vitest suite |

## Deploying (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the three environment variables above (`NEXTAUTH_URL` = your production URL).
4. Deploy. Run `npx prisma migrate deploy && npm run db:seed` once against the production database (locally, pointed at the prod `DATABASE_URL`, or via a Vercel one-off deployment/build step) to create the schema and demo accounts.

Any Postgres works — Neon, Supabase, Railway, etc. — nothing here is Neon-specific.

## Supported file types for import

**.txt, .md / .markdown, .docx** — anything else is rejected with an explicit error message in the UI. Markdown support is a small hand-rolled converter covering the subset the editor itself can produce (headings 1–3, bold, italic, bulleted/numbered lists, paragraphs) rather than full CommonMark — see the architecture note for why.

## Testing

`npm test` runs the Vitest suite (access-control role resolution and the Markdown/text import converters). Beyond that, every core flow (login, create, edit, autosave, rename, share, unshare, viewer read-only enforcement, file import happy/error paths, delete) was driven end-to-end with a real Postgres database and a headless browser during development — see `AI_WORKFLOW.md` for how that was used alongside the unit tests.

## What's deprioritized / known limitations

- **No live multi-cursor collaboration.** Two people editing the same document simultaneously will overwrite each other's autosave (last write wins) — there's no CRDT/OT layer. Sharing is about *access*, not real-time co-editing.
- **No password reset / self-service signup.** Accounts are seeded; this kept auth scope proportional to a take-home.
- **Markdown import is a practical subset**, not full CommonMark (no tables, nested blockquotes, images, etc.).
- **No document version history** — each save overwrites the previous content.

See `ARCHITECTURE.md` for the reasoning behind these cuts and what I'd build next with more time.
