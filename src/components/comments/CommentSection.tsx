"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import RankBadge from "@/components/profile/RankBadge";
import AuthModal from "@/components/auth/AuthModal";

interface CommentUser {
  id: number;
  username: string;
  fullName: string | null;
  profileImageUrl: string | null;
  rankTier: string;
  xpPoints: number;
  state: string | null;
  rankInfo?: any;
}

interface CommentItem {
  id: number;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  user: CommentUser;
  replies?: CommentItem[];
}

interface CommentSectionProps {
  entityType: "news" | "culture" | "wildlife" | "adventure" | "directory" | "post" | "marketplace";
  entityId: number;
  entityTitle?: string;
  entityUrl?: string;
  hideHeader?: boolean;
  minimal?: boolean;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function CommentSection({
  entityType,
  entityId,
  entityTitle,
  entityUrl,
  hideHeader,
  minimal,
}: CommentSectionProps) {
  const isPostOrMinimal = minimal || hideHeader || entityType === "post";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  // Auth modal trigger
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [likingIds, setLikingIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchSession();
    fetchComments();
  }, [entityType, entityId]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
      }
    } catch {
      // Ignored
    }
  }

  async function fetchComments() {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`);
      const data = await res.json();
      if (data.status === "success") {
        setComments(data.comments || []);
        const count = data.totalCount || 0;
        setTotalCount(count);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("northeast-comment-count-updated", {
              detail: { entityType, entityId, count },
            })
          );
        }
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          content: newComment.trim(),
          entityTitle,
          entityUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post comment");

      setComments([data.comment, ...comments]);
      setTotalCount((prev) => {
        const next = prev + 1;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("northeast-comment-count-updated", {
              detail: { entityType, entityId, count: next },
            })
          );
        }
        return next;
      });
      setNewComment("");
      showToast("Comment posted! (+10 Explorer XP earned 🎉)");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePostReply(parentId: number) {
    if (!replyText.trim()) return;

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmittingReply(true);
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          parentId,
          content: replyText.trim(),
          entityTitle,
          entityUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reply");

      // Attach reply to the parent in state
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), data.comment],
            };
          }
          return c;
        })
      );
      setTotalCount((prev) => {
        const next = prev + 1;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("northeast-comment-count-updated", {
              detail: { entityType, entityId, count: next },
            })
          );
        }
        return next;
      });
      setReplyText("");
      setActiveReplyId(null);
      showToast("Reply posted! (+10 Explorer XP 🎉)");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleToggleLike(commentId: number, isReply = false, parentId?: number) {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    // 1. Optimistic UI update (0ms response)
    if (!isReply) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: !c.isLiked,
                likesCount: c.isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1,
              }
            : c
        )
      );
    } else if (parentId) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id === commentId
                  ? {
                      ...r,
                      isLiked: !r.isLiked,
                      likesCount: r.isLiked ? Math.max(0, r.likesCount - 1) : r.likesCount + 1,
                    }
                  : r
              ),
            };
          }
          return c;
        })
      );
    }

    // 2. Set loading indicator
    setLikingIds((prev) => ({ ...prev, [commentId]: true }));

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to like");

      // Sync with exact server response
      if (!isReply) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, isLiked: data.isLiked, likesCount: data.likesCount }
              : c
          )
        );
      } else if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === commentId
                    ? { ...r, isLiked: data.isLiked, likesCount: data.likesCount }
                    : r
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLikingIds((prev) => ({ ...prev, [commentId]: false }));
    }
  }

  async function handleDeleteComment(commentId: number, isReply = false, parentId?: number) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");

      if (!isReply) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== commentId),
              };
            }
            return c;
          })
        );
      }
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast("Comment deleted.");
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div
      className={
        isPostOrMinimal
          ? "space-y-3 pt-1 text-slate-900 dark:text-slate-100"
          : "bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 mt-10 transition-colors"
      }
    >
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-800 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-xl">✨</span>
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Header (Hidden on community post cards for direct, clean inline commenting) */}
      {!isPostOrMinimal && (
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Community Discussion</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalCount} {totalCount === 1 ? "thought shared" : "thoughts shared"} • Earn XP by commenting
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Your Rank:</span>
              <RankBadge rankTier={currentUser.rankTier} xpPoints={currentUser.xpPoints} size="sm" />
            </div>
          )}
        </div>
      )}

      {/* Comment Input Box */}
      <form onSubmit={handlePostComment} className={isPostOrMinimal ? "mb-4" : "mb-8"}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {currentUser?.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                alt={currentUser.username}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : "👤"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="relative">
              <textarea
                rows={3}
                placeholder={
                  currentUser
                    ? `Share your thoughts or tips as @${currentUser.username}...`
                    : "Join the conversation! Ask questions, share regional tips or memories..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onClick={() => {
                  if (!currentUser) setAuthModalOpen(true);
                }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {!currentUser ? (
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔑 Sign in to earn +10 XP</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span>✨</span> +10 XP for posting
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">Loading community comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="text-3xl mb-2">🏔️</div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No comments yet</h4>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Be the first Explorer to share your insights, ask a question, or leave a tip!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex items-start gap-3.5">
                <Link href={`/profile/${comment.user.username}`} className="flex-shrink-0">
                  <img
                    src={
                      comment.user.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.user.username}`
                    }
                    alt={comment.user.username}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 transition-colors">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${comment.user.username}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {comment.user.fullName || `@${comment.user.username}`}
                        </Link>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{comment.user.username}</span>
                        <RankBadge
                          rankTier={comment.user.rankTier}
                          xpPoints={comment.user.xpPoints}
                          size="sm"
                        />
                        {comment.user.state && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700/80 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-600">
                            📍 {comment.user.state}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{timeAgo(comment.createdAt)}</span>
                        {currentUser && (currentUser.id === comment.user.id || currentUser.role === "Admin") && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-slate-400 hover:text-red-500 text-xs transition-colors p-1 cursor-pointer"
                            title="Delete comment"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  {/* Actions Bar (Like & Reply) */}
                  <div className="flex items-center gap-4 mt-2 px-2 text-xs">
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                        comment.isLiked
                          ? "text-rose-500 font-semibold"
                          : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                      }`}
                    >
                      {likingIds[comment.id] ? (
                        <svg className="w-3.5 h-3.5 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        <svg
                          className={`w-4 h-4 transition-transform active:scale-125 ${comment.isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      <span>{comment.likesCount > 0 ? comment.likesCount : "Like"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalOpen(true);
                          return;
                        }
                        setActiveReplyId(activeReplyId === comment.id ? null : comment.id);
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      <span>Reply</span>
                    </button>
                  </div>

                  {/* Reply Input Box */}
                  {activeReplyId === comment.id && (
                    <div className="mt-3 pl-4 border-l-2 border-emerald-500">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          placeholder={`Reply to @${comment.user.username}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePostReply(comment.id);
                            }
                          }}
                          className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                        <button
                          onClick={() => handlePostReply(comment.id)}
                          disabled={submittingReply || !replyText.trim()}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 cursor-pointer"
                        >
                          {submittingReply ? "..." : "Send"}
                        </button>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-emerald-200 dark:border-emerald-900/60 space-y-3.5">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2.5">
                          <Link href={`/profile/${reply.user.username}`} className="flex-shrink-0">
                            <img
                              src={
                                reply.user.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${reply.user.username}`
                              }
                              alt={reply.user.username}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="bg-slate-100 dark:bg-slate-800/90 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/profile/${reply.user.username}`}
                                    className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  >
                                    {reply.user.fullName || `@${reply.user.username}`}
                                  </Link>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">@{reply.user.username}</span>
                                  <RankBadge
                                    rankTier={reply.user.rankTier}
                                    xpPoints={reply.user.xpPoints}
                                    size="sm"
                                    showLevel={false}
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{timeAgo(reply.createdAt)}</span>
                                  {currentUser && (currentUser.id === reply.user.id || currentUser.role === "Admin") && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                      className="text-slate-400 hover:text-red-500 text-xs p-0.5 cursor-pointer"
                                      title="Delete reply"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                              </div>

                              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {reply.content}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 mt-1 px-2 text-[11px]">
                              <button
                                onClick={() => handleToggleLike(reply.id, true, comment.id)}
                                className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                  reply.isLiked ? "text-rose-500 font-semibold" : "text-slate-500 dark:text-slate-400 hover:text-rose-500"
                                }`}
                              >
                                {likingIds[reply.id] ? (
                                  <svg className="w-3 h-3 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                  </svg>
                                ) : (
                                  <svg
                                    className={`w-3.5 h-3.5 transition-transform active:scale-125 ${reply.isLiked ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                )}
                                <span>{reply.likesCount > 0 ? reply.likesCount : "Like"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auth modal overlay if prompted */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          fetchSession();
          fetchComments();
        }}
      />
    </div>
  );
}
