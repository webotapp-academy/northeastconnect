"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Inquiries for owner
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Inquiry Form
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("Site Visit");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchSession();
    if (id) {
      fetchProperty();
    }
  }, [id]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        setInquiryName(data.user.fullName || data.user.name || data.user.username || "");
        setInquiryEmail(data.user.email || "");
        if (data.user.phone || data.user.mobileNumber) setInquiryPhone(data.user.phone || data.user.mobileNumber);
      }
    } catch {}
  }

  async function fetchProperty() {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setProperty(data.data);
        // If current user is owner, load inquiries
        checkAndFetchInquiries(data.data.userId);
      }
    } catch (err) {
      console.error("Failed to load property:", err);
    } finally {
      setLoading(false);
    }
  }

  async function checkAndFetchInquiries(ownerId: number) {
    try {
      const res = await fetch(`/api/properties/${id}/inquiries`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setInquiries(data.data);
      }
    } catch {}
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryPhone.trim()) {
      setInquiryError("Full name, email, and phone number are required.");
      return;
    }

    try {
      setSubmittingInquiry(true);
      setInquiryError("");

      const res = await fetch(`/api/properties/${id}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone,
          message: inquiryMessage,
          inquiryType,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setInquirySuccess(true);
      } else {
        setInquiryError(data.message || "Failed to submit inquiry");
      }
    } catch {
      setInquiryError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmittingInquiry(false);
    }
  }

  async function handleUpdateInquiryStatus(inquiryId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/properties/${id}/inquiries`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, status: newStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: newStatus } : inq))
        );
      }
    } catch {
      alert("Failed to update inquiry status");
    }
  }

  function parseImages(imgData: any): string[] {
    if (!imgData) return [];
    if (Array.isArray(imgData)) return imgData;
    if (typeof imgData === "string") {
      if (imgData.startsWith("[")) {
        try {
          return JSON.parse(imgData);
        } catch {
          return [imgData];
        }
      }
      return imgData.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  function parseAmenities(amenitiesData: any): string[] {
    if (!amenitiesData) return [];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === "string") {
      return amenitiesData.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  function formatPrice(val: any, unit: string, listing: string) {
    const num = parseFloat(val) || 0;
    let formatted = "";
    if (num >= 10000000) {
      formatted = `₹${(num / 10000000).toFixed(2)} Crore`;
    } else if (num >= 100000) {
      formatted = `₹${(num / 100000).toFixed(2)} Lakh`;
    } else {
      formatted = `₹${num.toLocaleString()}`;
    }

    if (listing === "For Rent" || listing === "Commercial Lease" || listing === "PG") {
      return `${formatted} / month`;
    }
    if (unit === "per_sqft") {
      return `${formatted} / sq.ft`;
    }
    return formatted;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
          <span className="text-4xl">🔍</span>
          <h2 className="text-lg font-bold mt-2">Property Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            This property listing might have been removed, sold, or expired.
          </p>
          <Link
            href="/properties"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
          >
            &larr; Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && (currentUser.id === property.userId || (currentUser.role || "").toLowerCase() === "admin");
  const images = parseImages(property.imageUrls);
  const amenities = parseAmenities(property.amenities);
  const priceFormatted = formatPrice(property.price, property.priceUnit, property.listingType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* Breadcrumb Header */}
      <div className="bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Link href="/properties" className="hover:text-emerald-600 transition">
              Properties
            </Link>
            <span>/</span>
            <span>{property.state}</span>
            <span>/</span>
            <span>{property.city}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold truncate max-w-[200px]">
              {property.title}
            </span>
          </div>

          <Link
            href="/properties"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
          >
            &larr; Browse All
          </Link>
        </div>
      </div>

      {/* Owner Control Banner if logged in as owner */}
      {isOwner && (
        <div className="bg-emerald-900/30 border-b border-emerald-500/30 py-3 px-4 sm:px-6">
          <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <span className="font-extrabold text-emerald-400">
                You are the Owner/Agent of this Property Listing
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({inquiries.length} Inquiries Received)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/properties/my-properties"
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
              >
                Manage My Properties
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left 2 Columns: Photo Gallery, Overview & Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs overflow-hidden">
              {images.length > 0 ? (
                <div>
                  {/* Main Selected Image */}
                  <div className="aspect-video sm:aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-3">
                    <img
                      src={images[activeImageIndex] || images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                        property.listingType === "For Sale"
                          ? "bg-emerald-600 text-white"
                          : property.listingType === "For Rent"
                          ? "bg-blue-600 text-white"
                          : "bg-purple-600 text-white"
                      }`}>
                        {property.listingType}
                      </span>
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white rounded-full text-xs font-bold">
                        {property.propertyType}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                            activeImageIndex === idx
                              ? "border-emerald-500 scale-105"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-4xl text-slate-400">
                  <span>🏡</span>
                  <span className="text-xs text-slate-500 font-bold mt-2">No Photos Uploaded</span>
                </div>
              )}
            </div>

            {/* Property Title & Pricing Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {priceFormatted}
                  </span>
                  {property.priceNegotiable && (
                    <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      Price Negotiable
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Listed on {new Date(property.createdAt).toLocaleDateString()} • 👁️ {property.viewsCount || 0} views
                </div>
              </div>

              <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-4 leading-snug">
                {property.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                <span>📍</span>
                <span>{property.locality ? `${property.locality}, ` : ""}{property.city}, {property.state} {property.pincode ? `(${property.pincode})` : ""}</span>
              </div>

              {/* Quick Spec Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                  <span className="text-slate-400 text-[11px] font-bold block">Type</span>
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    {property.propertyType}
                  </span>
                </div>

                {property.bedrooms && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 text-[11px] font-bold block">Bedrooms</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {property.bedrooms} BHK
                    </span>
                  </div>
                )}

                {property.bathrooms && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 text-[11px] font-bold block">Bathrooms</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {property.bathrooms} Bath
                    </span>
                  </div>
                )}

                {property.areaSqFt && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 text-[11px] font-bold block">Super Built-up Area</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {parseFloat(property.areaSqFt).toLocaleString()} sq.ft
                    </span>
                  </div>
                )}

                {property.furnishing && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 text-[11px] font-bold block">Furnishing</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {property.furnishing}
                    </span>
                  </div>
                )}

                {property.facing && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
                    <span className="text-slate-400 text-[11px] font-bold block">Facing</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {property.facing}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mb-3">
                Property Description
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {property.description || "No detailed description provided by the owner."}
              </div>
            </div>

            {/* Amenities & Highlights */}
            {amenities.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mb-3">
                  Amenities & Features
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {amenities.map((am: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <span className="text-emerald-500">✓</span>
                      <span>{am}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Candidate/Inquiry Review Panel (If Owner) */}
            {isOwner && (
              <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      👑 Inquiries & Site Visit Requests ({inquiries.length})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage potential buyers and tenants who contacted you about this property.
                    </p>
                  </div>
                </div>

                {inquiries.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <p className="text-xs text-slate-500">No inquiries received yet. We will notify you when a buyer reaches out!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="pt-4 first:pt-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mr-2">
                              {inq.name}
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[10px] font-bold">
                              {inq.inquiryType || "Site Visit"}
                            </span>
                          </div>

                          {/* Status Selector */}
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-400 text-[11px]">Status:</span>
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Visited">Site Visited</option>
                              <option value="Closed">Deal Closed / Completed</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span>📞 {inq.phone}</span>
                          <span>✉️ {inq.email}</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {inq.message && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic">
                            "{inq.message}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Contact Owner Box */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs sticky top-20">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-2xl shrink-0">
                  🏡
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Listed by</span>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {property.contactName || property.user?.fullName || property.user?.username || "Verified Owner"}
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ {property.postedBy || "Owner"}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp / Phone CTAs */}
              <div className="space-y-2 mb-5">
                {property.contactWhatsApp && (
                  <a
                    href={`https://wa.me/${property.contactWhatsApp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20your%20property%20listing:%20${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                  >
                    <span>💬</span>
                    <span>Chat on WhatsApp</span>
                  </a>
                )}

                {property.contactPhone && (
                  <a
                    href={`tel:${property.contactPhone}`}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 transition"
                  >
                    <span>📞</span>
                    <span>Call: {property.contactPhone}</span>
                  </a>
                )}
              </div>

              {/* Inquire Form */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 mb-3">
                  Send Direct Inquiry / Request Site Visit
                </h4>

                {inquirySuccess ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                    <span className="text-2xl block mb-1">✓</span>
                    <p className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
                      Inquiry Sent Successfully!
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      The owner will get in touch with you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-2.5 text-xs">
                    {inquiryError && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 rounded-xl text-[11px]">
                        {inquiryError}
                      </div>
                    )}

                    <div>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                      >
                        <option value="Site Visit">🗓️ Request Site Visit</option>
                        <option value="Price Negotiation">💰 Price Negotiation</option>
                        <option value="Rental Booking">🔑 Rental / Booking</option>
                        <option value="General Inquiry">ℹ️ General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="Your Name *"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="Your Email *"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="Phone / WhatsApp *"
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Message or preferred visiting time..."
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95 transition"
                    >
                      {submittingInquiry ? "Sending..." : "Submit Inquiry 🚀"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
