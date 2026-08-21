"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

const STATES = [
  "All States",
  "Assam",
  "Arunachal Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
];

const CATEGORIES = [
  { id: "Culture & Heritage", icon: "🏛️", desc: "Tribal traditions, folklore, handloom, crafts & indigenous history" },
  { id: "Music & Festivals", icon: "🎸", desc: "Bands, indie artists, folk music, Ziro, Hornbill & gig alerts" },
  { id: "Travel & Homestays", icon: "🏡", desc: "Hidden trails, eco-tourism, backpacking & local hosts" },
  { id: "Food & Cuisine", icon: "🍲", desc: "Local delicacies, street food, recipes & indigenous ingredients" },
  { id: "Youth & Campus", icon: "🎓", desc: "College addas, student discussions, campus life & creative minds" },
  { id: "Startups & Creators", icon: "🚀", desc: "Northeast entrepreneurs, freelance creators & tech innovators" },
  { id: "Wildlife & Nature", icon: "🌿", desc: "Bio-diversity, conservation, bird watching & national parks" },
  { id: "Sports & Fitness", icon: "⚽", desc: "Football, martial arts, trekking, running & outdoor athletics" },
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form State
  const [addaName, setAddaName] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCategory, setSelectedCategory] = useState("Culture & Heritage");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🌿");
  const [rules, setRules] = useState("1. Be respectful to all cultures & communities.\n2. No spam or promotional spam.\n3. Share authentic stories and help fellow members.");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const EMOJI_OPTIONS = ["🌿", "🏔️", "🎸", "🏡", "☕", "🍲", "🎨", "🦅", "🌸", "🎓", "🚀", "⚽", "🎭", "🛖", "🌊"];

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
      }
    } catch {
      // Ignored
    }
  }

  // Format clean adda slug: n:example_name
  function handleAddaNameChange(val: string) {
    let clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "");
    if (!clean.startsWith("n:")) {
      clean = "n:" + clean.replace(/^n_*/, "");
    }
    setAddaName(clean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!addaName.trim() || addaName.length < 4) {
      alert("Please enter a valid Adda name (e.g. n:shillong_creators)");
      return;
    }

    if (!description.trim()) {
      alert("Please write a short description explaining what your community is about.");
      return;
    }

    try {
      setSubmitting(true);
      
      // Save locally to user's joined addas immediately
      const savedKey = `nec-joined-addas-${currentUser.id}`;
      const existingStr = localStorage.getItem(savedKey);
      let existingList: string[] = existingStr ? JSON.parse(existingStr) : [];
      if (!existingList.includes(addaName)) {
        existingList.push(addaName);
        localStorage.setItem(savedKey, JSON.stringify(existingList));
      }

      // Publish a welcoming inaugural post to the new community feed
      await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🎉 Welcome to ${addaName}! ${selectedIcon}\n\n${description.trim()}\n\n#northeastconnect #community #adda`,
          taggedLocation: addaName,
        }),
      });

      setSuccessToast(true);

      setTimeout(() => {
        router.push(`/?adda=${encodeURIComponent(addaName)}`);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Failed to create community");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 font-sans py-8 sm:py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/addas"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition"
          >
            &larr; Back to All Addas
          </Link>
        </div>

        {/* Hero Emotional Banner */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-800/40 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
              <span>🌿</span> Voice of the Northeast
            </span>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Every valley has a story. <br />
              <span className="text-emerald-400">Bring your people together.</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              From the mist-crowned peaks of Arunachal to the tea gardens of Assam, from Shillong&apos;s rock vibes to Kohima&apos;s artisan circles — build a space where local voices unite, collaborate, and celebrate our shared Northeast heritage.
            </p>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-300 font-medium">
              <div className="flex items-center gap-1.5">
                <span>🛡️</span> Lead as Community Founder
              </div>
              <div className="flex items-center gap-1.5">
                <span>✨</span> Earn +50 Explorer XP
              </div>
              <div className="flex items-center gap-1.5">
                <span>🤝</span> Connect Fellow Explorers
              </div>
            </div>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] text-9xl opacity-10 select-none pointer-events-none">
            🏞️
          </div>
        </div>

        {/* Main Creation Form Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Community Name & Mascot */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Community Handle / Adda Tag <span className="text-emerald-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={addaName}
                    onChange={(e) => handleAddaNameChange(e.target.value)}
                    placeholder="e.g. n:shillong_creators or n:kaziranga_explorers"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Unique identifier starting with <code className="text-emerald-600 font-bold">n:</code> for your community.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Mascot / Icon
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-2">
                  <span className="text-2xl ml-1">{selectedIcon}</span>
                  <select
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <option key={emoji} value={emoji} className="bg-white dark:bg-slate-900 text-lg">
                        {emoji}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. State & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  State / Region <span className="text-emerald-500">*</span>
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Category Focus <span className="text-emerald-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">
                      {c.icon} {c.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Catchy Tagline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Catchy Tagline / Topic Tag
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Indie Bands, Guitar Riffs & Northeast Music Lovers"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* 4. Description & Purpose */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Community Description & Emotional Mission <span className="text-emerald-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what this Adda is about. Why should someone join? Share the vibe, the vision, and what kind of conversations and meetups you envision here..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 5. Community Rules */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Community Guidelines / Rules
              </label>
              <textarea
                rows={3}
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-mono focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>🌟</span>
                <span>Founders earn the verified community leader badge</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-full shadow-lg hover:shadow-emerald-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Launching Your Adda..." : "🚀 Launch Community (+50 XP)"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-800 text-emerald-200 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-2xl">🎉</span>
          <div>
            <h5 className="font-bold text-sm text-white">Community Launched!</h5>
            <p className="text-xs text-emerald-300">Redirecting to your new Adda feed...</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchSession()}
      />
    </main>
  );
}
