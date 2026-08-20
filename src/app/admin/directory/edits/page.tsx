"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDirectoryEditsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Rejection modal
  const [rejectModalReq, setRejectModalReq] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadRequests(status = statusFilter) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/directory-edits?status=${status}`);
      const data = await res.json();
      if (data.status === "success") {
        setRequests(data.requests || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests(statusFilter);
  }, [statusFilter]);

  async function handleApprove(reqId: number) {
    if (!confirm("Are you sure you want to approve these proposed edits and update the live listing?")) return;
    try {
      setActionLoadingId(reqId);
      const res = await fetch(`/api/admin/directory-edits/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert(data.message);
        loadRequests(statusFilter);
      } else {
        alert(data.message || "Failed to approve edits");
      }
    } catch {
      alert("Error processing approval");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject() {
    if (!rejectModalReq) return;
    try {
      setActionLoadingId(rejectModalReq.id);
      const res = await fetch(`/api/admin/directory-edits/${rejectModalReq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", adminNotes: rejectReason }),
      });
      const data = await res.json();
      if (data.status === "success") {
        alert("Edit request marked as Rejected.");
        setRejectModalReq(null);
        setRejectReason("");
        loadRequests(statusFilter);
      } else {
        alert(data.message || "Failed to reject edit request");
      }
    } catch {
      alert("Error processing rejection");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/directory"
              className="text-xs font-semibold text-slate-400 hover:text-white"
            >
              &larr; Directory
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-emerald-400">Listing Edit Proposals</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Directory Edit Requests</h1>
          <p className="text-xs text-slate-400">
            Review and approve user-submitted modifications to verified business listings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/directory/claims"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            🏢 Business Ownership Claims
          </Link>
          <Link
            href="/admin/directory"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            📇 All Listings
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto scrollbar-none">
        {(["Pending", "Approved", "Rejected", "all"] as const).map((st) => {
          const count =
            st === "Pending"
              ? counts.pending
              : st === "Approved"
              ? counts.approved
              : st === "Rejected"
              ? counts.rejected
              : counts.total;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span className="capitalize">{st === "all" ? "All Edits" : st}</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading edit requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8">
          <span className="text-4xl block mb-2">📝</span>
          <h3 className="text-base font-bold text-white">No Edit Requests Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === "Pending"
              ? "All business edit requests have been reviewed!"
              : "No edit requests found for this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            let proposed: any = {};
            try {
              proposed = JSON.parse(req.proposedData || "{}");
            } catch {
              proposed = {};
            }

            const current = req.directory || {};

            return (
              <div
                key={req.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-5 sm:p-6 transition shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-slate-400">#{req.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          req.status === "Approved"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700"
                            : req.status === "Rejected"
                            ? "bg-rose-950/80 text-rose-400 border border-rose-700"
                            : "bg-amber-950/80 text-amber-400 border border-amber-700"
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Submitted on {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>🏢</span>
                      <span>{req.businessName}</span>
                      <Link
                        href={`/directory/${req.directoryId}`}
                        target="_blank"
                        className="text-xs text-emerald-400 hover:underline font-normal"
                      >
                        (View Live Listing ↗)
                      </Link>
                    </h3>
                  </div>

                  {/* Claimant User Pill */}
                  <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-2.5 rounded-2xl shrink-0">
                    <img
                      src={
                        req.user?.profileImageUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${req.user?.username || req.userId}`
                      }
                      alt={req.user?.username}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {req.user?.fullName || req.user?.username}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">
                          @{req.user?.username}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {req.user?.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diff Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 text-xs">
                  {/* Current Live Values */}
                  <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      🔴 Current Live Data
                    </span>
                    <div>
                      <span className="text-slate-500 block">Business Name:</span>
                      <span className="text-slate-300 font-semibold">{current.businessName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Category:</span>
                      <span className="text-slate-300">{current.category || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact & Email:</span>
                      <span className="text-slate-300">
                        {current.contactNumber || "No Phone"} • {current.email || "No Email"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span className="text-slate-300">
                        {current.city || "—"}, {current.district || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Website:</span>
                      <span className="text-slate-300">{current.website || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Working Hours:</span>
                      <span className="text-slate-300">{current.workingHours || "—"}</span>
                    </div>
                  </div>

                  {/* Proposed New Values */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block mb-2">
                      🟢 Proposed Updates
                    </span>
                    <div>
                      <span className="text-slate-500 block">Business Name:</span>
                      <span className="text-emerald-300 font-bold">{proposed.businessName || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Category:</span>
                      <span className="text-emerald-300">{proposed.category || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact & Email:</span>
                      <span className="text-emerald-300 font-semibold">
                        {proposed.contactNumber || "No Phone"} • {proposed.email || "No Email"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location:</span>
                      <span className="text-emerald-300">
                        {proposed.city || "—"}, {proposed.district || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Website:</span>
                      <span className="text-emerald-300">{proposed.website || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Working Hours:</span>
                      <span className="text-emerald-300">{proposed.workingHours || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Description comparison if provided */}
                {proposed.description && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs mb-4">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Proposed Description:</span>
                    <p className="text-slate-200 whitespace-pre-line">{proposed.description}</p>
                  </div>
                )}

                {/* Admin notes if reviewed */}
                {req.adminNotes && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 mb-4">
                    <span className="font-bold text-slate-400">Admin Remarks:</span> {req.adminNotes}
                  </div>
                )}

                {/* Action Buttons */}
                {req.status === "Pending" && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === req.id}
                      onClick={() => {
                        setRejectModalReq(req);
                        setRejectReason("");
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      ✕ Reject Request
                    </button>

                    <button
                      type="button"
                      disabled={actionLoadingId === req.id}
                      onClick={() => handleApprove(req.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {actionLoadingId === req.id ? "Processing..." : "✓ Approve & Apply Changes"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Decline Edit Proposal for &ldquo;{rejectModalReq.businessName}&rdquo;
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Please enter the reason for rejecting these modifications. This note will be sent to the business owner.
            </p>

            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Phone number could not be verified, invalid address details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === rejectModalReq.id || !rejectReason.trim()}
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
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
