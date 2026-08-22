"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

const DIRECTORY_CATEGORIES = [
  "All Categories",
  "Hotels & Resorts",
  "Restaurants & Cafes",
  "Travel & Tour Operators",
  "Beauty & Wellness",
  "Coaching & Education",
  "Health & Rehabilitation",
  "Gym & Fitness",
];

const NORTHEAST_STATES = [
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

const MARKETPLACE_CATEGORIES = [
  "All Categories",
  "Vehicles",
  "Properties",
  "Electronics",
  "Handicrafts & Traditional",
  "Services",
  "Others",
];

const JOB_CATEGORIES = [
  "All Categories",
  "IT & Software",
  "Hospitality & Tourism",
  "Healthcare & Medical",
  "Education & Teaching",
  "Sales & Marketing",
  "Banking & Finance",
  "Logistics & Drivers",
  "Govt & Public Sector",
  "Others",
];

const JOB_TYPES = [
  "All Types",
  "Full-time",
  "Part-time",
  "Remote",
  "Internship",
  "Contract",
  "Freelance",
];

export default function CommunityDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"users" | "posts" | "addas" | "directory" | "marketplace" | "jobs">("users");
  const [userSortTab, setUserSortTab] = useState<"recent" | "active">("recent");
  const [businessSortTab, setBusinessSortTab] = useState<"views" | "rating" | "recent" | "claimed">("views");
  const [jobSortTab, setJobSortTab] = useState<"views" | "recent" | "salary">("views");
  const [selectedJobType, setSelectedJobType] = useState("All Types");
  const [selectedState, setSelectedState] = useState("All States");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Quick Apply Modal States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantExp, setApplicantExp] = useState("");
  const [applicantRole, setApplicantRole] = useState("");
  const [applicantResume, setApplicantResume] = useState("");
  const [applicantNote, setApplicantNote] = useState("");

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
  }, [activeTab, selectedCategory, userSortTab, businessSortTab, jobSortTab, selectedJobType, selectedState]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        setApplicantName(data.user.name || "");
        setApplicantEmail(data.user.email || "");
        if (data.user.phone) setApplicantPhone(data.user.phone);
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
        userSort: userSortTab,
        businessSort: businessSortTab,
        jobSort: jobSortTab,
        jobType: selectedJobType,
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

  function handleTabSwitch(tab: "users" | "posts" | "addas" | "directory" | "marketplace" | "jobs") {
    setActiveTab(tab);
    setSelectedCategory("All Categories");
    setShowSuggestions(false);
  }

  async function handleQuickApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJobForApply) return;
    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim()) {
      setApplyError("Full name, email, and phone number are required.");
      return;
    }

    try {
      setApplySubmitting(true);
      setApplyError("");

      const res = await fetch(`/api/jobs/${selectedJobForApply.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: applicantName,
          email: applicantEmail,
          phone: applicantPhone,
          experience: applicantExp,
          currentRole: applicantRole,
          resumeUrl: applicantResume,
          coverNote: applicantNote,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        soundFX.playPop();
        setApplySuccess(true);
        setResults((prev) =>
          prev.map((j) =>
            j.id === selectedJobForApply.id
              ? { ...j, applicationsCount: (j.applicationsCount || 0) + 1 }
              : j
          )
        );
      } else {
        setApplyError(data.message || "Failed to submit application");
      }
    } catch {
      setApplyError("An unexpected error occurred. Please try again.");
    } finally {
      setApplySubmitting(false);
    }
  }

  async function handleSendFriendRequest(targetUserId: number) {
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

  function formatSalary(min: any, max: any, period: string) {
    if (!min && !max) return "Competitive";
    const minVal = min ? `₹${parseFloat(min).toLocaleString()}` : "";
    const maxVal = max ? `₹${parseFloat(max).toLocaleString()}` : "";
    const periodStr = period === "yearly" ? "/ yr" : period === "hourly" ? "/ hr" : "/ mo";

    if (minVal && maxVal) {
      return `${minVal} - ${maxVal} ${periodStr}`;
    }
    return `${minVal || maxVal} ${periodStr}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors pb-24">
      {/* Top Header & Search Area */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-slate-50/80 to-white dark:from-emerald-950/40 dark:via-[#0c121e] dark:to-[#090d16] pt-4 sm:pt-8 pb-5 sm:pb-8 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="container mx-auto px-3 sm:px-6 max-w-6xl">
          {/* Header Title */}
          <div className="max-w-3xl">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Discover People, Thoughts & Places
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed hidden sm:block">
              Filter local explorers, community thoughts, regional adda hubs, verified businesses, jobs, and marketplace ads.
            </p>
          </div>

          {/* Unified Compact Search Form */}
          <div ref={searchContainerRef} className="relative mt-3 sm:mt-4">
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-1 sm:p-1.5 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
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
                      : activeTab === "jobs"
                      ? "Search job titles, skills, companies..."
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

          {/* Segmented Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-4 overflow-x-auto pb-0.5 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-xs font-bold whitespace-nowrap">
            {/* 1. People */}
            <button
              type="button"
              onClick={() => handleTabSwitch("users")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "users"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
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
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <span>💭</span>
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
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <span>🏛️</span>
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
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <span>🏢</span>
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
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
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

            {/* 6. Jobs Tab */}
            <button
              type="button"
              onClick={() => handleTabSwitch("jobs")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "jobs"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <span>💼</span>
              <span>Jobs</span>
              {activeTab === "jobs" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Straight Line Dropdown Filter Bar */}
          {(activeTab === "directory" || activeTab === "marketplace" || activeTab === "users" || activeTab === "jobs") && (
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 animate-in fade-in duration-150">
              {/* State Dropdown (For Directory, Marketplace & Jobs) */}
              {(activeTab === "directory" || activeTab === "marketplace" || activeTab === "jobs") && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[140px]">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {NORTHEAST_STATES.map((st) => (
                      <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {st === "All States" ? "📍 All States" : `📍 ${st}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Category Dropdown (For Directory) */}
              {activeTab === "directory" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {DIRECTORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === "All Categories" ? "🏷️ All Categories" : `🏷️ ${cat}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Category Dropdown (For Marketplace) */}
              {activeTab === "marketplace" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {MARKETPLACE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === "All Categories" ? "🛍️ All Categories" : `🛍️ ${cat}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Category / Sector Dropdown (For Jobs) */}
              {activeTab === "jobs" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === "All Categories" ? "💼 All Sectors" : `💼 ${cat}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Job Type Dropdown (For Jobs) */}
              {activeTab === "jobs" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[130px]">
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {t === "All Types" ? "⏱️ All Types" : `⏱️ ${t}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Sort Order Dropdown (For Directory) */}
              {activeTab === "directory" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={businessSortTab}
                    onChange={(e) => setBusinessSortTab(e.target.value as any)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    <option value="views" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔥 Sort: Most Viewed</option>
                    <option value="rating" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⭐ Sort: Top Rated</option>
                    <option value="recent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">✨ Sort: Recently Added</option>
                    <option value="claimed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">✓ Sort: Verified / Claimed</option>
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Sort Order Dropdown (For Jobs) */}
              {activeTab === "jobs" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={jobSortTab}
                    onChange={(e) => setJobSortTab(e.target.value as any)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    <option value="views" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔥 Sort: Most Viewed</option>
                    <option value="recent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏱️ Sort: Latest</option>
                    <option value="salary" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">💰 Sort: Highest Salary</option>
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Sort Order Dropdown (For Users) */}
              {activeTab === "users" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[180px]">
                  <select
                    value={userSortTab}
                    onChange={(e) => setUserSortTab(e.target.value as any)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    <option value="recent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏱️ Sort: Recently Joined</option>
                    <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⚡ Sort: Most Active (Points)</option>
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Post a Job Shortcut for Jobs Tab */}
              {activeTab === "jobs" && (
                <Link
                  href="/jobs/post"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>➕</span>
                  <span>Post Job</span>
                </Link>
              )}

              {/* Reset Filters CTA if any filter is active */}
              {(selectedState !== "All States" || selectedCategory !== "All Categories" || (activeTab === "directory" && businessSortTab !== "views") || (activeTab === "jobs" && (jobSortTab !== "views" || selectedJobType !== "All Types")) || (activeTab === "users" && userSortTab !== "recent") || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedState("All States");
                    setSelectedCategory("All Categories");
                    setSelectedJobType("All Types");
                    setBusinessSortTab("views");
                    setJobSortTab("views");
                    setUserSortTab("recent");
                    setSearchQuery("");
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition cursor-pointer shrink-0 ml-auto flex items-center gap-1"
                  title="Reset all filters"
                >
                  <span>✕</span>
                  <span>Reset</span>
                </button>
              )}
            </div>
          )}
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
              Try adjusting your search keyword or selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setSelectedState("All States");
                setSelectedJobType("All Types");
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

                        {/* Bio */}
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
                            type="button"
                            disabled
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl text-center"
                          >
                            Requested
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendFriendRequest(user.id)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
                          >
                            + Connect
                          </button>
                        )}

                        <Link
                          href={`/profile/${user.username}`}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. THOUGHTS / POSTS GRID */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {results.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <Link href={`/profile/${post.user?.username || ""}`}>
                          <img
                            src={
                              post.user?.profileImageUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user?.username || "user"}`
                            }
                            alt={post.user?.username}
                            className="w-9 h-9 rounded-xl object-cover border border-emerald-500 shrink-0"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/profile/${post.user?.username || ""}`}
                            className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:underline truncate block"
                          >
                            {post.user?.fullName || post.user?.username || "Explorer"}
                          </Link>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed mb-3">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">
                        💬 {post.commentsCount || 0} comments • ❤️ {post.likesCount || 0}
                      </span>
                      <Link
                        href={`/post/${post.id}`}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        Join Discussion &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. ADDAS GRID */}
            {activeTab === "addas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {results.map((adda) => (
                  <Link
                    key={adda.slug}
                    href={`/addas/${adda.slug}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{adda.icon || "🏛️"}</span>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition">
                          {adda.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {adda.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>📍 {adda.state}</span>
                      <span className="text-emerald-600 font-bold">Explore Hub &rarr;</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 4. BUSINESSES / DIRECTORY GRID */}
            {activeTab === "directory" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {results.map((biz) => (
                  <div
                    key={biz.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-[10px] font-extrabold">
                          {biz.category || "Business"}
                        </span>
                        {biz.viewsCount !== undefined && biz.viewsCount > 0 && (
                          <span className="text-[10px] text-amber-500 font-mono font-bold">
                            🔥 {biz.viewsCount} views
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/directory/${biz.id}`}
                        className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition line-clamp-1 block mb-1"
                      >
                        {biz.businessName}
                      </Link>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {biz.description || "Verified local organization in Northeast India."}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        📍 {biz.district || biz.city || "Northeast"}
                      </span>
                      <Link
                        href={`/directory/${biz.id}`}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition shadow-xs"
                      >
                        View Listing &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. MARKETPLACE GRID */}
            {activeTab === "marketplace" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {results.map((item) => {
                  let img = item.images;
                  if (typeof img === "string" && img.startsWith("[")) {
                    try {
                      img = JSON.parse(img)[0];
                    } catch {}
                  }

                  const itemPriceFormatted =
                    typeof item.price === "number"
                      ? item.price.toLocaleString()
                      : typeof item.price === "string" && !isNaN(parseFloat(item.price))
                      ? parseFloat(item.price).toLocaleString()
                      : item.price || 0;

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
                              alt={item.title || "Marketplace item"}
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
                            ₹{itemPriceFormatted}
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

            {/* 6. JOBS GRID */}
            {activeTab === "jobs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {results.map((job) => {
                  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
                  const skills = job.skillsRequired
                    ? job.skillsRequired.split(",").map((s: string) => s.trim()).filter(Boolean)
                    : [];

                  return (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                    >
                      <div>
                        {/* Header: Company & Title */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="min-w-0 flex-1">
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-[10px] font-extrabold mr-1.5">
                              {job.type}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {job.category}
                            </span>

                            <Link
                              href={`/jobs/${job.id}`}
                              className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition block truncate mt-1"
                            >
                              {job.title}
                            </Link>

                            <p className="text-xs text-slate-500 font-medium truncate">
                              🏢 {job.company || "Direct Employer"}
                            </p>
                          </div>
                        </div>

                        {/* Salary & Location */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs space-y-1 mb-2.5">
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-slate-400 text-[11px]">Salary:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              {salary}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Location:</span>
                            <span className="font-medium truncate max-w-[140px]">
                              📍 {job.location || job.district ? `${job.location || job.district}, ` : ""}{job.state || "Northeast"}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1 mb-3">
                            {skills.slice(0, 3).map((sk: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-semibold"
                              >
                                {sk}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom CTA */}
                      <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          👁️ {job.viewsCount || 0} • 📩 {job.applicationsCount || 0}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobForApply(job);
                              setApplyModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            ⚡ Apply
                          </button>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      </div>
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

      {/* Quick Apply Modal */}
      {applyModalOpen && selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setApplyModalOpen(false);
                setApplySuccess(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
            >
              ✕
            </button>

            {applySuccess ? (
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  Application Submitted!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Your application has been received for <strong>{selectedJobForApply.title}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setApplyModalOpen(false);
                    setApplySuccess(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Apply for Position
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedJobForApply.title}
                  </h2>
                  <p className="text-xs text-slate-500">at {selectedJobForApply.company || "Hiring Employer"}</p>
                </div>

                {applyError && (
                  <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
                    {applyError}
                  </div>
                )}

                <form onSubmit={handleQuickApplySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Partha Pratim Sharma"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Experience
                      </label>
                      <input
                        type="text"
                        value={applicantExp}
                        onChange={(e) => setApplicantExp(e.target.value)}
                        placeholder="e.g. 2 Years"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Current Role
                      </label>
                      <input
                        type="text"
                        value={applicantRole}
                        onChange={(e) => setApplicantRole(e.target.value)}
                        placeholder="e.g. Engineer / Manager"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resume / Portfolio Link
                    </label>
                    <input
                      type="url"
                      value={applicantResume}
                      onChange={(e) => setApplicantResume(e.target.value)}
                      placeholder="https://drive.google.com/... or https://linkedin.com/in/..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Cover Note
                    </label>
                    <textarea
                      rows={2}
                      value={applicantNote}
                      onChange={(e) => setApplicantNote(e.target.value)}
                      placeholder="Brief note to the employer..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setApplyModalOpen(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applySubmitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      {applySubmitting ? "Submitting..." : "Submit Application 🚀"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
