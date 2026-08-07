import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string; district?: string; term?: string; page?: string }>;
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

  // Build query filter matching legacy directory.php
  const where: any = {
    OR: [
      { status: "Active" },
      { status: "active" },
      { status: "Available" },
      { status: null },
    ],
  };

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
      orderBy: { businessName: "asc" },
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
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[50vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-emerald-950/70 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Directory Hero"
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
            buttonBgColor="bg-emerald-600 hover:bg-emerald-700"
            focusBorderColor="focus:border-emerald-500"
            defaultValue={term}
          />

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm sm:text-base">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">500+</span> Verified Businesses
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">30+</span> Categories
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">35+</span> Districts Covered
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Filters Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <form action="/directory" method="GET" className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                name="category"
                defaultValue={category}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white/80 text-gray-900"
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
            <div className="flex-1 min-w-[200px]">
              <select
                name="district"
                defaultValue={district}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-emerald-500 bg-white/80 text-gray-900"
              >
                <option value="">All Districts</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d!}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition duration-300 min-w-[120px] font-semibold cursor-pointer shadow-md"
            >
              Filter
            </button>

            {/* Clear Link */}
            {(category || district || term) && (
              <Link href="/directory" className="text-gray-600 hover:text-gray-800 px-4 py-3 font-medium text-sm">
                Clear All
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Listings Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          {directoryList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-gray-400 text-6xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No businesses found</h3>
              <p className="text-gray-600 mb-6">Try clearing filters or search terms.</p>
              <Link href="/directory" className="inline-block bg-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold">
                Reset Filters &rarr;
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {directoryList.map((item) => {
                  const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  const detailUrl = `/directory/${slug}-${item.id}`;
                  const cleanDesc = stripHtml(item.description);

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider border border-emerald-100">
                            {item.category || "Services"}
                          </span>
                          {item.rating && Number(item.rating) > 0 && (
                            <span className="text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                              ★ {Number(item.rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-snug">
                          <Link href={detailUrl} className="hover:text-emerald-700 transition">
                            {item.businessName}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {cleanDesc}
                        </p>
                        <div className="text-xs text-gray-500 flex items-center pt-1 font-medium">
                          <svg className="w-4 h-4 mr-1 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{item.address || `${item.district}, Assam`}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium truncate max-w-[160px]">
                          📞 {item.contactNumber || item.email || "Verified Listing"}
                        </span>
                        <Link
                          href={detailUrl}
                          className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition font-medium text-xs shadow-sm"
                        >
                          View Listing &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center space-x-2">
                  {pageNum > 1 && (
                    <Link
                      href={`/directory?page=${pageNum - 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}`}
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
                      href={`/directory?page=${pageNum + 1}${category ? `&category=${category}` : ""}${district ? `&district=${district}` : ""}${term ? `&term=${term}` : ""}`}
                      className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-100 text-sm font-semibold"
                    >
                      Next &rarr;
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
