import Link from "next/link";
import { db } from "@/lib/db";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

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

export default async function NewsPage({ searchParams }: PageProps) {
  const { page = "1" } = await searchParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 12;

  const [newsList, totalResults] = await Promise.all([
    db.news.findMany({
      where: { status: "Published" },
      orderBy: { publishedDate: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    db.news.count({ where: { status: "Published" } }),
  ]);

  const totalPages = Math.ceil(totalResults / perPage);

  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Assam News Hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-4 pt-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">
            Latest News
          </h1>
          <p className="text-gray-200 text-lg md:text-xl">
            Stay informed about culture, tourism, and events across Assam.
          </p>
        </div>
      </header>

      {/* News Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 space-y-2">
            <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">
              Exclusive Updates
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Latest News &amp; Stories
            </h2>
            <p className="text-gray-500 text-base">
              Discover what’s happening across Assam right now
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {newsList.map((n) => {
              const articleHref = `/news/${encodeURIComponent(n.url || String(n.id))}`;
              const images = n.imageUrls ? n.imageUrls.split(",") : [];
              const mainImage = images[0]
                ? formatImageSrc(images[0])
                : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60";

              return (
                <article
                  key={n.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <Link href={articleHref}>
                      <img
                        src={mainImage}
                        alt={n.title}
                        className="w-full h-60 object-cover hover:opacity-90 transition-opacity"
                      />
                    </Link>
                    <div className="p-6 space-y-3">
                      <div className="text-xs text-gray-500 font-medium">
                        {n.category || "General"} &bull;{" "}
                        {n.publishedDate
                          ? new Date(n.publishedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent"}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                        <Link href={articleHref} className="hover:text-emerald-700 transition">
                          {n.title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {stripHtml(n.content)}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Link
                      href={articleHref}
                      className="text-blue-600 font-bold hover:underline inline-flex items-center text-sm"
                    >
                      Read more &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              {pageNum > 1 && (
                <Link
                  href={`/news?page=${pageNum - 1}`}
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm font-semibold"
                >
                  &larr; Previous
                </Link>
              )}
              <span className="text-sm font-medium text-gray-600 px-4">
                Page {pageNum} of {totalPages}
              </span>
              {pageNum < totalPages && (
                <Link
                  href={`/news?page=${pageNum + 1}`}
                  className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm font-semibold"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
