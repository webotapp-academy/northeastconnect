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

  const isFeed = pathname === "/" || pathname === "/community";
  const isExplore =
    pathname.startsWith("/directory") ||
    pathname.startsWith("/culture") ||
    pathname.startsWith("/wildlife") ||
    pathname.startsWith("/adventure") ||
    pathname.startsWith("/search");
  const isNewsMarket =
    pathname.startsWith("/news") || pathname.startsWith("/marketplace");
  const isProfile =
    (currentUser && pathname.startsWith(`/profile/${currentUser.username}`)) ||
    pathname === "/profile/edit";

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white shadow-2xl px-0.5 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] transition-colors"
      >
        <div className="grid grid-cols-5 items-center justify-items-center w-full mx-auto">
          {/* 1. Community / Feed */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full py-0.5 text-center transition-all ${
              isFeed
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
            }`}
          >
            <span className="text-lg leading-none mb-0.5">👥</span>
            <span className="text-[9px] leading-tight tracking-tight whitespace-nowrap">Community</span>
          </Link>

          {/* 2. Explore Hub */}
          <Link
            href="/directory"
            className={`flex flex-col items-center justify-center w-full py-0.5 text-center transition-all ${
              isExplore
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
            }`}
          >
            <span className="text-lg leading-none mb-0.5">🧭</span>
            <span className="text-[9px] leading-tight tracking-tight whitespace-nowrap">Explore</span>
          </Link>

          {/* 3. Center Create Post Action Button (Exact Mathematical Center) */}
          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={handleCreatePostClick}
              type="button"
              className="flex flex-col items-center justify-center -mt-4 cursor-pointer group"
              aria-label="Create Post"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 border-2 border-white dark:border-slate-900 group-active:scale-95 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[9px] leading-tight text-emerald-600 dark:text-emerald-300 font-bold mt-0.5">Post</span>
            </button>
          </div>

          {/* 4. News & Marketplace */}
          <Link
            href="/news"
            className={`flex flex-col items-center justify-center w-full py-0.5 text-center transition-all ${
              isNewsMarket
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
            }`}
          >
            <span className="text-lg leading-none mb-0.5">📰</span>
            <span className="text-[9px] leading-tight tracking-tight whitespace-nowrap">News</span>
          </Link>

          {/* 5. Profile / Account */}
          {currentUser ? (
            <Link
              href={`/profile/${currentUser.username}`}
              className={`flex flex-col items-center justify-center w-full py-0.5 text-center transition-all relative ${
                isProfile
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
              }`}
            >
              <div className="relative mb-0.5 flex items-center justify-center">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className={`w-5 h-5 rounded-full object-cover border ${
                    isProfile ? "border-emerald-500" : "border-slate-300 dark:border-slate-700"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
                )}
              </div>
              <span className="text-[9px] leading-tight tracking-tight whitespace-nowrap">Profile</span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              type="button"
              className="flex flex-col items-center justify-center w-full py-0.5 text-center transition-all text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium cursor-pointer"
            >
              <span className="text-lg leading-none mb-0.5">👤</span>
              <span className="text-[9px] leading-tight tracking-tight whitespace-nowrap">Sign In</span>
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
