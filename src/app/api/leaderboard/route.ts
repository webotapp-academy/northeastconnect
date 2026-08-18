import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankFromXp, RANKS } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");

    const users = await db.user.findMany({
      where: {
        status: "Active",
        ...(state ? { state } : {}),
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
      take: 50,
    });

    const leaderboard = users.map((u, index) => ({
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
