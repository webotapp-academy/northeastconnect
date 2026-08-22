import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const properties = await db.property.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { inquiries: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      data: properties,
    });
  } catch (error: any) {
    console.error("My properties error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load your properties" },
      { status: 500 }
    );
  }
}
