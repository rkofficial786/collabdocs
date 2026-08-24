import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
} from "lucide-react";
import {
  SlashCommandMenu,
  type SlashCommandMenuHandle,
} from "@/components/editor/SlashCommandMenu";

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  run: (editor: Editor, range: Range) => void;
};

const ITEMS: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Plain paragraph",
    icon: <Pilcrow className="h-4 w-4" />,
    run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Big section heading",
    icon: <Heading1 className="h-4 w-4" />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="h-4 w-4" />,
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bulleted list",
    description: "Simple unordered list",
    icon: <List className="h-4 w-4" />,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "List with numbering",
    icon: <ListOrdered className="h-4 w-4" />,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Blockquote",
    icon: <Quote className="h-4 w-4" />,
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
];

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,
        allowedPrefixes: [" ", "\n"],
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.run(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowedPrefixes: [" ", "\n"],
        items: ({ query }: { query: string }) =>
          ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8),
        command: ({ editor, range, props }) => {
          (props as SlashCommandItem).run(editor, range);
        },
        render: () => {
          let component: ReactRenderer<SlashCommandMenuHandle> | null = null;
          let unmount: (() => void) | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items as SlashCommandItem[],
                  command: (item: SlashCommandItem) => props.command(item),
                },
                editor: props.editor,
              });
              unmount = props.mount(component.element);
            },
            onUpdate: (props) => {
              component?.updateProps({
                items: props.items as SlashCommandItem[],
                command: (item: SlashCommandItem) => props.command(item),
              });
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                unmount?.();
                component?.destroy();
                return true;
              }
              return component?.ref?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              unmount?.();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
