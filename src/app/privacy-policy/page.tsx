import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What information North East Connect collects, how it's used, and the advertising and analytics services running on the platform.",
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS: [string, React.ReactNode][] = [
  [
    "Information we collect",
    "When you register, we collect your name, username, email, and any profile details you add (bio, location, photo). When you post — community posts, comments, marketplace listings, directory business claims, job postings — that content is stored against your account. We also log basic technical data (pages viewed, device/browser type, approximate location from IP) for security and analytics.",
  ],
  [
    "How we use it",
    "To run the platform: showing your posts and profile to other members, powering the leaderboard and notifications, verifying business directory claims, and moderating content against our community guidelines. We do not sell your personal data to third parties.",
  ],
  [
    "Advertising & analytics",
    "North East Connect runs Google AdSense and Google Analytics (GA4). These services may use cookies or similar technology to serve ads and measure site usage. You can control ad personalization through Google's Ad Settings, and manage cookies through your browser settings.",
  ],
  [
    "Content you post",
    "Anything you post publicly — community posts, comments, marketplace ads, directory reviews — is visible to other users and may appear in search results. Don't post information you don't want public.",
  ],
  [
    "Data retention & deletion",
    "Your account data is retained while your account is active. To request deletion of your account and associated data, contact us via the contact page.",
  ],
  [
    "Changes to this policy",
    "We may update this policy as the platform evolves. Material changes will be reflected on this page with an updated effective date.",
  ],
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-10">
          Effective for North East Connect (northeastconnect.in), a brand of Webotapp Private Limited.
        </p>

        <div className="space-y-8">
          {SECTIONS.map(([title, body]) => (
            <section key={title as string}>
              <h2 className="text-lg font-extrabold mb-2">{title}</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
