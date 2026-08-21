import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp, getRankFromXp } from "@/lib/gamification";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityIdParam = searchParams.get("entityId");

    if (!entityType || !entityIdParam) {
      return NextResponse.json(
        { status: "error", message: "entityType and entityId are required query parameters." },
        { status: 400 }
      );
    }

    const entityId = parseInt(entityIdParam, 10);
    if (isNaN(entityId)) {
      return NextResponse.json({ status: "error", message: "Invalid entityId" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();

    // Fetch top-level comments and replies
    const comments = await db.universalComment.findMany({
      where: {
        entityType,
        entityId,
        parentId: null, // top-level only
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
          },
        },
        likes: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true },
            }
          : false,
        replies: {
          where: { status: "Active" },
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
              },
            },
            likes: currentUser
              ? {
                  where: { userId: currentUser.id },
                  select: { id: true },
                }
              : false,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format comments with rank details and hasLiked
    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      likesCount: c.likesCount,
      isLiked: c.likes && c.likes.length > 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      user: {
        ...c.user,
        rankInfo: getRankFromXp(c.user.xpPoints || 0),
      },
      replies: (c.replies || []).map((r) => ({
        id: r.id,
        content: r.content,
        likesCount: r.likesCount,
        isLiked: r.likes && r.likes.length > 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          ...r.user,
          rankInfo: getRankFromXp(r.user.xpPoints || 0),
        },
      })),
    }));

    const totalCount = await db.universalComment.count({
      where: { entityType, entityId, status: "Active" },
    });

    return NextResponse.json({
      status: "success",
      comments: formatted,
      totalCount,
    });
  } catch (error: any) {
    console.error("Comments GET error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to join the conversation." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { entityType, entityId, parentId, content, entityTitle, entityUrl } = body;

    if (!entityType || !entityId || !content?.trim()) {
      return NextResponse.json(
        { status: "error", message: "entityType, entityId, and comment content are required." },
        { status: 400 }
      );
    }

    const numericEntityId = parseInt(entityId, 10);
    const numericParentId = parentId ? parseInt(parentId, 10) : null;

    // Create the comment
    const comment = await db.universalComment.create({
      data: {
        entityType,
        entityId: numericEntityId,
        userId: currentUser.id,
        parentId: numericParentId,
        content: content.trim(),
        likesCount: 0,
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
          },
        },
      },
    });

    // Award +10 XP for contributing
    await awardUserXp(
      currentUser.id,
      "COMMENT",
      10,
      `Commented on ${entityType} #${entityId}`
    );

    // If this is a reply to another comment, notify the parent comment's author
    if (numericParentId) {
      const parentComment = await db.universalComment.findUnique({
        where: { id: numericParentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== currentUser.id) {
        await db.notification.create({
          data: {
            userId: parentComment.userId,
            actorId: currentUser.id,
            type: "COMMENT_REPLY",
            title: "New Reply to Your Comment 💬",
            message: `@${currentUser.username} replied: "${content.trim().slice(0, 75)}..."`,
            linkUrl: entityUrl || (entityType === "post" ? `/#post-${numericEntityId}` : `/${entityType}/${numericEntityId}`),
          },
        });
      }
    } else if (entityType === "post") {
      // Increment commentsCount on the community post directly
      await db.communityPost.update({
        where: { id: numericEntityId },
        data: { commentsCount: { increment: 1 } },
      }).catch(() => {});

      // If commenting on a community post, notify the author of the post
      const post = await db.communityPost.findUnique({
        where: { id: numericEntityId },
        select: { userId: true },
      });

      if (post && post.userId !== currentUser.id) {
        await db.notification.create({
          data: {
            userId: post.userId,
            actorId: currentUser.id,
            type: "POST_COMMENT",
            title: "New Comment on Your Post 💬",
            message: `@${currentUser.username} commented on your post: "${content.trim().slice(0, 75)}..."`,
            linkUrl: `/community/${numericEntityId}`,
          },
        });
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Comment posted! (+10 XP)",
      comment: {
        ...comment,
        isLiked: false,
        replies: [],
        user: {
          ...comment.user,
          rankInfo: getRankFromXp(comment.user.xpPoints || 0),
        },
      },
    });
  } catch (error: any) {
    console.error("Comments POST error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
