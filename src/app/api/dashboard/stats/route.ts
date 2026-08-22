import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [
      businessesCount,
      userBusinesses,
      jobsCount,
      userJobs,
      propertiesCount,
      userProperties,
      marketplaceAdsCount,
      postsCount,
      friendsCount,
    ] = await Promise.all([
      db.directory.count({
        where: { userId: user.id },
      }),
      db.directory.findMany({
        where: { userId: user.id },
        select: { id: true },
      }),
      db.job.count({
        where: { userId: user.id, status: { not: "Deleted" } },
      }),
      db.job.findMany({
        where: { userId: user.id, status: { not: "Deleted" } },
        select: { id: true },
      }),
      db.property.count({
        where: { userId: user.id, status: { not: "Deleted" } },
      }),
      db.property.findMany({
        where: { userId: user.id, status: { not: "Deleted" } },
        select: { id: true },
      }),
      db.marketplaceListing.count({
        where: { userId: user.id, status: { not: "Deleted" } },
      }),
      db.communityPost.count({
        where: { userId: user.id, status: "Active" },
      }),
      db.friendship.count({
        where: {
          OR: [
            { senderId: user.id, status: "ACCEPTED" },
            { receiverId: user.id, status: "ACCEPTED" },
          ],
        },
      }),
    ]);

    const businessIds = userBusinesses.map((b) => String(b.id));
    const jobIds = userJobs.map((j) => j.id);
    const propertyIds = userProperties.map((p) => p.id);

    const [businessLeadsCount, jobApplicationsCount, propertyInquiriesCount] =
      await Promise.all([
        businessIds.length > 0
          ? db.lead.count({ where: { listingId: { in: businessIds } } })
          : 0,
        jobIds.length > 0
          ? db.jobApplication.count({ where: { jobId: { in: jobIds } } })
          : 0,
        propertyIds.length > 0
          ? db.propertyInquiry.count({ where: { propertyId: { in: propertyIds } } })
          : 0,
      ]);

    return NextResponse.json({
      status: "success",
      stats: {
        businessesCount,
        businessLeadsCount,
        jobsCount,
        jobApplicationsCount,
        propertiesCount,
        propertyInquiriesCount,
        marketplaceAdsCount,
        postsCount,
        friendsCount,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
