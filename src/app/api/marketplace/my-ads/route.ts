import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const listings = await db.marketplaceListing.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const adIds = listings.map((l) => String(l.id));
    const marketAdIds = listings.map((l) => `marketplace_${l.id}`);

    const leads = await db.lead.findMany({
      where: {
        listingId: { in: [...adIds, ...marketAdIds] },
      },
      orderBy: { id: "desc" },
    });

    const listingsWithLeads = listings.map((l) => {
      const adLeads = leads.filter(
        (ld) => ld.listingId === String(l.id) || ld.listingId === `marketplace_${l.id}`
      );
      return {
        ...l,
        leadsCount: adLeads.length,
        leads: adLeads,
      };
    });

    return NextResponse.json({
      status: "success",
      listings: listingsWithLeads,
      totalViews: listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0),
      totalLeads: leads.length,
    });
  } catch (error: any) {
    console.error("Marketplace my-ads GET error:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch user ads" },
      { status: 500 }
    );
  }
}
