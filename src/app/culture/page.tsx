import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ type?: string; term?: string }>;
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
  const { type = "", term = "" } = await searchParams;

  // Build query filters
  const where: any = {};

  if (type) {
    where.type = type;
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
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-900 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Culture of Assam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-36 pb-14 md:pt-40 md:pb-18">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Cultural Heritage
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            Experience the vibrant traditions and festivals of Assam
          </p>

          {/* Live Autocomplete Hero Search */}
          <HeroSearch
            placeholder="Search cultural events and festivals..."
            actionUrl="/culture"
            buttonBgColor="bg-purple-600 hover:bg-purple-700"
            focusBorderColor="focus:border-purple-500"
            defaultValue={term}
          />

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm sm:text-base">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">50+</span> Festivals
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">30+</span> Heritage Sites
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">100+</span> Art Traditions
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Filters Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <form action="/culture" method="GET" className="flex flex-wrap gap-4 items-center">
            {/* Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                name="type"
                defaultValue={type}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 bg-white/80 text-gray-900"
              >
                <option value="">All Categories</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t!}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <button
              type="submit"
              className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition duration-300 min-w-[120px] font-semibold cursor-pointer shadow-md"
            >
              Filter
            </button>

            {/* Clear Link */}
            {(type || term) && (
              <Link href="/culture" className="text-gray-600 hover:text-gray-800 px-4 py-3 font-medium text-sm">
                Clear All
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Listings Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {cultureList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow border border-gray-100">
              <div className="text-gray-400 text-6xl mb-4">🎭</div>
              <p className="text-gray-600 text-xl">No cultural events found matching your criteria.</p>
              <Link href="/culture" className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold">
                View all cultural heritage &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cultureList.map((item) => {
                const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const detailUrl = `/culture/${slug}-${item.id}`;
                const images = item.imageUrls ? item.imageUrls.split(",") : [];
                const mainImage = images[0] ? formatImageSrc(images[0]) : "https://images.unsplash.com/photo-1698515959329-878121b965aa?w=900&auto=format&fit=crop&q=60";
                const cleanDesc = stripHtml(item.description);

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img
                          src={mainImage}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-2xl font-bold mb-2">
                            <Link href={detailUrl} className="hover:underline text-purple-200">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-white/90 flex items-center text-sm font-medium">
                            <svg className="w-5 h-5 mr-2 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {item.location || item.district || "Assam"}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        {item.type && (
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                              {item.type}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {cleanDesc}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-4 pt-4">
                      <span className="text-xs text-gray-500 font-medium">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Annual Heritage"}
                      </span>
                      <Link
                        href={detailUrl}
                        className="inline-flex items-center text-purple-700 hover:text-purple-800 font-bold text-sm"
                      >
                        Explore &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
