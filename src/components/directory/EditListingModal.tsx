"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface EditListingModalProps {
  business: {
    id: number;
    businessName: string;
    category?: string | null;
    subcategory?: string | null;
    description?: string | null;
    address?: string | null;
    district?: string | null;
    city?: string | null;
    contactNumber?: string | null;
    email?: string | null;
    website?: string | null;
    workingHours?: string | null;
    imageUrls?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditListingModal({
  business,
  isOpen,
  onClose,
  onSuccess,
}: EditListingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [businessName, setBusinessName] = useState(business.businessName || "");
  const [category, setCategory] = useState(business.category || "");
  const [subcategory, setSubcategory] = useState(business.subcategory || "");
  const [description, setDescription] = useState(business.description || "");
  const [address, setAddress] = useState(business.address || "");
  const [district, setDistrict] = useState(business.district || "");
  const [city, setCity] = useState(business.city || "");
  const [contactNumber, setContactNumber] = useState(business.contactNumber || "");
  const [email, setEmail] = useState(business.email || "");
  const [website, setWebsite] = useState(business.website || "");
  const [workingHours, setWorkingHours] = useState(business.workingHours || "");
  const [imageUrls, setImageUrls] = useState(business.imageUrls || "");

  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (business) {
      setBusinessName(business.businessName || "");
      setCategory(business.category || "");
      setSubcategory(business.subcategory || "");
      setDescription(business.description || "");
      setAddress(business.address || "");
      setDistrict(business.district || "");
      setCity(business.city || "");
      setContactNumber(business.contactNumber || "");
      setEmail(business.email || "");
      setWebsite(business.website || "");
      setWorkingHours(business.workingHours || "");
      setImageUrls(business.imageUrls || "");
    }
  }, [business]);

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

  async function handleImageUpload(file: File) {
    try {
      setUploadingImage(true);
      setErrorMsg("");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "directory");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success" && data.url) {
        setImageUrls((prev) => (prev ? `${prev},${data.url}` : data.url));
      } else {
        setErrorMsg(data.message || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Network error uploading image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!businessName.trim()) {
      setErrorMsg("Business Name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/directory/${business.id}/edit-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          category: category.trim(),
          subcategory: subcategory.trim(),
          description: description.trim(),
          address: address.trim(),
          district: district.trim(),
          city: city.trim(),
          contactNumber: contactNumber.trim(),
          email: email.trim(),
          website: website.trim(),
          workingHours: workingHours.trim(),
          imageUrls: imageUrls.trim(),
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccessMsg(data.message || "Edits submitted for Admin approval! 📝");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(data.message || "Failed to submit listing edits");
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
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100 my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1.5">
              Edit Business Listing
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Update &ldquo;{business.businessName}&rdquo;
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proposed updates will be sent to the admin team for quick verification before publishing.
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

        {/* Form Body */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Restaurants, Education, IT & Web Services"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description / Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your services, specialties, and offerings..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  District / State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kamrup Metropolitan, Assam"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guwahati, GS Road"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Street Address
              </label>
              <input
                type="text"
                placeholder="Shop No, Building Name, Street..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Photos Upload */}
            <div className="p-3.5 bg-slate-800/60 border border-slate-700/80 rounded-2xl">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Upload New Business Photos
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
                disabled={uploadingImage}
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
              {uploadingImage && (
                <span className="text-[11px] text-emerald-400 mt-1 block">Uploading image...</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition transform active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Submitting Updates for Admin Approval...</span>
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    <span>Submit Edits for Admin Approval</span>
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
