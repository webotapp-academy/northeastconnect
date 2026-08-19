import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      directoryCount,
      newsCount,
      cultureCount,
      adventureCount,
      wildlifeCount,
      marketplaceCount,
      usersCount,
      commentsCount,
      leadsCount,
      pageViewsTotal,
      recentDirectory,
      recentNews,
      recentLeads,
      recentComments,
    ] = await Promise.all([
      db.directory.count(),
      db.news.count(),
      db.culture.count(),
      db.adventure.count(),
      db.wildlife.count(),
      db.marketplaceListing.count(),
      db.user.count(),
      db.universalComment.count({ where: { NOT: { status: "Deleted" } } }),
      db.lead.count(),
      db.pageView.aggregate({ _sum: { views: true } }),
      db.directory.findMany({
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, businessName: true, category: true, district: true, status: true, createdAt: true },
      }),
      db.news.findMany({
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, title: true, author: true, category: true, status: true, publishedDate: true },
      }),
      db.lead.findMany({
        orderBy: { id: "desc" },
        take: 5,
        select: { id: true, name: true, mobile: true, status: true, timestamp: true },
      }),
      db.universalComment.findMany({
        where: { NOT: { status: "Deleted" } },
        orderBy: { id: "desc" },
        take: 5,
        include: { user: { select: { username: true } } },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      metrics: {
        directoryCount,
        newsCount,
        cultureCount,
        adventureCount,
        wildlifeCount,
        marketplaceCount,
        usersCount,
        commentsCount,
        leadsCount,
        totalPageViews: pageViewsTotal._sum.views || 0,
      },
      recent: {
        directory: recentDirectory,
        news: recentNews,
        leads: recentLeads,
        comments: recentComments,
      },
    });
  } catch (error: any) {
    console.error("Admin stats API error:", error);
    return NextResponse.json({ status: "error", message: error?.message || "Failed to load admin stats" }, { status: 500 });
  }
}
