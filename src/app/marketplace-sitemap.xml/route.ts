import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  try {
    const listings = await db.marketplaceListing.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    const entries: SitemapEntry[] = [
      {
        url: `${baseUrl}/marketplace`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/marketplace/new`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      ...listings.map((item) => ({
        url: `${baseUrl}/marketplace/${item.id}`,
        lastModified: item.updatedAt || item.createdAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ];

    const xml = generateSitemapXml(entries);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    return new NextResponse(
      generateSitemapXml([{ url: `${baseUrl}/marketplace`, lastModified: new Date(), priority: 0.9 }]),
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
