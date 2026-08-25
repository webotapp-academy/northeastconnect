import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for North East Connect covering accounts, community content, the business directory and marketplace, and platform liability.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: [string, string][] = [
  [
    "Accounts",
    "You must provide accurate registration information and are responsible for activity under your account. Don't impersonate another person or business.",
  ],
  [
    "Community content & conduct",
    "Posts, comments and Adda discussions must not contain harassment, hate speech, misinformation presented as fact, spam, or illegal content. We may remove content or suspend accounts that violate these guidelines.",
  ],
  [
    "Business directory & marketplace",
    "Directory listings and marketplace ads are submitted by businesses and individual users. North East Connect verifies claimed listings on a best-effort basis but does not guarantee the accuracy of business details, pricing, or the quality of goods/services listed. Transactions arranged through the marketplace are between the buyer and seller — North East Connect is not a party to them.",
  ],
  [
    "News content",
    "News articles are produced or reviewed under our editorial process — see the editorial policy for sourcing and correction standards.",
  ],
  [
    "Intellectual property",
    "Content you post remains yours, but by posting publicly you grant North East Connect a license to display and distribute it on the platform. Don't post content you don't have the rights to share.",
  ],
  [
    "Limitation of liability",
    "The platform is provided \"as is.\" North East Connect is not liable for losses arising from user-generated content, marketplace transactions, or directory listing inaccuracies, to the fullest extent permitted by law.",
  ],
  [
    "Changes",
    "These terms may be updated as the platform evolves. Continued use after changes means you accept the updated terms.",
  ],
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Terms of Use</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-10">
          For North East Connect (northeastconnect.in), a brand of Webotapp Private Limited.
        </p>

        <div className="space-y-8">
          {SECTIONS.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-lg font-extrabold mb-2">{title}</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
