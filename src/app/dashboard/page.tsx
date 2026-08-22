"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RankBadge from "@/components/profile/RankBadge";
import InviteFriendsModal from "@/components/profile/InviteFriendsModal";

export default function UserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      setLoading(true);
      const [meRes, statsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/dashboard/stats"),
      ]);

      const meData = await meRes.json();
      const statsData = await statsRes.json();

      if (meData.status === "success" && meData.user) {
        setCurrentUser(meData.user);
      } else {
        router.push("/login?redirect=/dashboard");
        return;
      }

      if (statsData.status === "success" && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch {
      router.push("/login?redirect=/dashboard");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.fullName || currentUser.username;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-20 sm:pt-24 pb-20 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* ======================================================================= */}
        {/* 1. HERO PROFILE SUMMARY BANNER                                          */}
        {/* ======================================================================= */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-indigo-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {/* Avatar with Ring */}
              <div className="relative shrink-0">
                <img
                  src={
                    currentUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.username}`
                  }
                  alt={currentUser.username}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/40 shadow-xl bg-slate-800"
                />
                {currentUser.isVerified && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 text-xs shadow-xs" title="Verified Member">
                    ✓
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{displayName}</h1>
                  <span className="text-xs text-emerald-400 font-mono font-bold">@{currentUser.username}</span>
                </div>

                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <RankBadge
                    rankTier={currentUser.rankTier}
                    xpPoints={currentUser.xpPoints}
                    size="sm"
                    showLevel={true}
                  />
                  {currentUser.state && (
                    <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-xs rounded-full text-[11px] font-bold text-slate-200">
                      📍 {currentUser.city ? `${currentUser.city}, ` : ""}{currentUser.state}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300/80 mt-2">
                  Member since {new Date(currentUser.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" })} • {stats?.friendsCount || 0} Explorer Connections
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center shrink-0">
              <Link
                href={`/profile/${currentUser.username}`}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition backdrop-blur-xs border border-white/20 active:scale-95"
              >
                👤 View Public Profile
              </Link>
              <Link
                href="/profile/edit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
              >
                ⚙️ Account Settings
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. SUMMARY METRIC PILLS                                                  */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {/* Jobs Metric */}
          <Link
            href="/jobs/my-jobs"
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💼</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {stats?.jobApplicationsCount || 0} Leads
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats?.jobsCount || 0}
            </p>
            <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 transition">
              Jobs Posted &rarr;
            </p>
          </Link>

          {/* Properties Metric */}
          <Link
            href="/properties/my-properties"
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏡</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {stats?.propertyInquiriesCount || 0} Inquiries
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats?.propertiesCount || 0}
            </p>
            <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 transition">
              Properties Listed &rarr;
            </p>
          </Link>

          {/* Businesses Metric */}
          <Link
            href="/profile/my-businesses"
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏢</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {stats?.businessLeadsCount || 0} Calls
              </span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats?.businessesCount || 0}
            </p>
            <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 transition">
              Businesses Claimed &rarr;
            </p>
          </Link>

          {/* Marketplace Metric */}
          <Link
            href="/marketplace/my-ads"
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛍️</span>
              <span className="text-xs font-bold text-slate-400">Classifieds</span>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {stats?.marketplaceAdsCount || 0}
            </p>
            <p className="text-[11px] font-bold text-slate-500 group-hover:text-emerald-600 transition">
              Marketplace Ads &rarr;
            </p>
          </Link>
        </div>

        {/* ======================================================================= */}
        {/* 3. CATEGORIZED SERVICE HUBS                                             */}
        {/* ======================================================================= */}
        <div className="space-y-6 sm:space-y-8">
          {/* A. Jobs & Employer Hub */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl">
                  💼
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Jobs &amp; Employer Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Post vacancies, manage candidates, and explore job opportunities in Northeast India.
                  </p>
                </div>
              </div>
              <Link
                href="/jobs/post"
                className="hidden sm:inline-flex px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                ➕ Post New Job
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/jobs/my-jobs"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">👥</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Employer Hub (View Candidates)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Review applicant profiles, resumes, and update hiring statuses.
                </p>
              </Link>

              <Link
                href="/jobs/post"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">➕</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Post a Job Opening
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create a new vacancy listing across Assam &amp; Northeast states.
                </p>
              </Link>

              <Link
                href="/jobs"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">🔍</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Browse &amp; Apply for Jobs
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Filter jobs by sector, state, full-time, part-time, or remote.
                </p>
              </Link>
            </div>
          </div>

          {/* B. Properties & Real Estate Hub */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xl">
                  🏡
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Properties &amp; Real Estate Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Post properties, manage buyer site visit leads, and browse plots, villas, flats &amp; rentals.
                  </p>
                </div>
              </div>
              <Link
                href="/properties/post"
                className="hidden sm:inline-flex px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                ➕ Post Property Free
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/properties/my-properties"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">📋</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  My Properties &amp; Buyer Leads
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage your real estate listings and respond to buyer inquiries.
                </p>
              </Link>

              <Link
                href="/properties/post"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">➕</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  Post a Property (Free)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  List plots, villas, apartments, commercial spaces, or PG rentals.
                </p>
              </Link>

              <Link
                href="/properties"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">🔑</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  Browse Properties (Buy/Rent)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Explore thousands of verified properties across Northeast India.
                </p>
              </Link>
            </div>
          </div>

          {/* C. Business Directory & Marketplace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Directory Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl">
                    🏢
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Verified Directory Hub
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Promote your business, homestay, clinic, store or agency.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Link
                    href="/profile/my-businesses"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 transition"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      📊 My Businesses &amp; Customer Leads
                    </span>
                    <span className="text-xs text-amber-600 font-bold">&rarr;</span>
                  </Link>
                  <Link
                    href="/directory"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 transition"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      🔍 Explore All Northeast Businesses
                    </span>
                    <span className="text-xs text-amber-600 font-bold">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Marketplace Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-xl">
                    🛍️
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Marketplace &amp; Classifieds
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Buy and sell electronics, cars, furniture, handicrafts &amp; gadgets.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Link
                    href="/marketplace/my-ads"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      📋 My Marketplace Ads &amp; Inquiries
                    </span>
                    <span className="text-xs text-purple-600 font-bold">&rarr;</span>
                  </Link>
                  <Link
                    href="/marketplace/new"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ➕ Post a Free Classified Ad
                    </span>
                    <span className="text-xs text-purple-600 font-bold">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* D. Community, Social & Rewards Hub */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl">
                  🌱
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Community, Social &amp; Gamification
                  </h2>
                  <p className="text-xs text-slate-500">
                    Connect with fellow explorers, earn badges, join regional addas, and invite friends.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left transition cursor-pointer hover:shadow-xs group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">✉️</span>
                  <span className="text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded-full font-bold">+50 XP</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                  Invite Friends
                </h3>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Share your referral link and level up your Explorer Rank.
                </p>
              </button>

              <Link
                href="/create-community"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">🏛️</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Create Adda / Hub
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Launch a new town, city, or district discussion space.
                </p>
              </Link>

              <Link
                href="/leaderboard"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">🏆</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Explorer Leaderboard
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  See top ranked contributors across Northeast India.
                </p>
              </Link>

              <Link
                href="/community?tab=users"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/60 transition group"
              >
                <span className="text-xl mb-1.5 block">👥</span>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                  Discover People
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Find and connect with fellow regional creators &amp; guides.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <InviteFriendsModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
