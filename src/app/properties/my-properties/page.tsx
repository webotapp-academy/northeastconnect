"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";

export default function MyPropertiesDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchSessionAndProperties();
  }, []);

  async function fetchSessionAndProperties() {
    try {
      setLoading(true);
      const resUser = await fetch("/api/auth/me");
      const dataUser = await resUser.json();

      if (dataUser.status === "success" && dataUser.user) {
        setCurrentUser(dataUser.user);
        const resProps = await fetch("/api/properties/my-properties");
        const dataProps = await resProps.json();
        if (dataProps.status === "success") {
          setProperties(dataProps.data || []);
        }
      } else {
        setAuthModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load my properties:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(propertyId: number) {
    if (!confirm("Are you sure you want to delete this property listing?")) return;

    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      } else {
        alert(data.message || "Failed to delete property");
      }
    } catch {
      alert("Error deleting property");
    }
  }

  async function handleToggleStatus(propertyId: number, currentStatus: string) {
    const newStatus = currentStatus === "Active" ? "Sold" : "Active";
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      alert("Error updating status");
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

  function formatPrice(val: any, listing: string) {
    const num = parseFloat(val) || 0;
    let formatted = "";
    if (num >= 10000000) formatted = `₹${(num / 10000000).toFixed(2)} Cr`;
    else if (num >= 100000) formatted = `₹${(num / 100000).toFixed(2)} Lac`;
    else formatted = `₹${num.toLocaleString()}`;

    if (listing === "For Rent" || listing === "Commercial Lease" || listing === "PG") {
      return `${formatted} / mo`;
    }
    return formatted;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-slate-50/80 to-white dark:from-emerald-950/40 dark:via-[#0c121e] dark:to-[#090d16] pt-8 pb-8 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Link href="/properties" className="hover:text-emerald-600">
                  Properties
                </Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-100 font-bold">My Properties</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                📋 My Property Listings & Leads
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Manage your real estate listings, update availability, and review buyer inquiries.
              </p>
            </div>

            <Link
              href="/properties/post"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
            >
              <span>➕</span>
              <span>Post New Property</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl mt-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading your property listings...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
            <span className="text-4xl">🏡</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mt-3 mb-1">
              No Properties Listed Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              You haven't posted any real estate listings yet. Post your plot, flat, villa, or commercial space for free!
            </p>
            <Link
              href="/properties/post"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs inline-block"
            >
              ➕ Post Property Free
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => {
              const images = parseImages(prop.imageUrls);
              const firstImg = images[0];
              const inqCount = prop._count?.inquiries || prop.inquiriesCount || 0;

              return (
                <div
                  key={prop.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className="w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      {firstImg ? (
                        <img src={firstImg} alt={prop.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏡</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          prop.listingType === "For Sale" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        }`}>
                          {prop.listingType}
                        </span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {formatPrice(prop.price, prop.listingType)}
                        </span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          prop.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-300" : "bg-slate-100 text-slate-500"
                        }`}>
                          {prop.status}
                        </span>
                      </div>

                      <Link
                        href={`/properties/${prop.id}`}
                        className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:underline truncate block"
                      >
                        {prop.title}
                      </Link>

                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        📍 {prop.locality ? `${prop.locality}, ` : ""}{prop.city}, {prop.state}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Inquiry Count */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/properties/${prop.id}`}
                      className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>💬 Inquiries</span>
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                        {inqCount}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(prop.id, prop.status)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                    >
                      Mark {prop.status === "Active" ? "Sold/Rented" : "Active"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(prop.id)}
                      className="px-2.5 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-bold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
