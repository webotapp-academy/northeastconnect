import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";
import RankBadge from "@/components/profile/RankBadge";
import { getCommunityPostSlugUrl } from "@/lib/slugs";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

function getAdda(slug: string) {
  return MASTER_ADDAS.find((a) => a.id === slug);
}

export function generateStaticParams() {
  return MASTER_ADDAS.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const adda = getAdda(slug);
  if (!adda) return { title: "Adda Not Found" };

  const title = `${adda.state === "All States" ? adda.title : `${adda.title}, ${adda.state}`} Community & Local Adda — Meet People, Events, Groups`;
  const description = `${adda.desc} Join ${adda.name} on North East Connect to meet people, share local events, and follow ${adda.title.toLowerCase()} discussions from ${adda.state === "All States" ? "across Northeast India" : adda.state}.`;

  return {
    title,
    description,
    keywords: [
      ...adda.keywords,
      `${adda.title.split(" ")[0].toLowerCase()} community`,
      `${adda.title.split(" ")[0].toLowerCase()} events`,
      `${adda.name}`,
      "northeast india community",
    ],
    openGraph: {
      title: `${adda.title} — ${adda.name} | North East Connect`,
      description,
      type: "website",
      url: `${siteUrl}/addas/${adda.id}`,
    },
    twitter: {
      card: "summary",
      title: `${adda.title} — ${adda.name}`,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/addas/${adda.id}`,
    },
  };
}

function formatTimeAgo(date: Date) {
  const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default async function AddaHubPage({ params }: PageProps) {
  const { slug } = await params;
  const adda = getAdda(slug);
  if (!adda) notFound();

  const cleanAdda = adda.id;
  const posts = await db.communityPost.findMany({
    where: {
      status: "Active",
      OR: [
        { taggedLocation: { contains: adda.name, mode: "insensitive" } },
        { taggedLocation: { contains: cleanAdda, mode: "insensitive" } },
      ],
    },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, xpPoints: true, state: true, city: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const memberCount = await db.user.count({
    where: { OR: [{ state: adda.state }, { city: { contains: adda.id, mode: "insensitive" } }] },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${adda.title} — ${adda.name}`,
    description: adda.desc,
    url: `${siteUrl}/addas/${adda.id}`,
    isPartOf: {
      "@type": "WebSite",
      name: "North East Connect",
      url: siteUrl,
    },
    about: {
      "@type": "Place",
      name: adda.title,
      containedInPlace: adda.state !== "All States" ? { "@type": "AdministrativeArea", name: adda.state } : undefined,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-24 px-3 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <Link href="/addas" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Addas</Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500 truncate max-w-[220px]">{adda.title}</span>
        </nav>

        {/* Hub header */}
        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl sm:text-5xl leading-none">{adda.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {adda.name} &middot; {adda.categoryLabel} {adda.state !== "All States" ? `· ${adda.state}` : ""}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white text-balance">
                {adda.title} Community
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                {adda.desc} Meet people, follow local events, and join real conversations from{" "}
                {adda.state === "All States" ? "across Northeast India" : adda.state} — all inside the {adda.name} Adda on North East Connect.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {adda.keywords.slice(0, 6).map((k) => (
                  <span key={k} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm">
              <span className="font-black text-slate-900 dark:text-white">{memberCount.toLocaleString()}</span>{" "}
              <span className="text-slate-500 dark:text-slate-400">members from {adda.state === "All States" ? "Northeast India" : adda.state}</span>
            </div>
            <div className="text-sm">
              <span className="font-black text-slate-900 dark:text-white">{posts.length}</span>{" "}
              <span className="text-slate-500 dark:text-slate-400">recent posts</span>
            </div>
            <Link
              href={`/addas/${adda.id}/events`}
              className="text-sm font-bold px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
            >
              Upcoming events
            </Link>
            {adda.id === "guwahati" && (
              <Link
                href="/things-to-do-in-guwahati"
                className="text-sm font-bold px-4 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
              >
                Things to do
              </Link>
            )}
            <Link
              href={`/?adda=${encodeURIComponent(adda.name)}`}
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              Open live feed &amp; post →
            </Link>
          </div>
        </header>

        {/* Recent posts (SSR) */}
        <section>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3">Recent in {adda.name}</h2>
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No posts yet in {adda.name} — be the first to{" "}
              <Link href={`/?adda=${encodeURIComponent(adda.name)}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                start a conversation
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => {
                return (
                  <Link
                    key={post.id}
                    href={getCommunityPostSlugUrl(post)}
                    className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <img
                        src={post.user.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`}
                        alt={post.user.username}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">u/{post.user.username}</span>
                      <RankBadge rankTier={post.user.rankTier} xpPoints={post.user.xpPoints} size="sm" showLevel={false} />
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
