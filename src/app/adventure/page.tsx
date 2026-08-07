import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ district?: string; type?: string; term?: string }>;
}

export default async function AdventurePage({ searchParams }: PageProps) {
  const { district = "", type = "", term = "" } = await searchParams;

  const where: any = {};

  if (district) {
    where.district = district;
  }
  if (type) {
    where.type = type;
  }
  if (term) {
    where.AND = [
      {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { location: { contains: term, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [adventures, districts, types] = await Promise.all([
    db.adventure.findMany({
      where,
      orderBy: { name: "asc" },
    }),
    db.adventure.findMany({ select: { district: true }, distinct: ["district"] }),
    db.adventure.findMany({ select: { type: true }, distinct: ["type"] }),
  ]);

  const uniqueDistricts = districts.map((d) => d.district).filter(Boolean);
  const uniqueTypes = types.map((t) => t.type).filter(Boolean);

  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Full-screen Hero Section */}
      <header className="relative min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-80 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Adventures in Assam"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Adventure Experiences
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-12">
            Explore thrilling adventures across the landscapes of Assam
          </p>

          {/* Live Autocomplete Hero Search */}
          <HeroSearch
            placeholder="Search adventure activities..."
            actionUrl="/adventure"
            buttonBgColor="bg-orange-600 hover:bg-orange-700"
            focusBorderColor="focus:border-orange-500"
            defaultValue={term}
          />
        </div>
      </header>

      {/* Sticky Filters Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md shadow-md py-6 border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          <form action="/adventure" method="GET" className="flex flex-wrap gap-4 items-center">
            {/* District Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                name="district"
                defaultValue={district}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 bg-white/80 text-gray-900"
              >
                <option value="">All Districts</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d!}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex-1 min-w-[200px]">
              <select
                name="type"
                defaultValue={type}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-orange-500 bg-white/80 text-gray-900"
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
              className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition duration-300 min-w-[120px] font-semibold cursor-pointer"
            >
              Filter
            </button>

            {/* Clear Filters Link */}
            {(district || type || term) && (
              <Link href="/adventure" className="text-gray-600 hover:text-gray-800 px-4 py-3 font-medium text-sm">
                Clear All
              </Link>
            )}
          </form>
        </div>
      </div>

      {/* Listings Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          {adventures.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏄</div>
              <p className="text-gray-600 text-xl">No adventures found matching your criteria.</p>
              <Link href="/adventure" className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-semibold">
                View all adventures &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adventures.map((item) => {
                const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                const detailUrl = `/adventure/${slug}-${item.id}`;
                const images = item.imageUrls ? item.imageUrls.split(",") : [];
                const mainImage = images[0]?.trim() || "3.jpg";
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
                            <Link href={detailUrl} className="hover:underline text-orange-200 hover:text-orange-400">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-white/90 flex items-center text-sm font-medium">
                            <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {item.district || item.location}
                          </p>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.difficultyLevel && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                              {item.difficultyLevel}
                            </span>
                          )}
                          {item.price && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ₹{Number(item.price).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-2">
                      <div className="text-xs text-gray-500 flex items-center font-medium">
                        <svg className="w-4 h-4 inline-block mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.duration || "Full Day"}
                      </div>
                      <Link
                        href={detailUrl}
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm"
                      >
                        Explore
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
