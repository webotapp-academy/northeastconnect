import Link from "next/link";
import { db } from "@/lib/db";

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
  searchParams: Promise<{ type?: string; term?: string; state?: string }>;
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

export default async function CulturePage({ searchParams }: PageProps) {
  const { type = "", term = "", state = "" } = await searchParams;

  const where: any = {};
  if (type) where.type = type;
  if (state && state !== "All States") {
    where.OR = [
      { location: { contains: state, mode: "insensitive" } },
      { description: { contains: state, mode: "insensitive" } },
      { name: { contains: state, mode: "insensitive" } },
    ];
  }
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { location: { contains: term, mode: "insensitive" } },
    ];
  }

  const [cultureList, types] = await Promise.all([
    db.culture.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    db.culture.findMany({ select: { type: true }, distinct: ["type"] }),
  ]);

  const uniqueTypes = types.map((t) => t.type).filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans pt-3 sm:pt-5 pb-16 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* State Quick Switcher */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = (state === "" && st.name === "All States") || state === st.name;
              const href = st.name === "All States" ? "/culture" : `/culture?state=${encodeURIComponent(st.name)}`;
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
                  Heritage &amp; Festivals
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Cultural Heritage of Northeast India
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Explore ancient traditions, vibrant festivals, folk arts, and sacred monuments across the 8 states
              </p>
            </div>

            <div className="text-xs font-medium shrink-0">
              <span className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{cultureList.length}</strong> Heritage &amp; Festivals
              </span>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <form action="/culture" method="GET" className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
            {state && <input type="hidden" name="state" value={state} />}
            <div className="flex-1 relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="term"
                defaultValue={term}
                placeholder="Search festivals, dance forms, heritage places..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="flex gap-2">
              <select
                name="type"
                defaultValue={type}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Categories</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t!}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 shadow-xs"
              >
                Filter
              </button>
            </div>
          </form>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
            <Link
              href="/culture"
              className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                !type
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60"
              }`}
            >
              All
            </Link>
            {uniqueTypes.map((t) => (
              <Link
                key={t}
                href={`/culture?type=${encodeURIComponent(t!)}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition shrink-0 ${
                  type === t
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        {/* Culture Grid (Glossy Cards) */}
        {cultureList.length === 0 ? (
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
              🎭
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No cultural events or sites found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try clearing your filters or searching with another keyword.</p>
            <Link
              href="/culture"
              className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition"
            >
              View all heritage
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cultureList.map((item) => {
              const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const detailUrl = `/culture/${slug}-${item.id}`;
              const images = item.imageUrls ? item.imageUrls.split(",") : [];
              const mainImage = images[0] ? formatImageSrc(images[0]) : "https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60";
              const cleanDesc = stripHtml(item.description);

              return (
                <article
                  key={item.id}
                  className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <Link href={detailUrl} className="block relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={mainImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.type && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white border border-slate-700/60 rounded-md shadow-xs uppercase tracking-wider">
                          {item.type}
                        </span>
                      )}
                    </Link>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        <Link href={detailUrl}>{item.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {cleanDesc}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-3 pt-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      📍 {item.location || "Northeast India"}
                    </span>
                    <Link
                      href={detailUrl}
                      className="px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition"
                    >
                      Explore &rarr;
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
