import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp } from "@/lib/gamification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to react to posts." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ status: "error", message: "Invalid post ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const reactionType = (body.type || "like").toLowerCase();
    const VALID_TYPES = ["like", "love", "fire", "clap", "idea", "pride"];
    const typeToUse = VALID_TYPES.includes(reactionType) ? reactionType : "like";

    const post = await db.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, likesCount: true },
    });

    if (!post) {
      return NextResponse.json({ status: "error", message: "Post not found" }, { status: 404 });
    }

    const existingReaction = await (db as any).postReaction.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    });

    let newReaction: string | null = null;
    let likesCountDelta = 0;

    if (existingReaction) {
      if (existingReaction.type === typeToUse) {
        // Toggle OFF
        await (db as any).postReaction.delete({
          where: { id: existingReaction.id },
        });
        likesCountDelta = -1;
        newReaction = null;
      } else {
        // Switch reaction type
        await (db as any).postReaction.update({
          where: { id: existingReaction.id },
          data: { type: typeToUse },
        });
        newReaction = typeToUse;
      }
    } else {
      // Create new reaction
      await (db as any).postReaction.create({
        data: {
          postId,
          userId: currentUser.id,
          type: typeToUse,
        },
      });
      likesCountDelta = 1;
      newReaction = typeToUse;

      // Award XP & notify post author
      if (post.userId !== currentUser.id) {
        await awardUserXp(post.userId, "LIKE_RECEIVED", 5, `Received a reaction on post #${postId}`);
        await db.notification.create({
          data: {
            userId: post.userId,
            actorId: currentUser.id,
            type: "POST_LIKE",
            title: "New Post Reaction! ✨",
            message: `@${currentUser.username} reacted ${
              typeToUse === "fire" ? "🔥" : typeToUse === "love" ? "❤️" : typeToUse === "clap" ? "👏" : typeToUse === "pride" ? "🦏" : typeToUse === "idea" ? "💡" : "👍"
            } to your community thought.`,
            linkUrl: `/community/${postId}`,
          },
        });
      }
    }

    const updatedPost = await db.communityPost.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: likesCountDelta,
        },
      },
      select: {
        id: true,
        likesCount: true,
      },
    });

    // Ensure non-negative
    const finalLikesCount = Math.max(0, updatedPost.likesCount);

    return NextResponse.json({
      status: "success",
      currentReaction: newReaction,
      reacted: !!newReaction,
      likesCount: finalLikesCount,
    });
  } catch (error: any) {
    console.error("Post reaction error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update reaction" },
      { status: 500 }
    );
  }
}
