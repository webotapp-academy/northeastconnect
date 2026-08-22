import Link from "next/link";
import { db } from "@/lib/db";
import GoogleAd from "@/components/GoogleAd";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ term?: string; cat?: string; state?: string }>;
}

const NE_STATES = [
  { name: "All States", icon: "🌿", tag: "All" },
  { name: "Assam", icon: "🦏", tag: "Assam" },
  { name: "Meghalaya", icon: "🌧️", tag: "Meghalaya" },
  { name: "Arunachal Pradesh", icon: "🏔️", tag: "Arunachal" },
  { name: "Nagaland", icon: "🦅", tag: "Nagaland" },
  { name: "Manipur", icon: "🌸", tag: "Manipur" },
  { name: "Mizoram", icon: "🎋", tag: "Mizoram" },
  { name: "Tripura", icon: "🏰", tag: "Tripura" },
  { name: "Sikkim", icon: "❄️", tag: "Sikkim" },
];

function timeAgo(dateString?: string | Date | null): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { term = "", cat = "all", state = "All States" } = await searchParams;
  const query = term.trim();

  let posts: any[] = [];
  let directory: any[] = [];
  let news: any[] = [];
  let marketplace: any[] = [];
  let wildlife: any[] = [];
  let adventure: any[] = [];
  let culture: any[] = [];

  // Popular Addas for sidebar
  const popularAddas = [
    { name: "n:guwahati", icon: "🏙️", count: "1,343 members", state: "Assam" },
    { name: "n:shillong", icon: "🌧️", count: "256 members", state: "Meghalaya" },
    { name: "n:kaziranga", icon: "🦏", count: "184 members", state: "Assam" },
    { name: "n:nagaland", icon: "🦅", count: "201 members", state: "Nagaland" },
    { name: "n:sikkim", icon: "❄️", count: "102 members", state: "Sikkim" },
    { name: "n:travel", icon: "🎒", count: "610 members", state: "Northeast" },
  ];

  // Trending news for sidebar
  const sidebarNews = await db.news.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, category: true, createdAt: true },
  });

  if (query) {
    const [postsRes, dirRes, newsRes, marketRes, wildRes, advRes, cultRes] = await Promise.all([
      // Community Posts
      db.communityPost.findMany({
        where: {
          status: "Active",
          OR: [
            { content: { contains: query, mode: "insensitive" } },
            { taggedLocation: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          user: {
            select: { username: true, fullName: true, profileImageUrl: true, rankTier: true },
          },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),

      // Business Directory
      db.directory.findMany({
        where: {
          OR: [
            { businessName: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
      }),

      // News
      db.news.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),

      // Marketplace
      db.marketplaceListing.findMany({
        where: {
          status: "Active",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),

      // Wildlife
      db.wildlife.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),

      // Adventure
      db.adventure.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { district: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),

      // Culture
      db.culture.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 4,
      }),
    ]);

    posts = postsRes;
    directory = dirRes;
    news = newsRes;
    marketplace = marketRes;
    wildlife = wildRes;
    adventure = advRes;
    culture = cultRes;
  }

  const totalResults =
    posts.length +
    directory.length +
    news.length +
    marketplace.length +
    wildlife.length +
    adventure.length +
    culture.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 pt-3 sm:pt-5 pb-16 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* ========================================================================= */}
        {/* TOP STATE PILLS BAR (Quick Regional Switcher)                            */}
        {/* ========================================================================= */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = state === st.name;
              return (
                <Link
                  key={st.name}
                  href={`/search?term=${encodeURIComponent(query)}&state=${encodeURIComponent(st.name)}`}
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
        {/* GLOSSY SEARCH HEADER BAR                                                  */}
        {/* ========================================================================= */}
        <div className="mb-5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <form action="/search" method="GET" className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">Universal Search</span>
            </div>

            <h1
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mb-3"
              style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}
            >
              Search <span className="text-emerald-600 dark:text-emerald-400">NorthEast Connect</span>
            </h1>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="term"
                  defaultValue={query}
                  placeholder="Search community posts, businesses, news, marketplace ads..."
                  className="w-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  🔍
                </span>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer shrink-0"
              >
                Search
              </button>
            </div>

            {query && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                Showing {totalResults} result{totalResults === 1 ? "" : "s"} for &quot;<strong className="text-emerald-600 dark:text-emerald-400">{query}</strong>&quot;
              </p>
            )}
          </form>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 3-COLUMN HOMEPAGE-STYLE LAYOUT                                       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: Hub Navigation & Categories Filter                         */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Quick Explore Hubs */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-1">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                Explore Sections
              </div>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏠</span>
                <span>Community Feed</span>
              </Link>
              <Link
                href="/community?tab=users"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">👥</span>
                <span>People &amp; Explorers</span>
              </Link>
              <Link
                href="/community?tab=posts"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">💭</span>
                <span>Community Thoughts</span>
              </Link>
              <Link
                href="/addas"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏛️</span>
                <span>Northeast Addas</span>
              </Link>
              <Link
                href="/jobs"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">💼</span>
                <span>Jobs &amp; Careers</span>
              </Link>
              <Link
                href="/properties"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏡</span>
                <span>Properties (Buy &amp; Rent)</span>
              </Link>
              <Link
                href="/directory"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏢</span>
                <span>Verified Directory</span>
              </Link>
              <Link
                href="/marketplace"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🛍️</span>
                <span>Marketplace Ads</span>
              </Link>
              <Link
                href="/news"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">📰</span>
                <span>Regional News</span>
              </Link>
              <Link
                href="/culture"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🎭</span>
                <span>Culture &amp; Heritage</span>
              </Link>
              <Link
                href="/wildlife"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🦏</span>
                <span>Wildlife Sanctuaries</span>
              </Link>
              <Link
                href="/adventure"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                <span className="text-base">🏔️</span>
                <span>Adventure Trails</span>
              </Link>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* CENTER COLUMN: Glossy Search Results Stream                             */}
          {/* ======================================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {!query ? (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Discover Across Northeast India
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Enter a keyword above to find local community discussions, verified businesses, news stories, marketplace ads, and travel spots.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["Guwahati", "Shillong", "Silk", "Kaziranga", "Homestay", "Food"].map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?term=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : totalResults === 0 ? (
              <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center shadow-xs">
                <div className="text-4xl mb-3">🧭</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                  No matching results found for &quot;{query}&quot;
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Try searching with a broader keyword, checking another state, or exploring community addas.
                </p>
                <Link
                  href="/"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition inline-block"
                >
                  &larr; Back to Community Feed
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Community Posts Results */}
                {posts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        💬 Community Discussions ({posts.length})
                      </h2>
                    </div>
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={post.user?.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user?.username}`}
                              alt={post.user?.username}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                                  {post.taggedLocation || "n:all"}
                                </span>
                                <span className="text-slate-400 text-[10px]">•</span>
                                <Link
                                  href={`/profile/${post.user?.username}`}
                                  className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:underline"
                                >
                                  u/{post.user?.username}
                                </Link>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                          {post.content}
                        </p>
                        {post.mediaUrls && (
                          <div className="rounded-2xl overflow-hidden max-h-48 mb-3">
                            <img src={post.mediaUrls} alt="Post Media" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Link
                          href={`/community#post-${post.id}`}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          View Full Discussion &rarr;
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* Sponsored Result Placement */}
                <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2 block">
                    Sponsored Ad
                  </span>
                  <GoogleAd format="horizontal" responsive={true} />
                </div>

                {/* 2. Business Directory Results */}
                {directory.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        📇 Verified Businesses ({directory.length})
                      </h2>
                      <Link href="/directory" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        View Directory &rarr;
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {directory.map((item) => {
                        const slug = item.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        const detailUrl = `/listing/${slug}-${item.id}`;
                        return (
                          <div
                            key={item.id}
                            className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                  {item.category || "Business"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">📍 {item.district || "Assam"}</span>
                              </div>
                              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition mb-1">
                                <Link href={detailUrl}>{item.businessName}</Link>
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                {item.description}
                              </p>
                            </div>
                            <Link
                              href={detailUrl}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              View Listing Details &rarr;
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. News Results */}
                {news.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        📰 News &amp; Reports ({news.length})
                      </h2>
                      <Link href="/news" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        All News &rarr;
                      </Link>
                    </div>
                    {news.map((item) => (
                      <article
                        key={item.id}
                        className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">{item.category || "News"}</span>
                          <span>•</span>
                          <span>{timeAgo(item.publishedDate || item.createdAt)}</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition leading-snug mb-2">
                          <Link href={`/news/${encodeURIComponent(item.url || String(item.id))}`}>
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {item.content}
                        </p>
                        <Link
                          href={`/news/${encodeURIComponent(item.url || String(item.id))}`}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          Read Full Story &rarr;
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* 4. Marketplace Deals */}
                {marketplace.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        🛒 Marketplace Ads ({marketplace.length})
                      </h2>
                      <Link href="/marketplace" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        Browse Market &rarr;
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {marketplace.map((ad) => (
                        <div
                          key={ad.id}
                          className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                ₹{ad.price ? Number(ad.price).toLocaleString() : "Contact"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">📍 {ad.city || ad.state || "Assam"}</span>
                            </div>
                            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition line-clamp-1 mb-1">
                              <Link href={`/marketplace/${ad.id}`}>{ad.title}</Link>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                              {ad.description}
                            </p>
                          </div>
                          <Link
                            href={`/marketplace/${ad.id}`}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            View Item &rarr;
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Wildlife, Adventure & Culture Hubs */}
                {(wildlife.length > 0 || adventure.length > 0 || culture.length > 0) && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between px-2">
                      <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        🏞️ Nature, Culture &amp; Trails
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {wildlife.map((item) => {
                        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        return (
                          <div
                            key={`wild-${item.id}`}
                            className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm"
                          >
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">🦏 Wildlife • {item.district}</span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition mt-1 mb-1">
                              <Link href={`/wildlife/${slug}-${item.id}`}>{item.name}</Link>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                            <Link href={`/wildlife/${slug}-${item.id}`} className="text-xs font-bold text-emerald-600 hover:underline">
                              Explore Wildlife &rarr;
                            </Link>
                          </div>
                        );
                      })}
                      {culture.map((item) => {
                        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        return (
                          <div
                            key={`cult-${item.id}`}
                            className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm"
                          >
                            <span className="text-[10px] font-bold text-purple-600 uppercase">🎭 Heritage</span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-purple-600 transition mt-1 mb-1">
                              <Link href={`/culture/${slug}-${item.id}`}>{item.name}</Link>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                            <Link href={`/culture/${slug}-${item.id}`} className="text-xs font-bold text-purple-600 hover:underline">
                              Discover Heritage &rarr;
                            </Link>
                          </div>
                        );
                      })}
                      {adventure.map((item) => {
                        const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        return (
                          <div
                            key={`adv-${item.id}`}
                            className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm"
                          >
                            <span className="text-[10px] font-bold text-orange-600 uppercase">🏔️ Adventure • {item.district}</span>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-orange-600 transition mt-1 mb-1">
                              <Link href={`/adventure/${slug}-${item.id}`}>{item.name}</Link>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                            <Link href={`/adventure/${slug}-${item.id}`} className="text-xs font-bold text-orange-600 hover:underline">
                              View Trail &rarr;
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: Popular Addas & Trending News (Glossy Cards)              */}
          {/* ======================================================================= */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* 1. POPULAR ADDAS CARD */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Popular Addas
                </h3>
                <Link
                  href="/addas"
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  All ({popularAddas.length})
                </Link>
              </div>

              <div className="space-y-3">
                {popularAddas.map((comm) => (
                  <Link
                    key={comm.name}
                    href={`/addas/${comm.name.replace(/^n:/, "")}`}
                    className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm shrink-0">
                        {comm.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                          {comm.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {comm.count}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                      Visit
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/addas"
                  className="w-full py-2 bg-slate-100/80 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 transition cursor-pointer block text-center"
                >
                  See more addas &rarr;
                </Link>
              </div>
            </div>

            {/* 2. Trending News */}
            <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5">
                  <span>📰</span>
                  <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Trending News
                  </h3>
                </div>
                <Link
                  href="/news"
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  All News &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {sidebarNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="block group"
                  >
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                      {timeAgo(item.createdAt)} • {item.category || "News"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
