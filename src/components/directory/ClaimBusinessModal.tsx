"use client";

import React, { useState } from "react";

interface ClaimBusinessModalProps {
  directoryId: number;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ClaimBusinessModal({
  directoryId,
  businessName,
  isOpen,
  onClose,
  onSuccess,
}: ClaimBusinessModalProps) {
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [registrationProofUrl, setRegistrationProofUrl] = useState("");
  const [utilityBillUrl, setUtilityBillUrl] = useState("");
  const [idProofUrl, setIdProofUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [uploadingRegDoc, setUploadingRegDoc] = useState(false);
  const [uploadingUtilityDoc, setUploadingUtilityDoc] = useState(false);
  const [uploadingIdDoc, setUploadingIdDoc] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  async function handleFileUpload(
    file: File,
    type: "registration" | "utility" | "id"
  ) {
    try {
      if (type === "registration") setUploadingRegDoc(true);
      else if (type === "utility") setUploadingUtilityDoc(true);
      else if (type === "id") setUploadingIdDoc(true);

      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch("/api/upload?folder=business_claims", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.status === "success" && data.urls && data.urls[0]) {
        const url = data.urls[0];
        if (type === "registration") setRegistrationProofUrl(url);
        else if (type === "utility") setUtilityBillUrl(url);
        else if (type === "id") setIdProofUrl(url);
      } else {
        setErrorMsg(data.message || "Failed to upload document");
      }
    } catch {
      setErrorMsg("Error uploading document to secure storage");
    } finally {
      if (type === "registration") setUploadingRegDoc(false);
      else if (type === "utility") setUploadingUtilityDoc(false);
      else if (type === "id") setUploadingIdDoc(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!registrationProofUrl || !utilityBillUrl) {
      setErrorMsg("Please upload both Business Registration Proof and Utility Bill.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/directory/${directoryId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimantName,
          claimantEmail,
          claimantPhone,
          registrationProofUrl,
          utilityBillUrl,
          idProofUrl: idProofUrl || null,
          notes,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setErrorMsg(data.message || "Failed to submit claim request");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-1.5">
              Official Ownership Transfer
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Claim &ldquo;{businessName}&rdquo;
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify your ownership to manage leads, view real-time traffic, and update details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Person Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={claimantPhone}
                  onChange={(e) => setClaimantPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Official Business Email *
              </label>
              <input
                type="email"
                required
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                placeholder="contact@yourbusiness.com"
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Document Upload Section */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Verification Proof Documents
              </h4>

              {/* 1. Registration Proof */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. Business Registration Certificate *
                    </p>
                    <p className="text-[10px] text-slate-400">
                      GST Certificate, Trade License, MSME/Udyam, or Incorporation Document.
                    </p>
                  </div>
                  {registrationProofUrl ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      Attached ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "registration");
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  {uploadingRegDoc && <span className="text-[10px] text-emerald-500 animate-pulse">Uploading...</span>}
                </div>
              </div>

              {/* 2. Utility Bill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Utility / Electricity Bill / Tax Receipt *
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Recent electricity, water, telecom bill, or municipal property tax receipt.
                    </p>
                  </div>
                  {utilityBillUrl ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      Attached ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "utility");
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                  />
                  {uploadingUtilityDoc && <span className="text-[10px] text-emerald-500 animate-pulse">Uploading...</span>}
                </div>
              </div>

              {/* 3. Optional ID Proof */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      3. Owner Government ID (Optional)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PAN Card, Aadhaar, or Passport for priority verification.
                    </p>
                  </div>
                  {idProofUrl ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      Attached ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "id");
                    }}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-800 cursor-pointer"
                  />
                  {uploadingIdDoc && <span className="text-[10px] text-slate-400 animate-pulse">Uploading...</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Additional Notes / Statement
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any additional details or relationship with the business..."
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingRegDoc || uploadingUtilityDoc}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting for Admin Verification..." : "Submit Claim for Verification 🏢"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
