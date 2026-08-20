import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: "error", message: "Please sign in to view your businesses." },
        { status: 401 }
      );
    }

    // Fetch all businesses owned or claimed by the user
    const businesses = await db.directory.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Also get all leads associated with these businesses
    const businessIds = businesses.map((b) => String(b.id));

    const leads = await db.lead.findMany({
      where: {
        listingId: { in: businessIds },
      },
      orderBy: { id: "desc" },
    });

    // Group leads by business ID
    const businessesWithLeads = businesses.map((b) => {
      const bLeads = leads.filter((l) => l.listingId === String(b.id));
      return {
        ...b,
        leadsCount: bLeads.length,
        leads: bLeads,
      };
    });

    // Fetch any pending claim requests by this user
    const claimRequests = await db.businessClaimRequest.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      status: "success",
      businesses: businessesWithLeads,
      claimRequests,
      totalViews: businesses.reduce((acc, b) => acc + (b.viewsCount || 0), 0),
      totalLeads: leads.length,
    });
  } catch (error: any) {
    console.error("My businesses fetch error:", error);
    return NextResponse.json(
      { status: "error", message: error?.message || "Failed to load businesses" },
      { status: 500 }
    );
  }
}
