export interface SitemapEntry {
  url: string;
  lastModified?: Date | string | null;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urlsXml = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? new Date(entry.lastModified).toISOString()
        : new Date().toISOString();
      const changefreq = entry.changeFrequency || "weekly";
      const priority = (entry.priority !== undefined ? entry.priority : 0.7).toFixed(1);

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export interface NewsSitemapEntry {
  url: string;
  title: string;
  publicationDate: Date | string;
}

// Google News sitemap protocol: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
// Google only credits articles published in the last 2 days here — older news stays
// discoverable through the plain <url> entries in the regular sitemap, it just drops the
// <news:news> block since Google ignores it past that window anyway.
export function generateNewsSitemapXml(
  recentEntries: NewsSitemapEntry[],
  archiveEntries: SitemapEntry[],
  publicationName: string = "North East Connect",
  language: string = "en"
): string {
  const recentXml = recentEntries
    .map((entry) => {
      const pubDate = new Date(entry.publicationDate).toISOString();
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(publicationName)}</news:name>
        <news:language>${language}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(entry.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const recentUrls = new Set(recentEntries.map((e) => e.url));
  const archiveXml = archiveEntries
    .filter((entry) => !recentUrls.has(entry.url))
    .map((entry) => {
      const lastmod = entry.lastModified
        ? new Date(entry.lastModified).toISOString()
        : new Date().toISOString();
      const changefreq = entry.changeFrequency || "weekly";
      const priority = (entry.priority !== undefined ? entry.priority : 0.7).toFixed(1);
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentXml}${recentXml && archiveXml ? "\n" : ""}${archiveXml}
</urlset>`;
}

export function generateSitemapIndexXml(sitemaps: { url: string; lastModified?: Date | string | null }[]): string {
  const sitemapsXml = sitemaps
    .map((sm) => {
      const lastmod = sm.lastModified
        ? new Date(sm.lastModified).toISOString()
        : new Date().toISOString();
      return `  <sitemap>
    <loc>${escapeXml(sm.url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapsXml}
</sitemapindex>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
