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
  searchParams: Promise<{
    category?: string;
    district?: string;
    term?: string;
    page?: string;
    state?: string;
    sort?: string;
  }>;
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

export default async function DirectoryPage({ searchParams }: PageProps) {
  const {
    category = "",
    district = "",
    term = "",
    page = "1",
    state = "",
    sort = "views",
  } = await searchParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 12;

  const where: any = {};
  if (category) where.category = category;
  if (district) where.district = district;
  if (state && state !== "All States") {
    where.OR = [
      { address: { contains: state, mode: "insensitive" } },
      { district: { contains: state, mode: "insensitive" } },
      { description: { contains: state, mode: "insensitive" } },
    ];
  }
  if (term) {
    where.AND = [
      {
        OR: [
          { businessName: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { category: { contains: term, mode: "insensitive" } },
          { district: { contains: term, mode: "insensitive" } },
          { address: { contains: term, mode: "insensitive" } },
        ],
      },
    ];
  }

  let orderBy: any = [{ viewsCount: "desc" }, { id: "desc" }];
  if (sort === "newest") {
    orderBy = [{ id: "desc" }];
  } else if (sort === "rating") {
    orderBy = [{ rating: "desc" }, { reviewsCount: "desc" }, { viewsCount: "desc" }];
  } else if (sort === "alpha") {
    orderBy = [{ businessName: "asc" }];
  } else {
    // Default: Sort by most viewed listings on top
    orderBy = [{ viewsCount: "desc" }, { id: "desc" }];
  }

  const [directoryList, totalResults, categories, districts] = await Promise.all([
    db.directory.findMany({
      where,
      orderBy,
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    db.directory.count({ where }),
    db.directory.findMany({ select: { category: true }, distinct: ["category"] }),
    db.directory.findMany({ select: { district: true }, distinct: ["district"] }),
  ]);

  const uniqueCategories = categories.map((c) => c.category).filter(Boolean);
  const uniqueDistricts = districts.map((d) => d.district).filter(Boolean);
  const totalPages = Math.ceil(totalResults / perPage);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans pt-3 sm:pt-5 pb-16 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* ========================================================================= */}
        {/* TOP STATE PILLS BAR (Matching Homepage Adda Switcher)                     */}
        {/* ========================================================================= */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = (state === "" && st.name === "All States") || state === st.name;
              const href = st.name === "All States" ? "/directory" : `/directory?state=${encodeURIComponent(st.name)}`;
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

        {/* ========================================================================= */}
        {/* TOP GLOSSY HEADER & SEARCH CARD                                           */}
        {/* ========================================================================= */}
        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Verified Directory
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Business Directory &amp; Services
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Discover verified businesses, local services, and enterprises across Northeast India
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{totalResults}</strong> Listings
              </span>
              <span className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{uniqueCategories.length}</strong> Categories
              </span>
            </div>
          </div>

          {/* Integrated Glossy Search & Filter Form */}
          <form action="/directory" method="GET" className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
            {state && <input type="hidden" name="state" value={state} />}
            <div className="flex-1 relative">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="term"
                defaultValue={term}
                placeholder="Search businesses, services, or locations..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                name="category"
                defaultValue={category}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat!}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                name="district"
                defaultValue={district}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Districts</option>
                {uniqueDistricts.map((dist) => (
                  <option key={dist} value={dist!}>
                    {dist}
                  </option>
                ))}
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer font-medium"
              >
                <option value="views">🔥 Most Viewed (Default)</option>
                <option value="newest">🆕 Newest Added</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="alpha">🔤 Name (A-Z)</option>
              </select>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Active Filter Badges */}
          {(category || district || term || (state && state !== "All States") || (sort && sort !== "views")) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Active:</span>
              {state && state !== "All States" && (
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full font-bold">
                  📍 {state}
                </span>
              )}
              {sort && sort !== "views" && (
                <span className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 rounded-full font-bold">
                  ⚡ Sorted: {sort === "newest" ? "Newest" : sort === "rating" ? "Highest Rated" : "Name (A-Z)"}
                </span>
              )}
              {category && (
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full font-medium">
                  {category}
                </span>
              )}
              {district && (
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-medium">
                  {district}
                </span>
              )}
              {term && (
                <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full font-medium">
                  &quot;{term}&quot;
                </span>
              )}
              <Link href="/directory" className="text-rose-500 hover:underline font-bold ml-1">
                Clear all
              </Link>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MAIN 2-COLUMN CONTENT LAYOUT (Matching Homepage Aesthetic)                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Listings Stream */}
          <div className="lg:col-span-8 space-y-4">
            {directoryList.length === 0 ? (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
                  🏢
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No businesses found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try clearing filters or searching with a different term.</p>
                <Link
                  href="/directory"
                  className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition"
                >
                  View all businesses
                </Link>
              </div>
            ) : (
              directoryList.map((item) => {
                const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const detailUrl = `/listing/${slug}-${item.id}`;
                const cleanDesc = stripHtml(item.description);
                const rawImgs = item.imageUrls ? item.imageUrls.split(",") : [];
                const mainImage = rawImgs[0] ? formatImageSrc(rawImgs[0]) : null;

                return (
                  <article
                    key={item.id}
                    className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row gap-5 group"
                  >
                    {/* Thumbnail or Icon Banner */}
                    {mainImage ? (
                      <div className="w-full sm:w-44 h-40 sm:h-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 relative border border-slate-200/80 dark:border-slate-800">
                        <img
                          src={mainImage}
                          alt={item.businessName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white border border-slate-700/60 rounded-md shadow-xs uppercase tracking-wider">
                          {item.category || "Services"}
                        </span>
                      </div>
                    ) : (
                      <div className="w-full sm:w-36 h-28 sm:h-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-slate-800 dark:to-slate-850 border border-emerald-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center shrink-0 p-3 text-center">
                        <span className="text-3xl mb-1">🏢</span>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {item.category || "Verified"}
                        </span>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={detailUrl} className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug">
                            {item.businessName}
                          </Link>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <span>👁️</span>
                              <span>{(item.viewsCount || 0).toLocaleString()}</span>
                            </span>
                            {item.rating && Number(item.rating) > 0 && (
                              <span className="text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-full text-xs font-bold">
                                ★ {Number(item.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                          {cleanDesc}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{item.address || `${item.district || "Kamrup"}, Assam`}</span>
                        </div>
                      </div>

                      {/* Footer Actions (Glossy Pills) */}
                      <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {item.contactNumber ? `📞 ${item.contactNumber}` : "Verified Business"}
                        </span>
                        <Link
                          href={detailUrl}
                          className="px-4 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition"
                        >
                          View Details &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {/* Pagination (Glossy Pills) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4">
                {pageNum > 1 && (
                  <Link
                    href={`/directory?page=${pageNum - 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}${state ? `&state=${state}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className="px-4 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    &larr; Prev
                  </Link>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
                  Page {pageNum} of {totalPages}
                </span>
                {pageNum < totalPages && (
                  <Link
                    href={`/directory?page=${pageNum + 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}${state ? `&state=${state}` : ""}${sort ? `&sort=${sort}` : ""}`}
                    className="px-4 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 transition"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-4">
            {/* Ad Widget */}
            <GoogleAd format="rectangle" responsive={true} />

            {/* Popular Categories Card (Glossy) */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                <span>📂</span> Top Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {uniqueCategories.slice(0, 18).map((cat) => (
                  <Link
                    key={cat}
                    href={`/directory?category=${encodeURIComponent(cat!)}`}
                    className="px-3 py-1 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700/60 transition"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* List Your Business CTA (Glossy) */}
            <div className="bg-gradient-to-br from-emerald-600/90 to-teal-700/90 text-white rounded-3xl p-6 shadow-lg shadow-emerald-900/20 text-center">
              <h3 className="font-extrabold text-base mb-1.5">Own a local business?</h3>
              <p className="text-xs text-emerald-100/90 mb-4 leading-relaxed">
                Get discovered by travelers and local residents across all 8 Northeast states.
              </p>
              <Link
                href="/contact"
                className="inline-block px-5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold rounded-full shadow-xs transition"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
