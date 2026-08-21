import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const commentId = parseInt(id, 10);

    if (isNaN(commentId)) {
      return NextResponse.json({ status: "error", message: "Invalid comment ID" }, { status: 400 });
    }

    const comment = await db.universalComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ status: "error", message: "Comment not found" }, { status: 404 });
    }

    // Only comment author or admin can delete
    if (comment.userId !== currentUser.id && currentUser.role !== "Admin") {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    await db.universalComment.delete({
      where: { id: commentId },
    });

    if (comment.entityType === "post") {
      await db.communityPost.update({
        where: { id: comment.entityId },
        data: { commentsCount: { decrement: 1 } },
      }).catch(() => {});
    }

    return NextResponse.json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}
