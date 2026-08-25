import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseEntityId } from "@/lib/slugs";

// In-memory cache for fast link preview responses
const previewCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl || typeof targetUrl !== "string") {
      return NextResponse.json({ status: "error", message: "URL is required" }, { status: 400 });
    }

    const trimmedUrl = targetUrl.trim();

    // Check cache
    const cached = previewCache.get(trimmedUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ status: "success", preview: cached.data });
    }

    const parsedUrl = new URL(trimmedUrl, "https://northeastconnect.in");
    const isInternal =
      parsedUrl.hostname === "northeastconnect.in" ||
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname.includes("northeastconnect");

    let previewData: any = null;

    // 1. Internal Link Resolution (Instant DB Lookup)
    if (isInternal) {
      const pathname = parsedUrl.pathname;

      // /jobs/...
      if (pathname.startsWith("/jobs/")) {
        const jobId = parseEntityId(pathname.split("/").pop());
        if (jobId) {
          const job = await db.job.findUnique({
            where: { id: jobId },
            select: { id: true, title: true, company: true, location: true, district: true, state: true, jobDescription: true, companyLogo: true, type: true, category: true },
          });
          if (job) {
            previewData = {
              url: trimmedUrl,
              title: `${job.title} | ${job.company || "Job Vacancy"}`,
              description: job.jobDescription ? job.jobDescription.slice(0, 180) : `Hiring for ${job.type} ${job.category} in ${job.location || job.state || "Northeast India"}.`,
              image: job.companyLogo || "https://northeastconnect.in/assets/images/hero.jpg",
              siteName: "North East Connect • Jobs & Careers",
              domain: "northeastconnect.in",
              badge: "💼 Career Opening",
            };
          }
        }
      }

      // /news/...
      else if (pathname.startsWith("/news/")) {
        const rawParam = pathname.split("/").pop();
        if (rawParam) {
          const decoded = decodeURIComponent(rawParam);
          const numericId = parseInt(decoded, 10);
          const article = !isNaN(numericId)
            ? await db.news.findUnique({ where: { id: numericId } })
            : await db.news.findFirst({ where: { url: decoded } });

          if (article) {
            const rawImages = article.imageUrls ? article.imageUrls.split(",") : [];
            const img = rawImages[0]?.trim() || "https://northeastconnect.in/assets/images/hero.jpg";
            previewData = {
              url: trimmedUrl,
              title: article.title,
              description: article.content ? article.content.replace(/<[^>]*>/g, " ").slice(0, 180) : "Read regional Northeast India story and updates.",
              image: img.startsWith("http") || img.startsWith("/") ? img : `/assets/images/${img}`,
              siteName: "North East Connect • News",
              domain: "northeastconnect.in",
              badge: "📰 News Story",
            };
          }
        }
      }

      // /properties/...
      else if (pathname.startsWith("/properties/")) {
        const propId = parseEntityId(pathname.split("/").pop());
        if (propId) {
          const prop = await db.property.findUnique({
            where: { id: propId },
            select: { id: true, title: true, propertyType: true, listingType: true, price: true, city: true, state: true, description: true, imageUrls: true },
          });
          if (prop) {
            let img = "https://northeastconnect.in/assets/images/hero.jpg";
            if (prop.imageUrls) {
              const split = prop.imageUrls.split(",");
              if (split[0]?.trim()) img = split[0].trim();
            }
            previewData = {
              url: trimmedUrl,
              title: `${prop.title} - ₹${Number(prop.price).toLocaleString()}`,
              description: prop.description ? prop.description.slice(0, 180) : `${prop.propertyType} ${prop.listingType} in ${prop.city}, ${prop.state}.`,
              image: img,
              siteName: "North East Connect • Real Estate",
              domain: "northeastconnect.in",
              badge: "🏡 Property",
            };
          }
        }
      }

      // /directory/... or /listing/...
      else if (pathname.startsWith("/listing/") || pathname.startsWith("/directory/")) {
        const dirId = parseEntityId(pathname.split("/").pop());
        if (dirId) {
          const biz = await db.directory.findUnique({
            where: { id: dirId },
            select: { id: true, businessName: true, category: true, district: true, description: true, imageUrls: true },
          });
          if (biz) {
            previewData = {
              url: trimmedUrl,
              title: `${biz.businessName} - ${biz.category}`,
              description: biz.description ? biz.description.slice(0, 180) : `Verified business listing in ${biz.district}, Northeast India.`,
              image: biz.imageUrls ? biz.imageUrls.split(",")[0]?.trim() : "https://northeastconnect.in/assets/images/hero.jpg",
              siteName: "North East Connect • Verified Directory",
              domain: "northeastconnect.in",
              badge: "🏢 Directory Business",
            };
          }
        }
      }

      // /wildlife/...
      else if (pathname.startsWith("/wildlife/")) {
        const wildId = parseEntityId(pathname.split("/").pop());
        if (wildId) {
          const wild = await db.wildlife.findUnique({ where: { id: wildId } });
          if (wild) {
            previewData = {
              url: trimmedUrl,
              title: `${wild.name} | Wildlife Sanctuary`,
              description: wild.description ? wild.description.slice(0, 180) : "Explore wildlife sanctuary and eco-tourism in Northeast India.",
              image: wild.imageUrls ? wild.imageUrls.split(",")[0]?.trim() : "https://northeastconnect.in/assets/images/hero.jpg",
              siteName: "North East Connect • Wildlife Sanctuaries",
              domain: "northeastconnect.in",
              badge: "🦏 Wildlife Sanctuary",
            };
          }
        }
      }

      // /culture/...
      else if (pathname.startsWith("/culture/")) {
        const cultId = parseEntityId(pathname.split("/").pop());
        if (cultId) {
          const cult = await db.culture.findUnique({ where: { id: cultId } });
          if (cult) {
            previewData = {
              url: trimmedUrl,
              title: `${cult.name} | Cultural Heritage & Festival`,
              description: cult.description ? cult.description.slice(0, 180) : "Discover cultural heritage and traditional festivals.",
              image: cult.imageUrls ? cult.imageUrls.split(",")[0]?.trim() : "https://northeastconnect.in/assets/images/hero.jpg",
              siteName: "North East Connect • Cultural Heritage",
              domain: "northeastconnect.in",
              badge: "🎭 Culture & Heritage",
            };
          }
        }
      }

      // /marketplace/...
      else if (pathname.startsWith("/marketplace/")) {
        const marketId = parseEntityId(pathname.split("/").pop());
        if (marketId) {
          const item = await db.marketplaceListing.findUnique({ where: { id: marketId } });
          if (item) {
            previewData = {
              url: trimmedUrl,
              title: `${item.title} - ₹${item.price.toLocaleString()}`,
              description: item.description ? item.description.slice(0, 180) : `${item.category} in ${item.city}, ${item.state}.`,
              image: item.imageUrls ? item.imageUrls.split(",")[0]?.trim() : "https://northeastconnect.in/assets/images/hero.jpg",
              siteName: "North East Connect • Classifieds & Marketplace",
              domain: "northeastconnect.in",
              badge: "🛍️ Marketplace",
            };
          }
        }
      }
    }

    // 2. External Web URL Resolution (OpenGraph Scraper with 3.5s timeout)
    if (!previewData) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(trimmedUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NorthEastConnect/1.0",
            Accept: "text/html,application/xhtml+xml",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();

          // Extract OpenGraph / Twitter / Standard HTML Meta Tags
          const getMeta = (prop: string, altProp?: string) => {
            const propRegex = new RegExp(`<meta[^>]+(?:property|name)=["'](?:${prop}|${altProp || prop})["'][^>]+content=["']([^"']+)["']`, "i");
            const match1 = html.match(propRegex);
            if (match1 && match1[1]) return match1[1];

            const contentFirstRegex = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:${prop}|${altProp || prop})["']`, "i");
            const match2 = html.match(contentFirstRegex);
            return match2 ? match2[1] : null;
          };

          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

          const ogTitle = getMeta("og:title", "twitter:title") || (titleMatch ? titleMatch[1].trim() : parsedUrl.hostname);
          const ogDescription = getMeta("og:description", "description") || getMeta("twitter:description") || "";
          let ogImage = getMeta("og:image", "twitter:image") || getMeta("og:image:secure_url");
          const ogSiteName = getMeta("og:site_name") || parsedUrl.hostname.replace(/^www\./, "");

          if (ogImage && !ogImage.startsWith("http")) {
            try {
              ogImage = new URL(ogImage, trimmedUrl).toString();
            } catch {}
          }

          previewData = {
            url: trimmedUrl,
            title: ogTitle ? decodeHtmlEntities(ogTitle) : parsedUrl.hostname,
            description: ogDescription ? decodeHtmlEntities(ogDescription).slice(0, 200) : "",
            image: ogImage || null,
            siteName: ogSiteName || parsedUrl.hostname,
            domain: parsedUrl.hostname.replace(/^www\./, ""),
          };
        }
      } catch (externalErr) {
        // Fallback to basic domain info on timeout or blocked fetch
        previewData = {
          url: trimmedUrl,
          title: parsedUrl.hostname.replace(/^www\./, ""),
          description: `Visit ${parsedUrl.hostname}`,
          image: null,
          siteName: parsedUrl.hostname.replace(/^www\./, ""),
          domain: parsedUrl.hostname.replace(/^www\./, ""),
        };
      }
    }

    if (!previewData) {
      previewData = {
        url: trimmedUrl,
        title: parsedUrl.hostname,
        description: `Explore link on ${parsedUrl.hostname}`,
        image: null,
        siteName: parsedUrl.hostname,
        domain: parsedUrl.hostname,
      };
    }

    // Save in cache
    previewCache.set(trimmedUrl, { data: previewData, timestamp: Date.now() });

    return NextResponse.json({
      status: "success",
      preview: previewData,
    });
  } catch (error: any) {
    console.error("GET /api/link-preview error:", error);
    return NextResponse.json({ status: "error", message: "Failed to generate link preview" }, { status: 500 });
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}
