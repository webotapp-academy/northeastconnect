import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string; district?: string; term?: string; page?: string }>;
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
  const { category = "", district = "", term = "", page = "1" } = await searchParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const perPage = 12;

  // Build query filter matching directory listings
  const where: any = {};

  if (category) {
    where.category = category;
  }
  if (district) {
    where.district = district;
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

  const [directoryList, totalResults, categories, districts] = await Promise.all([
    db.directory.findMany({
      where,
      orderBy: { id: "desc" },
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
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section matching legacy directory.php */}
      <header className="relative min-h-[50vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-teal-800 opacity-90 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Business Directory of Assam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6 pt-20">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white">
            Business Directory
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto">
            Discover local businesses, services, and opportunities in Assam
          </p>

          {/* Live Autocomplete Hero Search */}
          <HeroSearch
            placeholder="Search businesses, services, or locations..."
            actionUrl="/directory"
            buttonBgColor="bg-green-600 hover:bg-green-700"
            focusBorderColor="focus:border-green-500"
            defaultValue={term}
          />

          {/* Quick Stats matching legacy directory.php */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm sm:text-base">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">{uniqueCategories.length}+</span> Business Categories
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">{uniqueDistricts.length}+</span> Districts
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">500+</span> Listings
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar Filter on Left & Horizontal List View on Right */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* 1. Sidebar Filters on Left matching legacy directory.php */}
            <aside className="w-full md:w-1/4 shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
                  Filters
                </h3>
                <form action="/directory" method="GET" className="space-y-6">
                  {term && <input type="hidden" name="term" value={term} />}

                  {/* Category Filter */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Category</label>
                    <select
                      name="category"
                      defaultValue={category}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 bg-white text-gray-900 text-sm"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat!}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Filter */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">District</label>
                    <select
                      name="district"
                      defaultValue={district}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 bg-white text-gray-900 text-sm"
                    >
                      <option value="">All Districts</option>
                      {uniqueDistricts.map((dist) => (
                        <option key={dist} value={dist!}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Apply & Clear Buttons */}
                  <div className="flex flex-col space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition duration-300 font-semibold text-sm shadow cursor-pointer"
                    >
                      Apply Filters
                    </button>
                    {(category || district || term) && (
                      <Link
                        href="/directory"
                        className="w-full text-center text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition"
                      >
                        Clear Filters
                      </Link>
                    )}
                  </div>
                </form>
              </div>
            </aside>

            {/* 2. Listings List View on Right matching legacy directory.php */}
            <main className="w-full md:w-3/4">
              {/* Header Title & Active Filter Tags */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {totalResults} {totalResults === 1 ? "Business" : "Businesses"}
                    {term && (
                      <span className="text-gray-500 text-lg font-normal"> matching &quot;{term}&quot;</span>
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {category && (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Category: {category}
                      </span>
                    )}
                    {district && (
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                        District: {district}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {directoryList.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-gray-400 text-6xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No businesses found matching your criteria.</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search term.</p>
                  <Link href="/directory" className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm">
                    View all listings &rarr;
                  </Link>
                </div>
              ) : (
                <>
                  {/* List View Vertical Stack of Horizontal Cards matching legacy directory.php */}
                  <div className="space-y-6">
                    {directoryList.map((item) => {
                      const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      const detailUrl = `/directory/${slug}-${item.id}`;
                      const cleanDesc = stripHtml(item.description);
                      const rawImgs = item.imageUrls ? item.imageUrls.split(",") : [];
                      const mainImage = rawImgs[0] ? formatImageSrc(rawImgs[0]) : null;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-xl transition-all duration-300"
                        >
                          {/* Image Container (Left 1/3) */}
                          <div className="w-full sm:w-1/3 relative bg-gray-100 shrink-0 min-h-[180px] flex items-center justify-center">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={item.businessName}
                                className="w-full h-full object-cover min-h-[180px]"
                              />
                            ) : (
                              <div className="w-full h-full min-h-[180px] bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center p-6">
                                <svg className="w-16 h-16 text-green-600/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            )}

                            {/* Category Badge Tag Overlay */}
                            <div className="absolute top-3 left-3">
                              <span className="bg-green-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                                {item.category || "Services"}
                              </span>
                            </div>
                          </div>

                          {/* Content Container (Right 2/3) */}
                          <div className="w-full sm:w-2/3 p-6 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-xl font-bold text-gray-800 hover:text-green-600 transition leading-snug">
                                  <Link href={detailUrl}>{item.businessName}</Link>
                                </h3>
                                {item.rating && Number(item.rating) > 0 && (
                                  <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs shrink-0">
                                    ★ {Number(item.rating).toFixed(1)}
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mt-2">
                                {cleanDesc}
                              </p>

                              {/* Address */}
                              <div className="text-xs text-gray-500 flex items-center mt-3 font-medium">
                                <svg className="w-4 h-4 mr-1 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{item.address || `${item.district || "Kamrup Metro"}, Assam`}</span>
                              </div>
                            </div>

                            {/* Bottom Contact & View Button Row */}
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                              <span className="text-gray-500 font-medium truncate max-w-[200px]">
                                📞 {item.contactNumber || item.email || "Verified Listing"}
                              </span>
                              <Link
                                href={detailUrl}
                                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-xs shadow"
                              >
                                View Listing &rarr;
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination matching legacy directory.php */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center space-x-2">
                      {pageNum > 1 && (
                        <Link
                          href={`/directory?page=${pageNum - 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-sm font-semibold"
                        >
                          &larr; Previous
                        </Link>
                      )}
                      <span className="text-sm font-medium text-gray-600 px-4">
                        Page {pageNum} of {totalPages}
                      </span>
                      {pageNum < totalPages && (
                        <Link
                          href={`/directory?page=${pageNum + 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 text-sm font-semibold"
                        >
                          Next &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </main>
  );
}
