"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { soundFX } from "@/lib/soundEffects";

export default function MyPostedJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any>(null);

  useEffect(() => {
    fetchSessionAndJobs();
  }, []);

  async function fetchSessionAndJobs() {
    try {
      setLoading(true);
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      if (userData.status === "success" && userData.user) {
        setCurrentUser(userData.user);

        const jobsRes = await fetch("/api/jobs/my-jobs");
        const jobsData = await jobsRes.json();
        if (jobsData.status === "success") {
          setJobs(jobsData.jobs || []);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Failed to load posted jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(jobId: number, currentStatus: string) {
    const nextStatus = currentStatus === "Open" ? "Closed" : "Open";
    try {
      soundFX.playPop();
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j))
        );
      }
    } catch {}
  }

  async function handleDeleteJob(jobId: number) {
    if (!confirm("Are you sure you want to delete this job opening? This action cannot be undone.")) {
      return;
    }

    try {
      soundFX.playPop();
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        if (selectedJobForApplicants?.id === jobId) {
          setSelectedJobForApplicants(null);
        }
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Header */}
      <div className="bg-linear-to-b from-emerald-900/15 via-emerald-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/jobs" className="hover:text-emerald-600">
                  Jobs
                </Link>
                <span>&rsaquo;</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">My Posted Jobs</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Employer Dashboard & Candidates
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track your active vacancies, view incoming candidate profiles, and manage applications.
              </p>
            </div>

            <Link
              href="/jobs/post"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto shrink-0"
            >
              ➕ Post Another Job
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl mt-6 sm:mt-8">
        {!currentUser && !loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">🔒</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
              Authentication Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Please sign in to view and manage your posted career vacancies.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
            >
              Sign in to Continue
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading your vacancies...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">💼</span>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
              No Posted Jobs Yet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              You haven't posted any job openings. Publish your first opening to receive applications.
            </p>
            <Link
              href="/jobs/post"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-block"
            >
              Post a Job Opening Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-extrabold">
                        {job.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{job.category}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          job.status === "Open"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-white hover:text-emerald-600"
                    >
                      {job.title}
                    </Link>

                    <p className="text-xs text-slate-500 mt-0.5">
                      📍 {job.location || job.district ? `${job.location || job.district}, ` : ""}{job.state || "Northeast"} • Posted on{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions & Metrics */}
                  <div className="flex items-center flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedJobForApplicants(job)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                    >
                      <span>📩</span>
                      <span>View {job.applications?.length || 0} Candidates</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job.id, job.status)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      {job.status === "Open" ? "Close Job" : "Re-open Job"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold"
                      title="Delete Job"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-400 font-mono">
                  <span>👁️ {job.viewsCount || 0} total views</span>
                  <span>•</span>
                  <span>📩 {job.applicationsCount || 0} total applicants</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Applications Drawer / Modal */}
      {selectedJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={() => setSelectedJobForApplicants(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
            >
              ✕
            </button>

            <div className="mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Candidate Applications
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedJobForApplicants.title}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedJobForApplicants.applications?.length || 0} total candidate submissions
              </p>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {!selectedJobForApplicants.applications || selectedJobForApplicants.applications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No candidate applications received yet.
                </div>
              ) : (
                selectedJobForApplicants.applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {app.fullName}
                        </h4>
                        {app.currentRole && (
                          <p className="text-slate-500 text-[11px] font-medium">{app.currentRole}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center flex-wrap gap-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      <span>📧 <a href={`mailto:${app.email}`} className="text-emerald-600 hover:underline">{app.email}</a></span>
                      <span>📞 <a href={`tel:${app.phone}`} className="text-emerald-600 hover:underline">{app.phone}</a></span>
                      {app.experience && <span>⏳ {app.experience}</span>}
                    </div>

                    {app.resumeUrl && (
                      <div>
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px]"
                        >
                          <span>📄 View Resume / Portfolio URL</span>
                          <span>&rarr;</span>
                        </a>
                      </div>
                    )}

                    {app.coverNote && (
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        <span className="font-bold block text-slate-400 text-[10px] uppercase">Cover Note:</span>
                        {app.coverNote}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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
