"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RankBadge from "@/components/profile/RankBadge";
import FriendActionButton from "@/components/profile/FriendActionButton";

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activity" | "friends" | "badges">("activity");

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading explorer profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 text-gray-900 flex items-center justify-center p-4 pt-24">
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">
            The explorer @{username} does not exist or may have changed their username.
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
  const rank = profile.rankInfo;
  const progress = profile.rankProgress;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-20 pb-16">
      {/* Cover Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 border-b border-gray-200 shadow-inner">
        {profile.coverImageUrl ? (
          <img
            src={profile.coverImageUrl}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800/80 via-teal-700/70 to-indigo-900/80" />
            <div className="relative z-10 text-white/20 font-black text-6xl md:text-8xl select-none tracking-widest uppercase">
              Northeast
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 max-w-5xl -mt-24 relative z-10">
        {/* Profile Header Card */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 md:p-8 shadow-md mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-20 flex-shrink-0">
              <img
                src={
                  profile.profileImageUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`
                }
                alt={profile.username}
                className="w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover border-4 border-white shadow-xl bg-gray-100"
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
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className="text-sm font-mono text-emerald-700 font-semibold mt-0.5">@{profile.username}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center md:justify-end gap-3">
                  {isOwnProfile ? (
                    <Link
                      href="/profile/edit"
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-300 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit Profile
                    </Link>
                  ) : (
                    <FriendActionButton
                      targetUserId={profile.id}
                      initialStatus={profile.friendshipStatus}
                      initialFriendshipId={profile.friendshipId}
                      onStatusChange={() => loadProfile()}
                    />
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-700 mt-3 leading-relaxed max-w-2xl">
                {profile.bio || "No bio yet. An avid explorer roaming Northeast India!"}
              </p>

              {/* Badges / Meta */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs text-gray-600">
                {profile.state && (
                  <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-gray-800 font-medium">
                    <span>📍</span> {profile.city ? `${profile.city}, ` : ""}
                    {profile.state}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 text-gray-800 font-medium">
                  <span>📅</span> Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
                  >
                    <span>🔗</span> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Rank & XP Progress Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">Current Rank:</span>
                <span className="text-emerald-700 font-bold">{rank.tier} (Level {rank.level})</span>
                <span className="text-gray-500">• {rank.description}</span>
              </div>
              <div className="font-mono text-gray-900 font-bold">
                {profile.xpPoints || 0} Total XP
              </div>
            </div>

            {progress && (
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${rank.color} transition-all duration-700`}
                    style={{ width: `${progress.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
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
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="text-xl md:text-2xl font-extrabold text-gray-900">{profile.friendsCount || 0}</div>
              <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Friends</div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="text-xl md:text-2xl font-extrabold text-gray-900">{profile.commentsCount || 0}</div>
              <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Comments</div>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <div className="text-xl md:text-2xl font-extrabold text-gray-900">{profile.postsCount || 0}</div>
              <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Posts</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("activity")}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "activity"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            💬 Recent Thoughts & Comments ({profile.commentsCount || 0})
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "friends"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            👥 Friends & Connections ({profile.friendsCount || 0})
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === "badges"
                ? "border-emerald-600 text-emerald-800"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            🏅 Explorer Badges
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            {/* Recent Comments */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>💬</span> Recent Thoughts &amp; Discussions
              </h3>
              {profile.recentComments && profile.recentComments.length > 0 ? (
                <div className="space-y-3">
                  {profile.recentComments.map((c: any) => (
                    <div
                      key={c.id}
                      className="bg-white border border-gray-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] border border-emerald-200">
                            {c.entityType || "Comment"}
                          </span>
                          <span className="font-semibold text-gray-700 truncate max-w-xs sm:max-w-md">
                            {c.entityTitle || `${c.entityType} #${c.entityId}`}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                        <span className="text-gray-500 font-medium">❤️ {c.likesCount || 0} Likes</span>
                        <Link
                          href={c.entityUrl || `/${c.entityType}/${c.entityId}`}
                          className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                        >
                          View Discussion <span>&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs shadow-sm">
                  No recent comments from this user yet.
                </div>
              )}
            </div>

            {/* Recent Community Posts */}
            {profile.recentPosts && profile.recentPosts.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📰</span> Community Posts
                </h3>
                <div className="space-y-3">
                  {profile.recentPosts.map((post: any) => (
                    <div
                      key={post.id}
                      className="bg-white border border-gray-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-md font-bold text-[10px] border border-teal-200">
                          {post.taggedLocation || "Community Post"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed mb-3">{post.content}</p>
                      {post.mediaUrls && (
                        <div className="mb-3 rounded-xl overflow-hidden max-h-60 border border-gray-100">
                          <img
                            src={
                              post.mediaUrls.startsWith("[")
                                ? JSON.parse(post.mediaUrls)[0]
                                : post.mediaUrls
                            }
                            alt="Post Attachment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 text-gray-500">
                        <span>❤️ {post.likesCount || 0} Likes • 💬 {post.commentsCount || 0} Comments</span>
                        <Link href="/community" className="text-emerald-700 hover:underline font-bold">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.friendsPreview && profile.friendsPreview.length > 0 ? (
              profile.friendsPreview.map((friend: any) => (
                <Link
                  key={friend.id}
                  href={`/profile/${friend.username}`}
                  className="bg-white border border-gray-200/90 p-4 rounded-2xl hover:border-emerald-500 hover:shadow-md transition flex items-center gap-3.5 shadow-sm"
                >
                  <img
                    src={
                      friend.profileImageUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.username}`
                    }
                    alt={friend.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-50"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{friend.fullName || friend.username}</h4>
                    <p className="text-xs text-gray-500 font-mono">@{friend.username}</p>
                    <div className="mt-1">
                      <RankBadge rankTier={friend.rankTier} size="sm" showLevel={false} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs shadow-sm">
                No connected friends yet. Send a friend request to start connecting!
              </div>
            )}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200/90 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="text-3xl p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">🌱</div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Explorer Novice</h4>
                <p className="text-xs text-gray-500 mt-0.5">Joined the North East Connect platform.</p>
                <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">✓ Unlocked</span>
              </div>
            </div>

            <div className={`bg-white border ${profile.commentsCount > 0 ? "border-gray-200/90" : "border-gray-200 opacity-60"} p-5 rounded-2xl flex items-center gap-4 shadow-sm`}>
              <div className="text-3xl p-3 bg-cyan-50 border border-cyan-200 rounded-2xl">💬</div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Active Voice</h4>
                <p className="text-xs text-gray-500 mt-0.5">Posted a comment on news, culture, or directory.</p>
                <span className="text-[11px] text-cyan-700 font-bold mt-1 inline-block">
                  {profile.commentsCount > 0 ? "✓ Unlocked" : "🔒 In Progress"}
                </span>
              </div>
            </div>

            <div className={`bg-white border ${profile.friendsCount > 0 ? "border-gray-200/90" : "border-gray-200 opacity-60"} p-5 rounded-2xl flex items-center gap-4 shadow-sm`}>
              <div className="text-3xl p-3 bg-purple-50 border border-purple-200 rounded-2xl">🤝</div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Social Connector</h4>
                <p className="text-xs text-gray-500 mt-0.5">Connected with fellow regional explorers.</p>
                <span className="text-[11px] text-purple-700 font-bold mt-1 inline-block">
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
