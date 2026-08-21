import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { awardUserXp } from "@/lib/gamification";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ status: "error", message: "Invalid post ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Please sign in to repost" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const commentary = (body.commentary || "").trim();

    const originalPost = await db.communityPost.findUnique({
      where: { id: postId, status: "Active" },
      include: {
        user: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });

    if (!originalPost) {
      return NextResponse.json({ status: "error", message: "Original post not found" }, { status: 404 });
    }

    // Create the repost CommunityPost
    const newRepost = await db.communityPost.create({
      data: {
        userId: currentUser.id,
        content: commentary || `🔁 Reposted from @${originalPost.user.username}`,
        originalPostId: originalPost.id,
        taggedLocation: originalPost.taggedLocation || "n:all",
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
          },
        },
        originalPost: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                profileImageUrl: true,
                rankTier: true,
                xpPoints: true,
              },
            },
          },
        },
      },
    });

    // Increment repostsCount on original post
    await db.communityPost.update({
      where: { id: originalPost.id },
      data: {
        repostsCount: { increment: 1 },
      },
    });

    // Award XP to reposter and author
    await awardUserXp(currentUser.id, "COMMUNITY_REPOST");
    if (originalPost.userId !== currentUser.id) {
      await awardUserXp(originalPost.userId, "POST_WAS_REPOSTED");

      // Notify original author
      await db.notification.create({
        data: {
          userId: originalPost.userId,
          actorId: currentUser.id,
          type: "REPOST",
          title: "Post Reposted! 🔁",
          message: `@${currentUser.username} shared your thought to the community!`,
          linkUrl: `/community/${newRepost.id}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      status: "success",
      message: "Repost published to feed!",
      post: newRepost,
    });
  } catch (error: any) {
    console.error("Repost error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to repost thought" },
      { status: 500 }
    );
  }
}
