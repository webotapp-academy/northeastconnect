import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getAuthorBySlug } from "@/lib/authors";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return { title: "Author Not Found", robots: { index: false, follow: false } };

  return {
    title: `${author.name} — ${author.role}`,
    description: author.bio,
    alternates: { canonical: `${siteUrl}/authors/${author.slug}` },
    openGraph: {
      type: "profile",
      title: `${author.name} — ${author.role}`,
      description: author.bio,
      url: `${siteUrl}/authors/${author.slug}`,
      images: [{ url: `${siteUrl}${author.photo}`, width: 800, height: 800, alt: author.name }],
    },
  };
}

export default async function AuthorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const recentArticles = await db.news.findMany({
    where: { status: "Published" },
    orderBy: { publishedDate: "desc" },
    take: 6,
    select: { id: true, title: true, url: true, category: true, publishedDate: true },
  });

  const jsonLdPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    image: `${siteUrl}${author.photo}`,
    url: `${siteUrl}/authors/${author.slug}`,
    sameAs: author.sameAs,
    worksFor: {
      "@type": "Organization",
      name: "North East Connect",
    },
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-12 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />

      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/authors"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition mb-6"
        >
          &larr; All authors
        </Link>

        <div className="bg-white dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src={author.photo}
              alt={author.name}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-500/15 shadow-lg shrink-0"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{author.name}</h1>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wide mt-1">
                {author.role}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-4 max-w-xl">
                {author.bio}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
                {author.badges.map((badge) => (
                  <span
                    key={badge}
                    className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {recentArticles.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-extrabold tracking-tight mb-4">Recent stories</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentArticles.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${encodeURIComponent(item.url || String(item.id))}`}
                  className="bg-white dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                >
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {item.category || "News"}
                  </span>
                  <h3 className="text-sm font-bold leading-snug mt-1 line-clamp-2">{item.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
