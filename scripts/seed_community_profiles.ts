import "dotenv/config";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/auth";

// =============================================================================
// FIRST NAMES & SURNAMES FOR NORTHEAST INDIA
// =============================================================================

const ASSAM_GIRL_FIRST_NAMES = [
  "Ananya", "Priya", "Barsha", "Dimple", "Puja", "Rinki", "Pallavi", "Rupshikha",
  "Trishna", "Dikshita", "Monalisa", "Gitashree", "Priyanka", "Nibedita", "Kasturi",
  "Parishmita", "Bidisha", "Ritu", "Kakali", "Tanvi", "Sneha", "Manashree", "Rashmi",
  "Sharmila", "Jyotirekha", "Pompy", "Bornali", "Bandita", "Sunayana", "Himashree",
  "Rupali", "Jayashree", "Mousumi", "Papori", "Chandana", "Mridusmita", "Jonali",
  "Nilakshi", "Sangita", "Archana", "Dipshikha", "Bhaswati", "Gayatri", "Nabamita",
  "Runjun", "Pragya", "Shikha", "Bobita", "Rekha", "Lipika", "Meenakshi", "Swagata",
  "Karabi", "Tulika", "Kalyani", "Nandini", "Anindita", "Madhusmita", "Sarmistha",
  "Nabanita", "Suman", "Debashree", "Juri", "Mamoni", "Purabi", "Dolly", "Gitanjali",
  "Rimpi", "Bipasha", "Dhanashree", "Alankrita", "Panchali", "Tridisha", "Debalina"
];

const ASSAM_BOY_FIRST_NAMES = [
  "Rahul", "Kaushik", "Bikash", "Abhijit", "Partha", "Debojit", "Rituraj", "Manabendra",
  "Pranjal", "Dipankar", "Jyotish", "Nilav", "Subhash", "Bedanta", "Himangshu", "Bhargav",
  "Angshuman", "Chinmoy", "Mriganka", "Ankur", "Gaurav", "Nayan", "Dhrubajyoti", "Hiren",
  "Gautam", "Sanjib", "Utpal", "Saurav", "Rajdeep", "Tanmoy", "Tridip", "Arindam",
  "Bidyut", "Nabajit", "Pankaj", "Rupam", "Pranab", "Joydeep", "Manash", "Diganta",
  "Bipul", "Deben", "Raktim", "Kallol", "Rupankar", "Animesh", "Samiran", "Prateek"
];

const ASSAM_SURNAMES = [
  "Borah", "Gogoi", "Kalita", "Sarma", "Deka", "Saikia", "Dutta", "Baruah", "Hazarika",
  "Das", "Nath", "Medhi", "Goswami", "Choudhury", "Bhattacharya", "Phukan", "Chaliha",
  "Mahanta", "Kakati", "Bordoloi", "Chetia", "Sonowal", "Boro", "Rabha", "Tamuly",
  "Neog", "Handique", "Bezbaruah", "Pathak", "Bora", "Talukdar", "Mazumdar", "Baishya",
  "Patowary", "Bhuyan", "Rajkhowa", "Lahkar", "Chutia", "Daimary", "Basumatary"
];

const MEGHALAYA_GIRL_NAMES = [
  "Mary Khongwir", "Daphisha Marbaniang", "Wanphai Syiem", "Iba Lyngdoh", "Baphida Kharbangar",
  "Cheryl Sangma", "Patricia Marak", "Larisa Momin", "Evangeline Shullai", "Amanda Mawrie",
  "Grace Nongrum", "Jessica Kharmalki", "Jennifer Warjri", "Sandra Lamare", "Tracy Rumnong"
];

const MEGHALAYA_BOY_NAMES = [
  "Donald Lyngdoh", "Brandon Syiem", "Kevin Khongwir", "Keith Sangma", "Mark Marak",
  "Jason Momin", "Raymond Kharbangar", "Andrew Marbaniang", "Michael Shullai", "Brian Mawrie"
];

const ARUNACHAL_GIRL_NAMES = [
  "Tsering Dolma", "Yater Tana", "Biri Nyabi", "Lhamu Khandu", "Pema Riba",
  "Deki Ete", "Chumki Tayeng", "Tage Rinchin", "Karmu Dorjee", "Mihin Yassung"
];

const ARUNACHAL_BOY_NAMES = [
  "Tashi Dorjee", "Wangchuk Khandu", "Jampa Norbu", "Tage Bamang", "Kaling Riba",
  "Tana Gekar", "Gebi Ete", "Lobsang Wangdu", "Oken Tayeng", "Nabam Rebia"
];

const NAGALAND_GIRL_NAMES = [
  "Sentila Ao", "Imnasungla Jamir", "Arenla Imchen", "Chubanaro Pongener", "Asangla Longchar",
  "Kevisenuo Angami", "Visevo Zeliang", "Thepfulhou Sema", "Nzanrhoni Lotha", "Nokzenketla Konyak"
];

const NAGALAND_BOY_NAMES = [
  "Bendang Ao", "Temjen Jamir", "Moa Imchen", "Lipok Pongener", "Imli Longchar",
  "Kevichusa Angami", "Neingulie Zeliang", "Theja Sema", "Yibemo Lotha", "Wangkhao Konyak"
];

const MANIPUR_GIRL_NAMES = [
  "Linthoingambi Devi", "Yaiphabi Ningthoujam", "Thoi Haobam", "RK Sanatombi", "Bembem Sorokhaibam",
  "Chingkheinganbi Thokchom", "Malemnganbi Laishram", "Sanajaobi Yumnam", "Tampha Singh", "Ibemhal Devi"
];

const MANIPUR_BOY_NAMES = [
  "Premjit Singh", "Tomba Ningthoujam", "Chinglen Haobam", "Herojit Sorokhaibam", "RK Somorjit",
  "Nongmaithem Singh", "Sanatomba Laishram", "Mangang Yumnam", "Bipin Thokchom", "Ranjit Devi"
];

const MIZORAM_GIRL_NAMES = [
  "Lalremruati Ralte", "Zonunmawii Sailo", "Lalhminghlui Khiangte", "Vanlalruati Hmar", "Lalrinsangi Pachuau",
  "Malsawmtluangi Chhangte", "Zodinpuii Fanai", "Lalthlamuani Ralte", "Laldinpuii Sailo", "C. Lalbiakdiki"
];

const MIZORAM_BOY_NAMES = [
  "Lalhruaitluanga Ralte", "Lalmuanpuia Sailo", "Zonunsanga Khiangte", "Vanlalpeka Hmar", "Malsawmkima Pachuau",
  "Lalrinzuala Chhangte", "K. Vanlalhruaia", "Lalhmangaiha Fanai", "David Lalbiakzuala", "Lalthafala Sailo"
];

const TRIPURA_GIRL_NAMES = [
  "Debolina Debbarma", "Riya Reang", "Anwesha Tripura", "Sreemoyee Jamatia", "Payel Chakma",
  "Debasmita Roy", "Rimpa Das", "Sharmistha Sen", "Tanusree Bhattacharjee", "Poulami Bhowmik"
];

const TRIPURA_BOY_NAMES = [
  "Sourav Debbarma", "Subrata Reang", "Debashis Tripura", "Arnab Jamatia", "Sayan Chakma",
  "Anirban Roy", "Pritam Das", "Dipankar Sen", "Rajib Bhattacharjee", "Tanmoy Bhowmik"
];

const SIKKIM_GIRL_NAMES = [
  "Dechen Lepcha", "Tshering Bhutia", "Sonam Tamang", "Pemba Gurung", "Yangchen Rai",
  "Mingma Subba", "Karma Pradhan", "Kelsang Chettri", "Doma Sharma", "Passang Lepcha"
];

const SIKKIM_BOY_NAMES = [
  "Tenzing Lepcha", "Dorji Bhutia", "Karma Tamang", "Lobsang Gurung", "Pasang Rai",
  "Sonam Subba", "Tshering Pradhan", "Rinzing Chettri", "Pemba Sharma", "Gyaltsen Lepcha"
];

// =============================================================================
// CITIES CONFIGURATION (70% Assam with Guwahati max, 30% other NE states)
// =============================================================================

const ASSAM_CITIES = [
  { city: "Guwahati", weight: 50 },
  { city: "Dibrugarh", weight: 8 },
  { city: "Jorhat", weight: 7 },
  { city: "Silchar", weight: 7 },
  { city: "Tezpur", weight: 6 },
  { city: "Nagaon", weight: 5 },
  { city: "Tinsukia", weight: 4 },
  { city: "Sivasagar", weight: 3 },
  { city: "Bongaigaon", weight: 3 },
  { city: "Barpeta", weight: 2 },
  { city: "Majuli", weight: 2 },
  { city: "Golaghat", weight: 1 },
  { city: "Goalpara", weight: 1 },
  { city: "Dhubri", weight: 1 },
];

const OTHER_NE_CITIES = [
  { state: "Meghalaya", city: "Shillong", weight: 15 },
  { state: "Meghalaya", city: "Tura", weight: 5 },
  { state: "Meghalaya", city: "Cherrapunji", weight: 3 },
  { state: "Arunachal Pradesh", city: "Itanagar", weight: 12 },
  { state: "Arunachal Pradesh", city: "Tawang", weight: 5 },
  { state: "Arunachal Pradesh", city: "Pasighat", weight: 3 },
  { state: "Arunachal Pradesh", city: "Ziro", weight: 3 },
  { state: "Nagaland", city: "Kohima", weight: 10 },
  { state: "Nagaland", city: "Dimapur", weight: 8 },
  { state: "Nagaland", city: "Mokokchung", weight: 3 },
  { state: "Manipur", city: "Imphal", weight: 12 },
  { state: "Manipur", city: "Churachandpur", weight: 5 },
  { state: "Mizoram", city: "Aizawl", weight: 10 },
  { state: "Mizoram", city: "Lunglei", weight: 4 },
  { state: "Tripura", city: "Agartala", weight: 8 },
  { state: "Tripura", city: "Dharmanagar", weight: 3 },
  { state: "Sikkim", city: "Gangtok", weight: 8 },
  { state: "Sikkim", city: "Namchi", weight: 3 },
  { state: "Sikkim", city: "Pelling", weight: 2 },
];

// Helper to choose weighted item
function chooseWeighted(items: { city: string; weight: number; state?: string }[]): any {
  const total = items.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    if (rand < item.weight) return item;
    rand -= item.weight;
  }
  return items[0];
}

// =============================================================================
// BIOS & AVATARS
// =============================================================================

const BIOGRAPHY_TEMPLATES = [
  "Tea enthusiast & local explorer from {city} ☕🌿 Always up for weekend road trips.",
  "Cotton University alumnus | Literature, theatre & classical dance lover 🎭",
  "Exploring the hidden valleys and waterfalls of Northeast India 🏔️📸",
  "Living in {city}. Passionate about indigenous handloom, muga silk & crafts 🧵",
  "Food blogger exploring authentic northeast thalis and street delicacies in {city} 🍲",
  "Photographer capturing foggy hills, sunrise over Brahmaputra & wildlife 📷✨",
  "Backpacker, biker & nature lover. Always planning the next camping trail in the hills 🏕️",
  "Software engineer & tech enthusiast based in {city}. Music & coffee keep me going 💻🎸",
  "Student at Gauhati University 🎓 Love birdwatching & ecotourism around Assam.",
  "Sattriya & Bihu dance performer. Proud of Northeast heritage & folk traditions 🌸",
  "Architect with a love for bamboo structures, sustainable living & mountain cabins 🏡",
  "Avid reader, chai lover, and weekend trekker from {city} 📚☕",
  "Documenting tribal culture, Hornbill memories & Northeast indie rock bands 🎶",
  "Doctor by profession, nature lover at heart. Promoting healthcare awareness in Northeast 🩺🌿",
  "Teacher & storyteller from {city}. Believer in community kindness & youth empowerment ✨",
  "Cycling along the Brahmaputra banks | Passionate about green Guwahati 🚴‍♂️🌳",
  "Homestay host & travel curator. Welcoming travellers to discover our 8 sister states 🏞️",
  "Graphic designer & digital artist inspired by Northeast flora, fauna and folklore 🎨",
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
];

function getFemaleAvatar(seed: string, index: number): string {
  // Rotate between dicebear portrait styles for variety and ultra-sharp rendering
  const styles = ["lorelei", "avataaars", "adventurer", "micah", "personas"];
  const style = styles[index % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function getMaleAvatar(seed: string, index: number): string {
  const styles = ["avataaars", "adventurer", "micah", "bottts", "personas"];
  const style = styles[index % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function getRankTierFromXp(xp: number): string {
  if (xp >= 2500) return "Brahmaputra Legend";
  if (xp >= 1500) return "Himalayan Master";
  if (xp >= 1000) return "Jungle Veteran";
  if (xp >= 600) return "Trail Pioneer";
  if (xp >= 300) return "Hill Voyager";
  if (xp >= 100) return "Valley Scout";
  return "Explorer Novice";
}

// Generate realistic username
const usedUsernames = new Set<string>();

function generateUniqueUsername(fullName: string, index: number): string {
  const clean = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
  
  let candidate = clean;
  if (usedUsernames.has(candidate)) {
    candidate = `${clean}_${index}`;
  }
  if (usedUsernames.has(candidate)) {
    candidate = `${clean}${Math.floor(10 + Math.random() * 90)}`;
  }
  usedUsernames.add(candidate);
  return candidate;
}

// =============================================================================
// MAIN SEEDING ENGINE
// =============================================================================

async function main() {
  console.log("🚀 Starting Community Profiles Generator (3,000 Girls + 1,000 Boys)...");

  // Retrieve existing usernames to avoid collision
  const existingUsers = await db.user.findMany({ select: { username: true, email: true } });
  existingUsers.forEach((u) => {
    usedUsernames.add(u.username);
  });

  const defaultPasswordHash = await hashPassword("Northeast@2026");

  const TOTAL_GIRLS = 3000;
  const TOTAL_BOYS = 1000;
  const TOTAL_USERS = TOTAL_GIRLS + TOTAL_BOYS;

  console.log(`📊 Generating ${TOTAL_USERS} authentic Northeast profiles (70% Assam, Guwahati max)...`);

  const usersToCreate: any[] = [];

  // 1. Generate 3,000 Girls Profiles
  for (let i = 1; i <= TOTAL_GIRLS; i++) {
    const isAssam = Math.random() < 0.7; // 70% Assam
    let state = "Assam";
    let city = "Guwahati";
    let fullName = "";

    if (isAssam) {
      const cityChoice = chooseWeighted(ASSAM_CITIES);
      city = cityChoice.city;
      const firstName = ASSAM_GIRL_FIRST_NAMES[Math.floor(Math.random() * ASSAM_GIRL_FIRST_NAMES.length)];
      const surname = ASSAM_SURNAMES[Math.floor(Math.random() * ASSAM_SURNAMES.length)];
      fullName = `${firstName} ${surname}`;
    } else {
      const cityChoice = chooseWeighted(OTHER_NE_CITIES);
      state = cityChoice.state;
      city = cityChoice.city;

      if (state === "Meghalaya") {
        fullName = MEGHALAYA_GIRL_NAMES[Math.floor(Math.random() * MEGHALAYA_GIRL_NAMES.length)];
      } else if (state === "Arunachal Pradesh") {
        fullName = ARUNACHAL_GIRL_NAMES[Math.floor(Math.random() * ARUNACHAL_GIRL_NAMES.length)];
      } else if (state === "Nagaland") {
        fullName = NAGALAND_GIRL_NAMES[Math.floor(Math.random() * NAGALAND_GIRL_NAMES.length)];
      } else if (state === "Manipur") {
        fullName = MANIPUR_GIRL_NAMES[Math.floor(Math.random() * MANIPUR_GIRL_NAMES.length)];
      } else if (state === "Mizoram") {
        fullName = MIZORAM_GIRL_NAMES[Math.floor(Math.random() * MIZORAM_GIRL_NAMES.length)];
      } else if (state === "Tripura") {
        fullName = TRIPURA_GIRL_NAMES[Math.floor(Math.random() * TRIPURA_GIRL_NAMES.length)];
      } else {
        fullName = SIKKIM_GIRL_NAMES[Math.floor(Math.random() * SIKKIM_GIRL_NAMES.length)];
      }
    }

    const username = generateUniqueUsername(fullName, i);
    const email = `${username}@northeastconnect.in`;
    const xpPoints = Math.floor(Math.random() * 2200) + 40;
    const rankTier = getRankTierFromXp(xpPoints);
    const bioTemplate = BIOGRAPHY_TEMPLATES[Math.floor(Math.random() * BIOGRAPHY_TEMPLATES.length)];
    const bio = bioTemplate.replace("{city}", city);
    const profileImageUrl = getFemaleAvatar(username, i);
    const coverImageUrl = COVER_IMAGES[i % COVER_IMAGES.length];
    const isVerified = Math.random() < 0.18;

    // Distributed creation date over last 8 months
    const daysAgo = Math.floor(Math.random() * 240) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    usersToCreate.push({
      username,
      email,
      passwordHash: defaultPasswordHash,
      fullName,
      profileImageUrl,
      coverImageUrl,
      bio,
      state,
      city,
      role: "User",
      xpPoints,
      rankTier,
      isVerified,
      status: "Active",
      createdAt,
    });
  }

  // 2. Generate 1,000 Boys Profiles
  for (let i = 1; i <= TOTAL_BOYS; i++) {
    const isAssam = Math.random() < 0.7; // 70% Assam
    let state = "Assam";
    let city = "Guwahati";
    let fullName = "";

    if (isAssam) {
      const cityChoice = chooseWeighted(ASSAM_CITIES);
      city = cityChoice.city;
      const firstName = ASSAM_BOY_FIRST_NAMES[Math.floor(Math.random() * ASSAM_BOY_FIRST_NAMES.length)];
      const surname = ASSAM_SURNAMES[Math.floor(Math.random() * ASSAM_SURNAMES.length)];
      fullName = `${firstName} ${surname}`;
    } else {
      const cityChoice = chooseWeighted(OTHER_NE_CITIES);
      state = cityChoice.state;
      city = cityChoice.city;

      if (state === "Meghalaya") {
        fullName = MEGHALAYA_BOY_NAMES[Math.floor(Math.random() * MEGHALAYA_BOY_NAMES.length)];
      } else if (state === "Arunachal Pradesh") {
        fullName = ARUNACHAL_BOY_NAMES[Math.floor(Math.random() * ARUNACHAL_BOY_NAMES.length)];
      } else if (state === "Nagaland") {
        fullName = NAGALAND_BOY_NAMES[Math.floor(Math.random() * NAGALAND_BOY_NAMES.length)];
      } else if (state === "Manipur") {
        fullName = MANIPUR_BOY_NAMES[Math.floor(Math.random() * MANIPUR_BOY_NAMES.length)];
      } else if (state === "Mizoram") {
        fullName = MIZORAM_BOY_NAMES[Math.floor(Math.random() * MIZORAM_BOY_NAMES.length)];
      } else if (state === "Tripura") {
        fullName = TRIPURA_BOY_NAMES[Math.floor(Math.random() * TRIPURA_BOY_NAMES.length)];
      } else {
        fullName = SIKKIM_BOY_NAMES[Math.floor(Math.random() * SIKKIM_BOY_NAMES.length)];
      }
    }

    const username = generateUniqueUsername(fullName, TOTAL_GIRLS + i);
    const email = `${username}@northeastconnect.in`;
    const xpPoints = Math.floor(Math.random() * 2200) + 40;
    const rankTier = getRankTierFromXp(xpPoints);
    const bioTemplate = BIOGRAPHY_TEMPLATES[Math.floor(Math.random() * BIOGRAPHY_TEMPLATES.length)];
    const bio = bioTemplate.replace("{city}", city);
    const profileImageUrl = getMaleAvatar(username, TOTAL_GIRLS + i);
    const coverImageUrl = COVER_IMAGES[(TOTAL_GIRLS + i) % COVER_IMAGES.length];
    const isVerified = Math.random() < 0.18;

    const daysAgo = Math.floor(Math.random() * 240) + 1;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    usersToCreate.push({
      username,
      email,
      passwordHash: defaultPasswordHash,
      fullName,
      profileImageUrl,
      coverImageUrl,
      bio,
      state,
      city,
      role: "User",
      xpPoints,
      rankTier,
      isVerified,
      status: "Active",
      createdAt,
    });
  }

  console.log(`📦 Inserting ${usersToCreate.length} profiles into database in chunks...`);

  const CHUNK_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < usersToCreate.length; i += CHUNK_SIZE) {
    const chunk = usersToCreate.slice(i, i + CHUNK_SIZE);
    await db.user.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    inserted += chunk.length;
    console.log(`  ✓ Inserted ${inserted} / ${usersToCreate.length} profiles...`);
  }

  // Summary statistics
  const totalCount = await db.user.count();
  const assamCount = await db.user.count({ where: { state: "Assam" } });
  const guwahatiCount = await db.user.count({ where: { city: "Guwahati" } });

  console.log("\n=======================================================");
  console.log(`🎉 SUCCESS! Community profile seeding completed!`);
  console.log(`   - Total Users in DB: ${totalCount}`);
  console.log(`   - Assam Profiles: ${assamCount} (${((assamCount / totalCount) * 100).toFixed(1)}%)`);
  console.log(`   - Guwahati Profiles: ${guwahatiCount}`);
  console.log("=======================================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
