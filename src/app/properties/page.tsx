"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";

const PROPERTY_TYPES = [
  "All Types",
  "Plots & Land",
  "Apartments & Flats",
  "Houses & Villas",
  "Commercial Shops & Offices",
  "PG & Hostels",
  "Farm Houses",
];

const LISTING_TYPES = [
  "All Listings",
  "For Sale",
  "For Rent",
  "Commercial Lease",
  "PG",
];

const NORTHEAST_STATES = [
  "All States",
  "Assam",
  "Meghalaya",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim",
];

const BEDROOM_OPTIONS = ["All", "1", "2", "3", "4", "5+"];

export default function PropertiesPortalPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedListing, setSelectedListing] = useState("All Listings");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedBedrooms, setSelectedBedrooms] = useState("All");
  const [sortOption, setSortOption] = useState("views");

  // Inquire Modal
  const [inquireModalOpen, setInquireModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryType, setInquiryType] = useState("Site Visit");
  const [inquireSubmitting, setInquireSubmitting] = useState(false);
  const [inquireSuccess, setInquireSuccess] = useState(false);
  const [inquireError, setInquireError] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchProperties(1, false);
  }, [selectedType, selectedListing, selectedState, selectedBedrooms, sortOption]);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setInquiryName(data.user.fullName || data.user.name || data.user.username || "");
        setInquiryEmail(data.user.email || "");
        if (data.user.phone || data.user.mobileNumber) setInquiryPhone(data.user.phone || data.user.mobileNumber);
      }
    } catch {}
  }

  async function fetchProperties(pageNum: number, isLoadMore = false) {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const params = new URLSearchParams({
        q: searchQuery,
        propertyType: selectedType,
        listingType: selectedListing,
        state: selectedState,
        bedrooms: selectedBedrooms,
        sort: sortOption,
        page: pageNum.toString(),
        limit: "12",
      });

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();

      if (data.status === "success") {
        if (isLoadMore) {
          setProperties((prev) => [...prev, ...(data.data || [])]);
        } else {
          setProperties(data.data || []);
        }
        setTotalCount(data.total || 0);
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProperties(1, false);
  }

  async function handleInquirySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProperty) return;
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryPhone.trim()) {
      setInquireError("Name, email, and phone number are required.");
      return;
    }

    try {
      setInquireSubmitting(true);
      setInquireError("");

      const res = await fetch(`/api/properties/${selectedProperty.id}/inquire`, {
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
        setInquireSuccess(true);
        setProperties((prev) =>
          prev.map((p) =>
            p.id === selectedProperty.id
              ? { ...p, inquiriesCount: (p.inquiriesCount || 0) + 1 }
              : p
          )
        );
      } else {
        setInquireError(data.message || "Failed to submit inquiry");
      }
    } catch {
      setInquireError("An unexpected error occurred. Please try again.");
    } finally {
      setInquireSubmitting(false);
    }
  }

  function formatPrice(val: any, unit: string, listing: string) {
    const num = parseFloat(val) || 0;
    let formatted = "";
    if (num >= 10000000) {
      formatted = `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      formatted = `₹${(num / 100000).toFixed(2)} Lac`;
    } else {
      formatted = `₹${num.toLocaleString()}`;
    }

    if (listing === "For Rent" || listing === "Commercial Lease" || listing === "PG") {
      return `${formatted} / mo`;
    }
    if (unit === "per_sqft") {
      return `${formatted} / sq.ft`;
    }
    return formatted;
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-slate-50/80 to-white dark:from-emerald-950/40 dark:via-[#0c121e] dark:to-[#090d16] pt-6 sm:pt-10 pb-6 sm:pb-8 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-bold mb-2">
                <span>🏡</span>
                <span>Northeast Real Estate Portal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Properties, Land & Rentals
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Buy, sell, and rent verified residential plots, luxury villas, commercial shops, apartments, and PG accommodations across Northeast India.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/properties/my-properties"
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
              >
                📋 My Properties
              </Link>
              <Link
                href="/properties/post"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <span>➕</span>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-4 sm:mt-6">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-1 sm:p-1.5 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
              <span className="pl-3 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location, project, villa, commercial plot, locality (e.g. Beltola, Zoo Road)..."
                className="flex-1 min-w-0 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                    fetchProperties(1, false);
                  }}
                  className="px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Straight-Line Filter Toolbar */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
            {/* Listing Type Filter (Sale / Rent / Lease) */}
            <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={selectedListing}
                onChange={(e) => setSelectedListing(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
              >
                {LISTING_TYPES.map((lt) => (
                  <option key={lt} value={lt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {lt === "All Listings" ? "🔑 All Listings" : `🔑 ${lt}`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>

            {/* Property Type Filter (Plot / Villa / Apartment / etc.) */}
            <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[160px]">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {pt === "All Types" ? "🏷️ All Property Types" : `🏷️ ${pt}`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>

            {/* State Filter */}
            <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
              >
                {NORTHEAST_STATES.map((st) => (
                  <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {st === "All States" ? "📍 All States" : `📍 ${st}`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>

            {/* Bedrooms Filter */}
            <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[110px]">
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
              >
                {BEDROOM_OPTIONS.map((b) => (
                  <option key={b} value={b} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {b === "All" ? "🛏️ BHK: All" : `🛏️ ${b} BHK`}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>

            {/* Sort Order */}
            <div className="relative shrink-0 flex-1 sm:flex-initial min-w-[150px]">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full appearance-none pl-3 pr-7 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold shadow-xs hover:border-emerald-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer transition"
              >
                <option value="views" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">🔥 Sort: Most Viewed</option>
                <option value="recent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">⏱️ Sort: Newest Added</option>
                <option value="price_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">💰 Price: Low to High</option>
                <option value="price_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">💎 Price: High to Low</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>

            {/* Reset Button */}
            {(selectedType !== "All Types" || selectedListing !== "All Listings" || selectedState !== "All States" || selectedBedrooms !== "All" || sortOption !== "views" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedType("All Types");
                  setSelectedListing("All Listings");
                  setSelectedState("All States");
                  setSelectedBedrooms("All");
                  setSortOption("views");
                  setSearchQuery("");
                }}
                className="px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-xl transition cursor-pointer shrink-0 ml-auto flex items-center gap-1"
              >
                <span>✕</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl mt-6 sm:mt-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading verified properties across Northeast India...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">🏡</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-3 mb-1">
              No Properties Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Try adjusting your search criteria or be the first to list a property in this area!
            </p>
            <Link
              href="/properties/post"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs inline-block"
            >
              ➕ Post Your Property Free
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Showing {properties.length} of {totalCount} verified properties
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {properties.map((prop) => {
                const images = parseImages(prop.imageUrls);
                const firstImg = images[0];
                const priceFormatted = formatPrice(prop.price, prop.priceUnit, prop.listingType);

                return (
                  <div
                    key={prop.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Property Image & Badges */}
                      <Link href={`/properties/${prop.id}`} className="block relative aspect-video sm:aspect-16/10 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt={prop.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-3xl text-slate-400">
                            <span>🏡</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-1">No Photo</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                            prop.listingType === "For Sale"
                              ? "bg-emerald-600 text-white"
                              : prop.listingType === "For Rent"
                              ? "bg-blue-600 text-white"
                              : "bg-purple-600 text-white"
                          }`}>
                            {prop.listingType}
                          </span>
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-full text-[10px] font-bold">
                            {prop.propertyType}
                          </span>
                        </div>

                        {/* Verified/Owner Tag */}
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <span>👤</span>
                          <span>{prop.postedBy || "Owner"}</span>
                        </div>
                      </Link>

                      {/* Content Info */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {priceFormatted}
                          </span>
                          {prop.priceNegotiable && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              Negotiable
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/properties/${prop.id}`}
                          className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-2 block leading-snug"
                        >
                          {prop.title}
                        </Link>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          📍 {prop.locality ? `${prop.locality}, ` : ""}{prop.city}, {prop.state}
                        </p>

                        {/* Key Specs Pills */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                          {prop.bedrooms && (
                            <span className="flex items-center gap-1 font-bold">
                              <span>🛏️</span>
                              <span>{prop.bedrooms} BHK</span>
                            </span>
                          )}
                          {prop.bathrooms && (
                            <span className="flex items-center gap-1 font-bold">
                              <span>🚿</span>
                              <span>{prop.bathrooms} Bath</span>
                            </span>
                          )}
                          {prop.areaSqFt && (
                            <span className="flex items-center gap-1 font-bold">
                              <span>📐</span>
                              <span>{parseFloat(prop.areaSqFt).toLocaleString()} sq.ft</span>
                            </span>
                          )}
                          {prop.furnishing && prop.furnishing !== "Unfurnished" && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-medium truncate ml-auto">
                              {prop.furnishing}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        👁️ {prop.viewsCount || 0} views
                      </span>

                      <div className="flex items-center gap-1.5">
                        {prop.contactWhatsApp && (
                          <a
                            href={`https://wa.me/${prop.contactWhatsApp.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20your%20property%20listing:%20${encodeURIComponent(prop.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-600 rounded-xl transition"
                            title="Chat on WhatsApp"
                          >
                            💬
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProperty(prop);
                            setInquireModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                        >
                          ⚡ Inquire
                        </button>
                        <Link
                          href={`/properties/${prop.id}`}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
                        >
                          Details &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => fetchProperties(page + 1, true)}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-900 dark:text-slate-100 rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? "Loading more properties..." : "Load More Properties ▾"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Inquire Modal */}
      {inquireModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setInquireModalOpen(false);
                setInquireSuccess(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
            >
              ✕
            </button>

            {inquireSuccess ? (
              <div className="py-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                  Inquiry Sent!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Your message has been delivered to the owner of <strong>{selectedProperty.title}</strong>. They will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInquireModalOpen(false);
                    setInquireSuccess(false);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Property Inquiry / Site Visit
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                    {selectedProperty.title}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {formatPrice(selectedProperty.price, selectedProperty.priceUnit, selectedProperty.listingType)} • {selectedProperty.city}, {selectedProperty.state}
                  </p>
                </div>

                {inquireError && (
                  <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium">
                    {inquireError}
                  </div>
                )}

                <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inquiry Type
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Site Visit">🗓️ Request Site Visit</option>
                      <option value="Price Negotiation">💰 Price Negotiation / Best Offer</option>
                      <option value="Rental Booking">🔑 Rental / Booking Inquiry</option>
                      <option value="General Inquiry">ℹ️ General Property Information</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Partha Pratim Sharma"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Message / Preferred Visiting Time
                    </label>
                    <textarea
                      rows={2}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Hi, I am interested in viewing this property this weekend..."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInquireModalOpen(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={inquireSubmitting}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-xs cursor-pointer active:scale-95"
                    >
                      {inquireSubmitting ? "Sending..." : "Send Inquiry 🚀"}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
