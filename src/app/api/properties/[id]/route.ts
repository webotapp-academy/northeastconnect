import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      return NextResponse.json({ status: "error", message: "Invalid property ID" }, { status: 400 });
    }

    // Increment views count asynchronously
    await db.property.update({
      where: { id: propertyId },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "success", data: property });
  } catch (error: any) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to fetch property" },
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

    const existing = await db.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    const isAdmin = (user.role || "").toLowerCase() === "admin" || (user.role || "").toLowerCase() === "superadmin";
    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await db.property.update({
      where: { id: propertyId },
      data: body,
    });

    return NextResponse.json({
      status: "success",
      message: "Property updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update property error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const existing = await db.property.findUnique({
      where: { id: propertyId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    const isAdmin = (user.role || "").toLowerCase() === "admin" || (user.role || "").toLowerCase() === "superadmin";
    if (existing.userId !== user.id && !isAdmin) {
      return NextResponse.json({ status: "error", message: "Forbidden" }, { status: 403 });
    }

    await db.property.delete({
      where: { id: propertyId },
    });

    return NextResponse.json({
      status: "success",
      message: "Property deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to delete property" },
      { status: 500 }
    );
  }
}
