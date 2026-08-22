"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

export default function SingleJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState("");

  // Application form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverNote, setCoverNote] = useState("");

  // Current session
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchSession();
    }
  }, [id]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        setFullName(data.user.name || "");
        setEmail(data.user.email || "");
        if (data.user.phone) setPhone(data.user.phone);
      }
    } catch {}
  }

  async function fetchJobDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      if (data.status === "success" && data.job) {
        setJob(data.job);
      } else {
        setErrorMsg(data.message || "Job opening not found");
      }
    } catch (err: any) {
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setApplyError("Please fill out your name, email, and phone number.");
      return;
    }

    try {
      setSubmitting(true);
      setApplyError("");

      const res = await fetch(`/api/jobs/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          experience,
          currentRole,
          resumeUrl,
          portfolioUrl,
          coverNote,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        soundFX.playPop();
        setApplySuccess(true);
        // Refresh applicant count
        setJob((prev: any) =>
          prev ? { ...prev, applicationsCount: (prev.applicationsCount || 0) + 1 } : prev
        );
      } else {
        setApplyError(data.message || "Failed to submit application");
      }
    } catch (err: any) {
      setApplyError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatSalary(min: any, max: any, period: string) {
    if (!min && !max) return "Competitive / Negotiable";
    const minVal = min ? `₹${parseFloat(min).toLocaleString()}` : "";
    const maxVal = max ? `₹${parseFloat(max).toLocaleString()}` : "";
    const periodStr = period === "yearly" ? "/ year" : period === "hourly" ? "/ hour" : "/ month";

    if (minVal && maxVal) {
      return `${minVal} - ${maxVal} ${periodStr}`;
    }
    return `${minVal || maxVal} ${periodStr}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">Loading job opening details...</p>
      </div>
    );
  }

  if (errorMsg || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
          <span className="text-4xl">💼</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
            Job Opening Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            {errorMsg || "This job listing may have been closed or removed by the employer."}
          </p>
          <Link
            href="/jobs"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-block"
          >
            &larr; Back to Job Directory
          </Link>
        </div>
      </div>
    );
  }

  const skills = job.skillsRequired
    ? job.skillsRequired.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Header Banner */}
      <div className="bg-linear-to-b from-emerald-900/15 via-emerald-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 pt-6 sm:pt-10 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Link href="/jobs" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Jobs
            </Link>
            <span>&rsaquo;</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">{job.category}</span>
            <span>&rsaquo;</span>
            <span className="text-slate-400 truncate max-w-xs">{job.title}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {job.companyLogo ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shrink-0">
                    <img
                      src={job.companyLogo}
                      alt={job.company || "Company"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-black text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                    {(job.company || job.title || "J")[0].toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-extrabold">
                      {job.type}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold">
                      {job.category}
                    </span>
                    {job.status === "Open" ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                        ● Actively Hiring
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-xs font-bold">
                        Closed
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {job.title}
                  </h1>

                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1">
                    {job.company || "Hiring Employer"}
                  </p>

                  <div className="flex items-center flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      <span>
                        {job.location ? `${job.location}, ` : ""}
                        {job.district ? `${job.district}, ` : ""}
                        {job.state || "Northeast India"}
                      </span>
                    </span>
                    <span>•</span>
                    <span>👁️ {job.viewsCount || 0} views</span>
                    <span>•</span>
                    <span>📩 {job.applicationsCount || 0} applicants</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setApplyModalOpen(true);
                  }}
                  disabled={job.status !== "Open"}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>⚡</span>
                  <span>Apply for Position</span>
                </button>

                {job.contactPhone && (
                  <a
                    href={`tel:${job.contactPhone}`}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition text-center"
                  >
                    📞 Call Employer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job Description & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview & Key Highlights */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Job Overview</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <p className="text-[11px] text-slate-400 font-medium">Offered Salary</p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <p className="text-[11px] text-slate-400 font-medium">Experience Level</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {job.experienceMin !== null && job.experienceMin > 0
                      ? `${job.experienceMin}${job.experienceMax ? ` - ${job.experienceMax}` : "+"} Yrs`
                      : "Fresher / Any"}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <p className="text-[11px] text-slate-400 font-medium">Employment Type</p>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {job.type}
                  </p>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    About the Role
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {job.jobDescription}
                  </div>
                </div>

                {job.responsibilities && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Key Responsibilities
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {job.responsibilities}
                    </div>
                  </div>
                )}

                {job.qualifications && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Qualifications & Requirements
                    </h3>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {job.qualifications}
                    </div>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Skills & Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.howToApply && (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mt-4">
                    <h3 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 mb-1">
                      Direct Application Instructions:
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      {job.howToApply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Employer Card & Quick Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">
                Hiring Organization Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Company Name:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {job.company || "Direct Employer"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Location:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {job.location || job.district ? `${job.location || job.district}, ` : ""}
                    {job.state || "Northeast India"}
                  </span>
                </div>

                {job.contactEmail && (
                  <div>
                    <span className="text-slate-400 block font-medium">Official Email:</span>
                    <a
                      href={`mailto:${job.contactEmail}`}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {job.contactEmail}
                    </a>
                  </div>
                )}

                {job.contactPhone && (
                  <div>
                    <span className="text-slate-400 block font-medium">Contact Phone:</span>
                    <a
                      href={`tel:${job.contactPhone}`}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {job.contactPhone}
                    </a>
                  </div>
                )}

                {job.applicationDeadline && (
                  <div>
                    <span className="text-slate-400 block font-medium">Application Deadline:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {new Date(job.applicationDeadline).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playPop();
                    setApplyModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition text-center block shadow-xs active:scale-95"
                >
                  ⚡ Apply Now
                </button>
              </div>
            </div>

            {/* Safety & Verification Notice */}
            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-5 text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">🛡️ Safe Job Seeking Tips:</p>
              <p>• Never pay any upfront registration or interview fees to employers.</p>
              <p>• Verify company credentials and interview locations before attending.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Job Application Modal */}
      {applyModalOpen && (
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
                  Your profile and contact details have been successfully transmitted to the hiring team for <strong>{job.title}</strong>.
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
                    {job.title}
                  </h2>
                  <p className="text-xs text-slate-500">at {job.company || "Hiring Employer"}</p>
                </div>

                {applyError && (
                  <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
                    {applyError}
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Total Experience
                      </label>
                      <input
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 3 Years"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Current Role / Title
                      </label>
                      <input
                        type="text"
                        value={currentRole}
                        onChange={(e) => setCurrentRole(e.target.value)}
                        placeholder="e.g. Frontend Developer"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resume Link (Google Drive / LinkedIn / Portfolio URL)
                    </label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
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
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Briefly describe why you are a great fit for this position..."
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
                      disabled={submitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      {submitting ? "Submitting Application..." : "Submit Application 🚀"}
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
