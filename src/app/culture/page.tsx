import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ type?: string; term?: string }>;
}

export default async function CulturePage({ searchParams }: PageProps) {
  const { type = "", term = "" } = await searchParams;

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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-600 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Culture of Assam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
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
            buttonBgColor="bg-blue-600 hover:bg-blue-700"
            focusBorderColor="focus:border-blue-500"
            defaultValue={term}
          />

          {/* Quick Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm sm:text-base">
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">50+</span> Festivals
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">20+</span> Dance Forms
            </div>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white">
              <span className="font-bold">100+</span> Cultural Events
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Filters Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          <form action="/culture" method="GET" className="flex flex-wrap gap-4 items-center">
            {/* Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                name="type"
                defaultValue={type}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white/80 text-gray-900"
              >
                <option value="">All Types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t!}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Filters Button */}
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition duration-300 min-w-[120px] font-semibold cursor-pointer"
            >
              Filter
            </button>

            {/* Clear Filters Link */}
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
        <div className="container mx-auto px-4">
          {cultureList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎭</div>
              <p className="text-gray-600 text-xl">No cultural events found matching your criteria.</p>
              <Link href="/culture" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                View all cultural heritage &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cultureList.map((item) => {
                const images = item.imageUrls ? item.imageUrls.split(",") : [];
                const mainImage = images[0]?.trim() || "2.jpg";
                const imgSrc = mainImage.startsWith("http") ? mainImage : `/assets/images/${mainImage}`;

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-white text-2xl font-bold mb-2">
                            {item.name}
                          </h3>
                          <p className="text-white/90 flex items-center text-sm font-medium">
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {item.location || item.district}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        {item.type && (
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              {item.type}
                            </span>
                          </div>
                        )}
                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                          {item.description}
                        </p>
                        {item.historicalSignificance && (
                          <p className="text-xs text-gray-500 italic">
                            &quot;{item.historicalSignificance}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                      <span className="text-xs text-gray-500 font-medium">{item.culturalImportance || "Cultural Tradition"}</span>
                      <Link
                        href="/contact"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        Explore Event
                        <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
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
