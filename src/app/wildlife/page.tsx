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
  searchParams: Promise<{ district?: string; season?: string; term?: string; state?: string }>;
}

export default async function WildlifePage({ searchParams }: PageProps) {
  const { district = "", season = "", term = "", state = "" } = await searchParams;

  const where: any = {};
  if (district) where.district = district;
  if (season) where.bestSeason = season;
  if (state && state !== "All States") {
    where.OR = [
      { district: { contains: state, mode: "insensitive" } },
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

  const [wildlifeList, districts, seasons] = await Promise.all([
    db.wildlife.findMany({
      where,
      orderBy: { name: "asc" },
    }),
    db.wildlife.findMany({ select: { district: true }, distinct: ["district"] }),
    db.wildlife.findMany({ select: { bestSeason: true }, distinct: ["bestSeason"] }),
  ]);

  const uniqueDistricts = districts.map((d) => d.district).filter(Boolean);
  const uniqueSeasons = seasons.map((s) => s.bestSeason).filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans pt-3 sm:pt-5 pb-16 transition-colors">
      <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
        {/* State Quick Switcher */}
        <div className="mb-4 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {NE_STATES.map((st) => {
              const active = (state === "" && st.name === "All States") || state === st.name;
              const href = st.name === "All States" ? "/wildlife" : `/wildlife?state=${encodeURIComponent(st.name)}`;
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
                  National Parks &amp; Wildlife
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Wildlife Sanctuaries &amp; National Parks
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Discover Kaziranga, Manas, Dibru-Saikhowa and the incredible biodiversity of Northeast India
              </p>
            </div>

            <div className="text-xs font-medium shrink-0">
              <span className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 shadow-xs">
                <strong className="text-slate-900 dark:text-slate-100 font-bold">{wildlifeList.length}</strong> Sanctuaries
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <form action="/wildlife" method="GET" className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
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
                placeholder="Search wildlife parks, safaris, one-horned rhino..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                name="district"
                defaultValue={district}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Districts</option>
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d!}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                name="season"
                defaultValue={season}
                className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Seasons</option>
                {uniqueSeasons.map((s) => (
                  <option key={s} value={s!}>
                    {s}
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
        </div>

        {/* Wildlife Grid (Glossy Cards) */}
        {wildlifeList.length === 0 ? (
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto text-2xl mb-3">
              🦏
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No wildlife locations found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Try clearing your filters or searching with another keyword.</p>
            <Link
              href="/wildlife"
              className="inline-block px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-full shadow-xs transition"
            >
              View all sanctuaries
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wildlifeList.map((item) => {
              const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              const detailUrl = `/wildlife/${slug}-${item.id}`;
              
              let mainImage = "/assets/images/hero.jpg";
              if (item.imageUrls) {
                try {
                  const parsed = JSON.parse(item.imageUrls);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    mainImage = parsed[0];
                  } else if (typeof parsed === "string") {
                    mainImage = parsed;
                  }
                } catch {
                  const split = item.imageUrls.replace(/[\[\]'"]/g, "").split(",");
                  if (split.length > 0 && split[0].trim()) {
                    mainImage = split[0].trim();
                  }
                }
              }

              const imgSrc = mainImage.startsWith("http") || mainImage.startsWith("/")
                ? mainImage
                : `/assets/images/${mainImage}`;

              return (
                <article
                  key={item.id}
                  className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <Link href={detailUrl} className="block relative h-48 sm:h-52 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.bestSeason && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-emerald-400 border border-slate-700/60 rounded-md shadow-xs uppercase tracking-wider">
                          {item.bestSeason}
                        </span>
                      )}
                    </Link>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        <Link href={detailUrl}>{item.name}</Link>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                        <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{item.district || item.location || "Assam"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-2 pt-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Safari &amp; Ecotourism
                    </span>
                    <Link
                      href={detailUrl}
                      className="px-3.5 py-1.5 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full border border-slate-300 dark:border-slate-700 transition"
                    >
                      View Sanctuary &rarr;
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
