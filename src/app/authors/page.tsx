import Link from "next/link";
import type { Metadata } from "next";
import { AUTHORS } from "@/lib/authors";

export const metadata: Metadata = {
  title: "Authors & Editorial Team",
  description:
    "Meet the people behind North East Connect's news, culture, wildlife, and community coverage of Assam and Northeast India.",
  alternates: { canonical: "/authors" },
};

export default function AuthorsIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Authors &amp; Editorial Team
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
          North East Connect runs a small, named editorial process rather than an anonymous
          newsroom — every story published here is checked against real sources under the
          oversight below.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {AUTHORS.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="group bg-white dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex gap-4 items-start hover:border-emerald-400 dark:hover:border-emerald-600 transition shadow-sm"
            >
              <img
                src={author.photo}
                alt={author.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div>
                <h2 className="font-extrabold text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  {author.name}
                </h2>
                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide mt-0.5">
                  {author.role}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                  {author.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
