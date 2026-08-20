export interface AddaDef {
  id: string;
  name: string; // e.g. "n:guwahati"
  title: string;
  icon: string;
  state: string;
  tag: string;
  category: "cities" | "nature" | "culture" | "topics";
  categoryLabel: string;
  keywords: string[];
  desc: string;
}

export const MASTER_ADDAS: AddaDef[] = [
  {
    id: "guwahati",
    name: "n:guwahati",
    title: "Guwahati City Hub",
    icon: "🏙️",
    state: "Assam",
    tag: "City Hub",
    category: "cities",
    categoryLabel: "Cities & Towns",
    keywords: ["guwahati", "kamrup", "dispur", "beltola", "panbazar", "gs road", "jalukbari", "brahmaputra", "cotton university", "khanapara"],
    desc: "Capital hub, city life, hangouts, food spots, colleges & local weekend events in Guwahati.",
  },
  {
    id: "shillong",
    name: "n:shillong",
    title: "Shillong Hills & Music",
    icon: "🌧️",
    state: "Meghalaya",
    tag: "Music & Hills",
    category: "cities",
    categoryLabel: "Cities & Towns",
    keywords: ["shillong", "khasi", "east khasi hills", "police bazar", "laitumkhrah", "umiam", "cherrapunji", "sohra", "meghalaya"],
    desc: "Rock music, pine groves, cozy cafes, Laitumkhrah hangouts & Khasi cultural vibes.",
  },
  {
    id: "kaziranga",
    name: "n:kaziranga",
    title: "Kaziranga Wildlife Safari",
    icon: "🦏",
    state: "Assam",
    tag: "Wildlife & Safari",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    keywords: ["kaziranga", "golaghat", "nagaon", "rhino", "safari", "kohora", "bagori", "wildlife", "bokakhat"],
    desc: "One-horned rhino sightings, elephant safari bookings, birdwatching & forest conservation stories.",
  },
  {
    id: "nagaland",
    name: "n:nagaland",
    title: "Nagaland & Hornbill Adda",
    icon: "🦅",
    state: "Nagaland",
    tag: "Hornbill & Culture",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    keywords: ["nagaland", "kohima", "dimapur", "hornbill", "kisama", "mokokchung", "mon", "dzukou", "naga"],
    desc: "Hornbill Festival, Naga warrior traditions, tribal crafts, indigenous music & scenic high hills.",
  },
  {
    id: "sikkim",
    name: "n:sikkim",
    title: "Sikkim Himalayan Adda",
    icon: "❄️",
    state: "Sikkim",
    tag: "Himalayas & Monasteries",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    keywords: ["sikkim", "gangtok", "nathula", "tsomgo", "rumtek", "pelling", "kanchenjunga", "lachung", "yumthang"],
    desc: "Kanchenjunga vistas, high mountain passes, organic farming, Rumtek & Buddhist monasteries.",
  },
  {
    id: "tawang",
    name: "n:tawang",
    title: "Tawang & Arunachal Trails",
    icon: "🏔️",
    state: "Arunachal Pradesh",
    tag: "Mountain Trails",
    category: "nature",
    categoryLabel: "Nature & Wildlife",
    keywords: ["tawang", "arunachal", "sela pass", "monastery", "arunachal pradesh", "bomdila", "dirang", "bhalukpong", "ziro", "itanagar"],
    desc: "High altitude passes, Tawang Monastery, snow trails & Monpa Himalayan culture in Arunachal.",
  },
  {
    id: "manipur",
    name: "n:manipur",
    title: "Manipur & Loktak Lake",
    icon: "🌸",
    state: "Manipur",
    tag: "Loktak & Heritage",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    keywords: ["manipur", "imphal", "loktak", "keibul lamjao", "sangai", "churachandpur", "ukhrul", "kangpokpi", "meitei", "kuki"],
    desc: "Floating phumdis of Loktak Lake, Sangai deer, classical Manipuri dance, sports & indigenous arts.",
  },
  {
    id: "mizoram",
    name: "n:mizoram",
    title: "Mizoram Hills & Aizawl",
    icon: "🎋",
    state: "Mizoram",
    tag: "Breezy Hills",
    category: "cities",
    categoryLabel: "Cities & Towns",
    keywords: ["mizoram", "aizawl", "champhai", "reiek", "vantawng", "mizo", "chapchar kut", "serchhip", "kolasib"],
    desc: "Aizawl city peaks, bamboo groves, Chapchar Kut festivities & tranquil mist-covered ridges.",
  },
  {
    id: "tripura",
    name: "n:tripura",
    title: "Tripura Palaces & Heritage",
    icon: "🏰",
    state: "Tripura",
    tag: "Royal Heritage",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    keywords: ["tripura", "agartala", "ujjayanta", "neermahal", "unakoti", "tripurasundari", "dharmanagar", "udaipur"],
    desc: "Ujjayanta Palace, Neermahal water fortress, Unakoti rock carvings & royal Tripuri history.",
  },
  {
    id: "majuli",
    name: "n:majuli",
    title: "Majuli River Island",
    icon: "🎭",
    state: "Assam",
    tag: "Satriya & Culture",
    category: "culture",
    categoryLabel: "Culture & Heritage",
    keywords: ["majuli", "jorhat", "satras", "mask making", "brahmaputra", "satriya", "island", "kamalabari"],
    desc: "World's largest inhabited river island, Neo-Vaishnavite Satras, traditional mask making & pottery.",
  },
  {
    id: "teagardens",
    name: "n:teagardens",
    title: "Assam Tea Trails & Estates",
    icon: "🍃",
    state: "Assam",
    tag: "Tea Heritage",
    category: "topics",
    categoryLabel: "Topics & Passions",
    keywords: ["tea", "dibrugarh", "jorhat", "tinsukia", "tea garden", "assam tea", "orthodox tea", "chai", "estate"],
    desc: "Lush tea gardens of Dibrugarh & Jorhat, heritage planter bungalows & world-famous Assam CTC tea.",
  },
  {
    id: "foodies",
    name: "n:foodies",
    title: "Northeast Food & Flavours",
    icon: "🍲",
    state: "All States",
    tag: "Cuisine & Recipes",
    category: "topics",
    categoryLabel: "Topics & Passions",
    keywords: ["food", "masor tenga", "khar", "smoked pork", "bhoot jolokia", "king chilli", "axone", "cuisine", "thukpa", "momo"],
    desc: "Authentic local recipes, smoked meats, fermented bamboo shoot, Khar, Masor Tenga, Bhoot Jolokia & momos.",
  },
  {
    id: "music",
    name: "n:music",
    title: "Northeast Indie Music & Gigs",
    icon: "🎸",
    state: "All States",
    tag: "Music & Festivals",
    category: "topics",
    categoryLabel: "Topics & Passions",
    keywords: ["music", "ziro", "band", "rock", "folk", "gig", "concert", "guitar", "festival", "singing"],
    desc: "Ziro festival, rock bands, folk fusion, local music gigs & Northeast indie artists.",
  },
];

/**
 * Filter addas based on user query (e.g. typing "n:gu" or "guw")
 */
export function matchAddas(query: string): AddaDef[] {
  if (!query) return MASTER_ADDAS;
  const clean = query.trim().toLowerCase().replace(/^n:/, "");
  if (!clean) return MASTER_ADDAS;

  return MASTER_ADDAS.filter((a) => {
    if (a.name.toLowerCase().includes(clean)) return true;
    if (a.id.toLowerCase().includes(clean)) return true;
    if (a.title.toLowerCase().includes(clean)) return true;
    if (a.state.toLowerCase().includes(clean)) return true;
    if (a.keywords.some((k) => k.toLowerCase().includes(clean))) return true;
    return false;
  });
}

/**
 * Matches an article / listing to an adda by its city, district, state, or tags
 */
export function findAddasForContent(content: {
  title?: string | null;
  tags?: string | null;
  location?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
}): AddaDef[] {
  const combined = [
    content.tags || "",
    content.location || "",
    content.city || "",
    content.district || "",
    content.state || "",
    content.title || "",
  ]
    .join(" ")
    .toLowerCase();

  const matched = MASTER_ADDAS.filter((adda) => {
    if (combined.includes(adda.name.toLowerCase())) return true;
    return adda.keywords.some((kw) => combined.includes(kw.toLowerCase()));
  });

  return matched;
}
