import { NextResponse } from "next/server";
import { generateSitemapXml, SitemapEntry } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  const staticPages = [
    { route: "", priority: 1.0, changeFrequency: "daily" as const },
    { route: "/addas", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/marketplace", priority: 0.9, changeFrequency: "hourly" as const },
    { route: "/marketplace/new", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/community", priority: 0.9, changeFrequency: "hourly" as const },
    { route: "/leaderboard", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/culture", priority: 0.9, changeFrequency: "daily" as const },
    { route: "/news", priority: 0.9, changeFrequency: "hourly" as const },
    { route: "/wildlife", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/adventure", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/directory", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/search", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { route: "/post-ads", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const entries: SitemapEntry[] = staticPages.map((page) => ({
    url: `${baseUrl}${page.route}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const xml = generateSitemapXml(entries);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
