import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How North East Connect sources, writes, corrects and publishes news coverage of Assam and Northeast India.",
  alternates: { canonical: "/editorial-policy" },
};

const SECTIONS: [string, string][] = [
  [
    "Sourcing",
    "Stories are built from official statements, verified regional press coverage, government releases, and named local sources. We do not publish unverified rumor or single-source claims presented as fact.",
  ],
  [
    "Who writes and reviews",
    "North East Connect runs a small, named editorial process under the oversight of the platform's founder (see Authors). Every published article is checked against its cited sources before it goes live.",
  ],
  [
    "Corrections",
    "If a factual error is reported, we correct the article and note the update. To flag a correction, use the contact page with the article URL and what needs fixing — we aim to review correction requests within 48 hours.",
  ],
  [
    "Independence",
    "Business directory listings, marketplace ads and sponsored placements are visually and structurally separated from news coverage. Being listed in the directory does not influence news coverage, and vice versa.",
  ],
  [
    "User-generated content",
    "Community posts, comments and Adda discussions are user-submitted and reflect individual members' views, not North East Connect's editorial position. They're moderated for platform guidelines, not fact-checked as journalism.",
  ],
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Editorial Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-10">
          How North East Connect sources, writes and corrects its news coverage.
        </p>

        <div className="space-y-8">
          {SECTIONS.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-lg font-extrabold mb-2">{title}</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-500 mt-10">
          Learn more about the platform on the{" "}
          <Link href="/about" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            about page
          </Link>{" "}
          or the{" "}
          <Link href="/authors" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            authors page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
