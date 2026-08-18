import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp, getRankFromXp } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, friends
    const state = searchParams.get("state");

    const currentUser = await getCurrentUser();

    let userIdsFilter: number[] | undefined = undefined;

    if (filter === "friends" && currentUser) {
      const friendships = await db.friendship.findMany({
        where: {
          OR: [
            { senderId: currentUser.id, status: "ACCEPTED" },
            { receiverId: currentUser.id, status: "ACCEPTED" },
          ],
        },
      });

      const friendIds = friendships.map((f) => (f.senderId === currentUser.id ? f.receiverId : f.senderId));
      userIdsFilter = [currentUser.id, ...friendIds];
    }

    const posts = await db.communityPost.findMany({
      where: {
        status: "Active",
        ...(userIdsFilter ? { userId: { in: userIdsFilter } } : {}),
        ...(state ? { user: { state } } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            state: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const formatted = posts.map((p) => ({
      ...p,
      user: {
        ...p.user,
        rankInfo: getRankFromXp(p.user.xpPoints || 0),
      },
    }));

    return NextResponse.json({
      status: "success",
      posts: formatted,
    });
  } catch (error: any) {
    console.error("Community posts GET error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to share a post." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, mediaUrls, taggedLocation, taggedEntityType, taggedEntityId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { status: "error", message: "Post content cannot be empty." },
        { status: 400 }
      );
    }

    const post = await db.communityPost.create({
      data: {
        userId: currentUser.id,
        content: content.trim(),
        mediaUrls: mediaUrls?.trim() || null,
        taggedLocation: taggedLocation?.trim() || null,
        taggedEntityType: taggedEntityType || null,
        taggedEntityId: taggedEntityId ? parseInt(taggedEntityId, 10) : null,
        status: "Active",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            state: true,
            city: true,
          },
        },
      },
    });

    // Award +20 XP
    await awardUserXp(currentUser.id, "POST", 20, "Shared a community post");

    return NextResponse.json({
      status: "success",
      message: "Post published! (+20 XP)",
      post: {
        ...post,
        user: {
          ...post.user,
          rankInfo: getRankFromXp(post.user.xpPoints || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Community post create error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
