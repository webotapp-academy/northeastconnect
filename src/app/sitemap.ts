import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 3600; // Revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/wildlife",
    "/culture",
    "/adventure",
    "/directory",
    "/news",
    "/contact",
    "/post-ads",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Fetch dynamic routes from database
  try {
    const [news, directory, wildlife, adventure, culture] = await Promise.all([
      db.news.findMany({
        where: { status: "Published" },
        select: { id: true, url: true, publishedDate: true },
        orderBy: { publishedDate: "desc" },
        take: 1000,
      }),
      db.directory.findMany({
        select: { id: true, businessName: true, createdAt: true },
        take: 1000,
      }),
      db.wildlife.findMany({
        select: { id: true, name: true, createdAt: true },
      }),
      db.adventure.findMany({
        select: { id: true, name: true, createdAt: true },
      }),
      db.culture.findMany({
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    const newsRoutes: MetadataRoute.Sitemap = news.map((item) => {
      const slugOrId = item.url || item.id;
      return {
        url: `${baseUrl}/news/${encodeURIComponent(String(slugOrId))}`,
        lastModified: item.publishedDate ? new Date(item.publishedDate) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    const directoryRoutes: MetadataRoute.Sitemap = directory.map((item) => {
      const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/listing/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });

    const wildlifeRoutes: MetadataRoute.Sitemap = wildlife.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/wildlife/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    const adventureRoutes: MetadataRoute.Sitemap = adventure.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/adventure/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    const cultureRoutes: MetadataRoute.Sitemap = culture.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/culture/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    return [
      ...staticRoutes,
      ...newsRoutes,
      ...directoryRoutes,
      ...wildlifeRoutes,
      ...adventureRoutes,
      ...cultureRoutes,
    ];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
