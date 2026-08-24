# Submission

**Candidate:** Rupraj Singh (ruprajsingh1@gmail.com)
**Assignment:** Ajaia LLC — Full Stack Product Engineer

## Included in this folder

- [ ] **Source code** — `collabdocs/` (this project)
- [x] **README.md** — local setup & run instructions, demo accounts, supported file types (`collabdocs/README.md`)
- [x] **ARCHITECTURE.md** — architecture note: what was prioritized, key decisions, what's next (`collabdocs/ARCHITECTURE.md`)
- [x] **AI_WORKFLOW.md** — AI tool usage, what was verified/changed/rejected (`collabdocs/AI_WORKFLOW.md`)
- [x] **SUBMISSION.md** — this file
- [ ] **Live product URL** — _add after deploying (see README → Deploying)_
- [ ] **Walkthrough video URL** — _add a `.txt` file with the Loom/YouTube link_
- [ ] **Screenshots / demo GIF** — _optional if the live deployment needs no extra setup steps to review_

## What's working end-to-end

- Sign in with any of 3 seeded accounts (alice/bob/carol@demo.com, password `password123`)
- Create a blank document; rename it; edit with bold/italic/underline/headings/bulleted & numbered lists; autosave with a visible save-status indicator; content persists across reload
- Import a `.txt`, `.md`, or `.docx` file as a new document; unsupported types are rejected with a clear error
- Share a document with another user by email, at **view** or **edit** permission; revoke access; the dashboard visually separates owned vs. shared documents and shows the permission level
- Viewers get a genuinely read-only editor (no toolbar, disabled title, non-editable content) — enforced server-side on every request, not just hidden in the UI
- Delete a document you own (with confirmation)

## What's incomplete / intentionally deprioritized

See `ARCHITECTURE.md` → "What I prioritized, and why" for the full reasoning. In short: no real-time multi-cursor collaboration, no comments/suggestions, no version history, no PDF export, no org/roles model beyond per-document sharing. All of these are either explicitly listed as optional stretch in the brief or are large enough features to be their own take-home.

## What I'd build next with 2–4 more hours

See `ARCHITECTURE.md` → "What I'd build next" (presence + optimistic-lock conflict handling, version history, attachments-as-a-distinct-feature, stricter upload validation).
