"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
} from "lucide-react";
import { tiptapExtensions } from "@/lib/tiptap-extensions";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none",
        active ? "bg-[var(--accent-soft)] text-[var(--accent-hover)]" : "text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)]"
      )}
    >
      {children}
    </button>
  );
}

export function Editor({
  documentId,
  initialContent,
  editable,
}: {
  documentId: string;
  initialContent: JSONContent;
  editable: boolean;
}) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContent = useRef<JSONContent | null>(null);

  const persist = useCallback(async () => {
    if (!latestContent.current) return;
    setSaveState("saving");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: latestContent.current }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [documentId]);

  const editor = useEditor({
    extensions: [
      ...tiptapExtensions,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "tiptap-content",
      },
    },
    onUpdate: ({ editor }) => {
      latestContent.current = editor.getJSON();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(persist, 700);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, []);

  // Flush pending save on tab close / navigation away.
  useEffect(() => {
    const handler = () => {
      if (saveTimeout.current && latestContent.current) {
        navigator.sendBeacon?.(
          `/api/documents/${documentId}`,
          new Blob([JSON.stringify({ content: latestContent.current })], {
            type: "application/json",
          })
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [documentId]);

  if (!editor) {
    return <div className="min-h-[60vh] animate-pulse rounded-lg bg-black/5" />;
  }

  return (
    <div className="flex flex-1 flex-col">
      {editable && (
        <div className="sticky top-[57px] z-10 -mx-6 mb-4 flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface)]/95 px-6 py-2 backdrop-blur">
          <ToolbarButton
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-[var(--border)]" />

          <ToolbarButton
            label="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph")}
          >
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 1"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-[var(--border)]" />

          <ToolbarButton
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-[var(--border)]" />

          <ToolbarButton
            label="Bulleted list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="ml-auto flex items-center gap-1.5 pl-2 text-xs text-[var(--muted-2)]">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                saveState === "saving" && "bg-amber-400",
                saveState === "saved" && "bg-emerald-500",
                saveState === "error" && "bg-red-500",
                saveState === "idle" && "bg-transparent"
              )}
            />
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "Saved"}
            {saveState === "error" && "Couldn't save"}
          </div>
        </div>
      )}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
