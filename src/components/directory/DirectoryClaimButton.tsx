"use client";

import React, { useState, useEffect } from "react";
import ClaimBusinessModal from "./ClaimBusinessModal";

interface DirectoryClaimButtonProps {
  directoryId: number;
  businessName: string;
  isClaimed: boolean;
  ownerId: number | null;
}

export default function DirectoryClaimButton({
  directoryId,
  businessName,
  isClaimed,
  ownerId,
}: DirectoryClaimButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [userClaimStatus, setUserClaimStatus] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserClaim() {
      try {
        const res = await fetch(`/api/directory/${directoryId}/claim`);
        const data = await res.json();
        if (data.status === "success" && data.claim) {
          setUserClaimStatus(data.claim.status); // "Pending", "Approved", "Rejected"
        }
      } catch {
        // Ignored
      }
    }
    checkUserClaim();
  }, [directoryId]);

  if (isClaimed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800/80 text-xs font-bold shadow-xs">
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>Verified & Claimed Business</span>
      </div>
    );
  }

  if (userClaimStatus === "Pending") {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 rounded-2xl border border-amber-300 dark:border-amber-800/80 text-xs font-bold animate-pulse">
        <span>⏳</span>
        <span>Claim Verification In Review by Admin</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 text-xs font-bold transition transform hover:scale-[1.02] cursor-pointer shadow-xs"
        title="Claim and verify ownership of this business"
      >
        <span>🏢</span>
        <span>Claim This Business</span>
      </button>

      <ClaimBusinessModal
        directoryId={directoryId}
        businessName={businessName}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setUserClaimStatus("Pending")}
      />
    </>
  );
}
