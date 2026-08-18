"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RankBadge from "@/components/profile/RankBadge";
import { RANKS } from "@/lib/ranks";

const NE_STATES = [
  "All States",
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("All States");

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedState]);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const query = selectedState !== "All States" ? `?state=${encodeURIComponent(selectedState)}` : "";
      const res = await fetch(`/api/leaderboard${query}`);
      const data = await res.json();
      if (data.status === "success") {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error("Failed to load leaderboard", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 pt-24 pb-20 px-4">
      {/* Header Banner */}
      <div className="container mx-auto max-w-5xl mb-10">
        <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-emerald-800 border border-amber-500/20 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-xl text-white">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3.5 py-1 bg-white/20 text-amber-100 text-xs font-semibold rounded-full border border-white/30 backdrop-blur">
              🏆 Community Leaderboard & Ranks
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-3 tracking-tight">
              Northeast Explorer Ranks
            </h1>
            <p className="text-xs md:text-sm text-stone-200 mt-2 leading-relaxed">
              Earn Explorer XP by commenting on listings, sharing travel recommendations, reviewing directory businesses, and connecting with friends.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 text-9xl opacity-15 select-none pointer-events-none">
            👑
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl space-y-12">
        {/* The 7-Tier Ranking System Showcase */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>⭐</span> Explorer Ranking Tiers
            </h2>
            <span className="text-xs text-gray-500 font-medium">7 Regional Levels</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {RANKS.map((r) => (
              <div
                key={r.tier}
                className="bg-white border border-gray-200/90 p-4.5 rounded-2xl flex flex-col justify-between hover:shadow-md transition shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400">Level {r.level}</span>
                    <RankBadge rankTier={r.tier} xpPoints={r.minXp} size="sm" showLevel={false} />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{r.tier}</h3>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{r.description}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] font-mono text-emerald-700 font-semibold">
                  {r.maxXp === null ? `${r.minXp}+ XP` : `${r.minXp} – ${r.maxXp} XP`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Explorers Table */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🏅</span> Top Community Explorers
              </h2>
              <p className="text-xs text-gray-500">Ranked by total activity points</p>
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-800 outline-none focus:border-amber-500 shadow-sm font-medium"
            >
              {NE_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading rankings...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-16 text-gray-500 text-xs">
                No users found for this filter yet. Be the first to join and take #1!
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {leaderboard.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Position Badge */}
                      <div className="flex-shrink-0 w-8 text-center font-extrabold text-sm">
                        {user.position === 1 ? (
                          <span className="text-2xl">🥇</span>
                        ) : user.position === 2 ? (
                          <span className="text-2xl">🥈</span>
                        ) : user.position === 3 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          <span className="text-gray-400 font-mono">#{user.position}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Link href={`/profile/${user.username}`}>
                        <img
                          src={
                            user.profileImageUrl ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`
                          }
                          alt={user.username}
                          className="w-12 h-12 rounded-2xl object-cover border border-gray-200 bg-gray-50 hover:scale-105 transition"
                        />
                      </Link>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/profile/${user.username}`}
                            className="font-bold text-sm text-gray-900 hover:text-emerald-700 transition truncate"
                          >
                            {user.fullName || user.username}
                          </Link>
                          <RankBadge
                            rankTier={user.rankTier}
                            xpPoints={user.xpPoints}
                            size="sm"
                            showLevel={true}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="font-mono text-gray-400">@{user.username}</span>
                          {user.state && (
                            <>
                              <span>•</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-700">
                                📍 {user.state}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats & XP */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-extrabold text-amber-600 font-mono">
                        {user.xpPoints || 0} XP
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {user._count?.comments || 0} thoughts shared
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
