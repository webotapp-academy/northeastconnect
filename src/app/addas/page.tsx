"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";

const NE_STATES = [
  { name: "All States", icon: "🌿", tag: "All" },
  { name: "Assam", icon: "🦏", tag: "Assam" },
  { name: "Meghalaya", icon: "🌧️", tag: "Meghalaya" },
  { name: "Arunachal Pradesh", icon: "🏔️", tag: "Arunachal" },
  { name: "Nagaland", icon: "🦅", tag: "Nagaland" },
  { name: "Manipur", icon: "🌸", tag: "Manipur" },
  { name: "Mizoram", icon: "🎋", tag: "Mizoram" },
  { name: "Tripura", icon: "🏰", tag: "Tripura" },
  { name: "Sikkim", icon: "❄️", tag: "Sikkim" },
];

const CATEGORIES = [
  { id: "all", label: "All Addas", icon: "✨" },
  { id: "cities", label: "Cities & Towns", icon: "🏙️" },
  { id: "nature", label: "Nature & Wildlife", icon: "🦏" },
  { id: "culture", label: "Culture & Heritage", icon: "🎭" },
  { id: "topics", label: "Topics & Passions", icon: "🎒" },
];

const ALL_ADDAS = [
  {
    id: "guwahati",
    name: "n:guwahati",
    title: "Guwahati City Adda",
    icon: "🏙️",
    count: 1343,
    tag: "City Hub",
    category: "cities",
    categoryLabel: "Cities & Towns",
    state: "Assam",
    desc: "Capital hub, city life, hangouts, food spots, colleges & local weekend events in Guwahati.",
    popularTopics: ["Rooftop cafes", "Brahmaputra riverfront", "Cotton University", "GS Road food"],
  },
  {
    id: "shillong",
    name: "n:shillong",
    title: "Shillong Hills & Music",
    icon: "🌧️",
    count: 256,
    tag: "Music & Hills",
    category: "cities",
    categoryLabel: "Cities & Towns",
    state: "Meghalaya",
    desc: "Rock music, pine groves, cozy cafes, Laitumkhrah hangouts & Khasi cultural vibes.",
    popularTopics: ["Indie music", "Police Bazar", "Umiam lake drives", "Cafe hopping"],
  },
  {
    id: "kaziranga",
    name: "n:kaziranga",
    title: "Kaziranga Wildlife Safari",
    icon: "🦏",
    count: 184,
    tag: "Wildlife & Safari",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    state: "Assam",
    desc: "One-horned rhino sightings, elephant safari bookings, birdwatching & forest conservation stories.",
    popularTopics: ["Rhino sightings", "Kohora range", "Birding", "Eco-resorts"],
  },
  {
    id: "nagaland",
    name: "n:nagaland",
    title: "Nagaland & Hornbill Adda",
    icon: "🦅",
    count: 201,
    tag: "Hornbill & Culture",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    state: "Nagaland",
    desc: "Hornbill Festival, Naga warrior traditions, tribal crafts, indigenous music & scenic high hills.",
    popularTopics: ["Hornbill festival", "Kisama village", "Kohima heritage", "Local music"],
  },
  {
    id: "sikkim",
    name: "n:sikkim",
    title: "Sikkim Himalayan Adda",
    icon: "❄️",
    count: 102,
    tag: "Himalayas & Monasteries",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    state: "Sikkim",
    desc: "Kanchenjunga vistas, high mountain passes, organic farming, Rumtek & Buddhist monasteries.",
    popularTopics: ["MG Marg", "Nathula pass", "Monasteries", "Organic trails"],
  },
  {
    id: "tawang",
    name: "n:tawang",
    title: "Tawang & Arunachal Trails",
    icon: "🏔️",
    count: 203,
    tag: "Mountain Trails",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    state: "Arunachal Pradesh",
    desc: "Sela Pass snow, 400-year-old Tawang Monastery, high altitude lakes & Arunachal expeditions.",
    popularTopics: ["Sela Pass", "Tawang Monastery", "Snow treks", "Bum La Pass"],
  },
  {
    id: "majuli",
    name: "n:majuli",
    title: "Majuli Island Heritage",
    icon: "🎭",
    count: 124,
    tag: "River Island & Art",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    state: "Assam",
    desc: "World's largest river island, mask making, Sattriya dance & Vaishnavite cultural Sattras.",
    popularTopics: ["Mask making", "Ferry rides", "Sattriya dance", "Sunset photography"],
  },
  {
    id: "dzukou",
    name: "n:dzukou",
    title: "Dzukou Valley Trekkers",
    icon: "🌸",
    count: 198,
    tag: "Valley Trekking",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    state: "Nagaland",
    desc: "Trekking trails, seasonal Dzukou lily blooms, cave exploration & mountain camping adventures.",
    popularTopics: ["Trek guides", "Camping tips", "Lily season", "Rest house info"],
  },
  {
    id: "cherrapunji",
    name: "n:cherrapunji",
    title: "Sohra & Living Root Bridges",
    icon: "🌊",
    count: 224,
    tag: "Root Bridges & Falls",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    state: "Meghalaya",
    desc: "Double-decker living root bridges, Nohkalikai waterfalls, caves & monsoon travel experiences.",
    popularTopics: ["Root bridges", "Nohkalikai falls", "Cave exploration", "Rainbow falls"],
  },
  {
    id: "food",
    name: "n:food",
    title: "NE Foodies & Cuisines",
    icon: "🍲",
    count: 542,
    tag: "Food & Recipes",
    category: "topics",
    categoryLabel: "Topics & Passions",
    state: "All States",
    desc: "Smoked pork with bamboo shoot, authentic thalis, fermented dishes & secret family recipes.",
    popularTopics: ["Traditional thalis", "Smoked pork", "Bamboo shoot", "Street food guide"],
  },
  {
    id: "travel",
    name: "n:travel",
    title: "Backpackers & Road Trips",
    icon: "🎒",
    count: 610,
    tag: "Travel & Backpacking",
    category: "topics",
    categoryLabel: "Topics & Passions",
    state: "All States",
    desc: "Road trips, homestay reviews, shared cabs, budget backpacking circuits & permit assistance.",
    popularTopics: ["Backpacking routes", "Homestay reviews", "Shared cabs", "ILP permits"],
  },
  {
    id: "music",
    name: "n:music",
    title: "NE Indie Music & Bands",
    icon: "🎸",
    count: 385,
    tag: "Music & Festivals",
    category: "topics",
    categoryLabel: "Topics & Passions",
    state: "All States",
    desc: "Ziro festival, rock bands, folk fusion, local music gigs & Northeast indie artists.",
    popularTopics: ["Ziro festival", "Local bands", "Folk fusion", "Concert alerts"],
  },
];

export default function ExploreAddasPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [addasList, setAddasList] = useState(ALL_ADDAS);
  const [joinedAddas, setJoinedAddas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("All States");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();

    async function loadLiveCounts() {
      try {
        const res = await fetch("/api/community/addas");
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.addas)) {
          setAddasList((prev) =>
            prev.map((a) => {
              const match = data.addas.find((s: any) => s.name === a.name);
              return match ? { ...a, count: match.count } : a;
            })
          );
        }
      } catch {
        // Ignored
      }
    }
    loadLiveCounts();
  }, []);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        try {
          const saved = localStorage.getItem(`nec-joined-addas-${data.user.id}`);
          if (saved) {
            setJoinedAddas(JSON.parse(saved));
          } else {
            setJoinedAddas([]);
          }
        } catch {
          setJoinedAddas([]);
        }
      } else {
        setCurrentUser(null);
        setJoinedAddas([]);
      }
    } catch {
      setCurrentUser(null);
      setJoinedAddas([]);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  function handleToggleJoin(addaName: string) {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const isJoined = joinedAddas.includes(addaName);
    let updated: string[];

    if (isJoined) {
      updated = joinedAddas.filter((n) => n !== addaName);
      showToast(`Left ${addaName}`);
    } else {
      updated = [...joinedAddas, addaName];
      showToast(`🎉 You joined ${addaName}! (+15 XP)`);
    }

    setJoinedAddas(updated);
    try {
      localStorage.setItem(`nec-joined-addas-${currentUser.id}`, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  }

  // Filter addas based on search, category, and state
  const filteredAddas = addasList.filter((adda) => {
    const matchesSearch =
      adda.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adda.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adda.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adda.state.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || adda.category === selectedCategory;

    const matchesState =
      selectedState === "All States" ||
      adda.state === selectedState ||
      adda.state === "All States";

    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b0e14] text-slate-900 dark:text-slate-100 py-6 sm:py-10 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
        {/* ========================================================================= */}
        {/* HEADER HERO (Glossy Card)                                                 */}
        {/* ========================================================================= */}
        <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-slate-100 font-semibold">Addas &amp; Communities</span>
            </div>

            <h1
              className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight"
              style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}
            >
              Explore Northeast <span className="text-emerald-600 dark:text-emerald-400">Addas</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              Join local city groups, wildlife hubs, tribal culture addas, and passionate topic communities across the 8 sister states of Northeast India.
            </p>

            {/* State community hubs */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {NE_STATES.filter((st) => st.name !== "All States").map((st) => (
                <Link
                  key={st.name}
                  href={`/addas/state/${st.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                >
                  <span>{st.icon}</span> {st.name} Community
                </Link>
              ))}
              <Link
                href="/addas/groups"
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <span>💬</span> WhatsApp &amp; Telegram Groups
              </Link>
            </div>

            {/* Search Input */}
            <div className="mt-5 relative max-w-xl">
              <input
                type="text"
                placeholder="Search addas (e.g. guwahati, shillong, food, travel, kaziranga)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CATEGORY & STATE FILTERS                                                  */}
        {/* ========================================================================= */}
        <div className="space-y-3 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    active
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                      : "bg-white/75 dark:bg-slate-900/75 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-white/60 dark:border-slate-800/80"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* State Switcher Pills */}
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
              {NE_STATES.map((st) => {
                const active = selectedState === st.name;
                return (
                  <button
                    key={st.name}
                    onClick={() => setSelectedState(st.name)}
                    className={`flex-shrink-0 snap-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/60"
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.name === "All States" ? "n:all" : `n:${st.name.toLowerCase().replace(/\s+/g, "")}`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRID OF ADDA CARDS                                                        */}
        {/* ========================================================================= */}
        {filteredAddas.length === 0 ? (
          <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs max-w-md mx-auto">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">No Addas Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your search query or state filter to find more regional addas.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedState("All States");
              }}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAddas.map((adda) => {
              const isJoined = joinedAddas.includes(adda.name);

              return (
                <div
                  key={adda.id}
                  className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Icon, Name & Join Button */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl group-hover:scale-105 transition shrink-0">
                          {adda.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                            {adda.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>{adda.count.toLocaleString()} members</span>
                            <span>•</span>
                            <span>{adda.state}</span>
                          </div>
                        </div>
                      </div>

                      {isJoined ? (
                        <Link
                          href={`/addas/${adda.id}`}
                          className="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs shrink-0 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                        >
                          View
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleToggleJoin(adda.name)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shadow-xs shrink-0 bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                        >
                          + Join
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {adda.desc}
                    </p>

                    {/* Popular Topic Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {adda.popularTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action: Direct Link to Community Feed */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {adda.tag}
                    </span>
                    <Link
                      href={`/addas/${adda.id}`}
                      className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Visit Feed</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab="login"
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => fetchMe()}
      />
    </main>
  );
}
