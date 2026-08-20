"use client";

import React, { useState, useEffect } from "react";
import ClaimBusinessModal from "./ClaimBusinessModal";
import EditListingModal from "./EditListingModal";

interface DirectoryClaimButtonProps {
  directoryId: number;
  businessName: string;
  isClaimed: boolean;
  ownerId: number | null;
  business?: any;
}

export default function DirectoryClaimButton({
  directoryId,
  businessName,
  isClaimed,
  ownerId,
  business,
}: DirectoryClaimButtonProps) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userClaimStatus, setUserClaimStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [claimRes, meRes] = await Promise.all([
          fetch(`/api/directory/${directoryId}/claim`).then((r) => r.json()).catch(() => null),
          fetch("/api/auth/me").then((r) => r.json()).catch(() => null),
        ]);

        if (claimRes?.status === "success" && claimRes.claim) {
          setUserClaimStatus(claimRes.claim.status);
        }
        if (meRes?.status === "success" && meRes.user) {
          setCurrentUser(meRes.user);
        }
      } catch {
        // Ignored
      }
    }
    loadData();
  }, [directoryId]);

  const role = (currentUser?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "superadmin";
  const isOwner = currentUser && ownerId && currentUser.id === ownerId;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isClaimed ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800/80 text-xs font-bold shadow-xs">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Verified & Claimed Business</span>
        </div>
      ) : userClaimStatus === "Pending" ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-2xl border border-amber-300 dark:border-amber-800/80 text-xs font-bold animate-pulse">
          <span>⏳</span>
          <span>Claim Verification In Review</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setClaimModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 text-xs font-bold transition transform hover:scale-[1.02] cursor-pointer shadow-xs"
          title="Claim and verify ownership of this business"
        >
          <span>🏢</span>
          <span>Claim This Business</span>
        </button>
      )}

      {/* Edit Listing Option if Owner or Admin */}
      {(isOwner || isAdmin) && business && (
        <button
          type="button"
          onClick={() => setEditModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/80 text-xs font-bold transition transform hover:scale-[1.02] cursor-pointer shadow-xs"
          title="Edit business details for admin review"
        >
          <span>✏️</span>
          <span>Edit Listing Details</span>
        </button>
      )}

      {/* Claim Modal */}
      <ClaimBusinessModal
        directoryId={directoryId}
        businessName={businessName}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={() => setUserClaimStatus("Pending")}
      />

      {/* Edit Modal */}
      {business && (
        <EditListingModal
          business={business}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}
