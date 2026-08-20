"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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
        setErrorMsg(data.message || "File upload failed");
      }
    } catch {
      setErrorMsg("File upload error");
    } finally {
      if (type === "registration") setUploadingRegDoc(false);
      else if (type === "utility") setUploadingUtilityDoc(false);
      else if (type === "id") setUploadingIdDoc(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!claimantName.trim() || !claimantEmail.trim() || !claimantPhone.trim()) {
      setErrorMsg("Please provide your name, official email, and phone number.");
      return;
    }

    if (!registrationProofUrl) {
      setErrorMsg("Please upload your Business Registration Certificate (GST, MSME, Trade License, etc.).");
      return;
    }

    if (!utilityBillUrl) {
      setErrorMsg("Please upload a Utility / Electricity Bill or location proof.");
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

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100 my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1.5">
              Official Ownership Transfer
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Claim &ldquo;{businessName}&rdquo;
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify your ownership to manage leads, view real-time traffic, and update details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-xs font-bold text-rose-300 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs font-bold text-emerald-300 flex items-center gap-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Person Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={claimantPhone}
                  onChange={(e) => setClaimantPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Official Business Email *
              </label>
              <input
                type="email"
                required
                placeholder="contact@yourbusiness.com"
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Document Uploads Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Verification Proof Documents
              </h4>

              {/* 1. Business Registration Certificate */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      1. Business Registration Certificate *
                    </span>
                    <span className="text-[11px] text-slate-400">
                      GST Certificate, Trade License, MSME/Udyam, or Incorporation Document.
                    </span>
                  </div>
                  {registrationProofUrl ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                      Attached ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required={!registrationProofUrl}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "registration");
                    }}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {uploadingRegDoc && <span className="text-[10px] text-emerald-400 animate-pulse">Uploading...</span>}
                </div>
              </div>

              {/* 2. Utility Bill / Electricity Bill */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      2. Utility / Electricity Bill *
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Recent electricity bill, water bill, or lease deed showing business address.
                    </span>
                  </div>
                  {utilityBillUrl ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                      Attached ✓
                    </span>
                  ) : null}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    required={!utilityBillUrl}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "utility");
                    }}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  {uploadingUtilityDoc && <span className="text-[10px] text-emerald-400 animate-pulse">Uploading...</span>}
                </div>
              </div>

              {/* 3. Government ID (Optional) */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">
                      3. Owner Government ID (Optional)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Aadhaar, PAN card, or Passport of authorized signatory.
                    </span>
                  </div>
                  {idProofUrl ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
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
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer"
                  />
                  {uploadingIdDoc && <span className="text-[10px] text-slate-400 animate-pulse">Uploading...</span>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Additional Notes / Statement
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention any additional details or relationship with the business..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingRegDoc || uploadingUtilityDoc}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition transform active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Submitting for Admin Verification...</span>
                  </>
                ) : (
                  <>
                    <span>🏢</span>
                    <span>Submit Claim for Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
