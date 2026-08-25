import Link from "next/link";
import type { Metadata } from "next";
import { getAuthorBySlug } from "@/lib/authors";

const founder = getAuthorBySlug("paban-bhuyan")!;

export const metadata: Metadata = {
  title: "About North East Connect",
  description:
    "North East Connect is a community, news and business directory hub for Assam and Northeast India — who runs it, how coverage is sourced, and what the platform includes.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <header className="relative min-h-[32vh] flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img src="/assets/images/hero.jpg" alt="Northeast India" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto pt-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">About North East Connect</h1>
          <p className="text-gray-200 mt-2 text-base sm:text-lg">
            One hub for Assam and Northeast India — community, news, culture, wildlife and business.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-3xl py-12 space-y-10">
        <section>
          <h2 className="text-xl font-extrabold mb-3">What North East Connect is</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            North East Connect (northeastconnect.in) is a community and information platform focused
            entirely on Assam and Northeast India. It brings together a local social feed
            (&ldquo;Addas&rdquo;), regional news, a verified business directory, a classifieds
            marketplace, and dedicated culture, wildlife and adventure sections — built so people
            from the region, and people planning to visit or do business here, have one place to
            find real, current information instead of scattered social groups and outdated blogs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold mb-3">Who runs it</h2>
          <div className="bg-white dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={founder.photo}
              alt={founder.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-emerald-500/15 shrink-0"
            />
            <div className="text-center sm:text-left">
              <h3 className="font-extrabold text-lg">{founder.name}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide mt-0.5">
                {founder.role}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {founder.bio}
              </p>
              <Link
                href="/authors/paban-bhuyan"
                className="inline-block mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Full profile &rarr;
              </Link>
            </div>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
            North East Connect is a brand of Webotapp Private Limited. See the{" "}
            <Link href="/editorial-policy" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              editorial policy
            </Link>{" "}
            for how news coverage is sourced, corrected and published.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold mb-3">What&rsquo;s on the platform</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Addas", "State and city-level community feeds — Guwahati, Shillong and more."],
              ["News", "Daily regional news coverage across Assam and Northeast India."],
              ["Directory", "Verified local business listings across categories and districts."],
              ["Marketplace", "Local classifieds for buying, selling and services."],
              ["Culture", "Festivals, heritage sites and cultural stories from the region."],
              ["Wildlife & Adventure", "Sanctuaries, parks and outdoor activities across the Northeast."],
            ].map(([title, desc]) => (
              <li key={title} className="bg-white dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
                <span className="font-bold text-slate-900 dark:text-slate-100">{title}</span>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-extrabold mb-3">Get in touch</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Questions, corrections, business claims or partnership enquiries — reach the team via
            the{" "}
            <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
