"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import {
  NORTHEAST_LOCATIONS,
  NE_STATE_NAMES,
  getCitiesForState,
} from "@/lib/locations";

const NE_STATES = [
  { name: "All States", icon: "🏔️" },
  { name: "Assam", icon: "🦏" },
  { name: "Meghalaya", icon: "🌧️" },
  { name: "Arunachal", icon: "☀️" },
  { name: "Manipur", icon: "💃" },
  { name: "Mizoram", icon: "🎋" },
  { name: "Nagaland", icon: "🦅" },
  { name: "Sikkim", icon: "❄️" },
  { name: "Tripura", icon: "🏛️" },
];

const CATEGORIES = [
  { id: "All", name: "All Categories", icon: "🛍️" },
  { id: "Vehicles & Bikes", name: "Vehicles & Bikes", icon: "🚗" },
  { id: "Mobiles & Electronics", name: "Electronics & Tech", icon: "📱" },
  { id: "Properties & Rent", name: "Property & Rentals", icon: "🏠" },
  { id: "Jobs & Services", name: "Jobs & Local Services", icon: "💼" },
  { id: "Handlooms & Crafts", name: "Handlooms & Crafts", icon: "🧣" },
  { id: "Tea & Agro Products", name: "Assam Tea & Agro", icon: "🍵" },
  { id: "Furniture & Decor", name: "Furniture & Decor", icon: "🛋️" },
  { id: "Pets & Livestock", name: "Pets & Farm Animals", icon: "🐾" },
  { id: "Fashion & Lifestyle", name: "Fashion & Clothes", icon: "👗" },
  { id: "Books & Hobbies", name: "Books & Hobbies", icon: "📚" },
];

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedState, selectedCity, sortOption]);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
      }
    } catch {
      // Ignored
    }
  }

  async function fetchListings() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedState !== "All States") params.set("state", selectedState);
      if (selectedCity !== "All Cities") params.set("city", selectedCity);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (sortOption) params.set("sort", sortOption);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      const data = await res.json();
      if (data.status === "success") {
        setItems(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load marketplace listings", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchListings();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-3 sm:pt-5 pb-20 px-2 sm:px-4 transition-colors">
      <div className="container mx-auto max-w-7xl">
        {/* State Quick Switcher */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = selectedState === st.name;
              return (
                <button
                  key={st.name}
                  onClick={() => {
                    setSelectedState(st.name);
                    setSelectedCity("All Cities");
                  }}
                  className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.name === "All States" ? "n:all" : `n:${st.name.toLowerCase().replace(/\s+/g, "")}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Header Card (Glossy) */}
        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Local Marketplace
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Buy &amp; Sell Across Northeast India
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Find vehicles, tech, Assam silk, handlooms, and agro products directly from local community members
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/marketplace/new"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-xs transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Post an Ad
              </Link>
              {currentUser && (
                <Link
                  href="/marketplace/my-ads"
                  className="px-4 py-2.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-full transition border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  My Ads
                </Link>
              )}
            </div>
          </div>

          {/* Search & Location Form */}
          <form onSubmit={handleSearch} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search items, vehicles, Assam silk, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              {/* Dynamic City Selector */}
              {selectedState !== "All States" && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  <option value="All Cities">🏙️ All Cities</option>
                  {getCitiesForState(selectedState).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="price_asc">📉 Price: Low to High</option>
                <option value="price_desc">📈 Price: High to Low</option>
                <option value="popular">🔥 Most Viewed</option>
              </select>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-full shadow-xs transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Categories Bar */}
          <div className="overflow-x-auto pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
            <div className="flex gap-1.5 min-w-max">
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {selectedCategory === "All" ? "Fresh Recommendations" : selectedCategory}{" "}
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({totalCount} items found)</span>
          </h2>

          <Link
            href="/marketplace/new"
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>+ Sell an item</span>
          </Link>
        </div>

        {/* Listings Grid (Glossy Cards) */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading marketplace items...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="text-5xl mb-3">🛍️</div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No items found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              No active listings match your current filters. Be the first to list an item for sale in {selectedState}!
            </p>
            <Link
              href="/marketplace/new"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs"
            >
              Post Your Ad Now (+30 XP)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {items.map((item) => {
              const images = item.imageUrls ? item.imageUrls.split(",") : [];
              const thumbnail =
                images[0]?.trim() ||
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";

              return (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className="group bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-950">
                      <img
                        src={thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Condition Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-slate-900/80 border border-slate-700/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {item.condition}
                      </span>
                      {/* State Badge */}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                        📍 {item.city || item.state}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price */}
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {item.isNegotiable && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-bold">
                            Negotiable
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {item.title}
                      </h3>

                      {/* Locality & Location */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1 truncate font-medium">
                        <span>📍</span>
                        <span>{item.locality ? `${item.locality}, ` : ""}{item.city}, {item.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer (Seller & Date) */}
                  <div className="p-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={
                          item.user?.profileImageUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user?.username || "user"}`
                        }
                        alt="Seller"
                        className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-medium">@{item.user?.username}</span>
                    </div>
                    <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchMe()}
      />
    </div>
  );
}
