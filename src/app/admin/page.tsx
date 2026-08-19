"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  metrics: {
    directoryCount: number;
    newsCount: number;
    cultureCount: number;
    adventureCount: number;
    wildlifeCount: number;
    marketplaceCount: number;
    usersCount: number;
    commentsCount: number;
    leadsCount: number;
    totalPageViews: number;
  };
  recent: {
    directory: any[];
    news: any[];
    leads: any[];
    comments: any[];
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") {
          setData(json);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading admin dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    directoryCount: 0,
    newsCount: 0,
    cultureCount: 0,
    adventureCount: 0,
    wildlifeCount: 0,
    marketplaceCount: 0,
    usersCount: 0,
    commentsCount: 0,
    leadsCount: 0,
    totalPageViews: 0,
  };

  const recent = data?.recent || { directory: [], news: [], leads: [], comments: [] };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Overview Control
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Welcome back! Here is the live status of the North East Connect portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/news"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            + Post News
          </Link>
          <Link
            href="/admin/directory"
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-semibold rounded-xl shadow-xs transition"
          >
            + Add Listing
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Directory Card */}
        <Link
          href="/admin/directory"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Directory</span>
            <span className="text-base group-hover:scale-110 transition-transform">📇</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.directoryCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Verified businesses</div>
        </Link>

        {/* News Card */}
        <Link
          href="/admin/news"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-blue-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">News Stories</span>
            <span className="text-base group-hover:scale-110 transition-transform">📰</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.newsCount}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Published articles</div>
        </Link>

        {/* Culture Card */}
        <Link
          href="/admin/culture"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-purple-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Culture &amp; Sites</span>
            <span className="text-base group-hover:scale-110 transition-transform">🎭</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.cultureCount}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Festivals &amp; traditions</div>
        </Link>

        {/* Adventure & Wildlife */}
        <Link
          href="/admin/wildlife"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-teal-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Parks &amp; Treks</span>
            <span className="text-base group-hover:scale-110 transition-transform">🦏</span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics.wildlifeCount + metrics.adventureCount}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">
            {metrics.wildlifeCount} wildlife • {metrics.adventureCount} adventure
          </div>
        </Link>

        {/* Marketplace */}
        <Link
          href="/admin/marketplace"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-amber-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Marketplace</span>
            <span className="text-base group-hover:scale-110 transition-transform">🛒</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.marketplaceCount}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Active classifieds</div>
        </Link>

        {/* Registered Users */}
        <Link
          href="/admin/users"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-indigo-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Registered Users</span>
            <span className="text-base group-hover:scale-110 transition-transform">👥</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.usersCount}</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">Community members</div>
        </Link>

        {/* Comments & Discussion */}
        <Link
          href="/admin/comments"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Universal Comments</span>
            <span className="text-base group-hover:scale-110 transition-transform">💬</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.commentsCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">User discussions</div>
        </Link>

        {/* Leads */}
        <Link
          href="/admin/leads"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-rose-500 transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Customer Leads</span>
            <span className="text-base group-hover:scale-110 transition-transform">📊</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.leadsCount}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">Inbound inquiries</div>
        </Link>

        {/* Page Views */}
        <Link
          href="/admin/page-views"
          className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-cyan-500 transition group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-semibold">Page Views</span>
            <span className="text-base group-hover:scale-110 transition-transform">👁️</span>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics.totalPageViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-600 font-semibold mt-1">Cumulative views</div>
        </Link>
      </div>

      {/* Two-Column Tables (matching Legacy Admin) */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Directory Listings */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Directory Listings</h2>
              <p className="text-xs text-gray-500">Newly registered local businesses</p>
            </div>
            <Link
              href="/admin/directory"
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-y border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Business</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.directory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3 font-semibold text-gray-900 truncate max-w-[150px]">
                      {item.businessName}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{item.category || "—"}</td>
                    <td className="py-3 px-3 text-gray-500">{item.district || "—"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent News Articles */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent News Stories</h2>
              <p className="text-xs text-gray-500">Latest published editorial posts</p>
            </div>
            <Link
              href="/admin/news"
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-y border-gray-100">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3 font-semibold text-gray-900 truncate max-w-[150px]">
                      {item.title}
                    </td>
                    <td className="py-3 px-3 text-gray-600">{item.category || "General"}</td>
                    <td className="py-3 px-3 text-gray-500">{item.author || "Editor"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {item.status || "Published"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts (matching Legacy Panel) */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <Link
            href="/admin/news"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">✍️</span>
            <span>Write News</span>
          </Link>
          <Link
            href="/admin/directory"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">🏢</span>
            <span>Add Business</span>
          </Link>
          <Link
            href="/admin/culture"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">🎭</span>
            <span>New Culture</span>
          </Link>
          <Link
            href="/admin/adventure"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">🏔️</span>
            <span>Add Trek</span>
          </Link>
          <Link
            href="/admin/wildlife"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">🦏</span>
            <span>Wildlife Park</span>
          </Link>
          <Link
            href="/admin/marketplace"
            className="p-3 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 rounded-xl text-xs font-semibold text-center transition flex flex-col items-center gap-1.5"
          >
            <span className="text-xl">🛡️</span>
            <span>Moderate Ads</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
