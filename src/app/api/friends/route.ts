import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    // 1. Accepted friends
    const accepted = await db.friendship.findMany({
      where: {
        OR: [
          { senderId: currentUser.id, status: "ACCEPTED" },
          { receiverId: currentUser.id, status: "ACCEPTED" },
        ],
      },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, state: true },
        },
        receiver: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, state: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const friends = accepted.map((f) => {
      const friend = f.senderId === currentUser.id ? f.receiver : f.sender;
      return {
        friendshipId: f.id,
        user: friend,
        connectedSince: f.updatedAt,
      };
    });

    // 2. Pending incoming requests (sent to current user)
    const pendingIncoming = await db.friendship.findMany({
      where: { receiverId: currentUser.id, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, state: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Pending outgoing requests (sent by current user)
    const pendingOutgoing = await db.friendship.findMany({
      where: { senderId: currentUser.id, status: "PENDING" },
      include: {
        receiver: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, state: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      friends,
      pendingIncoming,
      pendingOutgoing,
    });
  } catch (error: any) {
    console.error("Friends fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId || targetUserId === currentUser.id) {
      return NextResponse.json(
        { status: "error", message: "Invalid recipient for friend request." },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({
      where: { id: Number(targetUserId) },
      select: { id: true, username: true, fullName: true },
    });

    if (!targetUser) {
      return NextResponse.json({ status: "error", message: "Target user not found." }, { status: 404 });
    }

    // Check if relationship already exists
    const existing = await db.friendship.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: currentUser.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ status: "error", message: "You are already friends!" }, { status: 400 });
      }
      if (existing.status === "PENDING") {
        if (existing.senderId === currentUser.id) {
          return NextResponse.json({ status: "error", message: "Friend request is already pending." }, { status: 400 });
        } else {
          // If the other user sent us a request, auto-accept it!
          const updated = await db.friendship.update({
            where: { id: existing.id },
            data: { status: "ACCEPTED" },
          });

          await db.notification.create({
            data: {
              userId: targetUser.id,
              actorId: currentUser.id,
              type: "FRIEND_ACCEPT",
              title: "Friend Request Accepted! 🤝",
              message: `@${currentUser.username} accepted your friend request.`,
              linkUrl: `/profile/${currentUser.username}`,
            },
          });

          return NextResponse.json({
            status: "success",
            message: `You and @${targetUser.username} are now friends!`,
            friendship: updated,
          });
        }
      }
    }

    // Create new friend request
    const friendship = await db.friendship.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUser.id,
        status: "PENDING",
      },
    });

    // Notify the target user
    await db.notification.create({
      data: {
        userId: targetUser.id,
        actorId: currentUser.id,
        type: "FRIEND_REQUEST",
        title: "New Friend Request! 👋",
        message: `@${currentUser.username} (${currentUser.fullName || currentUser.username}) sent you a friend request.`,
        linkUrl: `/profile/${currentUser.username}`,
      },
    });

    return NextResponse.json({
      status: "success",
      message: `Friend request sent to @${targetUser.username}!`,
      friendship,
    });
  } catch (error: any) {
    console.error("Send friend request error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to send friend request" },
      { status: 500 }
    );
  }
}
