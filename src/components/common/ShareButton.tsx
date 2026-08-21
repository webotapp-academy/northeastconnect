"use client";

import React, { useState } from "react";

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
  className?: string;
}

export default function ShareButton({ url, title, text, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`
      : `https://northeastconnect.in${url.startsWith("/") ? url : `/${url}`}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "NorthEast Connect Community",
          text: text || "Check out this thought on NorthEast Connect!",
          url: fullUrl,
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Prompt fallback
      prompt("Copy link to this thought:", fullUrl);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={
        className ||
        "px-3 sm:px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-full font-bold text-xs sm:text-[13px] flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/60 transition cursor-pointer active:scale-95"
      }
      title="Share permalink"
    >
      <span>↗</span>
      <span>{copied ? "Copied Link! ✓" : "Share"}</span>
    </button>
  );
}
