"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyMarketplaceAdsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedAdId, setExpandedAdId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyAds();
  }, []);

  async function fetchMyAds() {
    try {
      setLoading(true);
      const res = await fetch("/api/marketplace/my-ads");
      const data = await res.json();
      if (data.status === "success") {
        setListings(data.listings || []);
        setTotalViews(data.totalViews || 0);
        setTotalLeads(data.totalLeads || 0);
      } else {
        router.push("/marketplace");
      }
    } catch {
      router.push("/marketplace");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: number, currentStatus: string) {
    try {
      setUpdatingId(id);
      const nextStatus = currentStatus === "Active" ? "Sold" : "Active";
      const res = await fetch(`/api/marketplace/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setListings(
          listings.map((item) =>
            item.id === id ? { ...item, status: nextStatus } : item
          )
        );
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAd(id: number) {
    if (!confirm("Are you sure you want to permanently delete this ad?")) return;
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/marketplace/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        setListings(listings.filter((item) => item.id !== id));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-20 sm:pt-24 pb-20 px-3 sm:px-6 transition-colors">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/marketplace"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>←</span> Back to Marketplace
              </Link>
              <span className="text-slate-400">&bull;</span>
              <Link
                href="/profile/my-businesses"
                className="text-xs text-slate-500 hover:underline"
              >
                My Businesses &amp; Leads
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🛒</span> My Marketplace Ads &amp; Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Track live buyer views, manage customer inquiries, and update your listings.
            </p>
          </div>

          <Link
            href="/marketplace/new"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
          >
            + Post New Ad (+30 XP)
          </Link>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">
              Active Ads
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {listings.length}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">
              Total Views
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalViews}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs">
            <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">
              Buyer Inquiries
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalLeads}
            </div>
          </div>
        </div>

        {/* Listings List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-sm animate-pulse">
            Loading your marketplace ads...
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              You haven&apos;t posted any ads yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Sell items, vehicles, tea, or crafts to thousands of buyers across Northeast India!
            </p>
            <Link
              href="/marketplace/new"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition inline-block"
            >
              Post Your First Ad (+30 XP)
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => {
              const imgs = item.imageUrls ? item.imageUrls.split(",") : [];
              const thumb =
                imgs[0]?.trim() ||
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
              const isSold = item.status === "Sold";
              const isExpanded = expandedAdId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSold
                                ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60"
                                : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Link
                          href={`/marketplace/${item.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          📍 {item.city}, {item.state} &bull; 👁️ {item.viewsCount || 0} views &bull; {item.leadsCount || 0} inquiries
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      <button
                        onClick={() => setExpandedAdId(isExpanded ? null : item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                          isExpanded
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>📬</span>
                        <span>{item.leadsCount || 0} Leads</span>
                        <span>{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        disabled={updatingId === item.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          isSold
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60"
                        }`}
                      >
                        {isSold ? "Re-activate" : "Mark Sold"}
                      </button>

                      <button
                        onClick={() => deleteAd(item.id)}
                        disabled={updatingId === item.id}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 rounded-xl transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expandable Buyer Inquiries */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Buyer Inquiries for this ad ({item.leads?.length || 0})
                      </h4>
                      {item.leads && item.leads.length > 0 ? (
                        <div className="space-y-2">
                          {item.leads.map((lead: any) => (
                            <div
                              key={lead.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {lead.name || "Interested Buyer"}
                                </span>
                                {lead.notes && (
                                  <p className="text-slate-600 dark:text-slate-300 italic mt-0.5">
                                    &ldquo;{lead.notes}&rdquo;
                                  </p>
                                )}
                              </div>
                              {lead.mobile && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={`tel:${lead.mobile}`}
                                    className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                                  >
                                    📞 {lead.mobile}
                                  </a>
                                  <a
                                    href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-500/30"
                                  >
                                    WhatsApp
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          No buyer inquiries yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
