import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { Node, Extension, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { Plugin } from "@tiptap/pm/state";
import { NodeSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { DOMSerializer } from "@tiptap/pm/model";
import { cleanContent, safeUrl } from "@/lib/cms/content";
import type { MediaAsset } from "@/lib/cms/types";
import { toast } from "sonner";

const ArticleImage = Image.extend({
  draggable: true,
  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (element) => (element.querySelector("img") ? {} : false),
      },
      { tag: "img[src]" },
    ];
  },
  addAttributes() {
    const imageAttribute = (name: string) => (element: HTMLElement) =>
      (element.tagName === "FIGURE"
        ? element.querySelector("img")
        : element
      )?.getAttribute(name) || null;
    return {
      src: { default: null, parseHTML: imageAttribute("src") },
      alt: { default: null, parseHTML: imageAttribute("alt") },
      title: { default: null, parseHTML: imageAttribute("title") },
      width: { default: null, parseHTML: imageAttribute("width") },
      height: { default: null, parseHTML: imageAttribute("height") },
      srcset: { default: null, parseHTML: imageAttribute("srcset") },
      sizes: {
        default: "(max-width: 768px) 100vw, 760px",
        parseHTML: (element) =>
          imageAttribute("sizes")(element) || "(max-width: 768px) 100vw, 760px",
      },
      mediaId: {
        default: null,
        parseHTML: imageAttribute("data-media-id"),
        renderHTML: (attrs) => ({ "data-media-id": attrs.mediaId }),
      },
      caption: {
        default: "",
        parseHTML: (element) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent ||
          "",
        renderHTML: () => ({}),
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      {},
      ["img", mergeAttributes(HTMLAttributes)],
      ...(node.attrs.caption ? [["figcaption", {}, node.attrs.caption]] : []),
    ];
  },
});
const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes: () => ({
    src: { default: "" },
    title: { default: "Embedded video" },
  }),
  parseHTML: () => [{ tag: "iframe" }],
  renderHTML: ({ HTMLAttributes }) => [
    "iframe",
    { ...HTMLAttributes, loading: "lazy", allowfullscreen: "true" },
  ],
});
const BlockDrag = Extension.create({
  name: "blockDrag",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.forEach((node, pos) => {
              decorations.push(
                Decoration.widget(
                  pos,
                  (view) => {
                    const grip = document.createElement("button");
                    grip.className = "cms-block-grip";
                    grip.textContent = "⠿";
                    grip.type = "button";
                    grip.draggable = true;
                    grip.title = "Drag to move this block";
                    grip.setAttribute("aria-label", "Drag content block");
                    grip.setAttribute(
                      "aria-keyshortcuts",
                      "Alt+ArrowUp Alt+ArrowDown",
                    );
                    grip.addEventListener("keydown", (event) => {
                      if (
                        !event.altKey ||
                        !["ArrowUp", "ArrowDown"].includes(event.key)
                      )
                        return;
                      event.preventDefault();
                      const blocks: { pos: number; size: number }[] = [];
                      view.state.doc.forEach((block, position) =>
                        blocks.push({ pos: position, size: block.nodeSize }),
                      );
                      const index = blocks.findIndex(
                          (block) => block.pos === pos,
                        ),
                        neighbour =
                          blocks[index + (event.key === "ArrowUp" ? -1 : 1)];
                      if (!neighbour) return;
                      const current = view.state.doc.nodeAt(pos);
                      if (!current) return;
                      const transaction = view.state.tr.delete(
                        pos,
                        pos + current.nodeSize,
                      );
                      const target =
                        event.key === "ArrowUp"
                          ? neighbour.pos
                          : neighbour.pos + neighbour.size - current.nodeSize;
                      transaction
                        .insert(target, current)
                        .setSelection(
                          NodeSelection.create(transaction.doc, target),
                        );
                      view.dispatch(transaction);
                      view.focus();
                    });
                    grip.addEventListener("mousedown", () =>
                      view.dispatch(
                        view.state.tr.setSelection(
                          NodeSelection.create(view.state.doc, pos),
                        ),
                      ),
                    );
                    grip.addEventListener("dragstart", (event) => {
                      const selection = NodeSelection.create(
                        view.state.doc,
                        pos,
                      );
                      view.dispatch(view.state.tr.setSelection(selection));
                      const slice = selection.content();
                      view.dragging = { slice, move: true };
                      const container = document.createElement("div");
                      container.appendChild(
                        DOMSerializer.fromSchema(
                          view.state.schema,
                        ).serializeFragment(slice.content),
                      );
                      event.dataTransfer?.setData(
                        "text/html",
                        container.innerHTML,
                      );
                      if (event.dataTransfer)
                        event.dataTransfer.effectAllowed = "move";
                    });
                    return grip;
                  },
                  { side: -1, key: `grip-${pos}-${node.type.name}` },
                ),
              );
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
export const createEditorExtensions = () => [
  StarterKit.configure({
    codeBlock: false,
    heading: { levels: [1, 2, 3, 4] },
    link: { openOnClick: false },
  }),
  ArticleImage,
  Highlight,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit.configure({ table: { resizable: true } }),
  CodeBlockLowlight.configure({ lowlight: createLowlight(common) }),
  VideoEmbed,
  BlockDrag,
];
export function insertAsset(editor: Editor, asset: MediaAsset) {
  editor
    .chain()
    .focus()
    .insertContent({
      type: "image",
      attrs: {
        src: asset.url,
        alt: asset.alt,
        caption: asset.caption,
        mediaId: asset.id,
        width: asset.width,
        height: asset.height,
        srcset: asset.srcset,
        sizes: "(max-width: 768px) 100vw, 760px",
      },
    })
    .run();
}

export default function RichEditor({
  content,
  onChange,
  onReady,
  onImage,
  onFiles,
}: {
  content: string;
  onChange: (html: string, json: object) => void;
  onReady: (editor: Editor) => void;
  onImage: () => void;
  onFiles: (files: File[]) => void;
}) {
  const [slash, setSlash] = useState<string | null>(null);
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content: cleanContent(content),
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "k"
        ) {
          event.preventDefault();
          const value = window.prompt("Link URL", "https://");
          if (value && (safeUrl(value) || value.startsWith("mailto:")))
            editor?.chain().focus().setLink({ href: value }).run();
          return true;
        }
        return false;
      },
      attributes: {
        class: "cms-prose cms-writing-canvas",
        "aria-label": "Article body editor",
        spellcheck: "true",
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (files.length) {
          onFiles(files);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.length) {
          onFiles(files);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
      const { $from } = editor.state.selection;
      const before = $from.parent.textBetween(0, $from.parentOffset);
      setSlash(before.match(/(?:^|\s)\/([a-z]*)$/)?.[1] ?? null);
    },
  });
  useEffect(() => {
    if (editor) onReady(editor);
  }, [editor, onReady]);
  if (!editor) return <p role="status">Loading your writing space…</p>;
  const askLink = () => {
    const url = window.prompt(
      "Link URL",
      editor.getAttributes("link").href || "https://",
    );
    if (url === null) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    if (!safeUrl(url) && !url.startsWith("mailto:")) {
      toast.error("Use a valid HTTP(S) or email URL.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const embed = () => {
    const raw = window.prompt(
      "YouTube or Vimeo embed URL (https://www.youtube-nocookie.com/embed/… or https://player.vimeo.com/video/…)",
    );
    if (!raw) return;
    if (
      !/^https:\/\/(www\.youtube(?:-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)[\w-]+/.test(
        raw,
      )
    ) {
      toast.error("Use an approved YouTube or Vimeo embed URL.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "videoEmbed",
        attrs: { src: raw, title: "Embedded article video" },
      })
      .run();
  };
  const commands = [
    {
      name: "heading",
      label: "Heading",
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    { name: "image", label: "Image from library", run: onImage },
    {
      name: "table",
      label: "Table",
      run: () =>
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      name: "quote",
      label: "Blockquote",
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      name: "code",
      label: "Code block",
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
  ];
  const toolbar = [
    ["B", "Bold", () => editor.chain().focus().toggleBold().run(), "bold"],
    [
      "I",
      "Italic",
      () => editor.chain().focus().toggleItalic().run(),
      "italic",
    ],
    [
      "U",
      "Underline",
      () => editor.chain().focus().toggleUnderline().run(),
      "underline",
    ],
    [
      "S",
      "Strikethrough",
      () => editor.chain().focus().toggleStrike().run(),
      "strike",
    ],
    [
      "▰",
      "Highlight",
      () => editor.chain().focus().toggleHighlight().run(),
      "highlight",
    ],
    [
      "•",
      "Bullet list",
      () => editor.chain().focus().toggleBulletList().run(),
      "bulletList",
    ],
    [
      "1.",
      "Numbered list",
      () => editor.chain().focus().toggleOrderedList().run(),
      "orderedList",
    ],
    [
      "☑",
      "Checklist",
      () => editor.chain().focus().toggleTaskList().run(),
      "taskList",
    ],
    [
      "❞",
      "Quote",
      () => editor.chain().focus().toggleBlockquote().run(),
      "blockquote",
    ],
    [
      "</>",
      "Code",
      () => editor.chain().focus().toggleCodeBlock().run(),
      "codeBlock",
    ],
  ] as const;
  return (
    <div className="cms-rich-editor">
      <div className="cms-toolbar" role="toolbar" aria-label="Text formatting">
        <select
          aria-label="Heading level"
          value={
            editor.isActive("heading")
              ? editor.getAttributes("heading").level
              : 0
          }
          onChange={(e) => {
            const level = Number(e.target.value);
            if (level)
              editor
                .chain()
                .focus()
                .setHeading({ level: level as 1 | 2 | 3 | 4 })
                .run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <option value={0}>Paragraph</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              Heading {n}
            </option>
          ))}
        </select>
        {toolbar.map(([symbol, label, run, type]) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={editor.isActive(type)}
            className={editor.isActive(type) ? "active" : ""}
            onClick={run}
          >
            {symbol}
          </button>
        ))}
        <button
          type="button"
          title="Hyperlink (Ctrl/⌘ K)"
          aria-label="Insert link"
          onClick={askLink}
        >
          ↗
        </button>
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          onClick={onImage}
        >
          ▧
        </button>
        <button
          type="button"
          title="Embed video"
          aria-label="Embed video"
          onClick={embed}
        >
          ▶
        </button>
        <button
          type="button"
          aria-label="Insert table"
          title="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          ▦
        </button>
        <button
          type="button"
          aria-label="Insert divider"
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          ―
        </button>
        <button
          type="button"
          disabled={!editor.can().undo()}
          aria-label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          ↶
        </button>
        {editor.isActive("image") && (
          <>
            <button
              type="button"
              onClick={() => {
                const caption = window.prompt(
                  "Image caption",
                  editor.getAttributes("image").caption || "",
                );
                if (caption !== null)
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("image", { caption })
                    .run();
              }}
            >
              Caption
            </button>
            <button
              type="button"
              onClick={() => {
                const alt = window.prompt(
                  "Describe this image",
                  editor.getAttributes("image").alt || "",
                );
                if (alt !== null)
                  editor
                    .chain()
                    .focus()
                    .updateAttributes("image", { alt })
                    .run();
              }}
            >
              Alt text
            </button>
          </>
        )}
        <button
          type="button"
          disabled={!editor.can().redo()}
          aria-label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          ↷
        </button>
        {editor.isActive("table") && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              + row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              + column
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              Delete table
            </button>
          </>
        )}
      </div>
      <EditorContent editor={editor} />
      {slash !== null && (
        <div className="cms-slash-menu" role="menu" aria-label="Insert block">
          {commands
            .filter((c) => c.name.startsWith(slash))
            .map((c) => (
              <button
                key={c.name}
                role="menuitem"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .deleteRange({
                      from: editor.state.selection.from - slash.length - 1,
                      to: editor.state.selection.from,
                    })
                    .run();
                  c.run();
                  setSlash(null);
                }}
              >
                {c.label}
              </button>
            ))}
        </div>
      )}
      <p className="cms-editor-hint">
        Type /heading, /image, /table or /quote. Drag the ⠿ handles to reorder
        blocks. Ctrl/⌘ Z to undo.
      </p>
    </div>
  );
}
