"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import RankBadge from "@/components/profile/RankBadge";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import ThemeToggle from "@/components/theme/ThemeToggle";

const NAV_ITEMS = [
  { label: "Community", href: "/", exact: true },
  { label: "Directory", href: "/directory" },
  { label: "News", href: "/news" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Culture", href: "/culture" },
  { label: "Wildlife", href: "/wildlife" },
  { label: "Adventure", href: "/adventure" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        if (!navSearchQuery.trim()) {
          setSearchExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navSearchQuery]);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setProfileDropdownOpen(false);
      window.location.href = "/";
    } catch {
      window.location.reload();
    }
  }

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  function handleNavSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      router.push(`/search?term=${encodeURIComponent(navSearchQuery.trim())}`);
      setSearchExpanded(false);
    }
  }

  const isNavActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === "/" || pathname === "/community";
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-6">
          {/* 1. Brand Logo (Unique Typography Wordmark) */}
          <Link
            href="/"
            className="flex items-center shrink-0 group select-none py-1"
            style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}
          >
            <span className="font-black text-lg sm:text-2xl tracking-[-0.04em] text-slate-900 dark:text-white transition-transform group-hover:scale-[1.02] whitespace-nowrap">
              NorthEast<span className="text-emerald-500 font-black ml-0.5">Connect</span>
            </span>
          </Link>

          {/* 3. Right Action Items: Expandable Search, Theme Toggle, Auth & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Expandable In-Place Search Input */}
            <div ref={searchContainerRef} className="relative flex items-center">
              {searchExpanded ? (
                <form
                  onSubmit={handleNavSearchSubmit}
                  className="flex items-center bg-slate-100 dark:bg-slate-800/90 border border-emerald-500 dark:border-emerald-500 rounded-full pl-2.5 pr-2 py-0.5 sm:py-1 shadow-sm transition-all duration-300 w-36 sm:w-64 md:w-72 animate-in fade-in zoom-in-95 duration-200"
                >
                  <svg
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchExpanded(false);
                      }
                    }}
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (navSearchQuery) {
                        setNavSearchQuery("");
                      } else {
                        setSearchExpanded(false);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer shrink-0"
                  aria-label="Expand Search"
                  title="Search"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Theme Toggle (System / Light / Dark) */}
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <NotificationDropdown
                  currentUser={currentUser}
                  onNotificationUpdate={fetchMe}
                />

                {/* Profile Pill */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-0.5 sm:p-1 pr-1.5 sm:pr-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-300 dark:border-slate-700/80 shrink-0"
                  >
                    <img
                      src={
                        currentUser.profileImageUrl ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                      }
                      alt={currentUser.username}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <span className="hidden sm:inline-block text-xs font-medium text-slate-800 dark:text-slate-200 max-w-[80px] truncate">
                      {currentUser.fullName || currentUser.username}
                    </span>
                    <svg
                      className="w-3 h-3 text-slate-500 dark:text-slate-400 hidden sm:inline-block"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {currentUser.fullName || currentUser.username}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          @{currentUser.username}
                        </p>
                        <div className="mt-1.5">
                          <RankBadge
                            rankTier={currentUser.rankTier}
                            xpPoints={currentUser.xpPoints}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`/profile/${currentUser.username}`}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          Profile & Wall
                        </Link>
                        <Link
                          href="/profile/edit"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          Account Settings
                        </Link>
                        <Link
                          href="/marketplace/my-ads"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          My Listings
                        </Link>
                        <Link
                          href="/leaderboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                        >
                          Leaderboard
                        </Link>

                        {((currentUser.role || "").toLowerCase() === "admin" ||
                          (currentUser.role || "").toLowerCase() === "superadmin") && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-y border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-full transition cursor-pointer whitespace-nowrap"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setAuthTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1 sm:p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              aria-label="Open menu"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[1000] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 text-xl font-medium focus:outline-none w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
              aria-label="Close menu"
            >
              &times;
            </button>

            {currentUser ? (
              <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                    {currentUser.fullName || currentUser.username}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">@{currentUser.username}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h4
                  className="font-black text-slate-900 dark:text-slate-100 text-xl mb-1 tracking-[-0.04em]"
                  style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}
                >
                  NorthEast<span className="text-emerald-500 font-black ml-0.5">Connect</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Discover and connect across Northeast India
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthTab("login");
                      setAuthModalOpen(true);
                    }}
                    className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition border border-slate-300 dark:border-slate-700/60"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthTab("register");
                      setAuthModalOpen(true);
                    }}
                    className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                    isNavActive(item)
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {currentUser && (
                <div className="pt-2 mt-2 border-t border-slate-800 space-y-0.5">
                  <Link
                    href={`/profile/${currentUser.username}`}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 px-3 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-medium flex items-center justify-between"
                  >
                    <span>Profile & Wall</span>
                    <span className="text-[10px] text-slate-500">View</span>
                  </Link>
                  <Link
                    href="/profile/edit"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 px-3 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-medium block"
                  >
                    Account Settings
                  </Link>
                  {((currentUser.role || "").toLowerCase() === "admin" ||
                    (currentUser.role || "").toLowerCase() === "superadmin") && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="py-2 px-3 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-xl text-xs font-semibold block"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2 px-3 text-rose-400 hover:bg-rose-950/30 rounded-xl text-xs font-medium text-left cursor-pointer transition"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          fetchMe();
        }}
      />
    </>
  );
}


