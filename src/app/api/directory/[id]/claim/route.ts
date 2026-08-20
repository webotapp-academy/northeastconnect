import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
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
      return NextResponse.json({ status: "success", hasClaim: false });
    }

    const existingClaim = await db.businessClaimRequest.findFirst({
      where: {
        directoryId,
        userId: currentUser.id,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      hasClaim: !!existingClaim,
      claim: existingClaim,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to check claim status" },
      { status: 500 }
    );
  }
}

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
        { status: "error", message: "Please sign in to claim this business." },
        { status: 401 }
      );
    }

    const business = await db.directory.findUnique({
      where: { id: directoryId },
    });

    if (!business) {
      return NextResponse.json({ status: "error", message: "Business not found." }, { status: 404 });
    }

    if (business.userId === currentUser.id && business.isClaimed) {
      return NextResponse.json(
        { status: "error", message: "You already own and manage this business." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      claimantName,
      claimantEmail,
      claimantPhone,
      registrationProofUrl,
      utilityBillUrl,
      idProofUrl,
      notes,
    } = body;

    if (!claimantName || !claimantEmail || !claimantPhone) {
      return NextResponse.json(
        { status: "error", message: "Name, email, and phone number are required." },
        { status: 400 }
      );
    }

    if (!registrationProofUrl || !utilityBillUrl) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Please upload both Business Registration Proof (GST/Trade License/MSME) and Utility/Electricity Bill.",
        },
        { status: 400 }
      );
    }

    // Check if there's already a pending claim by this user
    const pendingClaim = await db.businessClaimRequest.findFirst({
      where: {
        directoryId,
        userId: currentUser.id,
        status: "Pending",
      },
    });

    if (pendingClaim) {
      return NextResponse.json(
        {
          status: "error",
          message: "You already have a pending verification request for this business.",
        },
        { status: 409 }
      );
    }

    const claim = await db.businessClaimRequest.create({
      data: {
        directoryId,
        userId: currentUser.id,
        businessName: business.businessName,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim().toLowerCase(),
        claimantPhone: claimantPhone.trim(),
        registrationProofUrl: registrationProofUrl.trim(),
        utilityBillUrl: utilityBillUrl.trim(),
        idProofUrl: idProofUrl?.trim() || null,
        notes: notes?.trim() || null,
        status: "Pending",
      },
    });

    // Create user notification confirming submission
    await db.notification.create({
      data: {
        userId: currentUser.id,
        type: "CLAIM_SUBMITTED",
        title: "Claim Submitted for Verification 🏢",
        message: `Your ownership claim for "${business.businessName}" has been submitted. Our admin team will verify your documents within 24-48 hours.`,
        linkUrl: `/directory/${business.id}`,
      },
    });

    return NextResponse.json({
      status: "success",
      message:
        "Your claim has been submitted! Our admin team will verify your proof documents and transfer ownership.",
      claim,
    });
  } catch (error: any) {
    console.error("Business claim submission error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to submit business claim" },
      { status: 500 }
    );
  }
}
