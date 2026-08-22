import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id, 10);
    if (isNaN(propertyId)) {
      return NextResponse.json({ status: "error", message: "Invalid property ID" }, { status: 400 });
    }

    const property = await db.property.findUnique({
      where: { id: propertyId },
      select: { id: true, userId: true, title: true },
    });

    if (!property) {
      return NextResponse.json({ status: "error", message: "Property not found" }, { status: 404 });
    }

    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { name, email, phone, message, inquiryType } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { status: "error", message: "Name, email, and phone number are required." },
        { status: 400 }
      );
    }

    const inquiry = await db.propertyInquiry.create({
      data: {
        propertyId,
        userId: currentUser?.id || null,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message?.trim() || null,
        inquiryType: inquiryType || "Site Visit",
        status: "New",
      },
    });

    // Increment inquiry count on property
    await db.property.update({
      where: { id: propertyId },
      data: { inquiriesCount: { increment: 1 } },
    }).catch(() => {});

    // Create a notification for the property owner
    if (property.userId && (!currentUser || currentUser.id !== property.userId)) {
      await db.notification.create({
        data: {
          userId: property.userId,
          actorId: currentUser?.id || null,
          type: "PROPERTY_INQUIRY",
          title: "New Property Inquiry",
          message: `${name} inquired about "${property.title}" (${inquiryType || "Site Visit"}).`,
          linkUrl: `/properties/${property.id}`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      status: "success",
      message: "Your inquiry has been sent to the property owner/agent!",
      data: inquiry,
    });
  } catch (error: any) {
    console.error("Property inquiry error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to submit property inquiry" },
      { status: 500 }
    );
  }
}
