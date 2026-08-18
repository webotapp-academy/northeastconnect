import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextRankProgress, getRankFromXp } from "@/lib/gamification";

export async function GET(
  request: Request,
  props: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await props.params;
    const cleanUsername = decodeURIComponent(username).toLowerCase().trim();

    const targetUser = await db.user.findUnique({
      where: { username: cleanUsername },
      select: {
        id: true,
        username: true,
        fullName: true,
        profileImageUrl: true,
        coverImageUrl: true,
        bio: true,
        state: true,
        city: true,
        role: true,
        xpPoints: true,
        rankTier: true,
        badges: true,
        websiteUrl: true,
        socialLinks: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();

    // Determine relationship status between viewer and target user
    let friendshipStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "SELF" = "NONE";
    let friendshipId: number | null = null;

    if (currentUser) {
      if (currentUser.id === targetUser.id) {
        friendshipStatus = "SELF";
      } else {
        const friendship = await db.friendship.findFirst({
          where: {
            OR: [
              { senderId: currentUser.id, receiverId: targetUser.id },
              { senderId: targetUser.id, receiverId: currentUser.id },
            ],
          },
        });

        if (friendship) {
          friendshipId = friendship.id;
          if (friendship.status === "ACCEPTED") {
            friendshipStatus = "ACCEPTED";
          } else if (friendship.senderId === currentUser.id) {
            friendshipStatus = "PENDING_SENT";
          } else {
            friendshipStatus = "PENDING_RECEIVED";
          }
        }
      }
    }

    // Count friends
    const friendsCount = await db.friendship.count({
      where: {
        OR: [
          { senderId: targetUser.id, status: "ACCEPTED" },
          { receiverId: targetUser.id, status: "ACCEPTED" },
        ],
      },
    });

    // Count comments & posts
    const commentsCount = await db.universalComment.count({
      where: { userId: targetUser.id, status: "Active" },
    });

    const postsCount = await db.communityPost.count({
      where: { userId: targetUser.id, status: "Active" },
    });

    // Get recent activity
    const recentComments = await db.universalComment.findMany({
      where: { userId: targetUser.id, status: "Active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        entityType: true,
        entityId: true,
        content: true,
        likesCount: true,
        createdAt: true,
      },
    });

    // Get recent friends list preview (up to 6)
    const acceptedFriendships = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: targetUser.id, status: "ACCEPTED" },
          { receiverId: targetUser.id, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true },
        },
        receiver: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true },
        },
      },
      take: 6,
    });

    const friendsPreview = acceptedFriendships.map((f) => {
      const friend = f.senderId === targetUser.id ? f.receiver : f.sender;
      return friend;
    });

    const rankInfo = getRankFromXp(targetUser.xpPoints || 0);
    const rankProgress = getNextRankProgress(targetUser.xpPoints || 0);

    return NextResponse.json({
      status: "success",
      user: {
        ...targetUser,
        rankInfo,
        rankProgress,
        friendsCount,
        commentsCount,
        postsCount,
        friendshipStatus,
        friendshipId,
        friendsPreview,
        recentComments,
      },
    });
  } catch (error: any) {
    console.error("User profile fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
