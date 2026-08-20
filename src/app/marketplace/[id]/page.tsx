"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import CommentSection from "@/components/comments/CommentSection";

export default function MarketplaceItemPage() {
  const params = useParams();
  const id = params?.id as string;

  const [listing, setListing] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  async function fetchListing() {
    try {
      setLoading(true);
      const res = await fetch(`/api/marketplace/${id}`);
      const data = await res.json();
      if (data.status === "success" && data.listing) {
        setListing(data.listing);
        setRelated(data.relatedListings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 pt-24">
        <div className="text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Item Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            This ad may have been sold or removed by the seller.
          </p>
          <Link
            href="/marketplace"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const rawImages = listing.imageUrls ? listing.imageUrls.split(",") : [];
  const images = rawImages.length > 0 ? rawImages.map((s: string) => s.trim()) : [
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop&q=80"
  ];
  const activeImage = images[activeImageIndex] || images[0];

  // Clean WhatsApp number
  const cleanWhatsApp = listing.contactWhatsApp
    ? listing.contactWhatsApp.replace(/[^0-9]/g, "")
    : listing.contactPhone?.replace(/[^0-9]/g, "");

  const whatsAppUrl = cleanWhatsApp
    ? `https://wa.me/${cleanWhatsApp.length === 10 ? `91${cleanWhatsApp}` : cleanWhatsApp}?text=${encodeURIComponent(
        `Hi! I saw your ad for "${listing.title}" on North East Connect. Is it still available?`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-20 px-3 sm:px-4 transition-colors">
      {/* Breadcrumb */}
      <div className="container mx-auto max-w-6xl mb-5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-emerald-600 dark:hover:text-emerald-400">Marketplace</Link>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-semibold">{listing.category}</span>
        <span>/</span>
        <span className="text-slate-400 dark:text-slate-500 truncate max-w-xs">{listing.title}</span>
      </div>

      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Photos & Description (Glossy) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gallery Card */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] overflow-hidden">
            {/* Primary Featured Image */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              <img
                src={activeImage}
                alt={listing.title}
                className="w-full h-full object-contain md:object-cover"
              />
              {listing.status === "Sold" && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="px-6 py-2 bg-rose-600 text-white font-black text-lg md:text-2xl rounded-full uppercase tracking-wider shadow-xl">
                    ✓ Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                      activeImageIndex === idx ? "border-emerald-500 scale-105" : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Overview */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Description &amp; Specifications
            </h2>

            {/* Quick Spec Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50/90 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Category</div>
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">{listing.category}</div>
              </div>
              <div className="bg-slate-50/90 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  {listing.category === "Jobs & Services"
                    ? "Job Role / Terms"
                    : listing.category === "Properties & Rent"
                    ? "Type & Config"
                    : listing.category === "Pets & Livestock"
                    ? "Animal / Breed"
                    : listing.category === "Tea & Agro Products"
                    ? "Product Type"
                    : listing.category === "Handlooms & Crafts"
                    ? "Silk / Craft"
                    : "Condition"}
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">{listing.condition}</div>
              </div>
              <div className="bg-slate-50/90 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Location</div>
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 truncate">{listing.city}, {listing.state}</div>
              </div>
              <div className="bg-slate-50/90 dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Views</div>
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5">{listing.viewsCount || 0} views</div>
              </div>
            </div>

            {/* Text Description */}
            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </div>
          </div>

          {/* Universal Comments / Discussion for Q&A */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>💬</span> Public Q&amp;A &amp; Inquiries
            </h3>
            <CommentSection
              entityType="marketplace"
              entityId={listing.id}
              entityTitle={`Marketplace: ${listing.title}`}
              entityUrl={`/marketplace/${listing.id}`}
            />
          </div>
        </div>

        {/* Right 1 Col: Price, Seller & Contact Action */}
        <div className="space-y-6">
          {/* Price & Action Card (Glossy) */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-5">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {listing.category === "Jobs & Services"
                  ? "Salary / Compensation"
                  : listing.category === "Properties & Rent"
                  ? "Rent / Asking Price"
                  : "Selling Price"}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  ₹{listing.price.toLocaleString("en-IN")}
                </span>
                {listing.isNegotiable ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 font-bold">
                    Negotiable
                  </span>
                ) : (
                  <span className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 font-semibold">
                    Fixed
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {listing.title}
            </h1>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>📍</span>
              <span className="font-medium">
                {listing.locality ? `${listing.locality}, ` : ""}{listing.city}, {listing.state}
              </span>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-2.5 pt-2">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm rounded-full shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.79 11.79 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.52 5.81L0 24l6.34-1.66A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.3-6.11-3.48-8.52zM12 21.82c-1.91 0-3.68-.55-5.17-1.5l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.82 9.82 0 1 1 12 21.82zm5.67-7.5c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.22-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.63.13-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.53.08-.82.38-.28.31-1.07 1.04-1.07 2.54 0 1.49 1.1 2.93 1.25 3.12.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.42.2 1.96.12.6-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.08-.12-.28-.2-.58-.35z"/>
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              ) : null}

              {listing.contactPhone ? (
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="w-full py-3.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 font-bold text-xs md:text-sm rounded-full shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📞</span>
                  <span>Call Seller ({listing.contactPhone})</span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Seller Profile Card (Glossy) */}
          {listing.user && (
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-3.5">
                Seller Information
              </h3>
              <div className="flex items-center gap-3.5">
                <Link href={`/profile/${listing.user.username}`}>
                  <img
                    src={
                      listing.user.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${listing.user.username}`
                    }
                    alt={listing.user.username}
                    className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:scale-105 transition"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${listing.user.username}`}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate block"
                  >
                    {listing.user.fullName || listing.user.username}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{listing.user.username}</p>
                  <div className="mt-1">
                    <RankBadge
                      rankTier={listing.user.rankTier}
                      xpPoints={listing.user.xpPoints}
                      size="sm"
                      showLevel={false}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Member since</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(listing.user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>

              <Link
                href={`/profile/${listing.user.username}`}
                className="mt-3 block text-center py-2 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition"
              >
                View Seller&apos;s Profile Wall &rarr;
              </Link>
            </div>
          )}

          {/* Safety Tips */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-100">
              <span>🛡️</span> Safety Tips for Buyers
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
              <li>Meet seller in a safe, public place.</li>
              <li>Inspect the item and verify its condition thoroughly before making payment.</li>
              <li>Avoid sending advance payments or deposits before seeing the item.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Similar Regional Listings */}
      {related.length > 0 && (
        <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-5">
            More items in {listing.category} &amp; {listing.state}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => {
              const imgs = item.imageUrls ? item.imageUrls.split(",") : [];
              const thumb = imgs[0]?.trim() || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
              return (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-mono font-black text-slate-900 dark:text-slate-100 text-sm">
                      ₹{item.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">📍 {item.city}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
