"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

export default function MobileAppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
    // If on homepage or community, focus composer or scroll to top
    if (pathname === "/" || pathname === "/community") {
      const composer = document.getElementById("community-composer");
      if (composer) {
        composer.scrollIntoView({ behavior: "smooth", block: "center" });
        const input = composer.querySelector("textarea");
        if (input) input.focus();
        return;
      }
    }
    router.push("/community");
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-lg border-t border-stone-800/90 text-white shadow-2xl px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Feed / Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isFeed
                ? "text-emerald-400 font-bold scale-105"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <span className="text-xl leading-none mb-1">🌿</span>
            <span className="text-[10px] tracking-tight">Community</span>
          </Link>

          {/* 2. Explore Hub */}
          <Link
            href="/directory"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isExplore
                ? "text-emerald-400 font-bold scale-105"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <span className="text-xl leading-none mb-1">🧭</span>
            <span className="text-[10px] tracking-tight">Explore</span>
          </Link>

          {/* 3. Center Create Post Action Button */}
          <button
            onClick={handleCreatePostClick}
            type="button"
            className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
            aria-label="Create Post"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 border-2 border-stone-900 group-active:scale-95 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[9px] text-emerald-300 font-bold mt-0.5">Post</span>
          </button>

          {/* 4. News & Marketplace */}
          <Link
            href="/news"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isNewsMarket
                ? "text-emerald-400 font-bold scale-105"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <span className="text-xl leading-none mb-1">📰</span>
            <span className="text-[10px] tracking-tight">News</span>
          </Link>

          {/* 5. Profile / Account */}
          {currentUser ? (
            <Link
              href={`/profile/${currentUser.username}`}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isProfile
                  ? "text-emerald-400 font-bold scale-105"
                  : "text-stone-400 hover:text-white font-medium"
              }`}
            >
              <div className="relative mb-1">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className={`w-5 h-5 rounded-full object-cover border ${
                    isProfile ? "border-emerald-400" : "border-stone-600"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-stone-900"></span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">Profile</span>
            </Link>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              type="button"
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all text-stone-400 hover:text-white font-medium cursor-pointer"
            >
              <span className="text-xl leading-none mb-1">👤</span>
              <span className="text-[10px] tracking-tight">Sign In</span>
            </button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchSessionAndAlerts()}
      />
    </>
  );
}
