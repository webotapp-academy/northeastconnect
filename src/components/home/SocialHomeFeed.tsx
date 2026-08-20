"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import CommentSection from "@/components/comments/CommentSection";
import AuthModal from "@/components/auth/AuthModal";
import GoogleAd from "@/components/GoogleAd";

const NE_STATES = [
  { name: "All States", icon: "🌿", tag: "All" },
  { name: "Assam", icon: "🦏", tag: "Assam" },
  { name: "Meghalaya", icon: "🌧️", tag: "Meghalaya" },
  { name: "Arunachal Pradesh", icon: "🏔️", tag: "Arunachal" },
  { name: "Nagaland", icon: "🦅", tag: "Nagaland" },
  { name: "Manipur", icon: "🌸", tag: "Manipur" },
  { name: "Mizoram", icon: "🎋", tag: "Mizoram" },
  { name: "Tripura", icon: "🏰", tag: "Tripura" },
  { name: "Sikkim", icon: "❄️", tag: "Sikkim" },
];

interface SocialHomeFeedProps {
  initialPosts: any[];
  latestNews: any[];
  featuredDirectory: any[];
  topExplorers: any[];
  marketplaceDeals: any[];
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SocialHomeFeed({
  initialPosts = [],
  latestNews = [],
  featuredDirectory = [],
  topExplorers = [],
  marketplaceDeals = [],
}: SocialHomeFeedProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [selectedState, setSelectedState] = useState("All States");
  const [feedTab, setFeedTab] = useState<"trending" | "latest" | "friends">("trending");
  const [loading, setLoading] = useState(false);

  // Post composer state
  const [newContent, setNewContent] = useState("");
  const [taggedLocation, setTaggedLocation] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active expanded comments
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<number | null>(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

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

  async function loadPosts(state: string, tab: string) {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (tab === "friends") queryParams.set("filter", "friends");
      if (state !== "All States") queryParams.set("state", state);

      const res = await fetch(`/api/community/posts?${queryParams.toString()}`);
      const data = await res.json();
      if (data.status === "success") {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleStateChange(state: string) {
    setSelectedState(state);
    loadPosts(state, feedTab);
  }

  function handleTabChange(tab: "trending" | "latest" | "friends") {
    if (tab === "friends" && !currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setFeedTab(tab);
    loadPosts(selectedState, tab);
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;

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
          content: newContent.trim(),
          taggedLocation: taggedLocation.trim() || null,
          mediaUrls: mediaUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.status === "success" && data.post) {
        setPosts([data.post, ...posts]);
        setNewContent("");
        setTaggedLocation("");
        setMediaUrl("");
        setShowMediaInput(false);
        fetchMe();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare(post: any) {
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.user.username} on North East Connect`,
          text: post.content.slice(0, 100),
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Post link copied to clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-16 md:pt-20 pb-16">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* ========================================================================= */}
        {/* 1. TOP APP-STYLE REEL / STATE STORIES BAR                                */}
        {/* ========================================================================= */}
        <div className="mb-4 bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-3xl p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <h2 className="text-xs sm:text-sm font-extrabold text-gray-900 tracking-tight">
                Explore Northeast States
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              8 Sister States
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = selectedState === st.name;
              return (
                <button
                  key={st.name}
                  onClick={() => handleStateChange(st.name)}
                  className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 scale-102"
                      : "bg-gray-100/90 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200/60"
                  }`}
                >
                  <span className="text-sm">{st.icon}</span>
                  <span>{st.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN 3-COLUMN RESPONSIVE LAYOUT (1 Column in Mobile WebView)          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR (Desktop: User Quick Card & Exploration Shortcuts)          */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* User Quick Profile Card */}
            {currentUser ? (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-sm text-center">
                <Link href={`/profile/${currentUser.username}`}>
                  <img
                    src={
                      currentUser.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                    }
                    alt={currentUser.username}
                    className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-emerald-500 shadow-sm mb-3"
                  />
                  <h3 className="font-extrabold text-sm text-gray-900 hover:text-emerald-700 transition">
                    {currentUser.fullName || currentUser.username}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">@{currentUser.username}</p>
                </Link>
                <div className="mt-2.5 flex justify-center">
                  <RankBadge
                    rankTier={currentUser.rankTier}
                    xpPoints={currentUser.xpPoints}
                    size="sm"
                    showLevel={true}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
                  <Link
                    href={`/profile/${currentUser.username}`}
                    className="p-2 bg-gray-50 hover:bg-emerald-50 rounded-xl transition"
                  >
                    <span className="block text-xs font-bold text-gray-900">
                      {currentUser.xpPoints || 0}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">XP Points</span>
                  </Link>
                  <Link
                    href={`/profile/${currentUser.username}`}
                    className="p-2 bg-gray-50 hover:bg-emerald-50 rounded-xl transition"
                  >
                    <span className="block text-xs font-bold text-gray-900">
                      {currentUser.rankTier}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase">Rank</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-sm">
                <div className="text-2xl mb-2">🌿</div>
                <h3 className="font-extrabold text-base mb-1">Northeast India Hub</h3>
                <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                  Join regional discussions, connect with local explorers, and earn rewards.
                </p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Join Community (+20 XP)
                </button>
              </div>
            )}

            {/* Quick Community Channels */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-4 shadow-sm space-y-1">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-1">
                Explore Channels
              </div>
              <Link
                href="/directory"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">📇</span>
                <span>Verified Directory</span>
              </Link>
              <Link
                href="/news"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">📰</span>
                <span>Regional News</span>
              </Link>
              <Link
                href="/culture"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">🎭</span>
                <span>Culture &amp; Heritage</span>
              </Link>
              <Link
                href="/wildlife"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">🦏</span>
                <span>Wildlife Sanctuaries</span>
              </Link>
              <Link
                href="/adventure"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">🏔️</span>
                <span>Adventure Trails</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">🛒</span>
                <span>Marketplace Ads</span>
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
              >
                <span className="text-base">🏆</span>
                <span>Explorer Ranks</span>
              </Link>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* CENTER COLUMN (Live Social Community Feed & Composer)                   */}
          {/* ======================================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Quick Post Composer */}
            <div
              id="community-composer"
              className="bg-white border border-gray-200/90 rounded-3xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex gap-3">
                <img
                  src={
                    currentUser?.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || "explorer"}`
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-2xl object-cover border border-emerald-400 bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder={
                      currentUser
                        ? `Share a thought, travel tip, or question with the Northeast community...`
                        : `Sign in to share stories, ask recommendations, or post travel moments...`
                    }
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    onClick={() => {
                      if (!currentUser) setAuthModalOpen(true);
                    }}
                    className="w-full text-sm placeholder:text-gray-400 text-gray-900 border-0 focus:ring-0 p-0 resize-none outline-none leading-relaxed bg-transparent"
                  />

                  {showMediaInput && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                      <input
                        type="url"
                        placeholder="Image URL (e.g. https://...)"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* State Location Tag Selector */}
                      <select
                        value={taggedLocation}
                        onChange={(e) => setTaggedLocation(e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-2.5 py-1.5 outline-none font-medium cursor-pointer"
                      >
                        <option value="">📍 Tag State</option>
                        {NE_STATES.slice(1).map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.icon} {s.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowMediaInput(!showMediaInput)}
                        className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                          showMediaInput
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <span>📷</span>
                        <span className="hidden sm:inline">Photo</span>
                      </button>
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={submitting || !newContent.trim()}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    >
                      {submitting ? "Posting..." : "Share (+20 XP)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Filter Tabs */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-1.5 flex items-center justify-between gap-1 shadow-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTabChange("trending")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    feedTab === "trending"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  🔥 Trending
                </button>
                <button
                  onClick={() => handleTabChange("latest")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    feedTab === "latest"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  ⚡ Latest
                </button>
                <button
                  onClick={() => handleTabChange("friends")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    feedTab === "friends"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  👥 Friends Only
                </button>
              </div>

              <span className="text-[11px] text-gray-400 font-mono pr-2">
                {selectedState !== "All States" ? selectedState : "All NE"}
              </span>
            </div>

            {/* Live Feed Stream */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-gray-200">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 font-medium">Loading community feed...</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post, idx) => {
                  const isCommentsOpen = expandedCommentsPostId === post.id;

                  return (
                    <React.Fragment key={post.id}>
                      {/* Social Post Card */}
                      <article
                        id={`post-${post.id}`}
                        className="bg-white border border-gray-200/90 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-150 animate-in fade-in"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Link
                            href={`/profile/${post.user.username}`}
                            className="flex items-center gap-3 group"
                          >
                            <img
                              src={
                                post.user.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                              }
                              alt={post.user.username}
                              className="w-10 h-10 rounded-2xl object-cover border border-gray-200 bg-gray-50 group-hover:border-emerald-500 transition"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-emerald-700 transition">
                                  {post.user.fullName || post.user.username}
                                </h3>
                                <span className="text-xs text-gray-400 font-mono">
                                  @{post.user.username}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <RankBadge
                                  rankTier={post.user.rankTier}
                                  size="sm"
                                  showLevel={false}
                                />
                                {post.taggedLocation && (
                                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                                    📍 {post.taggedLocation}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          <span className="text-[11px] text-gray-400 font-mono whitespace-nowrap">
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                          {post.content}
                        </p>

                        {/* Attached Media */}
                        {post.mediaUrls && (
                          <div className="mb-3 rounded-2xl overflow-hidden max-h-96 border border-gray-100 bg-gray-50">
                            <img
                              src={
                                post.mediaUrls.startsWith("[")
                                  ? JSON.parse(post.mediaUrls)[0]
                                  : post.mediaUrls
                              }
                              alt="Attachment"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Interactive Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-500">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                if (!currentUser) setAuthModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 text-gray-600 hover:text-rose-600 transition cursor-pointer"
                            >
                              <span>❤️</span>
                              <span>{post.likesCount || 0}</span>
                            </button>

                            <button
                              onClick={() =>
                                setExpandedCommentsPostId(
                                  isCommentsOpen ? null : post.id
                                )
                              }
                              className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                            >
                              <span>💬</span>
                              <span>{post.commentsCount || 0} comments</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleShare(post)}
                            className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                            title="Share post"
                          >
                            <span>🔗</span>
                            <span className="hidden sm:inline">Share</span>
                          </button>
                        </div>

                        {/* Expandable Comments Section */}
                        {isCommentsOpen && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <CommentSection
                              entityType="post"
                              entityId={post.id}
                              entityTitle={`Post by @${post.user.username}`}
                            />
                          </div>
                        )}
                      </article>

                      {/* Clean Non-Intrusive In-Feed Ad after 3rd post */}
                      {idx === 2 && (
                        <GoogleAd
                          format="horizontal"
                          responsive={true}
                          className="max-w-xl mx-auto my-3"
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="text-4xl mb-2">🌿</div>
                <h3 className="font-extrabold text-base text-gray-900 mb-1">
                  Be the first to share!
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  No community posts found for {selectedState}. Start the conversation!
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) setAuthModalOpen(true);
                    else {
                      const input = document.querySelector("#community-composer textarea") as HTMLTextAreaElement;
                      if (input) input.focus();
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Write Post (+20 XP)
                </button>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT SIDEBAR (Desktop: News, Directory, Leaderboard Traffic Feeders)    */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* 1. Trending News Feeder */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span>📰</span>
                  <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                    Northeast News
                  </h3>
                </div>
                <Link
                  href="/news"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  All News &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {latestNews.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="block group"
                  >
                    <h4 className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      {timeAgo(item.publishedDate || item.createdAt)} • {item.category || "News"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. Top Verified Businesses */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span>📇</span>
                  <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                    Top Verified Spots
                  </h3>
                </div>
                <Link
                  href="/directory"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Directory &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {featuredDirectory.slice(0, 3).map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/listing/${biz.id}`}
                    className="flex items-center gap-3 group p-2 hover:bg-gray-50 rounded-2xl transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {biz.businessName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 truncate">
                        {biz.businessName}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {biz.district || "Assam"} • {biz.category || "Local"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Community Leaderboard Preview */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span>🏆</span>
                  <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                    Top Explorers
                  </h3>
                </div>
                <Link
                  href="/leaderboard"
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  Ranks &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {topExplorers.slice(0, 3).map((user, i) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center justify-between gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-xs text-gray-400 w-4">#{i + 1}</span>
                      <img
                        src={
                          user.profileImageUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                        }
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                      />
                      <span className="text-xs font-bold text-gray-800 truncate">
                        {user.fullName || user.username}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {user.xpPoints || 0} XP
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. Local Marketplace Deals */}
            {marketplaceDeals && marketplaceDeals.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <span>🛒</span>
                    <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">
                      Marketplace Deals
                    </h3>
                  </div>
                  <Link
                    href="/marketplace"
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    All Ads &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {marketplaceDeals.slice(0, 3).map((ad) => (
                    <Link
                      key={ad.id}
                      href={`/marketplace/${ad.id}`}
                      className="block group"
                    >
                      <h4 className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 truncate">
                        {ad.title}
                      </h4>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-0.5">
                        <span className="font-bold text-emerald-700">₹{ad.price?.toLocaleString("en-IN")}</span>
                        <span>{ad.state || "Northeast"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchMe()}
      />
    </div>
  );
}
