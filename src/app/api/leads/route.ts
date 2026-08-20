import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, email, message, listingId, entityType } = body;

    if (!name || !mobile || !listingId) {
      return NextResponse.json(
        { status: "error", message: "Name, contact number, and listing details are required." },
        { status: 400 }
      );
    }

    const noteContent = `Email: ${email || "N/A"} | Inquiry: ${message || "Customer requested details"}`;

    const lead = await db.lead.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        listingId: String(listingId),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        status: "pending",
        notes: noteContent,
      },
    });

    // Notify listing owner if business directory
    const numericId = parseInt(String(listingId).replace(/\D/g, ""), 10);
    if (!isNaN(numericId) && !String(listingId).startsWith("marketplace_")) {
      const biz = await db.directory.findUnique({
        where: { id: numericId },
        select: { id: true, businessName: true, userId: true },
      });

      if (biz && biz.userId) {
        await db.notification.create({
          data: {
            userId: biz.userId,
            type: "LEAD_RECEIVED",
            title: `New Customer Lead for "${biz.businessName}"! 📬`,
            message: `${name.trim()} (${mobile.trim()}) sent an inquiry: "${(message || "").slice(0, 100)}"`,
            linkUrl: `/profile/my-businesses`,
          },
        }).catch(() => null);
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Your inquiry has been sent successfully! The business will contact you shortly.",
      lead,
    });
  } catch (error: any) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
