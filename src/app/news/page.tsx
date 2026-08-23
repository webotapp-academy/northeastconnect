import Link from "next/link";
import { db } from "@/lib/db";
import GoogleAd from "@/components/GoogleAd";

export const revalidate = 60;

const NE_STATES = [
  { name: "All States", icon: "🏔️" },
  { name: "Assam", icon: "🦏" },
  { name: "Meghalaya", icon: "🌧️" },
  { name: "Arunachal", icon: "☀️" },
  { name: "Manipur", icon: "💃" },
  { name: "Mizoram", icon: "🎋" },
  { name: "Nagaland", icon: "🦅" },
  { name: "Sikkim", icon: "❄️" },
  { name: "Tripura", icon: "🏛️" },
];

interface PageProps {
  searchParams: Promise<{ page?: string; state?: string }>;
}

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

export default async function NewsPage({ searchParams }: PageProps) {
  const { page = "1", state = "" } = await searchParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 12;

  const where: any = { status: "Published" };
  if (state && state !== "All States") {
    where.OR = [
      { title: { contains: state, mode: "insensitive" } },
      { content: { contains: state, mode: "insensitive" } },
      { category: { contains: state, mode: "insensitive" } },
    ];
  }

  const [newsList, totalResults] = await Promise.all([
    db.news.findMany({
      where,
      orderBy: { publishedDate: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    db.news.count({ where }),
  ]);

  const totalPages = Math.ceil(totalResults / perPage);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans pt-3 sm:pt-5 pb-16 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* State Quick Switcher */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = (state === "" && st.name === "All States") || state === st.name;
              const href = st.name === "All States" ? "/news" : `/news?state=${encodeURIComponent(st.name)}`;
              return (
                <Link
                  key={st.name}
                  href={href}
                  className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <span>{st.icon}</span>
                  <span>{st.name === "All States" ? "n:all" : `n:${st.name.toLowerCase().replace(/\s+/g, "")}`}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Header Card (Glossy) */}
        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Regional News
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Latest News &amp; Culture Stories
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Stay updated with regional developments, culture, tourism, and community events across Northeast India
              </p>
            </div>

            <div className="text-xs font-medium shrink-0">
              <span className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{totalResults}</strong> Articles
              </span>
            </div>
          </div>
        </div>

        {/* Top News Google Ad */}
        <GoogleAd format="horizontal" responsive={true} className="mb-6" />

        {/* News Grid (Glossy Cards) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {newsList.map((n) => {
            const articleHref = `/news/${encodeURIComponent(n.url || String(n.id))}`;
            const images = n.imageUrls ? n.imageUrls.split(",").map((u) => u.trim()).filter(Boolean) : [];
            const mainImage = images[0] ? formatImageSrc(images[0]) : null;

            return (
              <article
                key={n.id}
                className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Render Image ONLY if mainImage is present and valid */}
                  {mainImage && (
                    <Link href={articleHref} className="block relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={mainImage}
                        alt={n.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white border border-slate-700/60 rounded-md shadow-xs uppercase tracking-wider">
                        {n.category || "General"}
                      </span>
                    </Link>
                  )}

                  <div className="p-5 space-y-2">
                    {/* Header with category and date if no image */}
                    {!mainImage ? (
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 rounded-md uppercase tracking-wider">
                          {n.category || "General"}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {n.publishedDate
                            ? new Date(n.publishedDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {n.publishedDate
                          ? new Date(n.publishedDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent"}
                      </div>
                    )}

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={articleHref}>{n.title}</Link>
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {stripHtml(n.content)}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Regional Story
                  </span>
                  <Link
                    href={articleHref}
                    className="px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition"
                  >
                    Read Article &rarr;
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            {pageNum > 1 && (
              <Link
                href={`/news?page=${pageNum - 1}${state ? `&state=${state}` : ""}`}
                className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                &larr; Prev
              </Link>
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3">
              Page {pageNum} of {totalPages}
            </span>
            {pageNum < totalPages && (
              <Link
                href={`/news?page=${pageNum + 1}${state ? `&state=${state}` : ""}`}
                className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
              >
                Next &rarr;
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
