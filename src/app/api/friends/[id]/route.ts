import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp } from "@/lib/gamification";

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const friendshipId = parseInt(id, 10);

    if (isNaN(friendshipId)) {
      return NextResponse.json({ status: "error", message: "Invalid friendship ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // "ACCEPT" | "REJECT"

    const friendship = await db.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        sender: { select: { id: true, username: true, fullName: true } },
        receiver: { select: { id: true, username: true, fullName: true } },
      },
    });

    if (!friendship) {
      return NextResponse.json({ status: "error", message: "Friendship request not found" }, { status: 404 });
    }

    // Only the receiver can accept or reject a pending request
    if (friendship.receiverId !== currentUser.id) {
      return NextResponse.json(
        { status: "error", message: "You can only respond to requests sent to you." },
        { status: 403 }
      );
    }

    if (action === "ACCEPT") {
      const updated = await db.friendship.update({
        where: { id: friendshipId },
        data: { status: "ACCEPTED" },
      });

      // Award XP to both users for making a new connection
      await awardUserXp(currentUser.id, "FRIEND_ACCEPTED", 15, `Connected with @${friendship.sender.username}`);
      await awardUserXp(friendship.sender.id, "FRIEND_ACCEPTED", 15, `Connected with @${currentUser.username}`);

      // Notify the sender that their request was accepted
      await db.notification.create({
        data: {
          userId: friendship.sender.id,
          actorId: currentUser.id,
          type: "FRIEND_ACCEPT",
          title: "Friend Request Accepted! 🤝",
          message: `@${currentUser.username} accepted your friend request. You are now friends!`,
          linkUrl: `/profile/${currentUser.username}`,
        },
      });

      return NextResponse.json({
        status: "success",
        message: `You and @${friendship.sender.username} are now friends!`,
        friendship: updated,
      });
    } else if (action === "REJECT") {
      await db.friendship.delete({
        where: { id: friendshipId },
      });

      return NextResponse.json({
        status: "success",
        message: "Friend request declined.",
      });
    }

    return NextResponse.json({ status: "error", message: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Friendship action error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update friendship" },
      { status: 500 }
    );
  }
}

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
    const friendshipId = parseInt(id, 10);

    if (isNaN(friendshipId)) {
      return NextResponse.json({ status: "error", message: "Invalid friendship ID" }, { status: 400 });
    }

    const friendship = await db.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ status: "error", message: "Friendship not found" }, { status: 404 });
    }

    // Only participants can cancel/delete
    if (friendship.senderId !== currentUser.id && friendship.receiverId !== currentUser.id) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    await db.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({
      status: "success",
      message: "Friendship / request removed.",
    });
  } catch (error: any) {
    console.error("Delete friendship error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to remove friendship" },
      { status: 500 }
    );
  }
}
