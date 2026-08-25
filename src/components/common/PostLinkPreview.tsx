"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { extractPostLinks } from "@/lib/postFormatting";

interface PostLinkPreviewProps {
  content: string;
}

interface PreviewItem {
  url: string;
  title: string;
  description: string;
  image?: string | null;
  siteName: string;
  domain: string;
  badge?: string;
}

export default function PostLinkPreview({ content }: PostLinkPreviewProps) {
  const { youtubeVideos, webLinks } = extractPostLinks(content);

  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Take the primary web link to show a clean Facebook-style card preview
  const primaryWebLink = webLinks.length > 0 ? webLinks[0] : null;

  useEffect(() => {
    if (!primaryWebLink) {
      setPreviews([]);
      return;
    }

    let isMounted = true;
    async function fetchPreview() {
      try {
        setLoading(true);
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(primaryWebLink!)}`);
        const data = await res.json();
        if (isMounted && data.status === "success" && data.preview) {
          setPreviews([data.preview]);
        }
      } catch (err) {
        console.error("Failed to fetch link preview:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchPreview();
    return () => {
      isMounted = false;
    };
  }, [primaryWebLink]);

  if (youtubeVideos.length === 0 && !primaryWebLink) {
    return null;
  }

  return (
    <div className="space-y-3 mt-3 mb-3" onClick={(e) => e.stopPropagation()}>
      {/* 1. YouTube Video Previews & Players */}
      {youtubeVideos.map((videoId) => {
        const isPlaying = playingVideoId === videoId;

        return (
          <div
            key={videoId}
            className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md aspect-video relative group"
          >
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <div
                className="w-full h-full relative cursor-pointer group"
                onClick={() => setPlayingVideoId(videoId)}
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt="YouTube Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                />

                {/* Red YouTube Play Button Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-10 sm:w-16 sm:h-12 bg-red-600 group-hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* YouTube Badge */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="text-red-500 font-black">▶</span>
                  <span>YouTube Video</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 2. Facebook-Style Web Link Preview Card */}
      {previews.map((preview, idx) => {
        const isInternal =
          preview.domain.includes("northeastconnect.in") ||
          preview.domain.includes("localhost");

        const targetHref = isInternal
          ? (() => {
              try {
                return new URL(preview.url).pathname;
              } catch {
                return preview.url;
              }
            })()
          : preview.url;

        const CardWrapper = isInternal ? Link : "a";
        const wrapperProps = isInternal
          ? { href: targetHref }
          : { href: preview.url, target: "_blank", rel: "noopener noreferrer" };

        return (
          <CardWrapper
            key={idx}
            {...(wrapperProps as any)}
            className="block rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 group"
          >
            {preview.image && (
              <div className="h-44 sm:h-52 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                <img
                  src={preview.image}
                  alt={preview.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {preview.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-[10px] font-black text-white border border-slate-700/60 rounded-md shadow-xs uppercase tracking-wider">
                    {preview.badge}
                  </span>
                )}
              </div>
            )}

            <div className="p-4 space-y-1.5 bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>🌐</span>
                <span className="truncate">{preview.domain || preview.siteName}</span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                {preview.title}
              </h4>

              {preview.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {preview.description}
                </p>
              )}
            </div>
          </CardWrapper>
        );
      })}
    </div>
  );
}
