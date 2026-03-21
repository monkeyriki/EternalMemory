import sanitizeHtml from "sanitize-html";

const IFRAME_HOSTS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com"
];

/**
 * Sanitize memorial story HTML from TipTap (bold, lists, links, YouTube/Vimeo embeds only).
 */
export function sanitizeMemorialStory(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "strike",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "div",
      "iframe",
      "span"
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel", "class"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "title",
        "class"
      ],
      div: ["data-youtube-video", "data-vimeo-video", "class"],
      span: ["class"],
      p: ["class"],
      h2: ["class"],
      h3: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
      blockquote: ["class"]
    },
    allowedIframeHostnames: IFRAME_HOSTS,
    allowVulnerableTags: true,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      iframe: ["https"]
    }
  });
}

/** True if content looks like HTML from the rich editor (vs legacy plain text). */
export function storyLooksLikeHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s.trim());
}
