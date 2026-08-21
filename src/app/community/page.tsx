"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import RankBadge from "@/components/profile/RankBadge";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

const NE_STATES = [
  "All States",
  "Assam",
  "Meghalaya",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim",
];

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
  const [activeTab, setActiveTab] = useState<"users" | "directory" | "marketplace" | "addas" | "posts">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
  }, []);

  useEffect(() => {
    setPage(1);
    fetchData(1, false);
  }, [activeTab, selectedState, selectedCategory]);

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
        state: selectedState,
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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    soundFX.playPop();
    setPage(1);
    fetchData(1, false);
  }

  function handleTabSwitch(tab: "users" | "directory" | "marketplace" | "addas" | "posts") {
    soundFX.playPop();
    setActiveTab(tab);
    setSelectedCategory("All Categories");
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
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-b from-emerald-900/40 via-slate-900/80 to-transparent pt-8 pb-12 border-b border-slate-200 dark:border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              🌿 Explorer Community & Discovery Hub
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-2">
              Discover People, Businesses & Deals Across Northeast India
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Search and filter through local explorers, verified regional businesses, community marketplaces, and regional adda hubs.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "users"
                    ? "Search people by name, username, bio, city..."
                    : activeTab === "directory"
                    ? "Search businesses, hotels, tours, handicrafts..."
                    : activeTab === "marketplace"
                    ? "Search marketplace items, cars, electronics..."
                    : activeTab === "addas"
                    ? "Search regional hubs (e.g. Guwahati, Shillong)..."
                    : "Search thoughts and discussions..."
                }
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
              />
            </div>

            {/* State Selector */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
            >
              {NE_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Category Selector (if directory or marketplace) */}
            {activeTab === "directory" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {DIRECTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "marketplace" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-xs cursor-pointer"
              >
                {MARKETPLACE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

          {/* LinkedIn-Style Segmented Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar text-xs font-bold whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleTabSwitch("users")}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "users"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>👥</span>
              <span>People & Explorers</span>
              {activeTab === "users" && totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("directory")}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "directory"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>🏪</span>
              <span>Businesses & Places</span>
              {activeTab === "directory" && totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("marketplace")}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "marketplace"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>🛍️</span>
              <span>Marketplace Deals</span>
              {activeTab === "marketplace" && totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("addas")}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "addas"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>🏙️</span>
              <span>Regional Addas</span>
              {activeTab === "addas" && totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("posts")}
              className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "posts"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <span>💬</span>
              <span>Thoughts & Discussions</span>
              {activeTab === "posts" && totalCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-800 text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 max-w-6xl mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Searching {activeTab} across Northeast India...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">🔍</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-3 mb-1">
              No results found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your search terms or selecting "All States".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedState("All States");
                setSelectedCategory("All Categories");
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 1. USERS / PEOPLE GRID */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((user) => {
                  const isSent = friendRequestsSent[user.id] || user.hasSentRequest;
                  return (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                    >
                      <div>
                        {/* Top Avatar & Rank */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Link href={`/profile/${user.username}`} className="shrink-0">
                            <img
                              src={
                                user.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                              }
                              alt={user.username}
                              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 group-hover:scale-105 transition"
                            />
                          </Link>
                          <RankBadge
                            rankTier={user.rankTier}
                            xpPoints={user.xpPoints}
                            size="sm"
                            showLevel={false}
                          />
                        </div>

                        {/* Name & Handle */}
                        <Link
                          href={`/profile/${user.username}`}
                          className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:underline block truncate"
                        >
                          {user.fullName || user.username}
                        </Link>
                        <p className="text-xs text-slate-500 font-mono">@{user.username}</p>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 truncate">
                          <span>📍</span>
                          <span>{user.city ? `${user.city}, ` : ""}{user.state || "Northeast India"}</span>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic">
                            "{user.bio}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
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
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
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

            {/* 2. DIRECTORY / BUSINESSES GRID */}
            {activeTab === "directory" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {results.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      {biz.image && (
                        <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={biz.image}
                            alt={biz.businessName}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link
                          href={biz.url}
                          className="font-extrabold text-base text-slate-900 dark:text-slate-100 hover:underline line-clamp-1"
                        >
                          {biz.businessName}
                        </Link>
                        {biz.isVerified && (
                          <span className="shrink-0 text-emerald-500" title="Verified Business">
                            ✓
                          </span>
                        )}
                      </div>

                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-extrabold mb-2">
                        {biz.category}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>📍</span>
                        <span className="truncate">{biz.district ? `${biz.district}, ` : ""}{biz.state}</span>
                      </div>

                      {biz.rating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                          <span>⭐</span>
                          <span>{biz.rating}</span>
                          {biz.reviewsCount && (
                            <span className="text-slate-400 font-normal">({biz.reviewsCount} reviews)</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
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
                        View Listing &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. MARKETPLACE GRID */}
            {activeTab === "marketplace" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((item) => {
                  const img = item.images ? item.images.split(",")[0] : null;
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                    >
                      <div>
                        {img ? (
                          <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                            <img
                              src={img}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3">
                            🛍️
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                            ₹{item.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {item.condition || "Used"}
                          </span>
                        </div>

                        <Link
                          href={`/marketplace/${item.id}`}
                          className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:underline line-clamp-2 block"
                        >
                          {item.title}
                        </Link>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          📍 {item.locality ? `${item.locality}, ` : ""}{item.state}
                        </p>
                      </div>

                      <Link
                        href={`/marketplace/${item.id}`}
                        className="mt-3 w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-bold text-center block transition"
                      >
                        View Deal &rarr;
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. REGIONAL ADDAS GRID */}
            {activeTab === "addas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {results.map((adda) => (
                  <div
                    key={adda.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl">
                          {adda.icon || "🏙️"}
                        </span>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                            {adda.title || adda.name}
                          </h3>
                          <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {adda.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                        {adda.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                        <span>📍 {adda.state}</span>
                      </div>
                    </div>

                    <Link
                      href={`/?adda=${encodeURIComponent(adda.name)}`}
                      className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold text-center block transition shadow-xs"
                    >
                      Enter Adda Wall &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* 5. POSTS / DISCUSSIONS */}
            {activeTab === "posts" && (
              <div className="space-y-4 max-w-3xl mx-auto">
                {results.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Link href={`/profile/${post.user.username}`}>
                          <img
                            src={
                              post.user.profileImageUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`
                            }
                            alt={post.user.username}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${post.user.username}`}
                            className="font-bold text-xs text-slate-900 dark:text-slate-100 hover:underline block truncate"
                          >
                            u/{post.user.username}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-mono">
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

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed mb-3 line-clamp-3">
                      {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">
                        ❤️ {post.likesCount || 0} • 💬 {post.commentsCount || 0}
                      </span>
                      <Link
                        href={`/community/${post.id}`}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        View Full Thread &rarr;
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => fetchData(page + 1, true)}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-slate-100 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
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
