import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";
import { isProfileIndexable } from "@/lib/profileIndexing";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  try {
    const users = await db.user.findMany({
      where: { status: "Active" },
      select: {
        username: true,
        createdAt: true,
        bio: true,
        profileImageUrl: true,
        _count: { select: { communityPosts: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    // Only list profiles that are actually indexable (see src/app/profile/[username]/layout.tsx
    // for the matching noindex threshold) — a thin, near-empty profile in the sitemap just
    // dilutes the site's average content-quality signal without adding ranking value.
    const indexableUsers = users.filter(isProfileIndexable);

    const entries: SitemapEntry[] = [
      {
        url: `${baseUrl}/leaderboard`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      ...indexableUsers.map((user) => ({
        url: `${baseUrl}/profile/${encodeURIComponent(user.username)}`,
        lastModified: user.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
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
      generateSitemapXml([{ url: `${baseUrl}/leaderboard`, lastModified: new Date(), priority: 0.8 }]),
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
