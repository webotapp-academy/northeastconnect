"use client";

import React, { useState, useRef, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

interface PostReactionsBarProps {
  postId: number;
  initialLikesCount?: number;
  initialUserReaction?: string | null;
  currentUser?: any;
}

const REACTION_OPTIONS = [
  { type: "like", emoji: "❤️", label: "Love", color: "text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800" },
  { type: "fire", emoji: "🔥", label: "Fire", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" },
  { type: "clap", emoji: "👏", label: "Clap", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" },
  { type: "idea", emoji: "💡", label: "Idea", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/60 border-yellow-200 dark:border-yellow-800" },
  { type: "pride", emoji: "🦏", label: "NE Pride", color: "text-teal-500 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800" },
];

export default function PostReactionsBar({
  postId,
  initialLikesCount = 0,
  initialUserReaction = null,
  currentUser,
}: PostReactionsBarProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLikesCount(initialLikesCount);
    setUserReaction(initialUserReaction);
  }, [initialLikesCount, initialUserReaction]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPicker]);

  async function handleReact(type: string = "like", e?: React.MouseEvent) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShowPicker(false);

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (loading) return;

    // Optimistic UI calculation
    const prevReaction = userReaction;
    const prevCount = likesCount;

    let nextReaction: string | null = null;
    let nextCount = prevCount;

    if (prevReaction === type) {
      nextReaction = null;
      nextCount = Math.max(0, prevCount - 1);
      soundFX.playPop();
    } else {
      nextReaction = type;
      if (!prevReaction) {
        nextCount = prevCount + 1;
      }
      soundFX.playReaction(type);
    }

    setUserReaction(nextReaction);
    setLikesCount(nextCount);

    try {
      setLoading(true);
      const res = await fetch(`/api/community/posts/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setUserReaction(data.currentReaction);
        setLikesCount(data.likesCount);
      } else {
        // Rollback
        setUserReaction(prevReaction);
        setLikesCount(prevCount);
      }
    } catch {
      // Rollback
      setUserReaction(prevReaction);
      setLikesCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  const currentOption = REACTION_OPTIONS.find((r) => r.type === userReaction);

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      {/* Floating Reactions Picker Popup */}
      {showPicker && (
        <div
          onMouseEnter={() => {
            if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
          }}
          onMouseLeave={() => setShowPicker(false)}
          className="absolute -top-12 left-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full px-2 py-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {REACTION_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={(e) => handleReact(opt.type, e)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:scale-130 active:scale-95 transition-transform cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              title={opt.label}
            >
              <span>{opt.emoji}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Like / Reaction Button */}
      <div
        className="flex items-center"
        onMouseEnter={() => {
          if (pickerTimeoutRef.current) clearTimeout(pickerTimeoutRef.current);
          setShowPicker(true);
        }}
        onMouseLeave={() => {
          pickerTimeoutRef.current = setTimeout(() => setShowPicker(false), 400);
        }}
      >
        <button
          type="button"
          onClick={(e) => handleReact(userReaction || "like", e)}
          className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-[13px] flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs ${
            currentOption
              ? `${currentOption.color} border`
              : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
          }`}
        >
          <span className="text-sm sm:text-base leading-none">
            {currentOption ? currentOption.emoji : "🤍"}
          </span>
          <span>{likesCount}</span>
          <span className="hidden sm:inline font-semibold">
            {currentOption ? currentOption.label : "Like"}
          </span>
        </button>

        {/* Reaction Picker Arrow Toggle on Mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
          }}
          className="sm:hidden -ml-1.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px]"
          title="Choose reaction"
        >
          ▾
        </button>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
