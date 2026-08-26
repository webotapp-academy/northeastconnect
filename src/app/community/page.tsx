"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";
import { getJobSlugUrl } from "@/lib/slugs";
import { renderRichPostContent } from "@/lib/postFormatting";

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

const PROPERTY_CATEGORIES = [
  "All Categories",
  "Plots & Land",
  "Apartments & Flats",
  "Houses & Villas",
  "Commercial Shops & Offices",
  "PG & Hostels",
  "Farm Houses",
];

const PROPERTY_LISTING_TYPES = [
  "All Listings",
  "For Sale",
  "For Rent",
  "Commercial Lease",
  "PG",
];

export default function CommunityDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"users" | "posts" | "addas" | "directory" | "marketplace" | "jobs" | "properties">("users");
  const [userSortTab, setUserSortTab] = useState<"recent" | "active">("recent");
  const [businessSortTab, setBusinessSortTab] = useState<"views" | "rating" | "recent" | "claimed">("views");
  const [jobSortTab, setJobSortTab] = useState<"views" | "recent" | "salary">("views");
  const [propertySortTab, setPropertySortTab] = useState<"views" | "recent" | "price_asc" | "price_desc">("views");
  const [selectedJobType, setSelectedJobType] = useState("All Types");
  const [selectedPropertyListing, setSelectedPropertyListing] = useState("All Listings");
  const [selectedState, setSelectedState] = useState("All States");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Quick Apply Modal States (for Jobs)
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

  // Quick Inquire Modal States (for Properties)
  const [propertyInquireModalOpen, setPropertyInquireModalOpen] = useState(false);
  const [selectedPropForInquire, setSelectedPropForInquire] = useState<any>(null);
  const [propInquiryName, setPropInquiryName] = useState("");
  const [propInquiryEmail, setPropInquiryEmail] = useState("");
  const [propInquiryPhone, setPropInquiryPhone] = useState("");
  const [propInquiryMessage, setPropInquiryMessage] = useState("");
  const [propInquiryType, setPropInquiryType] = useState("Site Visit");
  const [propInquirySubmitting, setPropInquirySubmitting] = useState(false);
  const [propInquirySuccess, setPropInquirySuccess] = useState(false);
  const [propInquiryError, setPropInquiryError] = useState("");

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
  }, [activeTab, selectedCategory, userSortTab, businessSortTab, jobSortTab, propertySortTab, selectedJobType, selectedPropertyListing, selectedState]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        setApplicantName(data.user.name || "");
        setApplicantEmail(data.user.email || "");
        setPropInquiryName(data.user.name || "");
        setPropInquiryEmail(data.user.email || "");
        if (data.user.phone) {
          setApplicantPhone(data.user.phone);
          setPropInquiryPhone(data.user.phone);
        }
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
        propertySort: propertySortTab,
        jobType: selectedJobType,
        listingType: selectedPropertyListing,
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

  function handleTabSwitch(tab: "users" | "posts" | "addas" | "directory" | "marketplace" | "jobs" | "properties") {
    setActiveTab(tab);
    setSelectedCategory("All Categories");
    setPage(1);
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

  async function handlePropertyInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPropForInquire) return;
    if (!propInquiryName.trim() || !propInquiryEmail.trim() || !propInquiryPhone.trim()) {
      setPropInquiryError("Name, email, and phone number are required.");
      return;
    }

    try {
      setPropInquirySubmitting(true);
      setPropInquiryError("");

      const res = await fetch(`/api/properties/${selectedPropForInquire.id}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: propInquiryName,
          email: propInquiryEmail,
          phone: propInquiryPhone,
          message: propInquiryMessage,
          inquiryType: propInquiryType,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setPropInquirySuccess(true);
        setResults((prev) =>
          prev.map((p) =>
            p.id === selectedPropForInquire.id
              ? { ...p, inquiriesCount: (p.inquiriesCount || 0) + 1 }
              : p
          )
        );
      } else {
        setPropInquiryError(data.message || "Failed to submit inquiry");
      }
    } catch {
      setPropInquiryError("An unexpected error occurred. Please try again.");
    } finally {
      setPropInquirySubmitting(false);
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

  function formatPropertyPrice(val: any, unit: string, listing: string) {
    const num = parseFloat(val) || 0;
    let formatted = "";
    if (num >= 10000000) {
      formatted = `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      formatted = `₹${(num / 100000).toFixed(2)} Lac`;
    } else {
      formatted = `₹${num.toLocaleString()}`;
    }

    if (listing === "For Rent" || listing === "Commercial Lease" || listing === "PG") {
      return `${formatted} / mo`;
    }
    if (unit === "per_sqft") {
      return `${formatted} / sq.ft`;
    }
    return formatted;
  }

  function parsePropertyImages(imgData: any): string[] {
    if (!imgData) return [];
    if (Array.isArray(imgData)) return imgData;
    if (typeof imgData === "string") {
      if (imgData.startsWith("[")) {
        try {
          return JSON.parse(imgData);
        } catch {
          return [imgData];
        }
      }
      return imgData.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
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
              Filter local explorers, community thoughts, regional adda hubs, verified businesses, jobs, properties, and marketplace ads.
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
                      : activeTab === "properties"
                      ? "Search plots, villas, flats, commercial space..."
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

            {/* 7. Properties Tab */}
            <button
              type="button"
              onClick={() => handleTabSwitch("properties")}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === "properties"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs"
              }`}
            >
              <span>🏡</span>
              <span>Properties</span>
              {activeTab === "properties" && totalCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-800/90 text-white text-[10px] rounded-full">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

          {/* Straight Line Dropdown Filter Bar */}
          {(activeTab === "directory" || activeTab === "marketplace" || activeTab === "users" || activeTab === "jobs" || activeTab === "properties") && (
            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 animate-in fade-in duration-150">
              {/* State Dropdown (For Directory, Marketplace, Jobs & Properties) */}
              {(activeTab === "directory" || activeTab === "marketplace" || activeTab === "jobs" || activeTab === "properties") && (
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

              {/* Category Dropdown (For Properties) */}
              {activeTab === "properties" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {PROPERTY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {cat === "All Categories" ? "🏷️ All Property Types" : `🏷️ ${cat}`}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                    ▼
                  </span>
                </div>
              )}

              {/* Listing Type Dropdown (For Properties: Buy / Rent / Lease) */}
              {activeTab === "properties" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[130px]">
                  <select
                    value={selectedPropertyListing}
                    onChange={(e) => setSelectedPropertyListing(e.target.value)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    {PROPERTY_LISTING_TYPES.map((lt) => (
                      <option key={lt} value={lt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {lt === "All Listings" ? "🔑 All Listings" : `🔑 ${lt}`}
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

              {/* Sort Order Dropdown (For Properties) */}
              {activeTab === "properties" && (
                <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
                  <select
                    value={propertySortTab}
                    onChange={(e) => setPropertySortTab(e.target.value as any)}
                    className="w-full appearance-none pl-3 pr-7 py-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
                  >
                    <option value="views" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔥 Sort: Most Viewed</option>
                    <option value="recent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏱️ Sort: Newest Added</option>
                    <option value="price_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">💰 Price: Low to High</option>
                    <option value="price_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">💎 Price: High to Low</option>
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

              {/* Post Property Shortcut for Properties Tab */}
              {activeTab === "properties" && (
                <Link
                  href="/properties/post"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1 active:scale-95"
                >
                  <span>➕</span>
                  <span>Post Property</span>
                </Link>
              )}

              {/* Reset Filters CTA if any filter is active */}
              {(selectedState !== "All States" || selectedCategory !== "All Categories" || (activeTab === "directory" && businessSortTab !== "views") || (activeTab === "jobs" && (jobSortTab !== "views" || selectedJobType !== "All Types")) || (activeTab === "properties" && (propertySortTab !== "views" || selectedPropertyListing !== "All Listings")) || (activeTab === "users" && userSortTab !== "recent") || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedState("All States");
                    setSelectedCategory("All Categories");
                    setSelectedJobType("All Types");
                    setSelectedPropertyListing("All Listings");
                    setBusinessSortTab("views");
                    setJobSortTab("views");
                    setPropertySortTab("views");
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
                setSelectedPropertyListing("All Listings");
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 1. USERS / PEOPLE GRID (Modern Profile Cards) */}
            {activeTab === "users" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {results.map((user) => {
                  const isSent = friendRequestsSent[user.id] || user.hasSentRequest;
                  const displayName = user.fullName || user.username;

                  return (
                    <div
                      key={user.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                    >
                      {/* Decorative subtle background header glow */}
                      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Centered Avatar with Ring */}
                        <Link href={`/profile/${user.username}`} className="relative mb-3 group/avatar">
                          <img
                            src={
                              user.profileImageUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                            }
                            alt={user.username}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md group-hover/avatar:scale-105 transition-transform"
                          />
                          {user.isVerified && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 text-[10px] shadow-xs" title="Verified Member">
                              ✓
                            </span>
                          )}
                        </Link>

                        {/* Name & Username */}
                        <Link
                          href={`/profile/${user.username}`}
                          className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate max-w-full block"
                          title={displayName}
                        >
                          {displayName}
                        </Link>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate max-w-full">
                          @{user.username}
                        </p>

                        {/* Rank Badge & XP */}
                        <div className="my-2.5 flex items-center justify-center">
                          <RankBadge
                            rankTier={user.rankTier}
                            xpPoints={user.xpPoints}
                            size="sm"
                            showLevel={false}
                          />
                        </div>

                        {/* Location */}
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-full">
                          <span className="text-[11px]">📍</span>
                          <span className="truncate">{user.city ? `${user.city}, ` : ""}{user.state || "Northeast India"}</span>
                        </div>

                        {/* Bio snippet if available */}
                        {user.bio && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic mt-2 text-center px-1">
                            "{user.bio}"
                          </p>
                        )}
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 relative z-10">
                        {user.isMe ? (
                          <Link
                            href="/profile/edit"
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl text-center transition"
                          >
                            Edit Profile
                          </Link>
                        ) : user.isFriend ? (
                          <Link
                            href={`/profile/${user.username}`}
                            className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl text-center transition"
                          >
                            Connected ✓
                          </Link>
                        ) : isSent ? (
                          <button
                            type="button"
                            disabled
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800/60 text-slate-400 text-xs font-bold rounded-xl text-center"
                          >
                            Requested
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendFriendRequest(user.id)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            + Connect
                          </button>
                        )}

                        <Link
                          href={`/profile/${user.username}`}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl text-center transition"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. POSTS / THOUGHTS GRID */}
            {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {results.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Link href={`/profile/${post.user?.username}`} className="shrink-0">
                          <img
                            src={
                              post.user?.profileImageUrl ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user?.username || "user"}`
                            }
                            alt={post.user?.username}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/profile/${post.user?.username}`}
                            className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:underline block truncate"
                          >
                            {post.user?.fullName || post.user?.username}
                          </Link>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                            @{post.user?.username} • {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed mb-3 whitespace-pre-wrap">
                        {renderRichPostContent(post.content)}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>❤️ {post.likesCount || 0}</span>
                        <span>💬 {post.commentsCount || 0}</span>
                      </div>
                      <Link
                        href={`/community?post=${post.id}`}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-xs"
                      >
                        Read Discussion &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. ADDAS / HUBS GRID */}
            {activeTab === "addas" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                {results.map((adda) => (
                  <div
                    key={adda.slug}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-3xl">{adda.emoji || "🏛️"}</span>
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            {adda.name} Adda
                          </h3>
                          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold">
                            {adda.state}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {adda.tagline || adda.description || "Join fellow regional explorers in this hub."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">
                        {adda.totalMembers ? `${adda.totalMembers.toLocaleString()} members` : "Active Hub"}
                      </span>
                      <Link
                        href={`/addas/${adda.slug}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Enter Adda &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. BUSINESSES / DIRECTORY GRID */}
            {activeTab === "directory" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {results.map((biz) => {
                  const images = biz.imageUrls ? biz.imageUrls.split(",").filter(Boolean) : [];
                  const firstImg = images[0];

                  return (
                    <div
                      key={biz.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                          {firstImg ? (
                            <img
                              src={firstImg}
                              alt={biz.businessName}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🏢
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-md font-bold">
                            {biz.category || "Business"}
                          </span>
                        </div>

                        <div className="p-3.5 sm:p-4">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate flex-1">
                              {biz.businessName}
                            </h3>
                            {biz.claimed && (
                              <span className="text-emerald-500 text-xs shrink-0" title="Verified Business">
                                ✓
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mb-1">
                            📍 {biz.district ? `${biz.district}, ` : ""}{biz.state}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                            <span>⭐ {biz.rating ? Number(biz.rating).toFixed(1) : "4.5"}</span>
                            <span className="text-[10px] text-slate-400">({biz.reviewCount || 0} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 sm:p-4 pt-0">
                        <Link
                          href={biz.url || `/listing/${biz.id}`}
                          className="block w-full py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-center rounded-xl text-xs font-bold transition"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. MARKETPLACE GRID */}
            {activeTab === "marketplace" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {results.map((ad) => {
                  const images = ad.imageUrls ? ad.imageUrls.split(",").filter(Boolean) : [];
                  const firstImg = images[0];

                  return (
                    <div
                      key={ad.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                          {firstImg ? (
                            <img
                              src={firstImg}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🛍️
                            </div>
                          )}
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-md font-bold">
                            {ad.category || "Item"}
                          </span>
                        </div>

                        <div className="p-3.5 sm:p-4">
                          <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 block mb-1">
                            ₹{ad.price ? Number(ad.price).toLocaleString() : "Contact"}
                          </span>
                          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                            {ad.title}
                          </h3>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                            📍 {ad.city ? `${ad.city}, ` : ""}{ad.state}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 sm:p-4 pt-0">
                        <Link
                          href={`/marketplace/${ad.id}`}
                          className="block w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-center rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          View Ad &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. JOBS GRID */}
            {activeTab === "jobs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {results.map((job) => {
                  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
                  return (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                    >
                      <div>
                        {/* Header: Title, Company & Job Type */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 rounded-md text-[10px] font-bold mb-1.5">
                              {job.type || "Full-time"}
                            </span>
                            <Link
                              href={getJobSlugUrl(job)}
                              className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-1 block"
                            >
                              {job.title}
                            </Link>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                              🏢 {job.company || "Direct Employer"}
                            </p>
                          </div>
                        </div>

                        {/* Location & Sector */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2.5">
                          <span className="truncate">📍 {job.location || job.state || "Northeast India"}</span>
                          <span>•</span>
                          <span className="truncate">{job.category}</span>
                        </div>

                        {/* Salary & Experience */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Compensation</span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{salary}</span>
                          </div>
                          {job.experienceMin !== null && job.experienceMin !== undefined && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-medium">Experience</span>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {job.experienceMin}+ Yrs
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Snippet */}
                        {job.jobDescription && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {job.jobDescription}
                          </p>
                        )}
                      </div>

                      {/* Footer: Views/Applications & Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
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
                            href={getJobSlugUrl(job)}
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

            {/* 7. PROPERTIES GRID */}
            {activeTab === "properties" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {results.map((prop) => {
                  const images = parsePropertyImages(prop.imageUrls);
                  const firstImg = images[0];
                  const priceFormatted = formatPropertyPrice(prop.price, prop.priceUnit, prop.listingType);

                  return (
                    <div
                      key={prop.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Property Image & Badges */}
                        <Link href={`/properties/${prop.id}`} className="block relative aspect-video sm:aspect-16/10 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          {firstImg ? (
                            <img
                              src={firstImg}
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-3xl text-slate-400">
                              <span>🏡</span>
                              <span className="text-[10px] font-bold text-slate-400 mt-1">No Photo</span>
                            </div>
                          )}

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                              prop.listingType === "For Sale"
                                ? "bg-emerald-600 text-white"
                                : prop.listingType === "For Rent"
                                ? "bg-blue-600 text-white"
                                : "bg-purple-600 text-white"
                            }`}>
                              {prop.listingType}
                            </span>
                            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-full text-[10px] font-bold">
                              {prop.propertyType}
                            </span>
                          </div>

                          {/* Owner Tag */}
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <span>👤</span>
                            <span>{prop.postedBy || "Owner"}</span>
                          </div>
                        </Link>

                        {/* Content Info */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                              {priceFormatted}
                            </span>
                            {prop.priceNegotiable && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                Negotiable
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/properties/${prop.id}`}
                            className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-2 block leading-snug"
                          >
                            {prop.title}
                          </Link>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                            📍 {prop.locality ? `${prop.locality}, ` : ""}{prop.city}, {prop.state}
                          </p>

                          {/* Key Specs Pills */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                            {prop.bedrooms && (
                              <span className="flex items-center gap-1 font-bold">
                                <span>🛏️</span>
                                <span>{prop.bedrooms} BHK</span>
                              </span>
                            )}
                            {prop.bathrooms && (
                              <span className="flex items-center gap-1 font-bold">
                                <span>🚿</span>
                                <span>{prop.bathrooms} Bath</span>
                              </span>
                            )}
                            {prop.areaSqFt && (
                              <span className="flex items-center gap-1 font-bold">
                                <span>📐</span>
                                <span>{parseFloat(prop.areaSqFt).toLocaleString()} sq.ft</span>
                              </span>
                            )}
                            {prop.furnishing && prop.furnishing !== "Unfurnished" && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium truncate ml-auto">
                                {prop.furnishing}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          👁️ {prop.viewsCount || 0} views
                        </span>

                        <div className="flex items-center gap-1.5">
                          {prop.contactWhatsApp && (
                            <a
                              href={`https://wa.me/${prop.contactWhatsApp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20your%20property%20listing:%20${encodeURIComponent(prop.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 rounded-xl transition"
                              title="Chat on WhatsApp"
                            >
                              💬
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPropForInquire(prop);
                              setPropertyInquireModalOpen(true);
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            ⚡ Inquire
                          </button>
                          <Link
                            href={`/properties/${prop.id}`}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
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

      {/* Quick Apply Modal (For Jobs) */}
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

      {/* Quick Inquire Modal (For Properties) */}
      {propertyInquireModalOpen && selectedPropForInquire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setPropertyInquireModalOpen(false);
                setPropInquirySuccess(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
            >
              ✕
            </button>

            {propInquirySuccess ? (
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  Inquiry Delivered!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Your message has been sent to the owner of <strong>{selectedPropForInquire.title}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPropertyInquireModalOpen(false);
                    setPropInquirySuccess(false);
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
                    Property Inquiry / Site Visit
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                    {selectedPropForInquire.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {formatPropertyPrice(selectedPropForInquire.price, selectedPropForInquire.priceUnit, selectedPropForInquire.listingType)} • {selectedPropForInquire.city}, {selectedPropForInquire.state}
                  </p>
                </div>

                {propInquiryError && (
                  <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
                    {propInquiryError}
                  </div>
                )}

                <form onSubmit={handlePropertyInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inquiry Type
                    </label>
                    <select
                      value={propInquiryType}
                      onChange={(e) => setPropInquiryType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Site Visit">🗓️ Request Site Visit</option>
                      <option value="Price Negotiation">💰 Price Negotiation / Best Offer</option>
                      <option value="Rental Booking">🔑 Rental / Booking Inquiry</option>
                      <option value="General Inquiry">ℹ️ General Property Information</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={propInquiryName}
                      onChange={(e) => setPropInquiryName(e.target.value)}
                      placeholder="e.g. Partha Pratim Sharma"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
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
                        value={propInquiryEmail}
                        onChange={(e) => setPropInquiryEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={propInquiryPhone}
                        onChange={(e) => setPropInquiryPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Message / Preferred Visiting Time
                    </label>
                    <textarea
                      rows={2}
                      value={propInquiryMessage}
                      onChange={(e) => setPropInquiryMessage(e.target.value)}
                      placeholder="Hi, I am interested in viewing this property this weekend..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPropertyInquireModalOpen(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={propInquirySubmitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      {propInquirySubmitting ? "Sending..." : "Send Inquiry 🚀"}
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
