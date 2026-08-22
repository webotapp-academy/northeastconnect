import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { MASTER_ADDAS } from "@/lib/addas";
import GroupSubmitForm from "@/components/community/GroupSubmitForm";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://northeastconnect.in";

export const metadata: Metadata = {
  title: "Assam & Northeast India WhatsApp & Telegram Groups — Real, Active Community Links",
  description:
    "A moderated directory of real, active Assam and Northeast India WhatsApp and Telegram groups — city hangouts, jobs, buy & sell, and interest groups, verified before listing. Submit your own group.",
  keywords: ["assam whatsapp group", "guwahati whatsapp group", "northeast india telegram group", "assam telegram group"],
  openGraph: {
    title: "Assam & Northeast India WhatsApp & Telegram Groups",
    description: "A moderated directory of real, active Assam and Northeast India WhatsApp and Telegram groups.",
    type: "website",
    url: `${siteUrl}/addas/groups`,
  },
  alternates: {
    canonical: `${siteUrl}/addas/groups`,
  },
};

interface GroupNote {
  platform: "whatsapp" | "telegram";
  inviteLink: string;
  addaSlug?: string;
  description?: string;
}

export default async function WhatsAppTelegramGroupsPage() {
  const approved = await db.lead.findMany({
    where: { listingId: "group-submission", status: "approved" },
    orderBy: { id: "desc" },
    take: 200,
  });

  const groups = approved
    .map((lead) => {
      let note: GroupNote | null = null;
      try {
        note = lead.notes ? JSON.parse(lead.notes) : null;
      } catch {
        note = null;
      }
      if (!note?.inviteLink) return null;
      const adda = note.addaSlug ? MASTER_ADDAS.find((a) => a.id === note.addaSlug) : undefined;
      return { id: lead.id, name: lead.name || "Community Group", note, adda };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Assam & Northeast India WhatsApp & Telegram Groups",
    itemListElement: groups.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: g.name,
      url: g.note.inviteLink,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pt-4 sm:pt-6 pb-24 px-3 sm:px-6 transition-colors">
      {groups.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <div className="container mx-auto max-w-3xl">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap py-1">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span>/</span>
          <Link href="/addas" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Addas</Link>
          <span>/</span>
          <span className="text-slate-400 dark:text-slate-500">WhatsApp &amp; Telegram Groups</span>
        </nav>

        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Community Directory
          </p>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white text-balance">
            Assam &amp; Northeast India WhatsApp &amp; Telegram Groups
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            A moderated directory of real, active groups — city hangouts, jobs, buy &amp; sell, and interest
            communities across Assam and the Northeast. Every group here is checked before it&apos;s listed.
          </p>
        </header>

        <section className="mb-8">
          {groups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No groups listed yet — submit yours below to be the first.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((g) => (
                <a
                  key={g.id}
                  href={g.note.inviteLink}
                  target="_blank"
                  rel="nofollow noopener ugc"
                  className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-emerald-400 dark:hover:border-emerald-600 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{g.note.platform === "telegram" ? "✈️" : "🟢"}</span>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">{g.name}</h3>
                    </div>
                    {g.note.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{g.note.description}</p>
                    )}
                    {g.adda && (
                      <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {g.adda.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Join →</span>
                </a>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-3">Submit your group</h2>
          <GroupSubmitForm />
        </section>
      </div>
    </div>
  );
}
