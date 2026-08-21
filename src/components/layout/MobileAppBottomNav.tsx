"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import CreatePostModal from "@/components/community/CreatePostModal";

export default function MobileAppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);

  // Hide bottom nav on admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    fetchSessionAndAlerts();
    const interval = setInterval(fetchSessionAndAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchSessionAndAlerts() {
    try {
      const [meRes, notifRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/notifications"),
      ]);
      const meData = await meRes.json();
      const notifData = await notifRes.json();

      if (meData.status === "success" && meData.user) {
        setCurrentUser(meData.user);
      } else {
        setCurrentUser(null);
      }

      if (notifData.status === "success") {
        setUnreadCount(notifData.unreadCount || 0);
      }
    } catch {
      // Ignore background errors
    }
  }

  function handleCreatePostClick() {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCreatePostModalOpen(true);
  }

  const isHome = pathname === "/";
  const isCommunity = pathname?.startsWith("/community");
  const isNews = pathname?.startsWith("/news");
  const isProfile =
    (currentUser && pathname.startsWith(`/profile/${currentUser.username}`)) ||
    pathname === "/profile/edit";

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-white shadow-2xl px-1 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="grid grid-cols-5 items-center justify-items-center w-full mx-auto">
          {/* 1. Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-all group ${
              isHome
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium"
            }`}
          >
            <div className="relative">
              <svg
                className="w-5 h-5 mb-0.5 transition-transform group-active:scale-90"
                viewBox="0 0 24 24"
                fill={isHome ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isHome ? "1.5" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10.5L12 3l9 7.5" />
                <path d="M5 9v11a1 1 0 001 1h12a1 1 0 001-1V9" />
                <path d="M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
              </svg>
            </div>
            <span className="text-[10px] leading-none tracking-tight whitespace-nowrap">Home</span>
          </Link>

          {/* 2. Community */}
          <Link
            href="/community"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-all group ${
              isCommunity
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium"
            }`}
          >
            <div className="relative">
              <svg
                className="w-5 h-5 mb-0.5 transition-transform group-active:scale-90"
                viewBox="0 0 24 24"
                fill={isCommunity ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isCommunity ? "1.5" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <span className="text-[10px] leading-none tracking-tight whitespace-nowrap">Community</span>
          </Link>

          {/* 3. Center Plus Button */}
          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={handleCreatePostClick}
              type="button"
              className="flex flex-col items-center justify-center -mt-4 cursor-pointer group"
              aria-label="Create Post"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-white dark:border-[#0b0e14] group-active:scale-90 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.8} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[9px] leading-tight text-emerald-600 dark:text-emerald-400 font-black mt-0.5">Post</span>
            </button>
          </div>

          {/* 4. News */}
          <Link
            href="/news"
            className={`flex flex-col items-center justify-center w-full py-1 text-center transition-all group ${
              isNews
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium"
            }`}
          >
            <div className="relative">
              <svg
                className="w-5 h-5 mb-0.5 transition-transform group-active:scale-90"
                viewBox="0 0 24 24"
                fill={isNews ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isNews ? "1.5" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m4 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h8M7 8h5" />
              </svg>
            </div>
            <span className="text-[10px] leading-none tracking-tight whitespace-nowrap">News</span>
          </Link>

          {/* 5. Profile / Account */}
          {currentUser ? (
            <Link
              href={`/profile/${currentUser.username}`}
              className={`flex flex-col items-center justify-center w-full py-1 text-center transition-all relative group ${
                isProfile
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <div className="relative mb-0.5 flex items-center justify-center">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className={`w-5 h-5 rounded-full object-cover transition-transform group-active:scale-90 ${
                    isProfile
                      ? "ring-2 ring-emerald-500 border border-white dark:border-slate-900"
                      : "border border-slate-300 dark:border-slate-700"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] leading-none tracking-tight whitespace-nowrap">Profile</span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              type="button"
              className="flex flex-col items-center justify-center w-full py-1 text-center transition-all text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium cursor-pointer group"
            >
              <svg
                className="w-5 h-5 mb-0.5 transition-transform group-active:scale-90"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[10px] leading-none tracking-tight whitespace-nowrap">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchSessionAndAlerts()}
      />

      <CreatePostModal
        currentUser={currentUser}
        isOpen={createPostModalOpen}
        onClose={() => setCreatePostModalOpen(false)}
        onPostCreated={() => {
          if (pathname === "/" || pathname === "/community") {
            router.refresh();
          } else {
            router.push("/community");
          }
        }}
      />
    </>
  );
}
