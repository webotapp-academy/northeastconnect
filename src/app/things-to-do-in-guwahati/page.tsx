import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const metadata: Metadata = {
  title: "Things to Do in Guwahati — Adventure, Culture, Food & Places",
  description:
    "The real Guwahati guide: adventure activities, cultural sites, cafes and local businesses, wildlife day trips, and the live Guwahati community — all in one place on North East Connect.",
  keywords: [
    "things to do in guwahati",
    "guwahati places to visit",
    "guwahati adventure",
    "guwahati cafes",
    "guwahati sightseeing",
  ],
  openGraph: {
    title: "Things to Do in Guwahati — North East Connect",
    description:
      "The real Guwahati guide: adventure activities, cultural sites, cafes and local businesses, wildlife day trips, and the live Guwahati community.",
    type: "website",
    url: `${siteUrl}/things-to-do-in-guwahati`,
  },
  alternates: {
    canonical: `${siteUrl}/things-to-do-in-guwahati`,
  },
};

const GUWAHATI_MATCH = { OR: [{ district: { contains: "guwahati", mode: "insensitive" as const } }, { location: { contains: "guwahati", mode: "insensitive" as const } }, { district: { contains: "kamrup", mode: "insensitive" as const } }, { location: { contains: "kamrup", mode: "insensitive" as const } }] };

function firstImage(imageUrls: string | null) {
  return imageUrls?.split(",")[0]?.trim() || null;
}

export default async function ThingsToDoInGuwahatiPage() {
  const [adventures, culture, directory] = await Promise.all([
    db.adventure.findMany({ where: { status: "Available", ...GUWAHATI_MATCH }, take: 8, orderBy: { createdAt: "desc" } }),
    db.culture.findMany({ where: { status: "Active", ...GUWAHATI_MATCH }, take: 8, orderBy: { createdAt: "desc" } }),
    db.directory.findMany({
      where: {
        status: "Active",
        OR: [{ district: { contains: "guwahati", mode: "insensitive" }, }, { city: { contains: "guwahati", mode: "insensitive" } }],
      },
      take: 8,
      orderBy: { rating: "desc" },
    }),
  ]);

  const totalItems = adventures.length + culture.length + directory.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Things to Do in Guwahati",
    description: "Adventure, culture, and local business guide to Guwahati, Assam.",
    url: `${siteUrl}/things-to-do-in-guwahati`,
    isPartOf: { "@type": "WebSite", name: "North East Connect", url: siteUrl },
    about: { "@type": "City", name: "Guwahati", containedInPlace: { "@type": "AdministrativeArea", name: "Assam" } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-24 px-3 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto max-w-5xl">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500">Things to Do in Guwahati</span>
        </nav>

        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Guwahati Guide</p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white text-balance">
            Things to Do in Guwahati
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            From river rafting on the Brahmaputra to Kamakhya Temple, riverfront cafes, and weekend day trips —
            here&apos;s what&apos;s actually happening in Guwahati, pulled straight from our Adventure, Culture, and Directory
            listings, plus the live Guwahati community.
          </p>
          <Link
            href="/addas/guwahati"
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition mt-5"
          >
            Join the Guwahati community →
          </Link>
        </header>

        {totalItems === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400 mb-8">
            We&apos;re still building out Guwahati listings — meanwhile, catch what&apos;s happening in the{" "}
            <Link href="/addas/guwahati" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
              live Guwahati Adda
            </Link>
            .
          </div>
        )}

        {adventures.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Adventure &amp; Outdoors</h2>
              <Link href="/adventure?term=Guwahati" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {adventures.map((a) => (
                <Link key={a.id} href={`/adventure/${a.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-600 transition">
                  {firstImage(a.imageUrls) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstImage(a.imageUrls)!} alt={a.name} className="w-full h-28 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">{a.name}</h3>
                    {a.type && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{a.type}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {culture.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Culture &amp; Heritage</h2>
              <Link href="/culture?term=Guwahati" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {culture.map((c) => (
                <Link key={c.id} href={`/culture/${c.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-600 transition">
                  {firstImage(c.imageUrls) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstImage(c.imageUrls)!} alt={c.name} className="w-full h-28 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">{c.name}</h3>
                    {c.type && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{c.type}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {directory.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Cafes, Stays &amp; Local Businesses</h2>
              <Link href="/directory?term=Guwahati" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {directory.map((d) => (
                <Link key={d.id} href={`/listing/${(d.businessName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${d.id}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-600 transition">
                  {firstImage(d.imageUrls) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firstImage(d.imageUrls)!} alt={d.businessName} className="w-full h-28 object-cover" />
                  )}
                  <div className="p-3">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">{d.businessName}</h3>
                    {d.category && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{d.category}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
