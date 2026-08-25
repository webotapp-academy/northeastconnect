import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const revalidate = 1800; // Revalidate every 30 minutes

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/addas",
    "/marketplace",
    "/marketplace/new",
    "/community",
    "/jobs",
    "/jobs/post",
    "/leaderboard",
    "/wildlife",
    "/culture",
    "/adventure",
    "/directory",
    "/news",
    "/search",
    "/contact",
    "/post-ads",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/marketplace" || route === "/jobs" || route === "/community" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : route === "/marketplace" || route === "/jobs" || route === "/community" ? 0.9 : 0.8,
  }));

  // Fetch dynamic routes from database
  try {
    const [jobs, marketplace, users, culture, news, directory, wildlife, adventure] = await Promise.all([
      db.job.findMany({
        where: { status: "Open" },
        select: { id: true, title: true, company: true, location: true, district: true, state: true, updatedAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 2000,
      }),
      db.marketplaceListing.findMany({
        where: { status: "Active" },
        select: { id: true, updatedAt: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 2000,
      }),
      db.user.findMany({
        where: { status: "Active" },
        select: { username: true, createdAt: true },
        take: 2000,
      }),
      db.culture.findMany({
        select: { id: true, name: true, createdAt: true },
        take: 2000,
      }),
      db.news.findMany({
        where: { status: "Published" },
        select: { id: true, url: true, publishedDate: true },
        orderBy: { publishedDate: "desc" },
        take: 2000,
      }),
      db.directory.findMany({
        select: { id: true, businessName: true, createdAt: true },
        take: 2000,
      }),
      db.wildlife.findMany({
        select: { id: true, name: true, createdAt: true },
        take: 2000,
      }),
      db.adventure.findMany({
        select: { id: true, name: true, createdAt: true },
        take: 2000,
      }),
    ]);

    // 1. Job Vacancies & Careers
    const jobRoutes: MetadataRoute.Sitemap = jobs.map((item) => {
      const parts = [item.title, item.company, item.location || item.district || item.state].filter(Boolean).join(" ");
      const slug = parts.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
      return {
        url: `${baseUrl}/jobs/${slug || "opening"}-${item.id}`,
        lastModified: item.updatedAt ? new Date(item.updatedAt) : item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      };
    });

    // 2. Marketplace Listings
    const marketplaceRoutes: MetadataRoute.Sitemap = marketplace.map((item) => ({
      url: `${baseUrl}/marketplace/${item.id}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(item.createdAt),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // 3. User Profiles
    const profileRoutes: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/profile/${encodeURIComponent(user.username)}`,
      lastModified: user.createdAt ? new Date(user.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    // 4. Culture Heritage & Festivals
    const cultureRoutes: MetadataRoute.Sitemap = culture.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/culture/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    // 5. News Articles
    const newsRoutes: MetadataRoute.Sitemap = news.map((item) => {
      const slugOrId = item.url || item.id;
      return {
        url: `${baseUrl}/news/${encodeURIComponent(String(slugOrId))}`,
        lastModified: item.publishedDate ? new Date(item.publishedDate) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      };
    });

    // 6. Directory Businesses
    const directoryRoutes: MetadataRoute.Sitemap = directory.map((item) => {
      const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/listing/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });

    // 7. Wildlife Sanctuaries
    const wildlifeRoutes: MetadataRoute.Sitemap = wildlife.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/wildlife/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    // 8. Adventure Spots
    const adventureRoutes: MetadataRoute.Sitemap = adventure.map((item) => {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        url: `${baseUrl}/adventure/${slug}-${item.id}`,
        lastModified: item.createdAt ? new Date(item.createdAt) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

    return [
      ...staticRoutes,
      ...jobRoutes,
      ...marketplaceRoutes,
      ...profileRoutes,
      ...cultureRoutes,
      ...newsRoutes,
      ...directoryRoutes,
      ...wildlifeRoutes,
      ...adventureRoutes,
    ];
  } catch (error) {
    console.error("Error generating dynamic master sitemap:", error);
    return staticRoutes;
  }
}
