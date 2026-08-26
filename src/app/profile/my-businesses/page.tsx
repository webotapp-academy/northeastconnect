"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditListingModal from "@/components/directory/EditListingModal";

export default function MyBusinessesDashboardPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [claimRequests, setClaimRequests] = useState<any[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedBusinessId, setExpandedBusinessId] = useState<number | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/directory/my-businesses");
        const data = await res.json();
        if (data.status === "success") {
          setBusinesses(data.businesses || []);
          setClaimRequests(data.claimRequests || []);
          setTotalViews(data.totalViews || 0);
          setTotalLeads(data.totalLeads || 0);
        } else {
          router.push("/login?redirect=/profile/my-businesses");
        }
      } catch {
        router.push("/login?redirect=/profile/my-businesses");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-20 sm:pt-24 pb-20 px-3 sm:px-6 transition-colors">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/directory"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>←</span> Business Directory
              </Link>
              <span className="text-slate-400">&bull;</span>
              <Link
                href="/marketplace/my-ads"
                className="text-xs text-slate-500 hover:underline"
              >
                My Marketplace Ads
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏢</span> My Businesses, Views &amp; Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Monitor real-time customer views and manage incoming customer leads for your claimed and registered businesses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/directory"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-emerald-600/20"
            >
              + Claim / Register Business
            </Link>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Managed Businesses</span>
              <span>🏢</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {businesses.length}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Active on directory
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Total Views</span>
              <span>👁️</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalViews}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Customer impressions
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider text-[10px]">Customer Inquiries / Leads</span>
              <span>📬</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {totalLeads}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Direct customer contacts
            </div>
          </div>
        </div>

        {/* Pending Claim Requests Banner */}
        {claimRequests.some((c) => c.status === "Pending") && (
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span>⏳</span>
              <span>Pending Ownership Verifications ({claimRequests.filter((c) => c.status === "Pending").length})</span>
            </div>
            {claimRequests
              .filter((c) => c.status === "Pending")
              .map((claim) => (
                <div
                  key={claim.id}
                  className="text-xs flex items-center justify-between bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-amber-500/20"
                >
                  <span className="font-bold">{claim.businessName}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800/40">
                    Verification In Progress
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Businesses List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-sm animate-pulse">
            Loading your registered businesses and customer leads...
          </div>
        ) : businesses.length === 0 ? (
          <div className="py-16 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <span className="text-4xl">🏢</span>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3">
              No registered businesses yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Claim an existing listing in our directory or contact us to verify your enterprise to start tracking views and receiving customer leads.
            </p>
            <div className="mt-5">
              <Link
                href="/directory"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20"
              >
                Browse Directory &amp; Claim Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((biz) => {
              const isExpanded = expandedBusinessId === biz.id;
              return (
                <div
                  key={biz.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm transition hover:border-emerald-500/40"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-xl shrink-0">
                        🏢
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {biz.businessName}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            Verified Owner ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {biz.category || "Business"} &bull; 📍 {biz.city || biz.district || "Assam"}
                        </p>
                      </div>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <span>👁️</span>
                        <span>{biz.viewsCount || 0} Views</span>
                      </div>

                      <button
                        onClick={() => setExpandedBusinessId(isExpanded ? null : biz.id)}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                          isExpanded
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100"
                        }`}
                      >
                        <span>📬</span>
                        <span>{biz.leadsCount || 0} Inquiries</span>
                        <span>{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingBusiness(biz)}
                        className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 transition flex items-center gap-1.5 cursor-pointer"
                        title="Edit business details for admin review"
                      >
                        <span>✏️</span>
                        <span>Edit Details</span>
                      </button>

                      <Link
                        href={`/listing/${biz.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${biz.id}`}
                        target="_blank"
                        className="px-3.5 py-1.5 rounded-2xl bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
                      >
                        Public Listing ↗
                      </Link>
                    </div>
                  </div>

                  {/* Expandable Leads Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Customer Inquiries &amp; Leads ({biz.leads?.length || 0})
                        </h4>
                        <span className="text-[10px] text-slate-400">Direct inquiries from directory visitors</span>
                      </div>

                      {biz.leads && biz.leads.length > 0 ? (
                        <div className="space-y-2">
                          {biz.leads.map((lead: any) => (
                            <div
                              key={lead.id}
                              className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {lead.name || "Interested Customer"}
                                  </span>
                                  {lead.timestamp && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {lead.timestamp}
                                    </span>
                                  )}
                                </div>
                                {lead.notes && (
                                  <p className="text-slate-600 dark:text-slate-300 italic">
                                    &ldquo;{lead.notes}&rdquo;
                                  </p>
                                )}
                              </div>

                              {lead.mobile && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={`tel:${lead.mobile}`}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                  >
                                    <span>📞</span>
                                    <span>{lead.mobile}</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/91${lead.mobile.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition border border-emerald-500/40"
                                  >
                                    WhatsApp
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                          No inquiries received yet. When visitors click &ldquo;Contact Business&rdquo;, their details will appear here.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Listing Modal */}
        {editingBusiness && (
          <EditListingModal
            business={editingBusiness}
            isOpen={!!editingBusiness}
            onClose={() => setEditingBusiness(null)}
          />
        )}
      </div>
    </div>
  );
}
