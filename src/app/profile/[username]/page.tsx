"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RankBadge from "@/components/profile/RankBadge";
import FriendActionButton from "@/components/profile/FriendActionButton";
import PostMediaCarousel from "@/components/common/PostMediaCarousel";
import { renderRichPostContent } from "@/lib/postFormatting";
import PostLinkPreview from "@/components/common/PostLinkPreview";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "friends" | "badges">("activity");

  // Detailed friends state for own profile
  const [friendsData, setFriendsData] = useState<any>({
    friends: [],
    pendingIncoming: [],
    pendingOutgoing: [],
  });
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendActionLoadingId, setFriendActionLoadingId] = useState<number | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState("");

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  async function loadProfile() {
    try {
      setLoading(true);
      const [profileRes, meRes] = await Promise.all([
        fetch(`/api/users/${username}`),
        fetch("/api/auth/me"),
      ]);

      const profileData = await profileRes.json();
      const meData = await meRes.json();

      if (profileData.status === "success") {
        setProfile(profileData.user);
        if (profileData.user.friendshipStatus === "SELF") {
          loadFriendsList();
        }
      }
      if (meData.status === "success" && meData.user) {
        setCurrentUser(meData.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCoverPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setCoverUploadError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const uploadRes = await fetch("/api/upload?folder=profiles", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.status !== "success" || !uploadData.urls?.[0]) {
        throw new Error(uploadData.message || "Failed to upload image");
      }

      const newCoverUrl = uploadData.urls[0];

      // Save to profile
      const updateRes = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: newCoverUrl }),
      });

      const updateData = await updateRes.json();
      if (updateData.status === "success") {
        setProfile((prev: any) => ({ ...prev, coverImageUrl: newCoverUrl }));
      } else {
        throw new Error(updateData.message || "Failed to update profile cover");
      }
    } catch (err: any) {
      setCoverUploadError(err.message || "Error uploading cover photo");
    } finally {
      setUploadingCover(false);
    }
  }

  async function loadFriendsList() {
    try {
      setFriendsLoading(true);
      const res = await fetch("/api/friends");
      const data = await res.json();
      if (data.status === "success") {
        setFriendsData({
          friends: data.friends || [],
          pendingIncoming: data.pendingIncoming || [],
          pendingOutgoing: data.pendingOutgoing || [],
        });
      }
    } catch (err) {
      console.error("Failed to load friends list:", err);
    } finally {
      setFriendsLoading(false);
    }
  }

  async function handleAcceptFriendRequest(friendshipId: number) {
    try {
      setFriendActionLoadingId(friendshipId);
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACCEPT" }),
      });
      const data = await res.json();
      if (data.status === "success") {
        loadFriendsList();
        loadProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFriendActionLoadingId(null);
    }
  }

  async function handleDeclineOrCancelFriendRequest(friendshipId: number) {
    try {
      setFriendActionLoadingId(friendshipId);
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "success") {
        loadFriendsList();
        loadProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFriendActionLoadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex items-center justify-center pt-24">
        <div className="text-center max-w-sm p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <span className="text-4xl mb-3 block">👤</span>
          <h2 className="text-lg font-bold mb-2">User Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            The profile you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/community"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            Go to Community
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = profile.friendshipStatus === "SELF";
  const isFriend = profile.friendshipStatus === "ACCEPTED";
  const rank = profile.rankInfo;
  const progress = profile.rankProgress;
  const pendingIncomingCount = friendsData.pendingIncoming?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-16 sm:pt-20 pb-16 transition-colors font-sans">
      {/* Cover Banner */}
      <div className="relative h-56 sm:h-72 md:h-88 w-full overflow-hidden bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 shadow-md group">
        {profile.coverImageUrl ? (
          <>
            <img
              src={profile.coverImageUrl}
              alt="Profile Cover"
              className="w-full h-full object-cover"
            />
            {/* Subtle atmospheric vignette so badges and avatar stand out crisply */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30 pointer-events-none" />
          </>
        ) : (
          /* High-Aesthetic Default Northeast Himalayan Landscape Artwork */
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#06201b] via-[#091e36] to-[#1a103c]">
            {/* Glowing Aurora Orbs */}
            <div className="absolute -top-16 -left-16 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
            <div className="absolute top-1/4 right-10 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-8 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Delicate Starlight & Sky Grid */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                backgroundSize: "28px 28px",
              }}
            />

            {/* Mountain Skyline Silhouette Vector */}
            <svg
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              preserveAspectRatio="none"
              viewBox="0 0 1440 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Distant Mountain Peak Layer */}
              <path
                d="M0 240 L160 160 L320 230 L480 130 L640 220 L800 110 L980 210 L1140 140 L1300 220 L1440 170 L1440 360 L0 360 Z"
                fill="url(#distantMountainGrad)"
                opacity="0.35"
              />
              {/* Mid-range Ridge Layer */}
              <path
                d="M0 260 L200 190 L380 250 L560 170 L740 240 L920 180 L1100 230 L1280 190 L1440 240 L1440 360 L0 360 Z"
                fill="url(#midMountainGrad)"
                opacity="0.55"
              />
              {/* Foreground Pine & Hill Contours */}
              <path
                d="M0 290 Q120 260 260 280 T540 270 T820 285 T1120 265 T1440 280 L1440 360 L0 360 Z"
                fill="url(#foreMountainGrad)"
                opacity="0.85"
              />

              <defs>
                <linearGradient id="distantMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#064e3b" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="midMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="foreMountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#047857" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#06121e" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing Moon / Crest Silhouette */}
            <div className="absolute top-6 left-8 sm:top-10 sm:left-14 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-emerald-950/40">
                🏔️
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow-xs block">
                  Eastern Himalayas
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white/90 drop-shadow-xs tracking-tight">
                  North East Explorer
                </span>
              </div>
            </div>

            {/* Atmospheric subtle location pill if present */}
            {(profile.state || profile.city) && (
              <div className="hidden sm:flex items-center gap-1.5 absolute top-10 right-14 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/15 rounded-full text-[11px] font-bold text-slate-200">
                <span className="text-emerald-400">📍</span>
                <span>{profile.city ? `${profile.city}, ` : ""}{profile.state}</span>
              </div>
            )}
          </div>
        )}

        {/* Owner Quick Upload / Change Cover Action */}
        {isOwnProfile && (
          <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20">
            <label className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-2xl border border-white/20 shadow-lg cursor-pointer transition flex items-center gap-1.5 active:scale-95">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                disabled={uploadingCover}
                className="hidden"
              />
              <span>{uploadingCover ? "⏳" : "📷"}</span>
              <span>{uploadingCover ? "Uploading..." : profile.coverImageUrl ? "Change Cover" : "Add Cover Photo"}</span>
            </label>
          </div>
        )}

        {/* Error toast if upload fails */}
        {coverUploadError && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-rose-600/90 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-xl z-20">
            {coverUploadError}
          </div>
        )}

        {/* Clean bottom fade into card */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50/90 dark:from-[#090d16]/90 to-transparent pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-3.5 sm:px-4 max-w-5xl -mt-16 sm:-mt-24 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="relative -mt-14 sm:-mt-20 flex-shrink-0">
              <img
                src={
                  profile.profileImageUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`
                }
                alt={profile.username}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-2xl bg-slate-100 dark:bg-slate-800"
              />
              <div className="absolute -bottom-2 -right-2">
                <RankBadge
                  rankTier={profile.rankTier}
                  xpPoints={profile.xpPoints}
                  size="sm"
                  showLevel={true}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                    @{profile.username}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap pt-2 md:pt-0">
                  {isOwnProfile ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                        title="Go to full Member Dashboard"
                      >
                        <span>📊</span>
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/profile/my-businesses"
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-50 dark:bg-emerald-600/15 hover:bg-emerald-100 dark:hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition flex items-center gap-1.5 shadow-xs"
                        title="View customer leads & business traffic"
                      >
                        <span>🏢</span>
                        <span>My Businesses</span>
                      </Link>
                      <Link
                        href="/marketplace/my-ads"
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-600/15 hover:bg-indigo-100 dark:hover:bg-indigo-600/25 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-500/30 transition flex items-center gap-1.5 shadow-xs"
                        title="View marketplace buyer leads & active ads"
                      >
                        <span>🛍️</span>
                        <span>My Ads</span>
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-xs"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Profile
                      </Link>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FriendActionButton
                        targetUserId={profile.id}
                        initialStatus={profile.friendshipStatus}
                        initialFriendshipId={profile.friendshipId}
                        onStatusChange={() => loadProfile()}
                      />

                      {isFriend && (
                        <button
                          onClick={() => {
                            // Scroll to bottom or notify user
                            alert(`You are connected with @${profile.username}! Use the Messenger icon on the top bar to message them anytime.`);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>💬</span>
                          <span>Message</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Location / Date Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3.5 text-xs text-slate-500 dark:text-slate-400">
                {(profile.city || profile.state) && (
                  <span className="flex items-center gap-1 font-medium">
                    <span>📍</span>
                    <span>{[profile.city, profile.state].filter(Boolean).join(", ")}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 font-medium">
                  <span>📅</span>
                  <span>
                    Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </span>
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    <span>🌐</span> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Gamification XP Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 -mx-5 sm:-mx-7 md:-mx-8 -mb-5 sm:-mb-7 md:-mb-8 p-5 sm:p-7 md:p-8 rounded-b-3xl transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">{rank.tier}</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{rank.perk}</span>
              </div>
              <div className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                {profile.xpPoints || 0} Total XP
              </div>
            </div>

            {progress && (
              <div className="space-y-1.5">
                <div className="w-full h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${rank.color} transition-all duration-700`}
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>{progress.progressPercent}% towards next rank</span>
                  <span>
                    {progress.nextRank
                      ? `${progress.xpNeeded} XP needed for ${progress.nextRank.tier}`
                      : "Maximum Rank Achieved! 👑"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100">{profile.friendsCount || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Friends</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100">{profile.commentsCount || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Comments</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100">{profile.postsCount || 0}</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Posts</div>
            </div>
          </div>
        </div>

        {/* Modern Mobile-Friendly Pill Tab Navigation */}
        <div className="bg-slate-200/80 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-300/80 dark:border-slate-800 mb-6 flex items-center justify-between gap-1 shadow-inner select-none">
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
              activeTab === "activity"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-800/40"
            }`}
          >
            <span>💬</span>
            <span className="truncate">Activity</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === "activity" ? "bg-white/20 text-white" : "bg-slate-300/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {profile.commentsCount || 0}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("friends");
              if (isOwnProfile) loadFriendsList();
            }}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
              activeTab === "friends"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-800/40"
            }`}
          >
            <span>👥</span>
            <span className="truncate">Friends</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === "friends" ? "bg-white/20 text-white" : "bg-slate-300/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              {profile.friendsCount || 0}
            </span>
            {isOwnProfile && pendingIncomingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full animate-bounce">
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
              activeTab === "badges"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/40 dark:hover:bg-slate-800/40"
            }`}
          >
            <span>🏅</span>
            <span className="truncate">Badges</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Recent Comments */}
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <span>💬</span> Recent Thoughts &amp; Discussions
              </h3>
              {profile.recentComments && profile.recentComments.length > 0 ? (
                <div className="space-y-3">
                  {profile.recentComments.map((c: any) => (
                    <div
                      key={c.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] border border-emerald-200 dark:border-emerald-800/60">
                            {c.entityType || "Comment"}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                            {c.entityTitle || `${c.entityType} #${c.entityId}`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">❤️ {c.likesCount || 0} Likes</span>
                        <Link
                          href={c.entityUrl || `/${c.entityType}/${c.entityId}`}
                          className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                        >
                          View Discussion <span>&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                  No recent comments from this user yet.
                </div>
              )}
            </div>

            {/* Recent Community Posts */}
            {profile.recentPosts && profile.recentPosts.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <span>📰</span> Community Posts
                </h3>
                <div className="space-y-3">
                  {profile.recentPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span className="bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 px-2.5 py-0.5 rounded-md font-bold text-[10px] border border-teal-200 dark:border-teal-800/60">
                          {post.taggedLocation || "Community Post"}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed mb-3 whitespace-pre-wrap">
                        {renderRichPostContent(post.content)}
                      </div>
                      <PostLinkPreview content={post.content} />
                      {post.mediaUrls && (
                        <div className="mb-3">
                          <PostMediaCarousel mediaUrls={post.mediaUrls} />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <span>❤️ {post.likesCount || 0} Likes • 💬 {post.commentsCount || 0} Comments</span>
                        <Link href="/community" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                          Join Discussion &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div className="space-y-6 sm:space-y-8">
            {isOwnProfile ? (
              <>
                {/* 1. Pending Incoming Requests */}
                {friendsData.pendingIncoming && friendsData.pendingIncoming.length > 0 && (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👋</span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                          Pending Friend Requests ({friendsData.pendingIncoming.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                        Action Required
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {friendsData.pendingIncoming.map((req: any) => (
                        <div
                          key={req.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Link href={`/profile/${req.sender.username}`}>
                              <img
                                src={
                                  req.sender.profileImageUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${req.sender.username}`
                                }
                                alt={req.sender.username}
                                className="w-12 h-12 rounded-2xl object-cover border border-emerald-500 bg-slate-100 dark:bg-slate-800"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/profile/${req.sender.username}`}
                                className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate block"
                              >
                                {req.sender.fullName || req.sender.username}
                              </Link>
                              <p className="text-[11px] text-slate-500 font-mono">@{req.sender.username}</p>
                              <div className="mt-1">
                                <RankBadge rankTier={req.sender.rankTier} size="sm" showLevel={false} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleAcceptFriendRequest(req.id)}
                              disabled={friendActionLoadingId === req.id}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {friendActionLoadingId === req.id ? "..." : "Accept"}
                            </button>
                            <button
                              onClick={() => handleDeclineOrCancelFriendRequest(req.id)}
                              disabled={friendActionLoadingId === req.id}
                              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Pending Outgoing Requests */}
                {friendsData.pendingOutgoing && friendsData.pendingOutgoing.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <span>📤</span> Sent Friend Requests ({friendsData.pendingOutgoing.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {friendsData.pendingOutgoing.map((req: any) => (
                        <div
                          key={req.id}
                          className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Link href={`/profile/${req.receiver.username}`}>
                              <img
                                src={
                                  req.receiver.profileImageUrl ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${req.receiver.username}`
                                }
                                alt={req.receiver.username}
                                className="w-10 h-10 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/profile/${req.receiver.username}`}
                                className="font-extrabold text-xs text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 truncate block"
                              >
                                {req.receiver.fullName || req.receiver.username}
                              </Link>
                              <p className="text-[10px] text-slate-500 font-mono">@{req.receiver.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeclineOrCancelFriendRequest(req.id)}
                            disabled={friendActionLoadingId === req.id}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-300 dark:border-slate-700 rounded-lg transition cursor-pointer disabled:opacity-50"
                            title="Cancel request"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Connected Friends */}
                <div>
                  <h3 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <span>👥</span> All Connected Friends ({friendsData.friends?.length || 0})
                  </h3>
                  {friendsData.friends && friendsData.friends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {friendsData.friends.map((f: any) => (
                        <div
                          key={f.friendshipId}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition flex items-center justify-between gap-3 shadow-xs"
                        >
                          <Link
                            href={`/profile/${f.user.username}`}
                            className="flex items-center gap-3 min-w-0 flex-1"
                          >
                            <img
                              src={
                                f.user.profileImageUrl ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${f.user.username}`
                              }
                              alt={f.user.username}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                                {f.user.fullName || f.user.username}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono">@{f.user.username}</p>
                              <div className="mt-1">
                                <RankBadge rankTier={f.user.rankTier} size="sm" showLevel={false} />
                              </div>
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Remove @${f.user.username} from friends?`)) {
                                handleDeclineOrCancelFriendRequest(f.friendshipId);
                              }
                            }}
                            title="Unfriend"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                      No connected friends yet. Explore the community feed to send friend requests!
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Other User's Profile Friends Preview
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {profile.friendsPreview && profile.friendsPreview.length > 0 ? (
                  profile.friendsPreview.map((friend: any) => (
                    <Link
                      key={friend.id}
                      href={`/profile/${friend.username}`}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-emerald-500 hover:shadow-md transition flex items-center gap-3 shadow-xs"
                    >
                      <img
                        src={
                          friend.profileImageUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`
                        }
                        alt={friend.username}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {friend.fullName || friend.username}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">@{friend.username}</p>
                        <div className="mt-1">
                          <RankBadge rankTier={friend.rankTier} size="sm" showLevel={false} />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                    No connected friends yet. Send a friend request to connect!
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="text-3xl p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl shrink-0">
                🌱
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Explorer Novice</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Joined the North East Connect platform.</p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">✓ Unlocked</span>
              </div>
            </div>

            <div className={`bg-white dark:bg-slate-900 border ${profile.commentsCount > 0 ? "border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-60"} p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-sm`}>
              <div className="text-3xl p-3 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/60 rounded-2xl shrink-0">
                💬
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Active Voice</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Posted a comment on news, culture, or directory.</p>
                <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mt-1 inline-block">
                  {profile.commentsCount > 0 ? "✓ Unlocked" : "🔒 In Progress"}
                </span>
              </div>
            </div>

            <div className={`bg-white dark:bg-slate-900 border ${profile.friendsCount > 0 ? "border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 opacity-60"} p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-sm`}>
              <div className="text-3xl p-3 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 rounded-2xl shrink-0">
                🤝
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">Social Connector</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Connected with fellow regional explorers.</p>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1 inline-block">
                  {profile.friendsCount > 0 ? "✓ Unlocked" : "🔒 In Progress"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
