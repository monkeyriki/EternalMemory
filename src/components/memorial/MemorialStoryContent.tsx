"use client";

import { useMemo } from "react";
import {
  sanitizeMemorialStory,
  storyLooksLikeHtml
} from "@/lib/sanitizeMemorialStory";

type Props = {
  html: string;
};

/**
 * Renders memorial story: legacy plain text as pre-wrap; HTML from TipTap after sanitization.
 */
export function MemorialStoryContent({ html }: Props) {
  const trimmed = html.trim();

  const inner = useMemo(() => {
    if (!trimmed) return { kind: "empty" as const };
    if (!storyLooksLikeHtml(trimmed)) {
      return { kind: "plain" as const, text: trimmed };
    }
    return { kind: "html" as const, safe: sanitizeMemorialStory(trimmed) };
  }, [trimmed]);

  if (inner.kind === "empty") {
    return null;
  }

  if (inner.kind === "plain") {
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {inner.text}
      </div>
    );
  }

  return (
    <div
      className="memorial-story text-sm leading-relaxed text-slate-700 [&_a]:break-words [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:my-2 [&_[data-youtube-video]]:my-4 [&_[data-youtube-video]]:max-w-full [&_[data-vimeo-video]]:my-4 [&_[data-vimeo-video]]:max-w-full [&_iframe]:max-h-[360px] [&_iframe]:w-full [&_iframe]:max-w-full [&_iframe]:rounded-lg [&_iframe]:border-0"
      dangerouslySetInnerHTML={{ __html: inner.safe }}
    />
  );
}
