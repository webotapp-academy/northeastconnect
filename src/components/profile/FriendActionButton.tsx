"use client";

import React, { useState } from "react";

interface FriendActionButtonProps {
  targetUserId: number;
  initialStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "SELF";
  initialFriendshipId?: number | null;
  className?: string;
  onStatusChange?: (newStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "SELF") => void;
}

export default function FriendActionButton({
  targetUserId,
  initialStatus,
  initialFriendshipId,
  className = "",
  onStatusChange,
}: FriendActionButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [friendshipId, setFriendshipId] = useState(initialFriendshipId);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (status === "SELF") return null;

  async function handleSendRequest() {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send request");
      }
      setStatus("PENDING_SENT");
      if (data.friendship) setFriendshipId(data.friendship.id);
      if (onStatusChange) onStatusChange("PENDING_SENT");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!friendshipId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to accept");
      setStatus("ACCEPTED");
      if (onStatusChange) onStatusChange("ACCEPTED");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeclineOrCancel() {
    if (!friendshipId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove");
      setStatus("NONE");
      setFriendshipId(null);
      if (onStatusChange) onStatusChange("NONE");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {errorMsg && (
        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">{errorMsg}</span>
      )}

      {status === "NONE" && (
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {loading ? "Sending..." : "Add Friend"}
        </button>
      )}

      {status === "PENDING_SENT" && (
        <button
          onClick={handleDeclineOrCancel}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl border border-gray-300 transition-all disabled:opacity-50 cursor-pointer"
          title="Click to cancel request"
        >
          <svg className="w-4 h-4 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {loading ? "Canceling..." : "Request Sent (Cancel)"}
        </button>
      )}

      {status === "PENDING_RECEIVED" && (
        <div className="inline-flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? "Accepting..." : "Accept Request"}
          </button>
          <button
            onClick={handleDeclineOrCancel}
            disabled={loading}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl border border-gray-300 transition-all disabled:opacity-50 cursor-pointer"
          >
            Decline
          </button>
        </div>
      )}

      {status === "ACCEPTED" && (
        <button
          onClick={() => {
            if (confirm("Are you sure you want to remove this friend?")) {
              handleDeclineOrCancel();
            }
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-red-50 text-emerald-700 hover:text-red-600 text-sm font-medium rounded-xl border border-emerald-300 hover:border-red-300 transition-all group cursor-pointer"
          title="Click to unfriend"
        >
          <svg className="w-4 h-4 text-emerald-600 group-hover:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <svg className="w-4 h-4 text-red-500 hidden group-hover:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="group-hover:hidden">Friends ✓</span>
          <span className="hidden group-hover:inline">Unfriend</span>
        </button>
      )}
    </div>
  );
}
