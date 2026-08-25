import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";
import { getCommunityPostSlugUrl } from "@/lib/slugs";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

// v1 heuristic: no dedicated isEvent/eventDate column exists on CommunityPost yet, so we
// surface posts that read like an event announcement rather than every post in the Adda.
// A real `isEvent` + `eventDate` field (with a matching CreatePostModal toggle) would make
// this exact instead of best-effort — flagged separately, not applied without sign-off since
// it needs a production DB migration.
const EVENT_KEYWORDS = [
  "event", "meetup", "meet-up", "meet up", "gathering", "fest", "festival", "concert",
  "workshop", "expo", "marathon", "rally", "exhibition", "camp", "trek", "tournament",
  "screening", "open mic", "flea market", "pop-up", "carnival", "fair",
];

function getAdda(slug: string) {
  return MASTER_ADDAS.find((a) => a.id === slug);
}

export function generateStaticParams() {
  return MASTER_ADDAS.map((a) => ({ slug: a.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const adda = getAdda(slug);
  if (!adda) return { title: "Events Not Found" };

  const place = adda.title.split(" ")[0];
  const title = `${place} Events — What's Happening in ${place}`;
  const description = `Upcoming meetups, festivals, and community events in ${adda.title}, shared by the ${adda.name} Adda on North East Connect. Post your own event and reach ${adda.state === "All States" ? "the Northeast community" : `the ${adda.state} community`}.`;

  return {
    title,
    description,
    keywords: [`${place.toLowerCase()} events`, `${place.toLowerCase()} community events`, `things to do in ${place.toLowerCase()}`, adda.name],
    openGraph: {
      title: `${title} | North East Connect`,
      description,
      type: "website",
      url: `${siteUrl}/addas/${adda.id}/events`,
    },
    alternates: {
      canonical: `${siteUrl}/addas/${adda.id}/events`,
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

export default async function AddaEventsPage({ params }: PageProps) {
  const { slug } = await params;
  const adda = getAdda(slug);
  if (!adda) notFound();

  const place = adda.title.split(" ")[0];

  const candidatePosts = await db.communityPost.findMany({
    where: {
      status: "Active",
      OR: [
        { taggedLocation: { contains: adda.name, mode: "insensitive" } },
        { taggedLocation: { contains: adda.id, mode: "insensitive" } },
      ],
    },
    include: {
      user: { select: { username: true, fullName: true, profileImageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const events = candidatePosts.filter((p) =>
    EVENT_KEYWORDS.some((kw) => p.content.toLowerCase().includes(kw))
  ).slice(0, 30);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${place} Events`,
    description: `Community-shared events in ${adda.title} on North East Connect.`,
    url: `${siteUrl}/addas/${adda.id}/events`,
    isPartOf: { "@type": "WebSite", name: "North East Connect", url: siteUrl },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-24 px-3 sm:px-6 transition-colors">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container mx-auto max-w-4xl">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <Link href="/addas" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Addas</Link>
          <span>/</span>
          <Link href={`/addas/${adda.id}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">{adda.title}</Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500">Events</span>
        </nav>

        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {adda.name} &middot; Events
          </p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white text-balance">
            What&apos;s happening in {place}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            Meetups, festivals, and community gatherings shared by the {adda.name} Adda. Have something coming up?
            Post it tagged {adda.name} — mention the word "event" and it'll show up here.
          </p>
          <Link
            href={`/?adda=${encodeURIComponent(adda.name)}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition mt-5"
          >
            Post an event →
          </Link>
        </header>

        <section>
          {events.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No events posted in {adda.name} yet — be the first to{" "}
              <Link href={`/?adda=${encodeURIComponent(adda.name)}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                share one
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((post) => (
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
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-4 whitespace-pre-wrap">{post.content}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
