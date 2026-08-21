import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendIdParam = searchParams.get("friendId");

    if (!friendIdParam) {
      // Return unread count
      const unreadCount = await (db as any).directMessage.count({
        where: {
          receiverId: currentUser.id,
          isRead: false,
        },
      });

      return NextResponse.json({
        status: "success",
        unreadCount,
      });
    }

    const friendId = parseInt(friendIdParam, 10);
    if (isNaN(friendId)) {
      return NextResponse.json({ status: "error", message: "Invalid friend ID" }, { status: 400 });
    }

    // Fetch conversation history between currentUser and friend
    const messages = await (db as any).directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: friendId },
          { senderId: friendId, receiverId: currentUser.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark unread messages from this friend as read
    await (db as any).directMessage.updateMany({
      where: {
        senderId: friendId,
        receiverId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const formattedMessages = (messages || []).map((m: any) => ({
      id: m.id,
      sender: m.senderId === currentUser.id ? "me" : "them",
      text: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    return NextResponse.json({
      status: "success",
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch messages" },
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
    const { targetUserId, content } = body;

    if (!targetUserId || !content?.trim()) {
      return NextResponse.json(
        { status: "error", message: "Recipient and message content are required." },
        { status: 400 }
      );
    }

    const numericTargetId = parseInt(targetUserId, 10);
    if (numericTargetId === currentUser.id) {
      return NextResponse.json({ status: "error", message: "Cannot message yourself." }, { status: 400 });
    }

    // Verify recipient exists
    const targetUser = await db.user.findUnique({
      where: { id: numericTargetId },
      select: { id: true, username: true, fullName: true },
    });

    if (!targetUser) {
      return NextResponse.json({ status: "error", message: "Target user not found." }, { status: 404 });
    }

    // Create persistent DirectMessage record
    const message = await (db as any).directMessage.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUser.id,
        content: content.trim(),
        isRead: false,
      },
    });

    // Notify the recipient
    await db.notification.create({
      data: {
        userId: targetUser.id,
        actorId: currentUser.id,
        type: "DIRECT_MESSAGE",
        title: `Message from @${currentUser.username} 💬`,
        message: content.trim().length > 60 ? `${content.trim().slice(0, 57)}...` : content.trim(),
        linkUrl: `/profile/${currentUser.username}`,
      },
    });

    return NextResponse.json({
      status: "success",
      message: {
        id: message.id,
        sender: "me",
        text: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
