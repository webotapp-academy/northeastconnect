"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import CommentSection from "@/components/comments/CommentSection";
import AuthModal from "@/components/auth/AuthModal";

const NE_STATES = [
  "All States",
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
];

export default function CommunityFeedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "friends">("all");
  const [selectedState, setSelectedState] = useState("All States");

  // Post composer
  const [newPostContent, setNewPostContent] = useState("");
  const [taggedLocation, setTaggedLocation] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Active comments accordion
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filter, selectedState]);

  async function fetchMe() {
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

  async function fetchPosts() {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.set("filter", filter);
      if (selectedState !== "All States") {
        queryParams.set("state", selectedState);
      }

      const res = await fetch(`/api/community/posts?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === "success") {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent.trim(),
          taggedLocation: taggedLocation.trim() || null,
          mediaUrls: mediaUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");

      setPosts([data.post, ...posts]);
      setNewPostContent("");
      setTaggedLocation("");
      setMediaUrl("");
      setShowMediaInput(false);
      fetchMe(); // refresh XP in sidebar
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-24 pb-16 px-4">
      {/* Top Banner */}
      <div className="container mx-auto max-w-6xl mb-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 border border-emerald-700/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg text-white">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 bg-white/20 text-emerald-100 text-xs font-semibold rounded-full border border-white/30 backdrop-blur">
              🌿 Northeast Community Hub
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Explorer Social Feed
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Connect with travelers, locals, and business owners across the Eight Sister States.
              Share travel updates, regional tips, hidden gems, and level up your Explorer Rank!
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 text-9xl opacity-15 select-none pointer-events-none">
            🏔️
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Composer Card */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition">
            <form onSubmit={handleCreatePost}>
              <div className="flex items-start gap-3.5">
                <img
                  src={
                    currentUser?.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || "guest"}`
                  }
                  alt="Avatar"
                  className="w-11 h-11 rounded-2xl object-cover border border-emerald-300 bg-emerald-50 flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    rows={3}
                    placeholder={
                      currentUser
                        ? `What's on your mind or travel itinerary, @${currentUser.username}?`
                        : "Sign in to share travel stories, recommendations, or questions (+20 XP)..."
                    }
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onClick={() => {
                      if (!currentUser) setAuthModalOpen(true);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-50/80 focus:bg-white rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-gray-900 text-sm outline-none transition resize-none placeholder:text-gray-400"
                  />

                  {/* Optional Media URL input */}
                  {showMediaInput && (
                    <div className="mt-2.5 flex gap-2 animate-in fade-in duration-150">
                      <input
                        type="url"
                        placeholder="Image URL (e.g. https://images.unsplash.com/...)"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  )}

                  {/* Composer Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition flex items-center gap-1.5 cursor-pointer ${
                          showMediaInput
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>📷</span> Photo
                      </button>

                      <input
                        type="text"
                        placeholder="📍 Tag location..."
                        value={taggedLocation}
                        onChange={(e) => setTaggedLocation(e.target.value)}
                        className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 outline-none focus:border-emerald-500 focus:bg-white max-w-[170px]"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      {currentUser && (
                        <span className="text-xs text-emerald-700 font-semibold hidden sm:inline">
                          ✨ +20 XP
                        </span>
                      )}
                      <button
                        type="submit"
                        disabled={submitting || !newPostContent.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {submitting ? "Posting..." : "Share Post"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Feed Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200/80 p-3 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  filter === "all" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                🌐 All Explorers
              </button>
              <button
                onClick={() => {
                  if (!currentUser) {
                    setAuthModalOpen(true);
                    return;
                  }
                  setFilter("friends");
                }}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  filter === "friends" ? "bg-white text-emerald-800 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                👥 Friends Only
              </button>
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-emerald-500 font-medium"
            >
              {NE_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading feed...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-3xl p-6 shadow-sm">
              <div className="text-4xl mb-2">🌿</div>
              <h3 className="font-bold text-gray-800 text-base">No posts in this feed yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Be the first to share an update, travel recommendation, or local question!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Author Info Header */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.user.username}`}>
                      <img
                        src={
                          post.user.profileImageUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                        }
                        alt={post.user.username}
                        className="w-11 h-11 rounded-2xl object-cover border border-gray-200 bg-gray-50 hover:scale-105 transition"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${post.user.username}`}
                          className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition"
                        >
                          {post.user.fullName || post.user.username}
                        </Link>
                        <RankBadge
                          rankTier={post.user.rankTier}
                          xpPoints={post.user.xpPoints}
                          size="sm"
                          showLevel={false}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-mono text-gray-400">@{post.user.username}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.taggedLocation && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                              📍 {post.taggedLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Attached Media */}
                {post.mediaUrls && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200 max-h-96">
                    <img
                      src={post.mediaUrls}
                      alt="Post Attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Post Footer (Discussion toggle) */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <button
                    onClick={() =>
                      setExpandedCommentsPostId(
                        expandedCommentsPostId === post.id ? null : post.id
                      )
                    }
                    className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer py-1"
                  >
                    <span>💬</span>
                    <span>
                      {expandedCommentsPostId === post.id
                        ? "Hide Discussion"
                        : "Join Discussion / Comments"}
                    </span>
                  </button>
                  <Link
                    href={`/profile/${post.user.username}`}
                    className="text-gray-500 hover:text-gray-800 font-medium"
                  >
                    View @{post.user.username}&apos;s Profile &rarr;
                  </Link>
                </div>

                {/* Embedded Comment Section for this post */}
                {expandedCommentsPostId === post.id && (
                  <div className="mt-4 pt-2 border-t border-gray-100">
                    <CommentSection
                      entityType="post"
                      entityId={post.id}
                      entityTitle={`Post by @${post.user.username}`}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right 1 Column: Sidebar & Leaderboard Quick View */}
        <div className="space-y-6">
          {/* User Status Card */}
          {currentUser ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3.5 mb-4">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-500"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-gray-900 truncate">
                    {currentUser.fullName || currentUser.username}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">@{currentUser.username}</p>
                </div>
              </div>

              <div className="mb-4">
                <RankBadge
                  rankTier={currentUser.rankTier}
                  xpPoints={currentUser.xpPoints}
                  size="md"
                />
              </div>

              {currentUser.rankProgress && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>XP: {currentUser.xpPoints}</span>
                    <span>Next: {currentUser.rankProgress.nextRank?.tier || "Max"}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${currentUser.rankProgress.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs font-semibold">
                <Link
                  href={`/profile/${currentUser.username}`}
                  className="text-emerald-700 hover:underline"
                >
                  My Profile Wall &rarr;
                </Link>
                <Link href="/profile/edit" className="text-gray-500 hover:text-gray-800">
                  Settings
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70 rounded-3xl p-6 shadow-sm text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="font-bold text-gray-900 text-base">Join the Community</h3>
              <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed">
                Sign in or register to share travel posts, add friends, and comment across all directory listings.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Sign In / Join (+20 XP)
              </button>
            </div>
          )}

          {/* How to Earn XP / Level Up */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3.5">
              <span>⚡</span> How to Level Up Your Rank
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-700">
              <li className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>💬 Comment on any page</span>
                <span className="font-bold text-emerald-700">+10 XP</span>
              </li>
              <li className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>📝 Post in Community Feed</span>
                <span className="font-bold text-emerald-700">+20 XP</span>
              </li>
              <li className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>🤝 Connect with a friend</span>
                <span className="font-bold text-emerald-700">+15 XP</span>
              </li>
              <li className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>❤️ Receive a like on comment</span>
                <span className="font-bold text-emerald-700">+5 XP</span>
              </li>
              <li className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span>👤 Complete your profile</span>
                <span className="font-bold text-emerald-700">+50 XP</span>
              </li>
            </ul>

            <Link
              href="/leaderboard"
              className="mt-4 block text-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition"
            >
              View Full Leaderboard &rarr;
            </Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          fetchMe();
          fetchPosts();
        }}
      />
    </div>
  );
}
