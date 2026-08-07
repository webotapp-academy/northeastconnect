import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

  try {
    const [newsCount, directoryCount, wildlifeCount, adventureCount, cultureCount] = await Promise.all([
      db.news.count({ where: { status: "Published" } }),
      db.directory.count({ where: { status: "Active" } }),
      db.wildlife.count(),
      db.adventure.count(),
      db.culture.count(),
    ]);

    const content = `# North East Connect

> North East Connect is the definitive digital portal for discovering tourism, culture, wildlife sanctuaries, business directory, news, and adventure experiences across Assam and North East India.

## Core Resources

- [Home](${baseUrl}): Portal overview, top experiences, exclusive deals, and business directory.
- [Wildlife Sanctuaries](${baseUrl}/wildlife): Comprehensive guide to Kaziranga, Manas, Nameri, Pobitora, and Dibru-Saikhowa National Parks.
- [Cultural Heritage](${baseUrl}/culture): Traditional festivals (Bihu, Majuli Raas, Tea Festival), Sattriya dance, and regional heritage.
- [Adventure Experiences](${baseUrl}/adventure): Brahmaputra river rafting, jungle safaris, and Tawang mountain trekking.
- [Business Directory](${baseUrl}/directory): ${directoryCount}+ verified businesses across hospitality, healthcare, education, retail, and local services in Assam.
- [News & Stories](${baseUrl}/news): ${newsCount}+ news articles covering regional developments, tourism updates, and cultural stories.
- [Contact Support](${baseUrl}/contact): Get in touch with business listings and support team.

## Key Statistics
- Verified Business Listings: ${directoryCount}
- Published News Articles: ${newsCount}
- National Parks & Sanctuaries: ${wildlifeCount}
- Outdoor Adventure Activities: ${adventureCount}
- Cultural Festivals & Heritage Items: ${cultureCount}

## API & Integration Endpoints
- Search Autocomplete API: GET ${baseUrl}/api/search?term={query}
- System Health Check API: GET ${baseUrl}/api/health
- Dynamic Sitemap: GET ${baseUrl}/sitemap.xml
- Robots Directive: GET ${baseUrl}/robots.txt
`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    const fallback = `# North East Connect\n\nDiscover North East India's tourism, wildlife, culture, business directory, and news.\n\nWebsite: ${baseUrl}\nSitemap: ${baseUrl}/sitemap.xml\n`;
    return new NextResponse(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
