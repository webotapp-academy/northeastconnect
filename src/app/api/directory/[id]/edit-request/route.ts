import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const directoryId = parseInt(id, 10);
    if (isNaN(directoryId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to edit listing details." },
        { status: 401 }
      );
    }

    const business = await db.directory.findUnique({
      where: { id: directoryId },
    });

    if (!business) {
      return NextResponse.json({ status: "error", message: "Business not found." }, { status: 404 });
    }

    const role = (currentUser.role || "").toLowerCase();
    const isAdmin = role === "admin" || role === "superadmin";
    const isOwner = business.userId === currentUser.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { status: "error", message: "You do not have permission to edit this business." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      category,
      subcategory,
      description,
      address,
      district,
      city,
      contactNumber,
      email,
      website,
      workingHours,
      imageUrls,
    } = body;

    if (!businessName?.trim()) {
      return NextResponse.json({ status: "error", message: "Business Name is required." }, { status: 400 });
    }

    const proposedData = {
      businessName: businessName.trim(),
      category: category?.trim() || business.category,
      subcategory: subcategory?.trim() || business.subcategory,
      description: description?.trim() || business.description,
      address: address?.trim() || business.address,
      district: district?.trim() || business.district,
      city: city?.trim() || business.city,
      contactNumber: contactNumber?.trim() || business.contactNumber,
      email: email?.trim() || business.email,
      website: website?.trim() || business.website,
      workingHours: workingHours?.trim() || business.workingHours,
      imageUrls: imageUrls?.trim() || business.imageUrls,
    };

    // If admin is directly updating, apply immediately
    if (isAdmin) {
      const updated = await db.directory.update({
        where: { id: directoryId },
        data: proposedData,
      });
      return NextResponse.json({
        status: "success",
        message: "Business listing updated directly by Admin.",
        business: updated,
      });
    }

    // Otherwise create pending edit request for admin approval
    const editRequest = await db.directoryEditRequest.create({
      data: {
        directoryId,
        userId: currentUser.id,
        businessName: businessName.trim(),
        proposedData: JSON.stringify(proposedData),
        status: "Pending",
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: currentUser.id,
        type: "EDIT_SUBMITTED",
        title: "Listing Edits Submitted 📝",
        message: `Your proposed updates for "${business.businessName}" have been submitted for admin approval.`,
        linkUrl: `/directory/${business.id}`,
      },
    }).catch(() => null);

    return NextResponse.json({
      status: "success",
      message: "Proposed updates submitted! Our admin team will review and approve the changes shortly.",
      editRequest,
    });
  } catch (error: any) {
    console.error("Directory edit request error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to submit edit request" },
      { status: 500 }
    );
  }
}
