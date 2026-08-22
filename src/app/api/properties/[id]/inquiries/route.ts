import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      return NextResponse.json({ status: "error", message: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!property) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    const isAdmin = (user.role || "").toLowerCase() === "admin" || (user.role || "").toLowerCase() === "superadmin";
    if (property.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden: You are not the owner of this property" }, { status: 403 });
    }

    const inquiries = await db.propertyInquiry.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ status: "success", data: inquiries });
  } catch (error: any) {
    console.error("Fetch property inquiries error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch property inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      return NextResponse.json({ status: "error", message: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!property) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    const isAdmin = (user.role || "").toLowerCase() === "admin" || (user.role || "").toLowerCase() === "superadmin";
    if (property.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { inquiryId, status } = body;

    if (!inquiryId || !status) {
      return NextResponse.json({ status: "error", message: "inquiryId and status are required" }, { status: 400 });
    }

    const updated = await db.propertyInquiry.update({
      where: { id: parseInt(inquiryId, 10) },
      data: { status },
    });

    return NextResponse.json({
      status: "success",
      message: `Inquiry status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Update property inquiry error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update inquiry status" },
      { status: 500 }
    );
  }
}
