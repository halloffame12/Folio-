"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Command = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  value?: string;
};

const commands: (Command | "separator")[] = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  "separator",
  { label: "Heading", icon: Heading2, command: "formatBlock", value: "h2" },
  { label: "Paragraph", icon: Pilcrow, command: "formatBlock", value: "p" },
  "separator",
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Blockquote", icon: Quote, command: "formatBlock", value: "blockquote" },
];

export function RichTextEditor({
  noteId,
  initialContent,
  onChange,
  onBlur,
  placeholder = "Begin writing. This is where the reading becomes an argument.",
  className,
}: {
  noteId: string;
  initialContent: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialContent;
    // Only initialise when switching notes. Re-rendering would reset the caret.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const exec = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-0.5 border-b border-border px-1 py-1.5"
      >
        {commands.map((item, index) =>
          item === "separator" ? (
            <span key={`sep-${index}`} className="mx-1 h-4 w-px bg-border" aria-hidden />
          ) : (
            <button
              key={item.label}
              type="button"
              title={item.label}
              aria-label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => exec(item.command, item.value)}
              className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <item.icon className="size-3.5" />
            </button>
          )
        )}
        <span className="ml-auto hidden pr-2 font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground/60 sm:block">
          Rich text
        </span>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Note content"
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        onBlur={onBlur}
        className="editor-surface article-prose max-w-none px-5 py-6 font-serif text-[16px] leading-[1.8] focus-visible:outline-none sm:px-8 sm:py-8"
      />
    </div>
  );
}
