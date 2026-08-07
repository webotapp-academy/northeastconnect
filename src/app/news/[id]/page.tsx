import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

function formatImageSrc(imgStr: string): string {
  if (!imgStr) return "";
  const trimmed = imgStr.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
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
  const mainImage = rawImages[0] ? formatImageSrc(rawImages[0]) : `${siteUrl}/assets/images/hero.jpg`;
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
      images: [{ url: mainImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [mainImage],
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
  const imageList = rawImages.map(formatImageSrc).filter(Boolean);
  const mainImage = imageList[0] || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60";
  const galleryImages = imageList.slice(1);

  // Render HTML content cleanly like PHP article.php (echo $renderContent)
  const rawContent = article.content || "";
  let renderHtml = rawContent;

  if (!/<\s*p\b/i.test(renderHtml)) {
    const text = renderHtml.replace(/\r\n|\r/g, "\n");
    const parts = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      renderHtml = parts.map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`).join("\n");
    }
  }

  const formattedDate = article.publishedDate
    ? new Date(article.publishedDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const jsonLdNews = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    image: [mainImage],
    datePublished: article.publishedDate ? new Date(article.publishedDate).toISOString() : new Date().toISOString(),
    author: [{ "@type": "Person", name: article.author || "Editorial Team" }],
    publisher: {
      "@type": "Organization",
      name: "North East Connect",
      logo: { "@type": "ImageObject", url: "https://northeastconnect.in/assets/images/logo.png" },
    },
    description: article.content ? article.content.slice(0, 160) : article.title,
  };

  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdNews) }}
      />
      {/* Hero Header matching legacy article.php */}
      <header className="relative min-h-[25vh] flex items-center justify-center text-center px-4 bg-gray-900">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90 z-10" />
          <img
            src={mainImage}
            alt={article.title}
            className="w-full h-full object-cover filter brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto py-16">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
            {article.title}
          </h1>
        </div>
      </header>

      {/* Main Article Content */}
      <div className="w-full max-w-[940px] mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium border-b border-gray-100 pb-4">
          <span>{formattedDate} &bull; <strong className="text-emerald-700 uppercase">{article.category || "News"}</strong></span>
          <span>👁 {article.viewsCount || 1} views</span>
        </div>

        {/* Featured Main Image */}
        {mainImage && (
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <img
              src={mainImage}
              alt={article.title}
              className="w-full max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        )}

        {/* Social Share Bar */}
        <div className="flex items-center gap-3 py-3 border-y border-gray-200/60 my-6 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Share:</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://northeastconnect.in/news/${article.url || article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition text-blue-600"
            title="Share on Facebook"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.48 17.52 2 11.93 2 6.35 2 1.86 6.48 1.86 12.07c0 4.97 3.64 9.09 8.39 9.93v-7.02H7.9v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.75h2.57l-.41 2.9h-2.16V22c4.75-.84 8.39-4.96 8.39-9.93z"/></svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition text-gray-900"
            title="Share on X"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2H21.5l-7.5 8.565L22.5 22h-7.373l-5.367-6.234L3.5 22H.244l8.258-9.43L.5 2h7.5l4.843 5.616L18.244 2zm-1.292 18h2.053L7.123 4h-2.05L16.952 20z"/></svg>
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:shadow-md transition text-green-600"
            title="Share on WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.79 11.79 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.09 1.52 5.81L0 24l6.34-1.66A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.3-6.11-3.48-8.52zM12 21.82c-1.91 0-3.68-.55-5.17-1.5l-.37-.22-3.77.99 1.01-3.67-.24-.38A9.82 9.82 0 1 1 12 21.82zm5.67-7.5c-.31-.15-1.82-.9-2.1-1-.28-.1-.49-.15-.7.15-.2.31-.8 1-.98 1.2-.18.2-.36.22-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.52-1.8-1.7-2.1-.18-.31-.02-.48.13-.63.13-.13.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.53-.07-.15-.7-1.67-.96-2.29-.25-.6-.51-.52-.7-.53h-.6c-.2 0-.53.08-.82.38-.28.31-1.07 1.04-1.07 2.54 0 1.49 1.1 2.93 1.25 3.12.15.2 2.17 3.31 5.26 4.64.74.32 1.31.51 1.76.65.74.24 1.42.2 1.96.12.6-.09 1.82-.74 2.08-1.46.26-.72.26-1.34.18-1.46-.08-.12-.28-.2-.58-.35z"/></svg>
          </a>
        </div>

        {/* Ad Banner Placeholder matching legacy */}
        <div className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 text-center text-xs text-gray-500">
          Ad Placeholder (728x90)
        </div>

        {/* Article Body Content rendered natively as HTML */}
        <article className="text-gray-900 text-lg leading-[1.8] font-sans space-y-4 my-8 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: renderHtml }} />
        </article>

        {/* Attached Images Section */}
        {galleryImages.length > 0 && (
          <section className="my-10 pt-8 border-t border-gray-200 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Attached Media &amp; Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden shadow-md border border-gray-200 group">
                  <img
                    src={imgUrl}
                    alt={`Attached image ${idx + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {article.tags && (
          <div className="pt-4 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Tags:</span>
            {article.tags.split(",").map((tag, idx) => (
              <span key={idx} className="text-xs px-3 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* In-article Ad Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 text-center text-xs text-gray-500">
            Ad Placeholder (In-article)
          </div>
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-4 text-center text-xs text-gray-500">
            Ad Placeholder (300x250)
          </div>
        </div>

        {/* More News Section matching legacy article.php */}
        {moreNews.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="text-center mb-8">
              <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider block">
                You might also like
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">
                More News
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {moreNews.map((item) => {
                const articleHref = `/news/${encodeURIComponent(item.url || String(item.id))}`;
                const itemRawImgs = item.imageUrls ? item.imageUrls.split(",") : [];
                const itemImg = itemRawImgs[0]
                  ? formatImageSrc(itemRawImgs[0])
                  : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60";

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <Link href={articleHref}>
                        <img
                          src={itemImg}
                          alt={item.title}
                          className="w-full h-44 object-cover hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="p-4 space-y-2">
                        <div className="text-xs text-gray-500">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toISOString().split("T")[0]
                            : "Recent"}{" "}
                          &bull; {item.category || "News"}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">
                          <Link href={articleHref} className="hover:text-emerald-700">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-xs line-clamp-2">{stripHtml(item.content)}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <Link
                        href={articleHref}
                        className="text-blue-600 font-bold text-xs hover:underline"
                      >
                        Read Article &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
