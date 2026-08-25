import React from "react";
import Link from "next/link";
import { MASTER_ADDAS } from "@/lib/addas";

export interface FormattedTextProps {
  content: string;
  onSelectHashtag?: (tag: string) => void;
  onSelectAdda?: (adda: string) => void;
  className?: string;
}

/**
 * Extracts links from text, separating YouTube URLs, normal web URLs, and media image attachments.
 */
export function extractPostLinks(text: string): {
  youtubeVideos: string[];
  webLinks: string[];
} {
  if (!text) return { youtubeVideos: [], webLinks: [] };

  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const matches = text.match(urlRegex) || [];

  const youtubeVideos: string[] = [];
  const webLinks: string[] = [];

  for (const rawUrl of matches) {
    // Remove trailing punctuation like ., ), ], etc.
    const cleanUrl = rawUrl.replace(/[.,!?;:)>\]]+$/, "");

    // Ignore direct image extensions (these are already handled by media carousel)
    if (/\.(png|jpe?g|webp|gif|svg|avif)($|\?)/i.test(cleanUrl)) {
      continue;
    }

    // Check if YouTube
    const ytMatch = cleanUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );

    if (ytMatch && ytMatch[1]) {
      if (!youtubeVideos.includes(ytMatch[1])) {
        youtubeVideos.push(ytMatch[1]);
      }
    } else {
      if (!webLinks.includes(cleanUrl)) {
        webLinks.push(cleanUrl);
      }
    }
  }

  return { youtubeVideos, webLinks };
}

/**
 * Parses inline Markdown formatting (bold **, italic *, bold-italic ***, strikethrough ~~)
 * as well as @mentions, #hashtags, and n:adda handles.
 */
export function renderRichPostContent(
  text: string,
  callbacks?: {
    onSelectHashtag?: (tag: string) => void;
    onSelectAdda?: (adda: string) => void;
  }
): React.ReactNode {
  if (!text) return null;

  // Split by major structural blocks (newlines)
  const lines = text.split("\n");

  return (
    <>
      {lines.map((line, lineIdx) => {
        // Parse inline elements for this line
        const parsedLine = parseInlineMarkdownAndHandles(line, callbacks, `line-${lineIdx}`);
        return (
          <React.Fragment key={lineIdx}>
            {parsedLine}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
}

/**
 * Parses inline text tokens (markdown + handles + urls)
 */
function parseInlineMarkdownAndHandles(
  lineText: string,
  callbacks?: {
    onSelectHashtag?: (tag: string) => void;
    onSelectAdda?: (adda: string) => void;
  },
  keyPrefix = "p"
): React.ReactNode[] {
  if (!lineText) return [" "];

  // Regex pattern matching:
  // 1. Bold italic: ***text***
  // 2. Bold: **text**
  // 3. Italic: *text* or _text_
  // 4. Strikethrough: ~~text~~
  // 5. Handles: @username, #hashtag, n:adda
  // 6. Direct URLs: https://...
  const tokenRegex =
    /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|#[a-zA-Z0-9_]+|n:[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+|https?:\/\/[^\s"'<>]+)/g;

  const parts = lineText.split(tokenRegex);

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;
    if (!part) return null;

    // 1. Bold + Italic: ***text***
    if (part.startsWith("***") && part.endsWith("***") && part.length > 6) {
      const inner = part.slice(3, -3);
      return (
        <strong key={key} className="font-black text-slate-950 dark:text-white italic">
          {inner}
        </strong>
      );
    }

    // 2. Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={key} className="font-extrabold text-slate-950 dark:text-white">
          {inner}
        </strong>
      );
    }

    // 3. Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={key} className="italic text-slate-900 dark:text-slate-100 font-medium">
          {inner}
        </em>
      );
    }

    // 4. Strikethrough: ~~text~~
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      const inner = part.slice(2, -2);
      return (
        <del key={key} className="line-through text-slate-400">
          {inner}
        </del>
      );
    }

    // 5. User Mentions: @username
    if (part.startsWith("@") && part.length > 1) {
      const handle = part.slice(1);
      return (
        <Link
          key={key}
          href={`/profile/${handle}`}
          className="inline-flex items-center font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 px-1.5 py-0.5 rounded-lg text-xs sm:text-sm border border-indigo-200/60 dark:border-indigo-800/60 transition mx-0.5"
        >
          {part}
        </Link>
      );
    }

    // 6. Hashtags: #tag
    if (part.startsWith("#") && part.length > 1) {
      const tag = part.slice(1);
      return callbacks?.onSelectHashtag ? (
        <button
          key={key}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            callbacks.onSelectHashtag!(tag);
          }}
          className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 px-1.5 py-0.5 rounded-lg text-xs sm:text-sm border border-emerald-200/60 dark:border-emerald-800/60 transition mx-0.5"
        >
          {part}
        </button>
      ) : (
        <Link
          key={key}
          href={`/?hashtag=${encodeURIComponent(tag)}`}
          className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100 px-1.5 py-0.5 rounded-lg text-xs sm:text-sm border border-emerald-200/60 dark:border-emerald-800/60 transition mx-0.5"
        >
          {part}
        </Link>
      );
    }

    // 7. Adda Handles: n:guwahati
    if (part.startsWith("n:") && part.length > 2) {
      const aName = part.slice(2);
      const matched = MASTER_ADDAS.find(
        (a) => a.id === aName.toLowerCase() || a.name.toLowerCase() === part.toLowerCase()
      );

      return callbacks?.onSelectAdda ? (
        <button
          key={key}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            callbacks.onSelectAdda!(part);
          }}
          className="inline-flex items-center font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer bg-teal-50/70 dark:bg-teal-950/50 px-1.5 py-0.5 rounded-lg font-mono text-xs sm:text-sm border border-teal-200/60 dark:border-teal-800/60 transition mx-0.5"
        >
          {part}
        </button>
      ) : (
        <Link
          key={key}
          href={matched ? `/addas/${matched.id}` : `/?adda=${encodeURIComponent(part)}`}
          className="inline-flex items-center font-extrabold text-teal-600 dark:text-teal-400 hover:underline bg-teal-50/80 dark:bg-teal-950/60 px-1.5 py-0.5 rounded-lg font-mono text-xs sm:text-sm border border-teal-200/60 dark:border-teal-800/60 transition mx-0.5"
        >
          {part}
        </Link>
      );
    }

    // 8. Raw Web URLs
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold break-all inline"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}
