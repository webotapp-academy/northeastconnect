import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const role = (currentUser?.role || "").toLowerCase();
    if (!currentUser || (role !== "admin" && role !== "superadmin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // all, Pending, Approved, Rejected

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const requests = await db.directoryEditRequest.findMany({
      where,
      include: {
        directory: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      pending: await db.directoryEditRequest.count({ where: { status: "Pending" } }),
      approved: await db.directoryEditRequest.count({ where: { status: "Approved" } }),
      rejected: await db.directoryEditRequest.count({ where: { status: "Rejected" } }),
      total: await db.directoryEditRequest.count(),
    };

    return NextResponse.json({
      status: "success",
      requests,
      counts,
    });
  } catch (error: any) {
    console.error("Admin directory edits fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load directory edits" },
      { status: 500 }
    );
  }
}
