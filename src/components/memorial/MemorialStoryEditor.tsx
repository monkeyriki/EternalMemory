"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link2,
  Undo2,
  Redo2,
  Video,
  Film
} from "lucide-react";
import { VimeoEmbed } from "@/extensions/tiptapVimeo";

export type MemorialStoryEditorHandle = {
  getHTML: () => string;
  isEmpty: () => boolean;
};

type MemorialStoryEditorProps = {
  initialContent: string;
  disabled?: boolean;
};

function isPersistableHtml(html: string): boolean {
  const t = html.replace(/\s|&nbsp;/g, "");
  if (!t) return false;
  if (t === "<p></p>") return false;
  if (t === "<p><br></p>") return false;
  return true;
}

const MemorialStoryEditor = forwardRef<
  MemorialStoryEditorHandle,
  MemorialStoryEditorProps
>(function MemorialStoryEditor({ initialContent, disabled = false }, ref) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc pl-4 my-2" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-4 my-2" } },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-amber-200 pl-3 my-2 text-stone-600 italic"
          }
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-800 underline underline-offset-2 hover:text-amber-900",
          rel: "noopener noreferrer nofollow",
          target: "_blank"
        }
      }),
      Placeholder.configure({
        placeholder:
          "Write a biography, memories, or paste a YouTube / Vimeo link…"
      }),
      Youtube.configure({
        nocookie: true,
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg max-w-full"
        }
      }),
      VimeoEmbed.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: "rounded-lg max-w-full"
        }
      })
    ],
    content: initialContent?.trim() ? initialContent : "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "prose-memorial min-h-[180px] px-3 py-2 text-sm text-stone-900 focus:outline-none max-w-none"
      }
    }
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor?.getHTML() ?? "",
      isEmpty: () => {
        if (!editor) return true;
        if (editor.isEmpty) return true;
        return !isPersistableHtml(editor.getHTML());
      }
    }),
    [editor]
  );

  const promptLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://…)", prev ?? "https://");
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  };

  const promptYoutube = () => {
    if (!editor) return;
    const url = window.prompt(
      "YouTube URL (watch, youtu.be, or embed)",
      "https://www.youtube.com/watch?v="
    );
    if (!url?.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const promptVimeo = () => {
    if (!editor) return;
    const url = window.prompt("Vimeo URL", "https://vimeo.com/");
    if (!url?.trim()) return;
    editor.chain().focus().setVimeoVideo({ src: url.trim() }).run();
  };

  if (!editor) {
    return (
      <div className="min-h-[180px] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-400">
        Loading editor…
      </div>
    );
  }

  const Btn = ({
    onClick,
    active,
    title,
    children
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-amber-100 text-amber-900"
          : "text-stone-600 hover:bg-stone-100"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-100 bg-stone-50 px-1 py-1">
        <Btn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Btn>
        <Btn
          title="Heading"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Btn>
        <Btn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <span className="px-0.5 text-xs font-serif font-semibold">&ldquo;</span>
        </Btn>
        <Btn title="Link" active={editor.isActive("link")} onClick={promptLink}>
          <Link2 className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <Btn title="Embed YouTube" onClick={promptYoutube}>
          <Video className="h-4 w-4" />
        </Btn>
        <Btn title="Embed Vimeo" onClick={promptVimeo}>
          <Film className="h-4 w-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} className="tiptap" />
      <p className="border-t border-stone-100 bg-stone-50 px-3 py-1.5 text-xs text-stone-500">
        Paste a YouTube or Vimeo URL to embed. Use the film button for Vimeo if paste does
        not work.
      </p>
    </div>
  );
});

export default MemorialStoryEditor;
