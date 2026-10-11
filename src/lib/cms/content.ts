import sanitizeHtml from "sanitize-html";

export const safeUrl = (value: string) => {
  try {
    const url = new URL(value, "https://paxxmo.com");
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);
export function cleanContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "u",
      "s",
      "mark",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "hr",
      "a",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "iframe",
      "input",
      "label",
      "span",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "title", "rel"],
      img: [
        "src",
        "alt",
        "width",
        "height",
        "srcset",
        "sizes",
        "data-media-id",
        "loading",
        "decoding",
      ],
      iframe: ["src", "title", "allowfullscreen", "loading"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ul: ["data-type"],
      li: ["data-type", "data-checked"],
      input: ["type", "checked", "disabled"],
      code: ["class"],
      span: ["class"],
    },
    allowedClasses: { code: ["language-*"], span: ["hljs-*", "hljs"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
    allowedIframeHostnames: [
      "www.youtube-nocookie.com",
      "www.youtube.com",
      "player.vimeo.com",
    ],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tag, attrs) => ({
        tagName: "a",
        attribs: { ...attrs, rel: "noopener noreferrer" },
      }),
      input: (_tag, attrs) => ({
        tagName: "input",
        attribs: {
          type: "checkbox",
          disabled: "",
          ...(attrs.checked !== undefined ? { checked: "" } : {}),
        },
      }),
      img: (_tag, attrs) => ({
        tagName: "img",
        attribs: {
          ...attrs,
          loading: "lazy",
          decoding: "async",
          ...(attrs.srcset
            ? {
                srcset: attrs.srcset
                  .split(",")
                  .filter((part) => safeUrl(part.trim().split(/\s+/)[0]))
                  .join(","),
              }
            : {}),
        },
      }),
    },
  });
}
export const plainText = (html: string) =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .trim();
export const wordCount = (html: string) =>
  plainText(html).split(/\s+/).filter(Boolean).length;
export const readingTime = (html: string) =>
  `${Math.max(1, Math.ceil(wordCount(html) / 200))} min read`;
export function articleContent(html: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const content = cleanContent(html).replace(
    /<h([1-4])>(.*?)<\/h\1>/gs,
    (_match, level, text) => {
      const number = Math.max(2, Number(level));
      const id = `${slugify(plainText(text)) || "section"}-${headings.length + 1}`;
      headings.push({ id, text: plainText(text), level: number });
      return `<h${number} id="${id}">${text}</h${number}>`;
    },
  );
  return { content, headings };
}
