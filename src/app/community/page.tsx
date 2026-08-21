"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

const DIRECTORY_CATEGORIES = [
  "All Categories",
  "Hotels & Homestays",
  "Tour Operators & Guides",
  "Cafes & Restaurants",
  "Handicrafts & Silk",
  "Transport & Rentals",
  "Hospitals & Clinics",
  "Local Stores & Services",
];

const MARKETPLACE_CATEGORIES = [
  "All Categories",
  "Vehicles",
  "Properties",
  "Electronics",
  "Handicrafts & Traditional",
  "Services",
  "Jobs",
  "Others",
];

export default function CommunityDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"users" | "posts" | "addas" | "directory" | "marketplace">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Results & Pagination state
  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Friend requests tracking
  const [friendRequestsSent, setFriendRequestsSent] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchSession();

    // Close suggestions on outside click
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live suggestions as user types
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/community/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.status === "success" && data.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        }
      } catch {}
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchData(1, false);
  }, [activeTab, selectedCategory]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
      }
    } catch {}
  }

  async function fetchData(pageNum: number, isLoadMore = false) {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        type: activeTab,
        q: searchQuery,
        category: selectedCategory.startsWith("All") ? "All" : selectedCategory,
        page: pageNum.toString(),
        limit: "16",
      });

      const res = await fetch(`/api/community/discover?${params.toString()}`);
      const data = await res.json();

      if (data.status === "success") {
        if (isLoadMore) {
          setResults((prev) => [...prev, ...(data.data || [])]);
        } else {
          setResults(data.data || []);
        }
        setTotalCount(data.total || 0);
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to load discovery data:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // No sound needed for searching enter
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    setPage(1);
    fetchData(1, false);
  }

  function handleSelectSuggestion(s: any) {
    setSearchQuery(s.query || s.label);
    setShowSuggestions(false);
    if (s.tab && s.tab !== activeTab) {
      setActiveTab(s.tab);
    } else {
      setPage(1);
      fetchData(1, false);
    }
  }

  function handleTabSwitch(tab: "users" | "posts" | "addas" | "directory" | "marketplace") {
    soundFX.playPop();
    setActiveTab(tab);
    setSelectedCategory("All Categories");
    setShowSuggestions(false);
  }

  async function handleSendFriendRequest(targetUserId: number, targetUsername: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        soundFX.playConnect();
        setFriendRequestsSent((prev) => ({ ...prev, [targetUserId]: true }));
      } else {
        alert(data.message || "Friend request sent!");
      }
    } catch {
      alert("Failed to send friend request");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors pb-24">
      {/* Top Header & Search Area - Mobile Optimized */}
      <div className="bg-gradient-to-b from-emerald-950/60 via-slate-900/90 to-transparent pt-4 sm:pt-8 pb-5 sm:pb-8 border-b border-slate-200 dark:border-slate-800/80">
        <div className="container mx-auto px-3 sm:px-6 max-w-6xl">
          {/* Header Title (Compact on Mobile) */}
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Discover People, Thoughts & Places
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed hidden sm:block">
              Filter local explorers, community thoughts, regional adda hubs, verified businesses, and marketplace ads.
            </p>
          </div>

          {/* Unified Compact Search Form with Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative mt-3 sm:mt-4">
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl p-1 sm:p-1.5 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                <span className="pl-2.5 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === "users"
                      ? "Search explorers by name, handle, city..."
                      : activeTab === "posts"
                      ? "Search thoughts and discussions..."
                      : activeTab === "addas"
                      ? "Search regional hubs (e.g. Guwahati)..."
                      : activeTab === "directory"
                      ? "Search hotels, tours, cafes, stores..."
                      : "Search marketplace items, cars, gadgets..."
                  }
                  className="flex-1 min-w-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                      setPage(1);
                      fetchData(1, false);
                    }}
                    className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}

                <button
                  type="submit"
                  className="px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0 active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Category Filter Chips (Only for Businesses & Marketplace) */}
              {activeTab === "directory" && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
                    Category:
                  </span>
                  {DIRECTORY_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundFX.playPop();
                          setSelectedCategory(cat);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === "marketplace" && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
                    Category:
                  </span>
                  {MARKETPLACE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          soundFX.playPop();
                          setSelectedCategory(cat);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 right-0 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Search Suggestions
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 text-left transition cursor-pointer group"
                    >
                      {s.image ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-750 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={s.image}
                            alt={s.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <span className="w-10 h-10 flex items-center justify-center text-lg shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-105 transition">
                          {s.icon || "🔍"}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                          {s.label}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          {s.subLabel}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                        {s.type} &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LinkedIn-Style Segmented Navigation Tabs: People -> Thoughts -> Addas -> Businesses -> Marketplace */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-0.5 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs font-bold whitespace-nowrap">
            {/* 1. People */}
            <button
              type="button"
              onClick={() => handleTabSwitch("users")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "users"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <span>👥</span>
              <span>People</span>
              {activeTab === "users" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            {/* 2. Thoughts */}
            <button
              type="button"
              onClick={() => handleTabSwitch("posts")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "posts"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <span>💬</span>
              <span>Thoughts</span>
              {activeTab === "posts" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            {/* 3. Addas */}
            <button
              type="button"
              onClick={() => handleTabSwitch("addas")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "addas"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <span>🏙️</span>
              <span>Addas</span>
              {activeTab === "addas" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            {/* 4. Businesses */}
            <button
              type="button"
              onClick={() => handleTabSwitch("directory")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "directory"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <span>🏪</span>
              <span>Businesses</span>
              {activeTab === "directory" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            {/* 5. Marketplace */}
            <button
              type="button"
              onClick={() => handleTabSwitch("marketplace")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "marketplace"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <span>🛍️</span>
              <span>Marketplace</span>
              {activeTab === "marketplace" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Content Area */}
      <div className="container mx-auto px-3 sm:px-6 max-w-6xl mt-4 sm:mt-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Searching {activeTab} across Northeast India...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center max-w-md mx-auto shadow-sm">
            <span className="text-3xl">🔍</span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-2 mb-1">
              No results found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your search keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 1. USERS / PEOPLE GRID (Optimized Mobile Cards) */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {results.map((user) => {
                  const isSent = friendRequestsSent[user.id] || user.hasSentRequest;
                  return (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                    >
                      <div>
                        {/* Top: Avatar, Name, Rank */}
                        <div className="flex items-start gap-3 mb-2.5">
                          <Link href={`/profile/${user.username}`} className="shrink-0">
                            <img
                              src={
                                user.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                              }
                              alt={user.username}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-emerald-500 group-hover:scale-105 transition shrink-0"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <Link
                                href={`/profile/${user.username}`}
                                className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:underline truncate block"
                              >
                                {user.fullName || user.username}
                              </Link>
                              <RankBadge
                                rankTier={user.rankTier}
                                xpPoints={user.xpPoints}
                                size="sm"
                                showLevel={false}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              <span>📍</span>
                              <span className="truncate">{user.city ? `${user.city}, ` : ""}{user.state || "Northeast India"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bio on desktop/tablet */}
                        {user.bio && (
                          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic mb-2">
                            "{user.bio}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        {user.isMe ? (
                          <Link
                            href="/profile/edit"
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl text-center"
                          >
                            Edit Profile
                          </Link>
                        ) : user.isFriend ? (
                          <Link
                            href={`/profile/${user.username}`}
                            className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-xs font-bold rounded-xl text-center"
                          >
                            Connected ✓
                          </Link>
                        ) : isSent ? (
                          <button
                            disabled
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl text-center"
                          >
                            Requested ⏳
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleSendFriendRequest(user.id, user.username, e)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl text-center transition cursor-pointer active:scale-95 shadow-xs"
                          >
                            + Connect
                          </button>
                        )}

                        <Link
                          href={`/profile/${user.username}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shrink-0"
                          title="View Profile"
                        >
                          👁️
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. POSTS / DISCUSSIONS */}
            {activeTab === "posts" && (
              <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
                {results.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link href={`/profile/${post.user.username}`} className="shrink-0">
                          <img
                            src={
                              post.user.profileImageUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                            }
                            alt={post.user.username}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${post.user.username}`}
                            className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:underline block truncate"
                          >
                            u/{post.user.username}
                          </Link>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate">
                            {post.taggedLocation || "n:community"}
                          </p>
                        </div>
                      </div>
                      <RankBadge
                        rankTier={post.user.rankTier}
                        xpPoints={post.user.xpPoints}
                        size="sm"
                        showLevel={false}
                      />
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-2.5 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 font-mono text-[10px] sm:text-[11px]">
                        ❤️ {post.likesCount || 0} • 💬 {post.commentsCount || 0}
                      </span>
                      <Link
                        href={`/community/${post.id}`}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-xs"
                      >
                        View Thread &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 3. REGIONAL ADDAS (2-Column on Mobile) */}
            {activeTab === "addas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {results.map((adda) => (
                  <div
                    key={adda.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5 sm:mb-2">
                        <span className="text-2xl sm:text-3xl p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl sm:rounded-2xl shrink-0">
                          {adda.icon || "🏙️"}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 truncate">
                            {adda.title || adda.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {adda.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                        {adda.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-[11px] text-slate-400">
                        <span>📍 {adda.state}</span>
                      </div>
                    </div>

                    <Link
                      href={`/?adda=${encodeURIComponent(adda.name)}`}
                      className="mt-3 sm:mt-4 w-full py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold text-center block transition shadow-xs"
                    >
                      Enter Adda Wall &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 4. DIRECTORY / BUSINESSES (Mobile List / Desktop Grid) */}
            {activeTab === "directory" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {results.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      {/* Mobile Row with Image Left */}
                      <div className="flex sm:block gap-3 mb-2 sm:mb-3">
                        {biz.image && (
                          <div className="w-20 h-20 sm:w-full sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={biz.image}
                              alt={biz.businessName}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <Link
                              href={biz.url}
                              className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-slate-100 hover:underline line-clamp-2 sm:line-clamp-1"
                            >
                              {biz.businessName}
                            </Link>
                            {biz.isClaimed && (
                              <span className="shrink-0 text-emerald-500 text-xs" title="Verified Business">
                                ✓
                              </span>
                            )}
                          </div>

                          <span className="inline-block px-2 py-0.2 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[9px] sm:text-[10px] font-extrabold mb-1">
                            {biz.category}
                          </span>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>📍</span>
                            <span className="truncate">{biz.district ? `${biz.district}, ` : ""}{biz.state}</span>
                          </div>

                          {biz.rating && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-0.5">
                              <span>⭐</span>
                              <span>{biz.rating}</span>
                              {biz.reviewsCount && (
                                <span className="text-slate-400 font-normal">({biz.reviewsCount})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      {biz.phone && (
                        <a
                          href={`tel:${biz.phone}`}
                          className="flex-1 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold text-center border border-emerald-200 dark:border-emerald-800/60"
                        >
                          📞 Call
                        </a>
                      )}
                      <Link
                        href={biz.url}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center shadow-xs"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. MARKETPLACE (2-Column on Mobile) */}
            {activeTab === "marketplace" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {results.map((item) => {
                  const img = item.images ? item.images.split(",")[0] : null;
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                    >
                      <div>
                        {img ? (
                          <div className="w-full h-28 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-28 sm:h-36 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-2">
                            🛍️
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                            ₹{item.price.toLocaleString()}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase truncate">
                            {item.condition || "Used"}
                          </span>
                        </div>

                        <Link
                          href={`/marketplace/${item.id}`}
                          className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:underline line-clamp-2 block leading-snug"
                        >
                          {item.title}
                        </Link>

                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                          📍 {item.locality ? `${item.locality}, ` : ""}{item.state}
                        </p>
                      </div>

                      <Link
                        href={`/marketplace/${item.id}`}
                        className="mt-2.5 w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-[11px] sm:text-xs font-bold text-center block transition"
                      >
                        View Deal &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="mt-6 sm:mt-8 text-center">
                <button
                  type="button"
                  onClick={() => fetchData(page + 1, true)}
                  disabled={loadingMore}
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-slate-100 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? "Loading more..." : "Load More Results ▾"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
