import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = parseInt(id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { status: "error", message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const listing = await db.marketplaceListing.update({
      where: { id: listingId },
      data: { viewsCount: { increment: 1 } },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            profileImageUrl: true,
            rankTier: true,
            xpPoints: true,
            state: true,
            city: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { status: "error", message: "Listing not found" },
        { status: 404 }
      );
    }

    // Get 4 related listings
    const relatedListings = await db.marketplaceListing.findMany({
      where: {
        id: { not: listingId },
        status: "Active",
        OR: [{ category: listing.category }, { state: listing.state }],
      },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            fullName: true,
            rankTier: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "success",
      listing,
      relatedListings,
    });
  } catch (error: any) {
    console.error("Marketplace [id] GET error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const listingId = parseInt(id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { status: "error", message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const existing = await db.marketplaceListing.findUnique({
      where: { id: listingId },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: "Listing not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id && user.role !== "Admin") {
      return NextResponse.json(
        { status: "error", message: "You can only edit your own listings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await db.marketplaceListing.update({
      where: { id: listingId },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        ...(body.description ? { description: body.description.trim() } : {}),
        ...(body.price !== undefined ? { price: parseFloat(body.price) } : {}),
        ...(body.isNegotiable !== undefined ? { isNegotiable: Boolean(body.isNegotiable) } : {}),
        ...(body.category ? { category: body.category.trim() } : {}),
        ...(body.condition ? { condition: body.condition } : {}),
        ...(body.state ? { state: body.state.trim() } : {}),
        ...(body.city ? { city: body.city.trim() } : {}),
        ...(body.locality !== undefined ? { locality: body.locality?.trim() || null } : {}),
        ...(body.imageUrls !== undefined ? { imageUrls: body.imageUrls?.trim() || null } : {}),
        ...(body.contactPhone !== undefined ? { contactPhone: body.contactPhone?.trim() || null } : {}),
        ...(body.contactWhatsApp !== undefined ? { contactWhatsApp: body.contactWhatsApp?.trim() || null } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Listing updated successfully",
      listing: updated,
    });
  } catch (error: any) {
    console.error("Marketplace [id] PUT error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update listing" },
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
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const listingId = parseInt(id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json(
        { status: "error", message: "Invalid listing ID" },
        { status: 400 }
      );
    }

    const existing = await db.marketplaceListing.findUnique({
      where: { id: listingId },
    });

    if (!existing) {
      return NextResponse.json(
        { status: "error", message: "Listing not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id && user.role !== "Admin") {
      return NextResponse.json(
        { status: "error", message: "You can only delete your own listings" },
        { status: 403 }
      );
    }

    await db.marketplaceListing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({
      status: "success",
      message: "Listing deleted successfully",
    });
  } catch (error: any) {
    console.error("Marketplace [id] DELETE error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to delete listing" },
      { status: 500 }
    );
  }
}
