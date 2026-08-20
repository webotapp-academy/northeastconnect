import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const role = (currentUser?.role || "").toLowerCase();
    if (!currentUser || (role !== "admin" && role !== "superadmin")) {
      return NextResponse.json({ status: "error", message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const editRequestId = parseInt(id, 10);
    if (isNaN(editRequestId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action, adminNotes } = body; // action: "approve" | "reject"

    const editRequest = await db.directoryEditRequest.findUnique({
      where: { id: editRequestId },
      include: { directory: true },
    });

    if (!editRequest) {
      return NextResponse.json({ status: "error", message: "Edit request not found." }, { status: 404 });
    }

    if (action === "approve") {
      let proposed: any = {};
      try {
        proposed = JSON.parse(editRequest.proposedData);
      } catch {
        return NextResponse.json({ status: "error", message: "Invalid proposed data JSON format" }, { status: 400 });
      }

      // 1. Update the Directory listing with proposed changes
      await db.directory.update({
        where: { id: editRequest.directoryId },
        data: {
          businessName: proposed.businessName,
          category: proposed.category,
          subcategory: proposed.subcategory,
          description: proposed.description,
          address: proposed.address,
          district: proposed.district,
          city: proposed.city,
          contactNumber: proposed.contactNumber,
          email: proposed.email,
          website: proposed.website,
          workingHours: proposed.workingHours,
          imageUrls: proposed.imageUrls,
        },
      });

      // 2. Mark edit request Approved
      const updatedReq = await db.directoryEditRequest.update({
        where: { id: editRequestId },
        data: {
          status: "Approved",
          adminNotes: adminNotes?.trim() || null,
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      });

      // 3. Notify the owner
      await db.notification.create({
        data: {
          userId: editRequest.userId,
          type: "EDIT_APPROVED",
          title: "Listing Updates Approved! ✅",
          message: `Your requested changes to "${editRequest.businessName}" have been verified and approved by admin.`,
          linkUrl: `/directory/${editRequest.directoryId}`,
        },
      }).catch(() => null);

      return NextResponse.json({
        status: "success",
        message: `Changes to "${editRequest.businessName}" have been approved and published!`,
        editRequest: updatedReq,
      });
    } else if (action === "reject") {
      const updatedReq = await db.directoryEditRequest.update({
        where: { id: editRequestId },
        data: {
          status: "Rejected",
          adminNotes: adminNotes?.trim() || "Information could not be verified.",
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      });

      // Notify the owner
      await db.notification.create({
        data: {
          userId: editRequest.userId,
          type: "EDIT_REJECTED",
          title: "Listing Update Request Declined ⚠️",
          message: `Your changes to "${editRequest.businessName}" were declined: ${adminNotes?.trim() || "Requirements not met."}`,
          linkUrl: `/directory/${editRequest.directoryId}`,
        },
      }).catch(() => null);

      return NextResponse.json({
        status: "success",
        message: "Edit request marked as Rejected.",
        editRequest: updatedReq,
      });
    } else {
      return NextResponse.json({ status: "error", message: "Invalid action. Use approve or reject." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin edit action error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to process edit action" },
      { status: 500 }
    );
  }
}
