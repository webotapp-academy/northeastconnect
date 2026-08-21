import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const existingPost = await db.communityPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ status: "error", message: "Post not found." }, { status: 404 });
    }

    // Only author or admin can edit
    const isAdmin = currentUser.role === "Admin" || currentUser.role === "SuperAdmin";
    if (existingPost.userId !== currentUser.id && !isAdmin) {
      return NextResponse.json(
        { status: "error", message: "You can only edit your own posts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, taggedLocation, mediaUrls } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ status: "error", message: "Content cannot be empty." }, { status: 400 });
    }

    const updatedPost = await db.communityPost.update({
      where: { id: postId },
      data: {
        content: content.trim(),
        taggedLocation: taggedLocation?.trim() || null,
        mediaUrls: mediaUrls ? (typeof mediaUrls === "string" ? mediaUrls.trim() : JSON.stringify(mediaUrls)) : null,
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

    const commentsCount = await db.universalComment.count({
      where: { entityType: "post", entityId: postId },
    });

    return NextResponse.json({
      status: "success",
      message: "Post updated successfully!",
      post: {
        ...updatedPost,
        _count: { comments: commentsCount },
      },
    });
  } catch (error: any) {
    console.error("Community post edit error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const existingPost = await db.communityPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ status: "error", message: "Post not found." }, { status: 404 });
    }

    // Only author or admin can delete
    const isAdmin = currentUser.role === "Admin" || currentUser.role === "SuperAdmin";
    if (existingPost.userId !== currentUser.id && !isAdmin) {
      return NextResponse.json(
        { status: "error", message: "You can only delete your own posts." },
        { status: 403 }
      );
    }

    await db.communityPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      status: "success",
      message: "Post deleted successfully.",
    });
  } catch (error: any) {
    console.error("Community post delete error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const post = await db.communityPost.findUnique({
      where: { id: postId },
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
    });

    if (!post) {
      return NextResponse.json({ status: "error", message: "Post not found" }, { status: 404 });
    }

    const commentsCount = await db.universalComment.count({
      where: { entityType: "post", entityId: postId, status: "Active" },
    });

    return NextResponse.json({
      status: "success",
      post: {
        ...post,
        commentsCount,
        _count: { comments: commentsCount },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

