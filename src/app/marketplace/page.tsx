"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import RankBadge from "@/components/profile/RankBadge";
import {
  NORTHEAST_LOCATIONS,
  NE_STATE_NAMES,
  getCitiesForState,
} from "@/lib/locations";

const CATEGORIES = [
  { id: "All", name: "All Categories", icon: "🛍️" },
  { id: "Vehicles & Bikes", name: "Vehicles & Bikes", icon: "🚗" },
  { id: "Mobiles & Electronics", name: "Electronics & Tech", icon: "📱" },
  { id: "Properties & Rent", name: "Property & Rentals", icon: "🏠" },
  { id: "Jobs & Services", name: "Jobs & Local Services", icon: "💼" },
  { id: "Handlooms & Crafts", name: "Traditional Handlooms & Crafts", icon: "🧣" },
  { id: "Tea & Agro Products", name: "Assam Tea & Agro", icon: "🍵" },
  { id: "Furniture & Decor", name: "Furniture & Decor", icon: "🛋️" },
  { id: "Pets & Livestock", name: "Pets & Farm Animals", icon: "🐾" },
  { id: "Fashion & Lifestyle", name: "Fashion & Clothes", icon: "👗" },
  { id: "Books & Hobbies", name: "Books, Sports & Hobbies", icon: "📚" },
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
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-24 pb-20 px-4">
      {/* Top Banner / Hero Header */}
      <div className="container mx-auto max-w-6xl mb-8">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 border border-emerald-700/30 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg text-white">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3.5 py-1 bg-white/20 text-emerald-100 text-xs font-semibold rounded-full border border-white/30 backdrop-blur">
              🛒 Northeast Buy &amp; Sell Marketplace
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Buy, Sell &amp; Discover Across the 8 States
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Find cars, bikes, gadgets, properties, authentic Assam silk, organic tea, and regional crafts directly from local buyers and sellers.
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/marketplace/new"
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-stone-950 font-extrabold text-xs md:text-sm rounded-2xl shadow-lg transition flex items-center gap-2"
            >
              <span>➕</span>
              <span>Post Free Ad / Sell Item (+30 XP)</span>
            </Link>
            {currentUser && (
              <Link
                href="/marketplace/my-ads"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs md:text-sm rounded-2xl border border-white/20 backdrop-blur transition"
              >
                📋 My Posted Ads
              </Link>
            )}
          </div>

          <div className="absolute -right-6 -bottom-6 text-9xl opacity-15 select-none pointer-events-none">
            🏷️
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Search & Location Bar */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-4 md:p-5 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
              <input
                type="text"
                placeholder="Search items, brands, cars, Assam silk, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs md:text-sm text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              {/* State Selector */}
              <select
                value={selectedState}
                onChange={(e) => {
                  const st = e.target.value;
                  setSelectedState(st);
                  setSelectedCity("All Cities");
                }}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 outline-none focus:border-emerald-500 font-medium"
              >
                <option value="All States">📍 All States</option>
                {NE_STATE_NAMES.map((st) => (
                  <option key={st} value={st}>
                    📍 {st}
                  </option>
                ))}
              </select>

              {/* Dynamic City Selector */}
              {selectedState !== "All States" && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 outline-none focus:border-emerald-500 font-medium animate-in fade-in duration-150"
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
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 outline-none focus:border-emerald-500 font-medium"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="price_asc">📉 Price: Low to High</option>
                <option value="price_desc">📈 Price: High to Low</option>
                <option value="popular">🔥 Most Viewed</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl shadow-sm transition cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Categories Bar */}
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex gap-2.5 min-w-max">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                    active
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            {selectedCategory === "All" ? "Fresh Recommendations" : selectedCategory}{" "}
            <span className="text-xs text-gray-500 font-normal">({totalCount} items found)</span>
          </h2>

          <Link
            href="/marketplace/new"
            className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
          >
            <span>+ Sell an item</span>
          </Link>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading marketplace items...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-3xl p-8 shadow-sm">
            <div className="text-5xl mb-3">🛍️</div>
            <h3 className="font-bold text-gray-900 text-base">No items found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              No active listings match your current filters. Be the first to list an item for sale in {selectedState}!
            </p>
            <Link
              href="/marketplace/new"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md"
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
                  className="group bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                      <img
                        src={thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Condition Badge */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                        {item.condition}
                      </span>
                      {/* Featured or State Badge */}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-md">
                        📍 {item.city || item.state}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Price */}
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-lg md:text-xl font-extrabold text-gray-900 font-mono">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        {item.isNegotiable && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                            Negotiable
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                        {item.title}
                      </h3>

                      {/* Locality & Location */}
                      <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1 truncate">
                        <span>📍</span>
                        <span>{item.locality ? `${item.locality}, ` : ""}{item.city}, {item.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer (Seller & Date) */}
                  <div className="p-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <img
                        src={
                          item.user?.profileImageUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user?.username || "user"}`
                        }
                        alt="Seller"
                        className="w-5 h-5 rounded-full object-cover border border-gray-200"
                      />
                      <span className="truncate text-gray-600 font-medium">@{item.user?.username}</span>
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
