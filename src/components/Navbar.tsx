"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import RankBadge from "@/components/profile/RankBadge";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isTransparentNav =
    pathname === "/" ||
    pathname.startsWith("/directory") ||
    pathname.startsWith("/listing") ||
    pathname.startsWith("/news") ||
    pathname.startsWith("/culture") ||
    pathname.startsWith("/wildlife") ||
    pathname.startsWith("/adventure");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMe();
  }, []);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`absolute top-0 left-0 right-0 z-50 px-4 py-4 transition-all duration-200 ${
          isTransparentNav
            ? "bg-black/25 backdrop-blur-[2px] border-b border-white/10"
            : "bg-stone-900/95 backdrop-blur-md border-b border-stone-800 shadow-md"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight hover:opacity-95 transition">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 12l-10-5 10 5 10-5v7l-10 5z" />
              </svg>
            </span>
            <span className="font-extrabold text-white">
              North East Connect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <Link href="/directory" className="text-white/90 hover:text-white font-medium transition">
              Directory
            </Link>
            <Link href="/news" className="text-white/90 hover:text-white font-medium transition">
              News
            </Link>
            <Link href="/culture" className="text-white/90 hover:text-white font-medium transition">
              Culture
            </Link>
            <Link href="/wildlife" className="text-white/90 hover:text-white font-medium transition">
              Wildlife
            </Link>
            <Link href="/adventure" className="text-white/90 hover:text-white font-medium transition">
              Adventure
            </Link>
            <Link href="/marketplace" className="text-white/90 hover:text-white font-medium transition">
              Marketplace
            </Link>
            <Link href="/community" className="text-white/90 hover:text-white font-medium transition">
              Community
            </Link>
          </div>

          {/* User Account / Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 transition-all cursor-pointer text-white text-xs"
                >
                  <img
                    src={
                      currentUser.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                    }
                    alt={currentUser.username}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                  />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold max-w-[100px] truncate">{currentUser.fullName || currentUser.username}</span>
                    <span className="text-[10px] text-emerald-300 font-semibold">{currentUser.rankTier}</span>
                  </div>
                  <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-sm text-gray-900">{currentUser.fullName || currentUser.username}</p>
                      <p className="text-xs text-gray-500 font-mono">@{currentUser.username}</p>
                      <div className="mt-2">
                        <RankBadge rankTier={currentUser.rankTier} xpPoints={currentUser.xpPoints} size="sm" />
                      </div>
                      {currentUser.rankProgress && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>XP: {currentUser.xpPoints}</span>
                            <span>Next: {currentUser.rankProgress.nextRank?.tier || "Max"}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                              style={{ width: `${currentUser.rankProgress.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href={`/profile/${currentUser.username}`}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <span>👤</span> My Profile & Wall
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <span>⚙️</span> Edit Profile & State
                      </Link>
                      <Link
                        href="/community"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                      >
                        <span>🌿</span> Community Feed
                      </Link>

                      <Link
                        href="/marketplace/my-ads"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
                      >
                        <span>🛒</span> My Marketplace Ads
                      </Link>
                      <Link
                        href="/leaderboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                      >
                        <span>🏆</span> Leaderboard & Ranks
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <span>🚪</span> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white hover:text-emerald-200 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthTab("register");
                    setAuthModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Join (+20 XP)
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
            aria-label="Open menu"
            type="button"
          >
            <span className="block w-6 h-0.5 bg-white my-1" />
            <span className="block w-6 h-0.5 bg-white my-1" />
            <span className="block w-6 h-0.5 bg-white my-1" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center transition-opacity p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              aria-label="Close menu"
            >
              &times;
            </button>

            {currentUser ? (
              <div className="mb-5 pb-4 border-b border-gray-100 text-center">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500 mb-2"
                />
                <h4 className="font-bold text-gray-900">{currentUser.fullName || currentUser.username}</h4>
                <p className="text-xs text-gray-400 font-mono">@{currentUser.username}</p>
                <div className="mt-2 flex justify-center">
                  <RankBadge rankTier={currentUser.rankTier} xpPoints={currentUser.xpPoints} size="sm" />
                </div>
              </div>
            ) : (
              <div className="mb-5 pb-4 border-b border-gray-100">
                <h4 className="font-bold text-gray-900 text-lg mb-1">North East Connect</h4>
                <p className="text-xs text-gray-500 mb-3">Join the social hub of Northeast India</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthTab("login");
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthTab("register");
                      setAuthModalOpen(true);
                    }}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                  >
                    Join Free
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Home
              </Link>
              <Link
                href="/directory"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Directory
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                News
              </Link>
              <Link
                href="/culture"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Culture
              </Link>
              <Link
                href="/wildlife"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Wildlife
              </Link>
              <Link
                href="/adventure"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Adventure
              </Link>
              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Marketplace
              </Link>
              <Link
                href="/community"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                Community
              </Link>

              {currentUser && (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <Link
                      href={`/profile/${currentUser.username}`}
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 flex items-center gap-2 mb-2"
                    >
                      <span>👤</span> My Profile
                    </Link>
                    <Link
                      href="/profile/edit"
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 px-4 bg-gray-50 text-gray-800 rounded-xl font-medium text-sm hover:bg-emerald-50 flex items-center gap-2 mb-2"
                    >
                      <span>⚙️</span> Edit Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2.5 px-4 bg-red-50 text-red-700 rounded-xl font-medium text-sm text-left flex items-center gap-2"
                    >
                      <span>🚪</span> Log Out
                    </button>
                  </div>
                </>
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
