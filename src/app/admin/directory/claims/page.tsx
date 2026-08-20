"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ImageLightboxModal from "@/components/common/ImageLightboxModal";

export default function AdminBusinessClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Lightbox view for documents
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Rejection modal
  const [rejectModalClaim, setRejectModalClaim] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadClaims(status = statusFilter) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/claims?status=${status}`);
      const data = await res.json();
      if (data.status === "success") {
        setClaims(data.claims || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims(statusFilter);
  }, [statusFilter]);

  async function handleApprove(claimId: number) {
    if (!confirm("Are you sure you want to approve this claim and transfer ownership to the user?")) return;
    try {
      setActionLoadingId(claimId);
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(data.message);
        loadClaims(statusFilter);
      } else {
        alert(data.message || "Failed to approve claim");
      }
    } catch {
      alert("Error processing approval");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject() {
    if (!rejectModalClaim) return;
    try {
      setActionLoadingId(rejectModalClaim.id);
      const res = await fetch(`/api/admin/claims/${rejectModalClaim.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          adminNotes: rejectReason || "Documents could not be verified.",
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setRejectModalClaim(null);
        setRejectReason("");
        loadClaims(statusFilter);
      } else {
        alert(data.message || "Failed to reject claim");
      }
    } catch {
      alert("Error processing rejection");
    } finally {
      setActionLoadingId(null);
    }
  }

  function viewDocument(url: string) {
    if (url.endsWith(".pdf") || url.includes(".pdf")) {
      window.open(url, "_blank");
    } else {
      setLightboxImages([url]);
      setLightboxOpen(true);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/admin"
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>←</span> Admin Dashboard
              </Link>
              <span className="text-slate-600">&bull;</span>
              <Link
                href="/admin/directory"
                className="text-xs text-slate-400 hover:underline"
              >
                Directory Listings
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>🏢</span> Business Ownership Claims
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Verify registration documents, utility bills, and approve ownership transfers.
            </p>
          </div>

          <button
            onClick={() => loadClaims(statusFilter)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>↻</span> Refresh List
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: "Pending", label: "Pending Verification", count: counts.pending, color: "text-amber-400 bg-amber-950/60 border-amber-800" },
            { key: "Approved", label: "Approved & Transferred", count: counts.approved, color: "text-emerald-400 bg-emerald-950/60 border-emerald-800" },
            { key: "Rejected", label: "Rejected", count: counts.rejected, color: "text-rose-400 bg-rose-950/60 border-rose-800" },
            { key: "all", label: "All Claims", count: counts.total, color: "text-slate-300 bg-slate-800 border-slate-700" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer border ${
                statusFilter === tab.key
                  ? `${tab.color} shadow-lg`
                  : "bg-slate-800/60 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/40">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Claims Table / Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono text-sm animate-pulse">
            Loading business claim verification requests...
          </div>
        ) : claims.length === 0 ? (
          <div className="py-20 text-center bg-slate-800/40 rounded-3xl border border-slate-800">
            <span className="text-4xl">🎉</span>
            <h3 className="text-base font-bold text-slate-300 mt-2">No {statusFilter} claims found</h3>
            <p className="text-xs text-slate-500 mt-1">All claim requests are up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-xl transition hover:border-slate-600"
              >
                <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-700/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">Claim #{claim.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          claim.status === "Approved"
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-800"
                            : claim.status === "Rejected"
                            ? "bg-rose-950/80 text-rose-400 border-rose-800"
                            : "bg-amber-950/80 text-amber-400 border-amber-800 animate-pulse"
                        }`}
                      >
                        {claim.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(claim.createdAt).toLocaleDateString()} at{" "}
                        {new Date(claim.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                      <Link
                        href={`/directory/${claim.directoryId}`}
                        target="_blank"
                        className="hover:text-emerald-400 transition hover:underline"
                      >
                        {claim.businessName}
                      </Link>
                      <span className="text-xs text-slate-400 font-normal">
                        ({claim.directory?.category || "Business"} &bull; {claim.directory?.city || claim.directory?.district || "Assam"})
                      </span>
                    </h3>
                  </div>

                  {/* Actions for Pending Claims */}
                  {claim.status === "Pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(claim.id)}
                        disabled={actionLoadingId === claim.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <span>✓</span>
                        <span>Approve & Transfer</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectModalClaim(claim);
                          setRejectReason("");
                        }}
                        disabled={actionLoadingId === claim.id}
                        className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition border border-rose-700/60 cursor-pointer disabled:opacity-50"
                      >
                        <span>✕</span>
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid Details: Claimant Info + Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Claimant Account & Contact */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Claimant Information
                    </h4>
                    <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">User Account:</span>
                        <Link
                          href={`/profile/${claim.user?.username}`}
                          target="_blank"
                          className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <span>@{claim.user?.username}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({claim.user?.fullName || "Explorer"})
                          </span>
                        </Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Claimant Name:</span>
                        <span className="font-bold text-white">{claim.claimantName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Claimant Email:</span>
                        <a href={`mailto:${claim.claimantEmail}`} className="text-emerald-400 hover:underline font-mono">
                          {claim.claimantEmail}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Claimant Phone:</span>
                        <a href={`tel:${claim.claimantPhone}`} className="text-emerald-400 hover:underline font-mono">
                          {claim.claimantPhone}
                        </a>
                      </div>
                      {claim.notes && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-400 block mb-0.5">Claim Notes:</span>
                          <p className="text-slate-200 italic">&ldquo;{claim.notes}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Uploaded Proof Documents */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Verification Proof Documents
                    </h4>

                    <div className="space-y-2">
                      {/* 1. Registration Proof */}
                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">1. Business Registration Certificate</p>
                          <p className="text-[10px] text-slate-400">GST, Trade License, MSME</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => viewDocument(claim.registrationProofUrl)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition border border-emerald-500/40 cursor-pointer flex items-center gap-1"
                        >
                          <span>🔍</span> View Document
                        </button>
                      </div>

                      {/* 2. Utility Bill */}
                      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">2. Utility Bill / Tax Receipt</p>
                          <p className="text-[10px] text-slate-400">Electricity, telecom, municipal tax</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => viewDocument(claim.utilityBillUrl)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition border border-emerald-500/40 cursor-pointer flex items-center gap-1"
                        >
                          <span>🔍</span> View Document
                        </button>
                      </div>

                      {/* 3. Optional ID Proof */}
                      {claim.idProofUrl && (
                        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">3. Owner ID Proof</p>
                            <p className="text-[10px] text-slate-400">Aadhaar / PAN Card</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => viewDocument(claim.idProofUrl)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer flex items-center gap-1"
                          >
                            <span>🔍</span> View ID
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox for Image Documents */}
      <ImageLightboxModal
        images={lightboxImages}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Reject Modal */}
      {rejectModalClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white">
              Reject Claim for &ldquo;{rejectModalClaim.businessName}&rdquo;
            </h3>
            <p className="text-xs text-slate-400">
              Provide a reason for rejection. This will be sent to the user.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Document was blurry / address did not match business location..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalClaim(null)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
