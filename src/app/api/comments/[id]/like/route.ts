import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp } from "@/lib/gamification";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await props.params;
    const commentId = parseInt(id, 10);

    if (isNaN(commentId)) {
      return NextResponse.json({ status: "error", message: "Invalid comment ID" }, { status: 400 });
    }

    const comment = await db.universalComment.findUnique({
      where: { id: commentId },
      include: { user: { select: { id: true, username: true } } },
    });

    if (!comment) {
      return NextResponse.json({ status: "error", message: "Comment not found" }, { status: 404 });
    }

    // Check if user already liked this comment
    const existingLike = await db.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: currentUser.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.commentLike.delete({
        where: { id: existingLike.id },
      });

      const updated = await db.universalComment.update({
        where: { id: commentId },
        data: {
          likesCount: { decrement: 1 },
        },
        select: { id: true, likesCount: true },
      });

      return NextResponse.json({
        status: "success",
        isLiked: false,
        likesCount: Math.max(0, updated.likesCount),
      });
    } else {
      // Like
      await db.commentLike.create({
        data: {
          commentId,
          userId: currentUser.id,
        },
      });

      const updated = await db.universalComment.update({
        where: { id: commentId },
        data: {
          likesCount: { increment: 1 },
        },
        select: { id: true, likesCount: true },
      });

      // Award +5 XP to the comment author if it's not self-like
      if (comment.userId !== currentUser.id) {
        await awardUserXp(comment.userId, "LIKE_RECEIVED", 5, `Comment liked by @${currentUser.username}`);

        await db.notification.create({
          data: {
            userId: comment.userId,
            actorId: currentUser.id,
            type: "COMMENT_LIKE",
            title: "Someone liked your comment! ❤️",
            message: `@${currentUser.username} liked your comment: "${comment.content.slice(0, 50)}..."`,
            linkUrl: comment.entityType === "post" ? `/#post-${comment.entityId}` : `/${comment.entityType}/${comment.entityId}`,
          },
        });
      }

      return NextResponse.json({
        status: "success",
        isLiked: true,
        likesCount: updated.likesCount,
      });
    }
  } catch (error: any) {
    console.error("Comment like error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to like comment" },
      { status: 500 }
    );
  }
}
