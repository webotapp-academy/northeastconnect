import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "Admin") {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // all, Pending, Approved, Rejected

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const claims = await db.businessClaimRequest.findMany({
      where,
      include: {
        directory: {
          select: {
            id: true,
            businessName: true,
            category: true,
            city: true,
            district: true,
            contactNumber: true,
            email: true,
            userId: true,
            isClaimed: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            mobileNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      pending: await db.businessClaimRequest.count({ where: { status: "Pending" } }),
      approved: await db.businessClaimRequest.count({ where: { status: "Approved" } }),
      rejected: await db.businessClaimRequest.count({ where: { status: "Rejected" } }),
      total: await db.businessClaimRequest.count(),
    };

    return NextResponse.json({
      status: "success",
      claims,
      counts,
    });
  } catch (error: any) {
    console.error("Admin claims fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load claims" },
      { status: 500 }
    );
  }
}
