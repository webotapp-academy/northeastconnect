import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: currentUser.id },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await db.notification.count({
      where: { userId: currentUser.id, isRead: false },
    });

    return NextResponse.json({
      status: "success",
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await db.notification.updateMany({
        where: { id: parseInt(notificationId, 10), userId: currentUser.id },
        data: { isRead: true },
      });
    } else {
      // Mark all as read
      await db.notification.updateMany({
        where: { userId: currentUser.id, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Notifications marked as read",
    });
  } catch (error: any) {
    console.error("Notifications update error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}
