import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";
import { MASTER_ADDAS } from "@/lib/addas";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

const NE_STATES = [
  "Assam",
  "Meghalaya",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim",
];

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  let posts: { id: number; createdAt: Date }[] = [];
  try {
    posts = await db.communityPost.findMany({
      where: { status: "Active" },
      select: { id: true, createdAt: true },
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
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // State Feeds
    ...NE_STATES.map((state) => ({
      url: `${baseUrl}/community?state=${encodeURIComponent(state)}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.85,
    })),
    // Addas Hub Feeds
    ...MASTER_ADDAS.map((adda) => ({
      url: `${baseUrl}/community?adda=${encodeURIComponent(adda.name)}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.85,
    })),
    // Hashtag Feeds
    ...hashtags.map((h) => ({
      url: `${baseUrl}/community?hashtag=${encodeURIComponent(h.tag)}`,
      lastModified: h.updatedAt || new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
    // Individual Posts
    ...posts.map((post) => ({
      url: `${baseUrl}/community#post-${post.id}`,
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
