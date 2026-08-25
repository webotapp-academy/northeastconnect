import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNewsSitemapXml, generateSitemapXml, NewsSitemapEntry, SitemapEntry } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

// Google News only wants the last 48 hours worth of <news:news> entries in this sitemap —
// anything older is still listed as a plain <url> for regular indexing, just without the block.
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  try {
    const news = await db.news.findMany({
      where: { status: "Published" },
      select: { id: true, title: true, url: true, publishedDate: true, createdAt: true },
      orderBy: { publishedDate: "desc" },
      take: 5000,
    });

    const cutoff = Date.now() - NEWS_WINDOW_MS;

    const archiveEntries: SitemapEntry[] = [
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 0.9,
      },
      ...news.map((item) => {
        const slugOrId = item.url || item.id;
        return {
          url: `${baseUrl}/news/${encodeURIComponent(String(slugOrId))}`,
          lastModified: item.publishedDate || item.createdAt,
          changeFrequency: "daily" as const,
          priority: 0.8,
        };
      }),
    ];

    const newsEntries: NewsSitemapEntry[] = news
      .filter((item) => {
        const pub = item.publishedDate || item.createdAt;
        return pub && new Date(pub).getTime() >= cutoff;
      })
      .map((item) => {
        const slugOrId = item.url || item.id;
        return {
          url: `${baseUrl}/news/${encodeURIComponent(String(slugOrId))}`,
          title: item.title,
          publicationDate: item.publishedDate || item.createdAt || new Date(),
        };
      });

    const xml = generateNewsSitemapXml(newsEntries, archiveEntries);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    return new NextResponse(
      generateSitemapXml([{ url: `${baseUrl}/news`, lastModified: new Date(), priority: 0.9 }]),
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
