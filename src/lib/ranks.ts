export interface RankInfo {
  tier: string;
  minXp: number;
  maxXp: number | null;
  level: number;
  color: string;
  badgeBg: string;
  textColor: string;
  iconName: string;
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    tier: "Explorer Novice",
    minXp: 0,
    maxXp: 99,
    level: 1,
    color: "from-stone-400 to-stone-600",
    badgeBg: "bg-stone-100 text-stone-700 border-stone-300",
    textColor: "text-stone-700",
    iconName: "Compass",
    description: "Starting their journey across the Northeast.",
  },
  {
    tier: "Hill Wanderer",
    minXp: 100,
    maxXp: 299,
    level: 2,
    color: "from-emerald-500 to-teal-700",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-300",
    textColor: "text-emerald-700",
    iconName: "Mountain",
    description: "Roaming the misty peaks and lush valleys.",
  },
  {
    tier: "Valley Chronicler",
    minXp: 300,
    maxXp: 699,
    level: 3,
    color: "from-cyan-500 to-blue-700",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-300",
    textColor: "text-cyan-700",
    iconName: "Feather",
    description: "Documenting cultural stories and regional secrets.",
  },
  {
    tier: "Regional Scout",
    minXp: 700,
    maxXp: 1499,
    level: 4,
    color: "from-blue-600 to-indigo-800",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-300",
    textColor: "text-blue-700",
    iconName: "MapPin",
    description: "An experienced voice uncovering gems across the 8 states.",
  },
  {
    tier: "Northeast Envoy",
    minXp: 1500,
    maxXp: 2999,
    level: 5,
    color: "from-purple-500 to-violet-800",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-300",
    textColor: "text-purple-700",
    iconName: "Crown",
    description: "A trusted regional ambassador and community leader.",
  },
  {
    tier: "Heritage Guardian",
    minXp: 3000,
    maxXp: 5999,
    level: 6,
    color: "from-amber-500 to-orange-700",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
    textColor: "text-amber-700",
    iconName: "Shield",
    description: "A stalwart champion of Northeast indigenous heritage.",
  },
  {
    tier: "Northeast Legend",
    minXp: 6000,
    maxXp: null,
    level: 7,
    color: "from-rose-500 via-purple-600 to-amber-500",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-400 ring-1 ring-rose-400",
    textColor: "text-rose-700",
    iconName: "Sparkles",
    description: "Legendary contributor who embodies the spirit of the Northeast.",
  },
];

export function getRankFromXp(xp: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRankProgress(xp: number) {
  const currentRank = getRankFromXp(xp);
  if (currentRank.maxXp === null) {
    return {
      currentRank,
      nextRank: null,
      progressPercent: 100,
      xpNeeded: 0,
      currentTierXp: xp - currentRank.minXp,
      tierSpan: 1,
    };
  }

  const nextRankIndex = RANKS.findIndex((r) => r.tier === currentRank.tier) + 1;
  const nextRank = RANKS[nextRankIndex] || null;
  const tierSpan = currentRank.maxXp - currentRank.minXp + 1;
  const currentTierXp = xp - currentRank.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentTierXp / tierSpan) * 100)));
  const xpNeeded = currentRank.maxXp + 1 - xp;

  return {
    currentRank,
    nextRank,
    progressPercent,
    xpNeeded,
    currentTierXp,
    tierSpan,
  };
}

export type ActionType =
  | "COMMENT"
  | "POST"
  | "REVIEW"
  | "LIKE_RECEIVED"
  | "FRIEND_ACCEPTED"
  | "PROFILE_COMPLETED"
  | "DAILY_LOGIN";

export const ACTION_XP_MAP: Record<ActionType, number> = {
  COMMENT: 10,
  POST: 20,
  REVIEW: 25,
  LIKE_RECEIVED: 5,
  FRIEND_ACCEPTED: 15,
  PROFILE_COMPLETED: 50,
  DAILY_LOGIN: 5,
};
