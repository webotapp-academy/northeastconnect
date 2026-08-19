"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface MarketplaceItem {
  id: number;
  title: string;
  category: string;
  price: string | null;
  state: string;
  city: string;
  sellerName: string;
  sellerPhone: string | null;
  status: string;
  featured: boolean;
  imageUrls: string | null;
  createdAt: string;
  user: { username: string; email: string };
}

export default function AdminMarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [page, category, status]);

  async function loadData() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        category,
        status,
      });
      const res = await fetch(`/api/admin/marketplace?${params.toString()}`);
      const data = await res.json();
      if (data.status === "success") {
        setItems(data.items || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData();
  }

  async function toggleStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/marketplace/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.status === "success") {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFeatured(id: number, isFeatured: boolean) {
    try {
      const res = await fetch(`/api/admin/marketplace/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      const data = await res.json();
      if (data.status === "success") {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to permanently delete this ad listing?")) return;
    try {
      const res = await fetch(`/api/admin/marketplace/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Classifieds &amp; Ads ({total})
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Moderate Marketplace Ads
          </h1>
        </div>
        <Link
          href="/marketplace"
          target="_blank"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <span>🛒</span> Open Public Marketplace
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] flex gap-2">
          <input
            type="text"
            placeholder="Search ad title, seller, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          <option value="JOBS">Jobs</option>
          <option value="PROPERTIES">Properties</option>
          <option value="VEHICLES">Cars &amp; Vehicles</option>
          <option value="HANDLOOMS_CRAFTS">Handlooms &amp; Crafts</option>
          <option value="TEA_AGRO">Tea &amp; Agro</option>
          <option value="PETS_LIVESTOCK">Pets &amp; Livestock</option>
          <option value="ELECTRONICS">Mobiles &amp; Electronics</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Ads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Ad Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Seller / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Loading ads...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No marketplace ads found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  let mainImage = "";
                  if (item.imageUrls) {
                    try {
                      const parsed = JSON.parse(item.imageUrls);
                      if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
                      else if (typeof parsed === "string") mainImage = parsed;
                    } catch {
                      const split = item.imageUrls.split(",");
                      if (split[0]) mainImage = split[0].trim();
                    }
                  }

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">🛒</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs font-bold text-gray-900">
                        <Link
                          href={`/marketplace/${item.id}`}
                          target="_blank"
                          className="hover:text-emerald-700 transition line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Posted by @{item.user?.username} • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {item.price ? `₹${parseFloat(item.price).toLocaleString()}` : "Contact Seller"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{item.sellerName}</div>
                        <div className="text-[10px] text-gray-400">
                          {item.city}, {item.state}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : item.status === "SOLD"
                                ? "bg-gray-100 text-gray-700 border border-gray-300"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {item.status}
                          </span>
                          {item.featured && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-white">
                              ⭐ FEATURED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => toggleFeatured(item.id, item.featured)}
                          className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          {item.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() =>
                            toggleStatus(item.id, item.status === "ACTIVE" ? "SOLD" : "ACTIVE")
                          }
                          className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          {item.status === "ACTIVE" ? "Mark Sold" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 text-[10px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Page <span className="font-bold text-gray-900">{page}</span> of{" "}
              <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg font-medium transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg font-medium transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
