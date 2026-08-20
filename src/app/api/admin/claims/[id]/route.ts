import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardUserXp } from "@/lib/gamification";

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
    const claimId = parseInt(id, 10);
    if (isNaN(claimId)) {
      return NextResponse.json({ status: "error", message: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { action, adminNotes } = body; // action: "approve" | "reject"

    const claim = await db.businessClaimRequest.findUnique({
      where: { id: claimId },
      include: { directory: true },
    });

    if (!claim) {
      return NextResponse.json({ status: "error", message: "Claim request not found." }, { status: 404 });
    }

    if (action === "approve") {
      // 1. Transfer business ownership to the user
      await db.directory.update({
        where: { id: claim.directoryId },
        data: {
          userId: claim.userId,
          isClaimed: true,
          claimedAt: new Date(),
        },
      });

      // 2. Update claim request
      const updatedClaim = await db.businessClaimRequest.update({
        where: { id: claimId },
        data: {
          status: "Approved",
          adminNotes: adminNotes || "Claim verified and ownership transferred.",
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      });

      // 3. Award +50 XP to the user
      await awardUserXp(claim.userId, "BUSINESS_CLAIMED", 50, `Claimed business ${claim.businessName}`).catch(() => null);

      // 4. Create user notification
      await db.notification.create({
        data: {
          userId: claim.userId,
          type: "CLAIM_APPROVED",
          title: "🎉 Business Claim Approved! (+50 XP)",
          message: `Congratulations! Your ownership claim for "${claim.businessName}" has been approved. You can now view your business views, manage customer leads, and update information from your profile.`,
          linkUrl: `/directory/${claim.directoryId}`,
        },
      });

      return NextResponse.json({
        status: "success",
        message: `Claim approved! Ownership of "${claim.businessName}" has been transferred to the user.`,
        claim: updatedClaim,
      });
    } else if (action === "reject") {
      // Update claim request to Rejected
      const updatedClaim = await db.businessClaimRequest.update({
        where: { id: claimId },
        data: {
          status: "Rejected",
          adminNotes: adminNotes || "Document verification could not be completed.",
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        },
      });

      // Create user notification
      await db.notification.create({
        data: {
          userId: claim.userId,
          type: "CLAIM_REJECTED",
          title: "Business Claim Update",
          message: `Your ownership claim for "${claim.businessName}" could not be approved at this time: ${adminNotes || "Verification documents did not match."}`,
          linkUrl: `/directory/${claim.directoryId}`,
        },
      });

      return NextResponse.json({
        status: "success",
        message: `Claim for "${claim.businessName}" has been rejected.`,
        claim: updatedClaim,
      });
    }

    return NextResponse.json({ status: "error", message: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin claim action error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to process claim" },
      { status: 500 }
    );
  }
}
