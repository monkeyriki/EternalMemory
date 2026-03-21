import { Node, mergeAttributes, nodePasteRule } from "@tiptap/core";

const VIMEO_PAGE = /vimeo\.com\/(?:video\/)?(\d+)/i;
const VIMEO_PLAYER = /player\.vimeo\.com\/video\/(\d+)/i;
/** Paste full Vimeo page or player URLs */
const VIMEO_PASTE_GLOBAL =
  /https?:\/\/(www\.)?(vimeo\.com\/(?:video\/)?\d+|player\.vimeo\.com\/video\/\d+)/gi;

export function vimeoUrlToEmbedSrc(url: string): string | null {
  const t = url.trim();
  let id: string | null = null;
  const m1 = t.match(VIMEO_PLAYER);
  if (m1?.[1]) id = m1[1];
  const m2 = t.match(VIMEO_PAGE);
  if (!id && m2?.[1]) id = m2[1];
  if (!id) return null;
  return `https://player.vimeo.com/video/${id}`;
}

export function isValidVimeoUrl(url: string): boolean {
  return vimeoUrlToEmbedSrc(url) !== null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    vimeo: {
      setVimeoVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const VimeoEmbed = Node.create({
  name: "vimeo",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      width: 640,
      height: 360,
      HTMLAttributes: {}
    };
  },

  addAttributes() {
    return {
      src: { default: null }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-vimeo-video] iframe' }];
  },

  addCommands() {
    return {
      setVimeoVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          const embed = vimeoUrlToEmbedSrc(options.src);
          if (!embed) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { src: embed }
          });
        }
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: VIMEO_PASTE_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          const raw = (match[0] ?? match.input ?? "").toString();
          const embed = vimeoUrlToEmbedSrc(raw);
          return embed ? { src: embed } : null;
        }
      })
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string | null;
    if (!src) {
      return ["div", { "data-vimeo-video": "" }];
    }
    return [
      "div",
      { "data-vimeo-video": "" },
      [
        "iframe",
        mergeAttributes(
          { ...this.options.HTMLAttributes },
          {
            src,
            width: this.options.width,
            height: this.options.height,
            frameborder: "0",
            allow:
              "autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media",
            allowfullscreen: true,
            title: "Vimeo video"
          }
        )
      ]
    ];
  }
});
