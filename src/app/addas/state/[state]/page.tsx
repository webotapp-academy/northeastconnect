import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";
import RankBadge from "@/components/profile/RankBadge";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ state: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

function slugifyState(state: string) {
  return state.toLowerCase().replace(/\s+/g, "-");
}

function getStateName(slug: string): string | undefined {
  const states = Array.from(new Set(MASTER_ADDAS.map((a) => a.state).filter((s) => s !== "All States")));
  return states.find((s) => slugifyState(s) === slug);
}

export function generateStaticParams() {
  const states = Array.from(new Set(MASTER_ADDAS.map((a) => a.state).filter((s) => s !== "All States")));
  return states.map((state) => ({ state: slugifyState(state) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateName = getStateName(state);
  if (!stateName) return { title: "Community Not Found | North East Connect" };

  const title = `${stateName} Community — Meet People, Local Addas & Events`;
  const description = `Join the ${stateName} community on North East Connect. Discover ${stateName}'s local Addas, meet people nearby, follow real conversations, and find upcoming events across ${stateName}.`;

  return {
    title,
    description,
    keywords: [
      `${stateName.toLowerCase()} community`,
      `${stateName.toLowerCase()} whatsapp group`,
      `${stateName.toLowerCase()} events`,
      `meet people in ${stateName.toLowerCase()}`,
      "northeast india community",
    ],
    openGraph: {
      title: `${stateName} Community | North East Connect`,
      description,
      type: "website",
      url: `${siteUrl}/addas/state/${state}`,
    },
    alternates: {
      canonical: `${siteUrl}/addas/state/${state}`,
    },
  };
}

export default async function StateCommunityHubPage({ params }: PageProps) {
  const { state } = await params;
  const stateName = getStateName(state);
  if (!stateName) notFound();

  const stateAddas = MASTER_ADDAS.filter((a) => a.state === stateName);
  const addaNames = stateAddas.map((a) => a.name);

  const [posts, memberCount, topMembers] = await Promise.all([
    db.communityPost.findMany({
      where: {
        status: "Active",
        OR: addaNames.map((name) => ({ taggedLocation: { contains: name, mode: "insensitive" as const } })),
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, profileImageUrl: true, rankTier: true, xpPoints: true, city: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.user.count({ where: { state: stateName } }),
    db.user.findMany({
      where: { state: stateName },
      select: { username: true, fullName: true, profileImageUrl: true, rankTier: true, xpPoints: true, city: true },
      orderBy: { xpPoints: "desc" },
      take: 6,
    }),
  ]);

  function formatTimeAgo(date: Date) {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${stateName} Community`,
    description: `Join the ${stateName} community on North East Connect — local Addas, people, and events.`,
    url: `${siteUrl}/addas/state/${state}`,
    isPartOf: { "@type": "WebSite", name: "North East Connect", url: siteUrl },
    about: { "@type": "AdministrativeArea", name: stateName },
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
          <span className="text-slate-400 dark:text-slate-500">{stateName} Community</span>
        </nav>

        {/* Hub header */}
        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {stateName} Community &middot; North East Connect
          </p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white text-balance">
            {stateName} Community
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            Meet people from {stateName}, follow local Addas, and catch real conversations and events happening
            around you — all in one place on North East Connect.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div className="text-sm">
              <span className="font-black text-slate-900 dark:text-white">{memberCount.toLocaleString()}</span>{" "}
              <span className="text-slate-500 dark:text-slate-400">members from {stateName}</span>
            </div>
            <div className="text-sm">
              <span className="font-black text-slate-900 dark:text-white">{stateAddas.length}</span>{" "}
              <span className="text-slate-500 dark:text-slate-400">local Addas</span>
            </div>
          </div>
        </header>

        {/* Local Addas grid */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3">Local Addas in {stateName}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stateAddas.map((adda) => (
              <Link
                key={adda.id}
                href={`/addas/${adda.id}`}
                className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
              >
                <span className="text-2xl">{adda.icon}</span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{adda.title}</h3>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{adda.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top members */}
        {topMembers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3">Top members from {stateName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topMembers.map((m) => (
                <Link
                  key={m.username}
                  href={`/profile/${m.username}`}
                  className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                >
                  <img
                    src={m.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.username}`}
                    alt={m.username}
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{m.fullName || `@${m.username}`}</p>
                    <RankBadge rankTier={m.rankTier} xpPoints={m.xpPoints} size="sm" showLevel={false} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent posts */}
        <section>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3">Recent in {stateName}</h2>
          {posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No posts yet from {stateName} Addas — be the first to{" "}
              <Link href={`/addas/${stateAddas[0]?.id}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                start a conversation
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <img
                      src={post.user.profileImageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.user.username}`}
                      alt={post.user.username}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">u/{post.user.username}</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{post.taggedLocation}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
