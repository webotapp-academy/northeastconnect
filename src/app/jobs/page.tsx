"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";
import { getJobSlugUrl } from "@/lib/slugs";

const JOB_TYPES = [
  "All Types",
  "Full-time",
  "Part-time",
  "Remote",
  "Internship",
  "Contract",
  "Freelance",
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
  "Construction & Engineering",
  "Govt & Public Sector",
  "Handicrafts & Agriculture",
  "Others",
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

export default function JobsDirectoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedState, setSelectedState] = useState("All States");
  const [sortBy, setSortBy] = useState<"views" | "recent" | "salary">("views");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Quick Apply Modal States
  const [selectedJobForApply, setSelectedJobForApply] = useState<any>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
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

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchJobs(1, false);
  }, [selectedType, selectedCategory, selectedState, sortBy]);

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
        // Increment applications count in state
        setJobs((prev) =>
          prev.map((j) =>
            j.id === selectedJobForApply.id
              ? { ...j, applicationsCount: (j.applicationsCount || 0) + 1 }
              : j
          )
        );
      } else {
        setApplyError(data.message || "Failed to submit application");
      }
    } catch (err: any) {
      setApplyError("An unexpected error occurred. Please try again.");
    } finally {
      setApplySubmitting(false);
    }
  }

  async function fetchJobs(pageNum: number, isLoadMore = false) {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        q: searchQuery.trim(),
        type: selectedType.startsWith("All") ? "" : selectedType,
        category: selectedCategory.startsWith("All") ? "" : selectedCategory,
        state: selectedState.startsWith("All") ? "" : selectedState,
        sort: sortBy,
        page: pageNum.toString(),
        limit: "12",
      });

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (data.status === "success") {
        if (isLoadMore) {
          setJobs((prev) => [...prev, ...(data.jobs || [])]);
        } else {
          setJobs(data.jobs || []);
        }
        setTotalCount(data.total || 0);
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    soundFX.playPop();
    setPage(1);
    fetchJobs(1, false);
  }

  function formatSalary(min: any, max: any, period: string) {
    if (!min && !max) return "Competitive / Negotiable";
    const minVal = min ? `₹${parseFloat(min).toLocaleString()}` : "";
    const maxVal = max ? `₹${parseFloat(max).toLocaleString()}` : "";
    const periodStr = period === "yearly" ? "/ yr" : period === "hourly" ? "/ hr" : "/ mo";

    if (minVal && maxVal) {
      return `${minVal} - ${maxVal} ${periodStr}`;
    }
    return `${minVal || maxVal} ${periodStr}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Hero Header */}
      <div className="bg-linear-to-b from-emerald-900/15 via-emerald-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2.5">
                <span>💼</span>
                <span>Northeast India Career & Talent Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Find Local Jobs & Hire Top Talent
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Explore career openings across Assam, Meghalaya, Nagaland, and all 8 Northeast states.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/jobs/my-jobs"
                className="px-3.5 sm:px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>📋</span>
                <span>Manage Posted Jobs</span>
              </Link>

              <Link
                href="/jobs/post"
                onClick={() => soundFX.playPop()}
                className="px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
              >
                <span>➕</span>
                <span>Post a Job Opening</span>
              </Link>
            </div>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 shadow-md focus-within:ring-2 focus-within:ring-emerald-500/30 focus-within:border-emerald-500 transition">
              <span className="pl-3 text-slate-400 text-base">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills (e.g. React, Accountant, Chef, Nurse), company..."
                className="w-full bg-transparent px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    fetchJobs(1, false);
                  }}
                  className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs shrink-0 cursor-pointer active:scale-95"
              >
                Search Jobs
              </button>
            </div>
          </form>

          {/* State Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              State:
            </span>
            {NORTHEAST_STATES.map((st) => {
              const isSelected = selectedState === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedState(st);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
              Sector:
            </span>
            {JOB_CATEGORIES.map((cat) => {
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
                      : "bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl mt-6 sm:mt-8">
        {/* Sub-Filter Sort Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          {/* Job Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {JOB_TYPES.map((t) => {
              const isSelected = selectedType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setSelectedType(t);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Sort Tabs */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shrink-0">
            <button
              type="button"
              onClick={() => setSortBy("views")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                sortBy === "views"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span>🔥</span>
              <span>Most Viewed</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("recent")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                sortBy === "recent"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span>⏱️</span>
              <span>Latest</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy("salary")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                sortBy === "salary"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <span>💰</span>
              <span>Highest Salary</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono">
          <span>Showing {jobs.length} of {totalCount} career opportunities</span>
          {(selectedType !== "All Types" || selectedCategory !== "All Categories" || selectedState !== "All States" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedType("All Types");
                setSelectedCategory("All Categories");
                setSelectedState("All States");
                setSearchQuery("");
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Searching active jobs across Northeast India...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">💼</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-3 mb-1">
              No matching jobs found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Try adjusting your keyword or clearing selected state/sector filters.
            </p>
            <Link
              href="/jobs/post"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-block"
            >
              Post the First Job in this Category
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {jobs.map((job) => {
              const salaryFormatted = formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod);
              const skills = job.skillsRequired
                ? job.skillsRequired.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-md transition group"
                >
                  <div>
                    {/* Header: Company Logo / Initial & Type */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {job.companyLogo ? (
                          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0">
                            <img
                              src={job.companyLogo}
                              alt={job.company || "Company"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-extrabold text-base flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                            {(job.company || job.title || "J")[0].toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                            {job.company || "Hiring Organization"}
                          </p>
                          <Link
                            href={job.slugUrl || getJobSlugUrl(job)}
                            className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 block truncate transition"
                          >
                            {job.title}
                          </Link>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-extrabold">
                          {job.type}
                        </span>
                        {job.hasApplied && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[9px] font-extrabold shadow-xs">
                            ✓ Applied
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location & Sector */}
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1 font-medium">
                        <span>📍</span>
                        <span className="truncate">
                          {job.location || job.district ? `${job.location || job.district}, ` : ""}
                          {job.state || "Northeast"}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {job.category}
                      </span>
                    </div>

                    {/* Salary & Experience */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 mb-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Salary:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {salaryFormatted}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Experience:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {job.experienceMin !== null && job.experienceMin > 0
                            ? `${job.experienceMin}${job.experienceMax ? ` - ${job.experienceMax}` : "+"} Yrs`
                            : "Fresher / Any"}
                        </span>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    {skills.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1.5 mb-3">
                        {skills.slice(0, 3).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold">
                            +{skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats & CTA */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>👁️ {job.viewsCount || 0}</span>
                      <span>•</span>
                      <span>📩 {job.applicationsCount || 0} applied</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {job.hasApplied ? (
                        <Link
                          href={job.slugUrl || getJobSlugUrl(job)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <span>✓</span>
                          <span>Applied</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            soundFX.playPop();
                            setSelectedJobForApply(job);
                            setApplyModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <span>⚡</span>
                          <span>Apply</span>
                        </button>
                      )}

                      <Link
                        href={job.slugUrl || getJobSlugUrl(job)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                        title="View Full Job Details"
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

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => fetchJobs(page + 1, true)}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-slate-100 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? "Loading more jobs..." : "Load More Openings ▾"}
            </button>
          </div>
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
                  Your profile and contact details have been successfully transmitted to the hiring team for <strong>{selectedJobForApply.title}</strong>.
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
                        Current Role / Title
                      </label>
                      <input
                        type="text"
                        value={applicantRole}
                        onChange={(e) => setApplicantRole(e.target.value)}
                        placeholder="e.g. Developer / Manager"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resume Link (Google Drive / LinkedIn / Portfolio)
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
                      Cover Note / Pitch
                    </label>
                    <textarea
                      rows={3}
                      value={applicantNote}
                      onChange={(e) => setApplicantNote(e.target.value)}
                      placeholder="Briefly describe why you are a great fit..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2">
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
                      {applySubmitting ? "Submitting Application..." : "Submit Application 🚀"}
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
