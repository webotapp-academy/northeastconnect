import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import GoogleAd from "@/components/GoogleAd";
import CommentSection from "@/components/comments/CommentSection";
import { cache } from "react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

function formatImageSrc(imgStr: string | null | undefined): string | null {
  if (!imgStr) return null;
  const trimmed = imgStr.trim();
  if (
    trimmed === "" ||
    trimmed === "null" ||
    trimmed === "undefined" ||
    trimmed === "[]" ||
    trimmed === "{}"
  )
    return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/"))
    return trimmed;
  if (!/\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(trimmed)) return null;
  return `/assets/images/${trimmed}`;
}

function stripHtml(htmlStr: string | null | undefined): string {
  if (!htmlStr) return "";
  return htmlStr
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Cached per-request so generateMetadata and the page body share one DB lookup.
const getArticle = cache(async (decodedParam: string) => {
  const numericId = parseInt(decodedParam, 10);

  if (!isNaN(numericId)) {
    const byId = await db.news.findUnique({ where: { id: numericId } });
    if (byId) return byId;
  }

  return db.news.findFirst({ where: { url: decodedParam } });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const decodedParam = decodeURIComponent(id);
  const article = await getArticle(decodedParam);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const description = stripHtml(article.content).slice(0, 160);
  const rawImages = article.imageUrls ? article.imageUrls.split(",") : [];
  const imageList: string[] = rawImages
    .map(formatImageSrc)
    .filter((img): img is string => typeof img === "string" && img.length > 0 && !img.includes("null") && !img.includes("undefined"));
  const mainImage = imageList.length > 0 ? imageList[0] : null;
  const canonicalPath = `/news/${article.url || article.id}`;
  const keywords = article.tags ? article.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined;

  return {
    title: article.title,
    description,
    keywords,
    authors: [{ name: article.author || "Editorial Team" }],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title: article.title,
      description,
      url: canonicalPath,
      siteName: "North East Connect",
      publishedTime: article.publishedDate ? new Date(article.publishedDate).toISOString() : undefined,
      authors: [article.author || "Editorial Team"],
      section: article.category || "News",
      tags: keywords,
      images: mainImage ? [{ url: mainImage, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: mainImage ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: mainImage ? [mainImage] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decodedParam = decodeURIComponent(id);

  const article = await getArticle(decodedParam);

  if (!article) {
    notFound();
  }

  // Increment view count asynchronously
  db.news.update({
    where: { id: article.id },
    data: { viewsCount: { increment: 1 } },
  }).catch(() => null);

  // Fetch 6 recent articles for "More News" grid
  const moreNews = await db.news.findMany({
    where: {
      status: "Published",
      id: { not: article.id },
    },
    orderBy: { publishedDate: "desc" },
    take: 6,
  });

  const rawImages = article.imageUrls ? article.imageUrls.split(",") : [];
  const imageList: string[] = rawImages
    .map(formatImageSrc)
    .filter((img): img is string => typeof img === "string" && img.length > 0 && !img.includes("null") && !img.includes("undefined"));
  const mainImage = imageList.length > 0 ? imageList[0] : null;
  const galleryImages = imageList.slice(1);

  // Process article content to preserve ALL HTML blocks (paragraphs, tables, headings, lists, quotes)
  // while allowing in-article sponsored banner placements cleanly
  const rawContent = article.content || "";
  let contentBlocks: string[] = [];

  if (/<(p|table|h[1-6]|ul|ol|blockquote|div|section)/i.test(rawContent)) {
    // Regex matching any top-level HTML element
    const blockRegex = /<(p|table|h[1-6]|ul|ol|blockquote|div|section|figure|article)[\s\S]*?<\/\1>|<(hr|img)[^>]*\/?>/gi;
    const matches = rawContent.match(blockRegex);
    if (matches && matches.length > 0) {
      contentBlocks = matches;
    } else {
      contentBlocks = [rawContent];
    }
  } else {
    // Plain text content
    const text = rawContent.replace(/\r\n|\r/g, "\n");
    const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      contentBlocks = parts.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`);
    } else if (text.trim()) {
      const sentences = text.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length >= 4) {
        const mid = Math.ceil(sentences.length / 2);
        contentBlocks = [
          `<p>${sentences.slice(0, mid).join(" ").trim()}</p>`,
          `<p>${sentences.slice(mid).join(" ").trim()}</p>`,
        ];
      } else {
        contentBlocks = [`<p>${text.replace(/\n/g, "<br />")}</p>`];
      }
    }
  }

  const formattedDate = article.publishedDate
    ? new Date(article.publishedDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const jsonLdNews = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: mainImage ? [mainImage] : undefined,
    datePublished: article.publishedDate ? new Date(article.publishedDate).toISOString() : new Date().toISOString(),
    author: [{ "@type": "Person", name: article.author || "Editorial Team" }],
    publisher: {
      "@type": "Organization",
      name: "North East Connect",
      logo: { "@type": "ImageObject", url: "https://northeastconnect.in/assets/images/logo.png" },
    },
    description: article.content ? article.content.slice(0, 160) : article.title,
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://northeastconnect.in"
    }, {
      "@type": "ListItem",
      position: 2,
      name: "News",
      item: "https://northeastconnect.in/news"
    }, {
      "@type": "ListItem",
      position: 3,
      name: article.title,
      item: `https://northeastconnect.in/news/${article.url || article.id}`
    }]
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans pt-4 pb-16 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNews) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to News &amp; Updates</span>
          </Link>
        </div>

        {/* Main Article Container (Glossy) */}
        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-6">
          {/* Category & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800/60 uppercase tracking-wider">
                {article.category || "Regional News"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>By <strong className="text-slate-800 dark:text-slate-200">{article.author || "Editorial Team"}</strong></span>
              <span>&bull;</span>
              <span>👁 {article.viewsCount || 1} views</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3.5xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Social Share Bar */}
          <div className="flex items-center gap-2.5 py-2.5 border-y border-slate-100 dark:border-slate-800 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Share:</span>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=https://northeastconnect.in/news/${article.url || article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-blue-500 cursor-pointer"
              title="Share on Facebook"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 4.97 3.64 9.09 8.39 9.93v-7.02H7.9v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.75h2.57l-.41 2.9h-2.16V22c4.75-.84 8.39-4.96 8.39-9.93z"/></svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-800 dark:text-slate-200 cursor-pointer"
              title="Share on X"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2H21.5l-7.5 8.565L22.5 22h-7.373l-5.367-6.234L3.5 22H.244l8.258-9.43L.5 2h7.5l4.843 5.616L18.244 2zm-1.292 18h2.053L7.123 4h-2.05L16.952 20z"/></svg>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-emerald-600 dark:text-emerald-400 cursor-pointer"
              title="Share on WhatsApp"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.79 11.79 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.52 5.81L0 24l6.34-1.66A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.3-6.11-3.48-8.52zM12 21.82c-1.91 0-3.68-.55-5.17-1.5l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.82 9.82 0 1 1 12 21.82zm5.67-7.5c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.22-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.63.13-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.53.08-.82.38-.28.31-1.07 1.04-1.07 2.54 0 1.49 1.1 2.93 1.25 3.12.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.42.2 1.96.12.6-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.08-.12-.28-.2-.58-.35z"/></svg>
            </a>
          </div>

          {/* Featured Main Image */}
          {mainImage && (
            <div className="w-full rounded-2xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <img
                src={mainImage}
                alt={article.title}
                className="w-full max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* Article Body with In-Between Sponsored Banners */}
          <article className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-[1.85] font-sans space-y-5 my-6 prose dark:prose-invert prose-emerald max-w-none">
            {contentBlocks.map((block, idx) => (
              <div key={idx} className="space-y-4">
                <div
                  className="article-html-block overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: block }}
                />

                {/* 1st In-Article Sponsored Banner after 2nd block (or after 1st if short) */}
                {((contentBlocks.length > 2 && idx === 1) || (contentBlocks.length === 2 && idx === 0)) && (
                  <div className="my-6 not-prose">
                    <GoogleAd format="horizontal" responsive={true} />
                  </div>
                )}

                {/* 2nd In-Article Sponsored Banner after 6th block if article is long */}
                {contentBlocks.length >= 7 && idx === 5 && (
                  <div className="my-6 not-prose">
                    <GoogleAd format="horizontal" responsive={true} />
                  </div>
                )}
              </div>
            ))}
          </article>

          {/* Attached Images */}
          {galleryImages.length > 0 && (
            <section className="my-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Attached Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group">
                    <img
                      src={imgUrl}
                      alt={`Attached image ${idx + 1}`}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {article.tags && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1">Tags:</span>
              {article.tags.split(",").map((tag, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-300">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* End-of-Article Clean Sponsored Banner */}
          <GoogleAd format="horizontal" responsive={true} className="max-w-3xl mx-auto my-6" />

          {/* Universal Comments & Community Discussion */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <CommentSection
              entityType="news"
              entityId={article.id}
              entityTitle={article.title}
              entityUrl={`/news/${article.url || article.id}`}
            />
          </div>
        </div>

        {/* More Regional News Section (Glossy Minimal Cards without Thumbnails) */}
        {moreNews.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  More Regional News
                </h2>
              </div>
              <Link
                href="/news"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition flex items-center gap-1"
              >
                <span>View all news</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreNews.map((item) => {
                const articleHref = `/news/${encodeURIComponent(item.url || String(item.id))}`;

                return (
                  <Link
                    key={item.id}
                    href={articleHref}
                    className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 hover:border-emerald-500/70 hover:bg-white/90 dark:hover:bg-slate-850 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Meta header */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 rounded-md uppercase tracking-wider">
                          {item.category || "News"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>

                      {/* Headline */}
                      <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {stripHtml(item.content)}
                      </p>
                    </div>

                    {/* Bottom Action link */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:text-emerald-500 flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                        Read Story &rarr;
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        3 min read
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
