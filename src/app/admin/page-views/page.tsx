"use client";

import React, { useState, useEffect } from "react";

interface PageViewItem {
  id: number;
  pageName: string;
  views: number | null;
  lastViewed: string | null;
}

export default function AdminPageViewsPage() {
  const [items, setItems] = useState<PageViewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/page-views")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setItems(data.items || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = items.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Site Traffic Analytics
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Page Views &amp; Popular Destinations
          </h1>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="text-xs text-gray-500 font-medium">Total Views Tracked</div>
          <div className="text-xl font-black text-gray-900 font-mono">
            {totalViews.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Page Views Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Page / Route Name</th>
                <th className="py-3 px-4">Total Page Views</th>
                <th className="py-3 px-4">Traffic Share</th>
                <th className="py-3 px-4 text-right">Last Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Loading analytics data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No page view data recorded yet.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const share = totalViews > 0 ? (((item.views || 0) / totalViews) * 100).toFixed(1) : "0";
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                        #{index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 font-mono text-xs">
                        {item.pageName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-emerald-800 text-sm">
                        {(item.views || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-gray-500">{share}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-400 text-[11px]">
                        {item.lastViewed
                          ? new Date(item.lastViewed).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
