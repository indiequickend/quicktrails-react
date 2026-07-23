import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export function formatINR(amount) {
  if (amount === null || amount === undefined) return "";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

const PRICE_UNIT_LABELS = {
  night: "/night",
  person_per_day: "/day/person",
};

export function priceUnitLabel(priceUnit) {
  return PRICE_UNIT_LABELS[priceUnit] || PRICE_UNIT_LABELS.night;
}

export const PRICE_UNIT_OPTIONS = [
  { value: "night", label: "Per night (per room)" },
  { value: "person_per_day", label: "Per day, per head" },
];

export function titleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Named entities TinyMCE's charmap plugin can insert, beyond the XML-basic
// set (amp/lt/gt/quot/apos). Covers dashes, curly quotes/ellipsis, the
// Latin-1 accented-letter block, and common symbols/currency.
const HTML_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  ndash: "–",
  mdash: "—",
  minus: "−",
  hellip: "…",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  sbquo: "‚",
  bdquo: "„",
  bull: "•",
  dagger: "†",
  Dagger: "‡",
  permil: "‰",
  prime: "′",
  Prime: "″",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  plusmn: "±",
  times: "×",
  divide: "÷",
  sect: "§",
  para: "¶",
  middot: "·",
  laquo: "«",
  raquo: "»",
  iexcl: "¡",
  iquest: "¿",
  euro: "€",
  pound: "£",
  cent: "¢",
  yen: "¥",
  curren: "¤",
  frac12: "½",
  frac14: "¼",
  frac34: "¾",
  szlig: "ß",
  eth: "ð",
  ETH: "Ð",
  thorn: "þ",
  THORN: "Þ",
  agrave: "à",
  aacute: "á",
  acirc: "â",
  atilde: "ã",
  auml: "ä",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  egrave: "è",
  eacute: "é",
  ecirc: "ê",
  euml: "ë",
  igrave: "ì",
  iacute: "í",
  icirc: "î",
  iuml: "ï",
  ntilde: "ñ",
  ograve: "ò",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  ouml: "ö",
  oslash: "ø",
  ugrave: "ù",
  uacute: "ú",
  ucirc: "û",
  uuml: "ü",
  yacute: "ý",
  yuml: "ÿ",
  Agrave: "À",
  Aacute: "Á",
  Acirc: "Â",
  Atilde: "Ã",
  Auml: "Ä",
  Aring: "Å",
  AElig: "Æ",
  Ccedil: "Ç",
  Egrave: "È",
  Eacute: "É",
  Ecirc: "Ê",
  Euml: "Ë",
  Igrave: "Ì",
  Iacute: "Í",
  Icirc: "Î",
  Iuml: "Ï",
  Ntilde: "Ñ",
  Ograve: "Ò",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Ouml: "Ö",
  Oslash: "Ø",
  Ugrave: "Ù",
  Uacute: "Ú",
  Ucirc: "Û",
  Uuml: "Ü",
  Yacute: "Ý",
};

function decodeHtmlEntities(str) {
  return str.replace(/&(#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === "#") return String.fromCharCode(Number(code.slice(1)));
    return HTML_ENTITIES[code] ?? HTML_ENTITIES[code.toLowerCase()] ?? match;
  });
}

// Converts the limited HTML tag set produced by TinyMCEEditor (p, h1-h6,
// strong/b, em/i, a, ul/ol/li, br, plus color spans) into Markdown. Not a
// general-purpose HTML->Markdown converter — nested lists aren't unwrapped
// recursively since the editor toolbar doesn't realistically produce them.
export function htmlToMarkdown(html) {
  if (!html) return "";

  let md = html;

  // Headings are processed first, before any inline-tag conversion below,
  // and reduced straight to plain text (stripping whatever's nested inside
  // -- editors and pasted-in content routinely wrap heading text in extra
  // <span>/<strong> combinations). Every level is demoted to bold rather
  // than `#`.."######": a leading `#` at the start of a line starts a new
  // structural section for any Markdown parser, and these headings sit
  // nested inside a bullet, not at the document's top level (that's
  // reserved for llms.txt's own ## Properties / ## Tour Packages sections).
  md = md.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, _level, text) => {
    const clean = text.replace(/<[^>]+>/g, "").trim();
    return clean ? `\n\n**${clean}**\n\n` : "\n\n";
  });

  md = md.replace(
    /<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, text) => `[${text.trim()}](${href})`
  );

  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `**${text}**`);
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `*${text}*`);

  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return "\n\n" + items.map((m) => `- ${m[1].trim()}`).join("\n") + "\n\n";
  });
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return "\n\n" + items.map((m, i) => `${i + 1}. ${m[1].trim()}`).join("\n") + "\n\n";
  });

  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>/gi, "").replace(/<\/p>/gi, "\n\n");

  md = md.replace(/<[^>]+>/g, "");

  md = decodeHtmlEntities(md);

  md = md
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return md;
}

function stripHtmlToText(html) {
  if (!html) return "";
  const text = html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
}

// Plain-text, single-line summary for lightweight directory listings (the
// llms.txt property bullets) -- the first sentence or two, capped at
// maxLen chars on a word boundary. Unlike htmlToMarkdown, this discards all
// formatting since it's meant to sit inline after a bullet's header.
export function htmlToSummary(html, maxLen = 160) {
  const text = stripHtmlToText(html);
  if (!text) return "";

  const sentenceMatch = text.match(/^(.*?[.!?])(?:\s+(.*?[.!?]))?(?:\s|$)/);
  let summary = sentenceMatch ? [sentenceMatch[1], sentenceMatch[2]].filter(Boolean).join(" ") : text;

  if (summary.length > maxLen) {
    summary = summary.slice(0, maxLen);
    const lastSpace = summary.lastIndexOf(" ");
    if (lastSpace > 0) summary = summary.slice(0, lastSpace);
    summary += "…";
  }

  return summary;
}
