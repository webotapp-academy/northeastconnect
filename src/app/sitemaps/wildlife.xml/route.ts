import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  try {
    const wildlife = await db.wildlife.findMany({
      select: { id: true, name: true, createdAt: true },
      take: 2000,
    });

    const entries: SitemapEntry[] = [
      {
        url: `${baseUrl}/wildlife`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      ...wildlife.map((item) => {
        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        return {
          url: `${baseUrl}/wildlife/${slug}-${item.id}`,
          lastModified: item.createdAt,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        };
      }),
    ];

    const xml = generateSitemapXml(entries);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error: any) {
    return new NextResponse(
      generateSitemapXml([{ url: `${baseUrl}/wildlife`, lastModified: new Date(), priority: 0.9 }]),
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
