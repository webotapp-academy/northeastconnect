import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankFromXp, RANKS } from "@/lib/gamification";

// Fisher-Yates shuffle with configurable randomness ratio (60% shuffle)
function shuffleArray<T>(array: T[], randomRatio = 0.6): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    if (Math.random() < randomRatio) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }
  return result;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");

    const users = await db.user.findMany({
      where: {
        status: "Active",
        ...(state && state !== "All States" ? { state } : {}),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        profileImageUrl: true,
        state: true,
        city: true,
        xpPoints: true,
        rankTier: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            communityPosts: true,
          },
        },
      },
      orderBy: { xpPoints: "desc" },
      take: 60,
    });

    // Group users by XP level and shuffle matching peers with 60% probability for fresh community discovery
    const xpGroups: Record<number, typeof users> = {};
    for (const u of users) {
      const xp = u.xpPoints || 0;
      if (!xpGroups[xp]) xpGroups[xp] = [];
      xpGroups[xp].push(u);
    }

    const sortedXpKeys = Object.keys(xpGroups)
      .map(Number)
      .sort((a, b) => b - a);

    const reorderedUsers: typeof users = [];
    for (const xp of sortedXpKeys) {
      const group = xpGroups[xp];
      if (group.length > 1) {
        reorderedUsers.push(...shuffleArray(group, 0.6));
      } else {
        reorderedUsers.push(...group);
      }
    }

    const leaderboard = reorderedUsers.map((u, index) => ({
      position: index + 1,
      ...u,
      rankInfo: getRankFromXp(u.xpPoints || 0),
    }));

    return NextResponse.json({
      status: "success",
      leaderboard,
      ranksOverview: RANKS,
    });
  } catch (error: any) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
