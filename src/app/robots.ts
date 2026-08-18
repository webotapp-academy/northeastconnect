import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/profile/edit", "/marketplace/my-ads"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/profile/edit", "/marketplace/my-ads"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap_index.xml`,
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/page-sitemap.xml`,
      `${baseUrl}/marketplace-sitemap.xml`,
      `${baseUrl}/adventure-sitemap.xml`,
      `${baseUrl}/directory-sitemap.xml`,
      `${baseUrl}/culture-sitemap.xml`,
      `${baseUrl}/wildlife-sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
      `${baseUrl}/profile-sitemap.xml`,
      `${baseUrl}/community-sitemap.xml`,
    ],
  };
}
