"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠", exact: true },
  { href: "/admin/directory", label: "Directory", icon: "📇" },
  { href: "/admin/news", label: "News", icon: "📰" },
  { href: "/admin/culture", label: "Culture", icon: "🎭" },
  { href: "/admin/adventure", label: "Adventure", icon: "🏔️" },
  { href: "/admin/wildlife", label: "Wildlife", icon: "🦏" },
  { href: "/admin/marketplace", label: "Marketplace", icon: "🛒" },
  { href: "/admin/users", label: "Users & Ranks", icon: "👥" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/leads", label: "Leads", icon: "📊" },
  { href: "/admin/page-views", label: "Page Views", icon: "👁️" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.user) {
          const role = (data.user.role || "").toLowerCase();
          if (role !== "admin" && role !== "superadmin") {
            router.replace("/login?error=unauthorized_role&redirect=/admin");
            return;
          }
          setCurrentUser(data.user);
          setLoading(false);
        } else {
          router.replace("/login?error=admin_required&redirect=/admin");
        }
      })
      .catch(() => {
        router.replace("/login?error=admin_required&redirect=/admin");
      });
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-gray-700">Verifying administrator credentials...</p>
        <p className="text-xs text-gray-400 mt-1">Please wait while we secure your session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-gray-800 flex flex-col font-sans">
      <div className="flex flex-1 min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar matching Legacy Panel */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-base">
              N
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm tracking-tight leading-none">
                North East Connect
              </div>
              <div className="text-[11px] text-gray-500 font-semibold tracking-wider uppercase mt-1">
                Admin Control
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-2xs"
            >
              <span>🌐</span> View Live Website
            </Link>
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
            >
              <span>🚪</span> Sign Out Admin
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3 flex-1">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="relative max-w-md w-full hidden sm:block">
                <input
                  type="search"
                  placeholder="Search admin records..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
              </div>
            </div>

            {/* Admin User Badge & Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              >
                <span>🚀</span> Live Site
              </Link>

              <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                  {currentUser?.username ? currentUser.username[0].toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {currentUser?.fullName || currentUser?.username || "Admin"}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{currentUser?.email || "admin@northeastconnect"}</div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="ml-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
