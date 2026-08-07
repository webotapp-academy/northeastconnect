import Link from "next/link";
import { db } from "@/lib/db";
import HeroSearch from "@/components/HeroSearch";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { term = "" } = await searchParams;

  const query = term.trim();

  let wildlife: any[] = [];
  let adventure: any[] = [];
  let culture: any[] = [];
  let directory: any[] = [];
  let news: any[] = [];

  if (query) {
    [wildlife, adventure, culture, directory, news] = await Promise.all([
      db.wildlife.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
      db.adventure.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
      db.culture.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
      db.directory.findMany({
        where: {
          OR: [
            { businessName: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 12,
      }),
      db.news.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
    ]);
  }

  const totalResults = wildlife.length + adventure.length + culture.length + directory.length + news.length;

  return (
    <main className="w-full bg-white text-gray-900 font-sans">
      {/* Hero Header */}
      <header className="relative min-h-[45vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img
            src="/assets/images/hero.jpg"
            alt="Search Hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto pt-16 w-full space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Search Results
          </h1>
          {query && (
            <p className="text-xl text-gray-200">
              Showing results for &quot;<strong className="text-emerald-400">{query}</strong>&quot; ({totalResults} found)
            </p>
          )}

          {/* Live Autocomplete Hero Search */}
          <HeroSearch
            placeholder="Search across all categories..."
            actionUrl="/search"
            defaultValue={query}
          />
        </div>
      </header>

      {/* Results Container */}
      <section className="py-16 bg-gray-50 min-h-[50vh]">
        <div className="container mx-auto px-4 max-w-7xl space-y-12">
          {!query ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Enter a search keyword above to discover businesses, news, wildlife, and adventures.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-xl">No matching results found for &quot;{query}&quot;.</p>
              <Link href="/" className="inline-block mt-4 text-emerald-700 font-semibold hover:underline">
                &larr; Back to Home
              </Link>
            </div>
          ) : (
            <>
              {/* Business Directory Results */}
              {directory.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 flex items-center">
                    🏢 Business Directory ({directory.length})
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {directory.map((item) => {
                      const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      return (
                        <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                              {item.category}
                            </span>
                            <h3 className="font-bold text-lg text-gray-900">
                              <Link href={`/directory/${slug}-${item.id}`} className="hover:text-emerald-700">
                                {item.businessName}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-xs line-clamp-2">{item.description}</p>
                          </div>
                          <Link href={`/directory/${slug}-${item.id}`} className="text-emerald-700 font-bold text-xs inline-block hover:underline">
                            View Listing &rarr;
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* News Results */}
              {news.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 flex items-center">
                    📰 News &amp; Stories ({news.length})
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {news.map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-xs text-gray-500 font-medium">{item.category || "News"}</span>
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                            <Link href={`/news/${encodeURIComponent(item.url || String(item.id))}`} className="hover:text-emerald-700">
                              {item.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-xs line-clamp-2">{item.content}</p>
                        </div>
                        <Link href={`/news/${encodeURIComponent(item.url || String(item.id))}`} className="text-blue-600 font-bold text-xs inline-block hover:underline">
                          Read Article &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wildlife Results */}
              {wildlife.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 flex items-center">
                    🦁 Wildlife Sanctuaries ({wildlife.length})
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {wildlife.map((item) => {
                      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      return (
                        <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-xs text-green-700 font-bold uppercase">{item.district}</span>
                            <h3 className="font-bold text-lg text-gray-900">
                              <Link href={`/wildlife/${slug}-${item.id}`} className="hover:text-emerald-700">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-xs line-clamp-2">{item.description}</p>
                          </div>
                          <Link href={`/wildlife/${slug}-${item.id}`} className="text-green-700 font-bold text-xs inline-block hover:underline">
                            Explore &rarr;
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Adventure Results */}
              {adventure.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 flex items-center">
                    🏄 Outdoor Adventures ({adventure.length})
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {adventure.map((item) => {
                      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      return (
                        <div key={item.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md space-y-3 flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-xs text-orange-700 font-bold uppercase">{item.type || "Adventure"}</span>
                            <h3 className="font-bold text-lg text-gray-900">
                              <Link href={`/adventure/${slug}-${item.id}`} className="hover:text-emerald-700">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-xs line-clamp-2">{item.description}</p>
                          </div>
                          <Link href={`/adventure/${slug}-${item.id}`} className="text-orange-600 font-bold text-xs inline-block hover:underline">
                            View Activity &rarr;
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
