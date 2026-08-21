"use client";

import React, { useState } from "react";
import RankBadge from "@/components/profile/RankBadge";
import { soundFX } from "@/lib/soundEffects";

interface RepostModalProps {
  isOpen: boolean;
  post: any;
  currentUser: any;
  onClose: () => void;
  onRepostSuccess: (newPost: any) => void;
}

export default function RepostModal({
  isOpen,
  post,
  currentUser,
  onClose,
  onRepostSuccess,
}: RepostModalProps) {
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !post) return null;

  const originalTarget = post.originalPost || post;
  const author = originalTarget.user;
  const firstMedia = originalTarget.mediaUrls ? originalTarget.mediaUrls.split(",")[0].trim() : null;

  async function handleRepost(instant = false) {
    try {
      setLoading(true);
      const res = await fetch(`/api/community/posts/${originalTarget.id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentary: instant ? "" : commentary,
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.post) {
        soundFX.playPostPublished();
        onRepostSuccess(data.post);
        onClose();
        setCommentary("");
      } else {
        alert(data.message || "Failed to repost");
      }
    } catch {
      alert("Failed to repost. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl text-base">
              🔁
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              Repost to Feed
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Reposter input */}
        <div className="space-y-2">
          <textarea
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            placeholder="Add your thoughts or commentary (optional)..."
            rows={3}
            className="w-full p-3.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition resize-none"
          />
        </div>

        {/* Embedded Original Post Card Preview */}
        <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={
                  author.profileImageUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${author.username}`
                }
                alt={author.username}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="min-w-0">
                <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {author.fullName || author.username}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">@{author.username}</p>
              </div>
            </div>
            <RankBadge
              rankTier={author.rankTier}
              xpPoints={author.xpPoints}
              size="sm"
              showLevel={false}
            />
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed">
            {originalTarget.content}
          </p>

          {firstMedia && (
            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
              <img
                src={firstMedia}
                alt="Media preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleRepost(true)}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Posting..." : "Instant Repost"}
          </button>
          <button
            type="button"
            onClick={() => handleRepost(false)}
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Repost with Thoughts"}
          </button>
        </div>
      </div>
    </div>
  );
}
