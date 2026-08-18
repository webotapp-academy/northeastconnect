"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyMarketplaceAdsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/marketplace"
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 mb-1"
            >
              &larr; Back to Marketplace
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900">Manage My Posted Ads</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Keep your listings up to date or mark them as Sold once completed
            </p>
          </div>

          <Link
            href="/marketplace/new"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            + Post New Ad
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your ads...
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-3xl p-8 shadow-sm">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-bold text-gray-900 text-base">You haven&apos;t posted any ads yet</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Sell items, vehicles, tea, or crafts to thousands of buyers across Northeast India!
            </p>
            <Link
              href="/marketplace/new"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Post Your First Ad (+30 XP)
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => {
              const imgs = item.imageUrls ? item.imageUrls.split(",") : [];
              const thumb = imgs[0]?.trim() || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60";
              const isSold = item.status === "Sold";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200/90 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-20 h-20 rounded-2xl object-cover border border-gray-200 flex-shrink-0 bg-gray-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSold ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-gray-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        href={`/marketplace/${item.id}`}
                        className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition truncate block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        📍 {item.city}, {item.state} • {item.viewsCount || 0} views • Posted {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => toggleStatus(item.id, item.status)}
                      disabled={updatingId === item.id}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                        isSold
                          ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {isSold ? "Re-activate Ad" : "Mark as Sold"}
                    </button>
                    <button
                      onClick={() => deleteAd(item.id)}
                      disabled={updatingId === item.id}
                      className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
