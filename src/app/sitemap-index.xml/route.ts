import { NextResponse } from "next/server";
import { generateSitemapIndexXml } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  const sitemaps = [
    { url: `${baseUrl}/sitemaps/pages.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/marketplace.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/culture.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/profiles.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/community.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/news.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/directory.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/wildlife.xml`, lastModified: new Date() },
    { url: `${baseUrl}/sitemaps/adventure.xml`, lastModified: new Date() },
  ];

  const xml = generateSitemapIndexXml(sitemaps);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
