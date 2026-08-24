import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

/**
 * Shared extension set used by the client editor (Editor.tsx) and the
 * server-side file importer (import.ts), so HTML generated at import time
 * round-trips through the exact same schema the editor renders.
 * StarterKit already bundles Underline, so it isn't added separately.
 */
export const tiptapExtensions = [
  StarterKit,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];
