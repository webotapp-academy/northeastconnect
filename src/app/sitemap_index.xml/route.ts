import { NextResponse } from "next/server";
import { generateSitemapIndexXml } from "@/lib/sitemapHelper";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  const sitemaps = [
    { url: `${baseUrl}/page-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/marketplace-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/adventure-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/directory-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/culture-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/wildlife-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/news-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/profile-sitemap.xml`, lastModified: new Date() },
    { url: `${baseUrl}/community-sitemap.xml`, lastModified: new Date() },
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
