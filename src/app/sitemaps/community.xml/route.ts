import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";
import { MASTER_ADDAS } from "@/lib/addas";
import { getCommunityPostSlugUrl } from "@/lib/slugs";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  let posts: any[] = [];
  try {
    posts = await db.communityPost.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        content: true,
        taggedLocation: true,
        createdAt: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
  } catch (e) {
    console.warn("Could not fetch posts for sitemap:", e);
  }

  let hashtags: { tag: string; updatedAt: Date }[] = [];
  try {
    hashtags = await db.hashtag.findMany({
      select: { tag: true, updatedAt: true },
      take: 500,
    });
  } catch (e) {
    console.warn("Could not fetch hashtags for sitemap:", e);
  }

  const entries: SitemapEntry[] = [
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/addas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/addas/groups`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // Addas Hub Pages (real SSR URLs, not the ?adda= client filter)
    ...MASTER_ADDAS.map((adda) => ({
      url: `${baseUrl}/addas/${adda.id}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.85,
    })),
    // Adda Events Pages
    ...MASTER_ADDAS.map((adda) => ({
      url: `${baseUrl}/addas/${adda.id}/events`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // State Community Hubs
    ...Array.from(new Set(MASTER_ADDAS.map((a) => a.state).filter((s) => s !== "All States"))).map((state) => ({
      url: `${baseUrl}/addas/state/${state.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    // Hashtag Feeds
    ...hashtags.map((h) => ({
      url: `${baseUrl}/community?hashtag=${encodeURIComponent(h.tag)}`,
      lastModified: h.updatedAt || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    // Individual Posts (SEO friendly slug URL)
    ...posts.map((post) => ({
      url: `${baseUrl}${getCommunityPostSlugUrl(post)}`,
      lastModified: post.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
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
}
