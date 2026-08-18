import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const listings = await db.marketplaceListing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      listings,
    });
  } catch (error: any) {
    console.error("Marketplace my-ads GET error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch user ads" },
      { status: 500 }
    );
  }
}
