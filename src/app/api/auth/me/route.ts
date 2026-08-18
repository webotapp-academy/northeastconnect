import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextRankProgress } from "@/lib/gamification";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ status: "unauthenticated", user: null });
    }

    // Get unread notifications count
    const unreadNotificationsCount = await db.notification.count({
      where: { userId: user.id, isRead: false },
    });

    // Get pending received friend requests count
    const pendingFriendRequestsCount = await db.friendship.count({
      where: { receiverId: user.id, status: "PENDING" },
    });

    const rankProgress = getNextRankProgress(user.xpPoints || 0);

    return NextResponse.json({
      status: "success",
      user: {
        ...user,
        unreadNotificationsCount,
        pendingFriendRequestsCount,
        rankProgress,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch user session" },
      { status: 500 }
    );
  }
}
