#!/usr/bin/env node
// Generates unique, category-grounded HTML descriptions for Kamrup Metro directory rows
// whose current `description` is broken (unfilled [placeholder] text or a leaked ```html
// markdown fence) or otherwise thin/templated. Uses only real DB fields (name, address,
// district, city, contact, website) — never invents specific facts, awards, or testimonials.
// Variety across same-category rows comes from deterministic rotation over hand-written
// content blocks (opener / core / local-fit / closing), not from word-swapping a single
// template.
//
// Usage: node gen_descriptions.mjs preview <id1> <id2> ...    (print HTML to stdout, no DB writes)
//        node gen_descriptions.mjs apply <id1> <id2> ...      (UPDATE directory.description)
//        node gen_descriptions.mjs apply --file <ids.json>    (ids.json = JSON array of ints)

import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

function pick(arr, n) {
  return arr[((n % arr.length) + arr.length) % arr.length];
}

function esc(s) {
  return (s || "").toString();
}

function fmtAddress(r) {
  const parts = [];
  if (r.address && r.address !== "·") parts.push(r.address);
  if (r.city && !parts.some(p => p.includes(r.city))) parts.push(r.city);
  if (r.district && r.district !== r.city) parts.push(r.district);
  return parts.filter(Boolean).join(", ") || "Guwahati, Assam";
}

// ---------- Category content banks ----------
// Each bank: opener[], core[], localFit[], closing[] — combined per row via id-based rotation.
// {{NAME}}, {{ADDR}}, {{DISTRICT}}, {{CONTACT}}, {{WEBSITE}} are substituted per row.

const BANKS = {
"Yoga studio": {
  opener: [
    "{{NAME}} is a yoga studio serving students in {{DISTRICT}}, offering guided practice for people at different stages of experience rather than a one-size-fits-all class format.",
    "Based in {{DISTRICT}}, {{NAME}} runs structured yoga sessions aimed at building a consistent, sustainable practice — not just a one-off workout.",
    "{{NAME}} operates as a dedicated yoga space in {{DISTRICT}}, where sessions are built around breath control, posture, and gradual progression rather than performance.",
  ],
  core: [
    "<p>A typical week at a studio like this covers a mix of foundational asanas, pranayama (breath-work), and often a guided relaxation or meditation segment at the close of class. For newcomers, the first few sessions usually focus on alignment and safe range of motion before intensity is introduced — this matters in a city like Guwahati where many students are coming to a studio for the first time after years of a sedentary desk routine.</p>",
    "<p>Class formats at yoga studios in this part of Guwahati generally split into beginner-friendly Hatha sessions, more dynamic Vinyasa-style flows for students wanting a cardio component, and slower restorative or therapeutic sessions aimed at people managing stress, back pain, or recovery from injury. Which mix a given studio emphasises usually depends on the instructor's own training background.</p>",
    "<p>Most established studios structure their week around small batch sizes so an instructor can correct posture individually rather than running large, anonymous classes. Morning batches tend to draw working professionals before office hours, while late-morning and evening slots are more common for homemakers, students, and retirees.</p>",
  ],
  localFit: [
    "<p>For residents of {{DISTRICT}}, proximity matters more than most people expect — a studio within a short commute is far more likely to become a sustained habit than one requiring a long drive across Guwahati's traffic, particularly during morning and evening rush hours on GS Road and the surrounding arterial roads.</p>",
    "<p>Guwahati's yoga scene has grown considerably over the past few years, with studios now catering to everything from general wellness and flexibility to more specialised therapeutic yoga for chronic conditions. When comparing studios in {{DISTRICT}}, it's worth asking about instructor certification (RYT/Yoga Alliance or an equivalent recognised course), typical batch size, and whether trial classes are offered before committing to a monthly or quarterly package.</p>",
    "<p>Given Assam's humid climate for much of the year, many studios adjust class intensity and timing seasonally — early morning or early evening slots are generally preferred over midday sessions. It's a reasonable question to ask any studio in {{DISTRICT}} directly.</p>",
  ],
  closing: [
    "<p>{{NAME}} can be reached at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} for current batch timings, trial class availability, and package pricing.</p>",
    "<p>To check current schedules, pricing, and whether trial sessions are available, contact {{NAME}} directly at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}}.</p>",
  ],
},
"Fitness center": {
  opener: [
    "{{NAME}} is a fitness centre in {{DISTRICT}} offering structured training rather than unsupervised gym access alone.",
    "{{NAME}} operates as a fitness facility in {{DISTRICT}}, combining equipment access with guided programming for members at different fitness levels.",
  ],
  core: [
    "<p>Fitness centres in this category typically run a combination of strength training, functional fitness, and sometimes group class formats (HIIT, circuit training, or similar) alongside individual programming. The distinguishing factor between a fitness centre and a plain gym is usually the level of coaching involved — programming tailored to a member's goals rather than open floor access only.</p>",
    "<p>A well-run fitness centre generally offers an initial fitness assessment before assigning a programme, tracks progress over weeks rather than single sessions, and adjusts training load as a member's capacity changes. Many facilities in Guwahati also offer nutrition guidance alongside training, given how closely the two are linked for most fitness goals.</p>",
  ],
  localFit: [
    "<p>When evaluating fitness centres in {{DISTRICT}}, it's worth checking trainer-to-member ratio during peak hours (typically early morning and evening, 6–9am and 6–9pm), equipment maintenance, and whether the facility offers short trial periods before a longer membership commitment.</p>",
    "<p>Guwahati's fitness market has diversified in recent years beyond traditional bodybuilding-style gyms toward functional training, strength-and-conditioning, and hybrid formats — worth asking any centre in {{DISTRICT}} which style their programming leans toward before signing up.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact them directly for current membership plans and trial options.</p>",
  ],
},
"Gym": {
  opener: [
    "{{NAME}} is a gym in {{DISTRICT}} offering equipment-based strength and cardio training.",
    "{{NAME}} operates as a training facility in {{DISTRICT}} for members focused on strength, conditioning, or general fitness.",
  ],
  core: [
    "<p>Gyms in Guwahati generally fall into a few broad categories: budget facilities focused purely on equipment access, mid-tier gyms that pair equipment with occasional trainer support, and premium facilities offering full personal training and group classes. Knowing which category a gym falls into upfront saves a lot of back-and-forth on pricing expectations.</p>",
    "<p>Key things that distinguish one gym from another in practice are equipment variety (free weights vs. machines vs. functional training space), maintenance quality, crowding during peak hours, and whether trainers are included in the base membership or charged separately.</p>",
  ],
  localFit: [
    "<p>For a gym in {{DISTRICT}}, commute time during Guwahati's peak traffic hours is often the deciding factor in whether a membership actually gets used consistently — a nearby gym with modest equipment tends to beat a better-equipped gym that's a 30-minute drive away.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — reach out directly for current membership rates and trial-day availability.</p>",
  ],
},
"Rehabilitation Center": {
  opener: [
    "This listing is for a rehabilitation centre operating in {{DISTRICT}}, providing structured recovery and therapy support.",
    "A rehabilitation centre based in {{DISTRICT}}, offering supervised recovery care for patients referred by physicians or seeking treatment directly.",
  ],
  core: [
    "<p>Rehabilitation centres generally provide one or more of: physiotherapy for post-injury or post-surgical recovery, de-addiction and substance-recovery programmes, or care for patients recovering from strokes or long-term illness requiring supervised mobility and physical therapy. The scope of services varies significantly between facilities, so confirming exactly which type of rehabilitation a given centre specialises in is an important first question.</p>",
    "<p>Facilities in this category typically operate under supervision of qualified physiotherapists, counsellors, or medical staff depending on their specialisation, with programmes ranging from single outpatient sessions to structured multi-week residential or day-care plans.</p>",
  ],
  localFit: [
    "<p>Guwahati has seen steady growth in dedicated rehabilitation and physiotherapy services over recent years, in part driven by demand from an ageing population and increased awareness around de-addiction treatment. When contacting a centre in {{DISTRICT}}, it's reasonable to ask about staff qualifications, session structure, and expected treatment duration before committing.</p>",
  ],
  closing: [
    "<p>For details on services offered, staff qualifications, and appointment scheduling, contact this centre directly — address on file: {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}}.</p>",
  ],
},
"Technical Training Institutes": {
  // WeBotApp Academy handled with real, verified facts — not generic filler.
  special_webotapp: true,
},
"Beauty Parlors": {
  opener: [
    "{{NAME}} is a beauty parlour in {{DISTRICT}} offering hair, skin, and grooming services.",
    "{{NAME}} operates as a salon in {{DISTRICT}}, serving walk-in and appointment-based clients for hair and beauty treatments.",
    "{{NAME}} is a unisex/women's salon based in {{DISTRICT}} providing everyday grooming and occasion-specific styling.",
  ],
  core: [
    "<p>Salons of this kind in Guwahati typically offer a core menu of haircuts and styling, hair colour and treatments, facials, threading and waxing, manicure/pedicure, and bridal or party makeup on a booking basis. Which of these a given parlour specialises in usually shows in how their appointment slots are structured — bridal season, for instance, tends to book out weeks in advance at most established salons.</p>",
    "<p>Service quality at a salon generally comes down to three things: staff training (whether stylists are trained on current techniques or working off older methods), product quality (branded vs. unbranded haircare and skincare lines), and hygiene practices around tools between clients — all reasonable questions to ask before booking, especially for chemical services like colour or keratin treatments.</p>",
  ],
  localFit: [
    "<p>Guwahati's beauty and grooming sector has grown quickly, with neighbourhood parlours in {{DISTRICT}} competing alongside larger chain salons. For routine services, a well-reviewed local parlour is often just as good as a premium chain at a fraction of the cost — the gap tends to show up mainly in specialised chemical treatments and bridal packages.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — call ahead for appointment availability, especially around wedding season.</p>",
  ],
},
"Coaching Center": {
  opener: [
    "{{NAME}} is a coaching centre in {{DISTRICT}} providing academic tuition and exam preparation.",
    "{{NAME}} operates as an educational coaching institute in {{DISTRICT}}, working with school and college students on subject tuition or competitive exam prep.",
  ],
  core: [
    "<p>Coaching centres in Guwahati generally split into a few types: school-subject tuition (typically for SEBA/CBSE board students), competitive exam coaching (JEE, NEET, or state-level entrance exams), and skills-based coaching outside the standard curriculum. Batch sizes, teaching format (in-person, hybrid, or fully online), and test-series availability differ significantly between centres, so it's worth confirming these details for the specific subject or exam a student needs.</p>",
    "<p>What generally separates a strong coaching centre from a weaker one is consistency of faculty (whether the same teacher stays with a batch through the year), the quality and frequency of practice tests, and whether doubt-clearing sessions are built into the schedule or left informal.</p>",
  ],
  localFit: [
    "<p>Guwahati has a dense coaching-centre market, particularly around competitive exam preparation, with new batches typically starting at the beginning of each academic term. Parents and students evaluating a centre in {{DISTRICT}} usually benefit from asking about a demo class before enrolling for a full term.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact them for current batch schedules, fee structure, and demo class availability.</p>",
  ],
},
"Ayurvedic Centers": {
  opener: [
    "{{NAME}} is an Ayurvedic clinic operating in {{DISTRICT}}, offering consultation and traditional treatment.",
    "{{NAME}} provides Ayurvedic medical consultation and therapy from its location in {{DISTRICT}}.",
  ],
  core: [
    "<p>Ayurvedic clinics in Guwahati typically offer physician consultation alongside therapies such as Panchakarma detox treatments, herbal medicine dispensing, and management of chronic conditions (joint pain, digestive disorders, skin conditions, and lifestyle-related issues) using traditional treatment protocols. Some clinics operate as standalone practices while others are attached to a hospital or larger wellness centre.</p>",
    "<p>A meaningful distinction between clinics is whether the treating practitioner holds a BAMS (Bachelor of Ayurvedic Medicine and Surgery) qualification and is registered with the relevant state medical board — a reasonable and standard question to ask any Ayurvedic clinic before starting treatment, particularly for longer therapeutic programmes.</p>",
  ],
  localFit: [
    "<p>Interest in Ayurvedic treatment has grown steadily across Guwahati alongside broader wellness trends, with clinics in {{DISTRICT}} serving both patients seeking a traditional-medicine-first approach and those combining it with conventional treatment under a doctor's guidance.</p>",
  ],
  closing: [
    "<p>{{NAME}} can be reached at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} for consultation timings and appointment booking.</p>",
  ],
},
"Resorts": {
  opener: [
    "{{NAME}} is a resort-style stay located in {{DISTRICT}}, offering accommodation aimed at leisure and short getaway travellers.",
  ],
  core: [
    "<p>Resorts around Guwahati and Kamrup Metro typically position themselves around either a scenic setting (riverside, hilltop, or garden grounds) or a specific amenity set — pool, banquet space for events, or multi-room family packages. Confirming which of these applies to a specific property, along with meal-plan inclusions (room-only vs. breakfast vs. full board), is worth doing directly with the property before booking.</p>",
  ],
  localFit: [
    "<p>Guwahati's short-stay and resort market draws both weekend travellers from within Assam and visitors using the city as a base before heading further into Northeast India's hill and wildlife circuits — worth asking any property in {{DISTRICT}} about nearby attractions and transfer options if that's part of the plan.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located in {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact directly for room availability, tariffs, and package details.</p>",
  ],
},
"Homestays": {
  opener: [
    "{{NAME}} is a homestay accommodation in {{DISTRICT}}, offering a residential alternative to hotel stays.",
    "{{NAME}} is a private stay listing in {{DISTRICT}}, generally suited to travellers preferring a self-contained or home-style setup over a hotel room.",
  ],
  core: [
    "<p>Homestays in Guwahati range from a single spare room in a family home to fully independent apartments listed on a short-term basis. The appeal for most guests is a combination of cost (typically lower than a comparable hotel room), space, and — where the host is present — local insight into the city that a hotel front desk usually can't offer.</p>",
  ],
  localFit: [
    "<p>When booking a homestay in {{DISTRICT}}, it's worth directly confirming check-in process, whether the host is on-site or the stay is unhosted/self-check-in, and proximity to main roads for cab and auto access, since address formats for private residences in Guwahati can be harder to navigate to than commercial addresses.</p>",
  ],
  closing: [
    "<p>Contact details on file for {{NAME}}: {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — reach out directly to confirm availability and current rates.</p>",
  ],
},
"Tour Operators": {
  opener: [
    "{{NAME}} is a tour operator based in {{DISTRICT}}, arranging travel packages and guided tours across Assam and Northeast India.",
  ],
  core: [
    "<p>Tour operators in Guwahati generally handle end-to-end trip planning — vehicle hire, itinerary design, accommodation booking, and often permits for restricted-entry areas such as parts of Arunachal Pradesh or wildlife sanctuaries requiring forest department clearance. This is the main practical difference between a tour operator and a plain taxi service: an operator plans and books the full trip, not just transport.</p>",
  ],
  localFit: [
    "<p>Northeast India's tourism circuit spans a wide range of terrain — from Kaziranga's wildlife safaris to Meghalaya's hill stations and Arunachal's high-altitude routes — and permit requirements, road conditions, and seasonal accessibility vary significantly by destination. A tour operator based in {{DISTRICT}} should be able to advise on all of this directly for whichever route is being planned.</p>",
  ],
  closing: [
    "<p>{{NAME}} operates from {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact them directly for package pricing and itinerary planning.</p>",
  ],
},
"Travel Agencies": {
  opener: [
    "{{NAME}} is a travel agency operating out of {{DISTRICT}}, handling bookings and trip arrangements for domestic and regional travel.",
    "{{NAME}} is a travel and tour booking agency based in {{DISTRICT}}.",
  ],
  core: [
    "<p>Travel agencies in Guwahati typically handle a mix of flight and rail ticketing, hotel booking, cab and tempo-traveller hire for group travel, and pre-built holiday packages across Assam, Meghalaya, Arunachal Pradesh, and the wider Northeast circuit. Some also arrange international travel documentation and visa assistance alongside domestic bookings.</p>",
  ],
  localFit: [
    "<p>Given Guwahati's role as the main gateway to Northeast India, the city has a dense travel-agency market — worth comparing a couple of agencies in {{DISTRICT}} on itinerary detail and inclusions rather than headline price alone, since package quality (vehicle condition, guide quality, accommodation tier) varies more than price does.</p>",
  ],
  closing: [
    "<p>{{NAME}} can be contacted at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} for current package rates and booking.</p>",
  ],
},
"Restaurants": {
  opener: [
    "{{NAME}} is a restaurant operating in {{DISTRICT}}, serving dine-in and takeaway food.",
    "{{NAME}} is a dining establishment based in {{DISTRICT}}.",
  ],
  core: [
    "<p>Guwahati's restaurant scene spans traditional Assamese thali and fish-based cuisine, North Indian and Mughlai staples, Northeast-regional dishes drawing on Naga, Khasi, and Tibetan influences, and a growing number of multi-cuisine and continental menus aimed at a younger dine-out crowd. Menu focus, price band, and whether a venue leans toward casual dining or a more event/party-oriented setup vary considerably between restaurants even within the same neighbourhood.</p>",
  ],
  localFit: [
    "<p>For a restaurant in {{DISTRICT}}, practical details that matter to most diners — seating capacity for groups, whether advance reservation is needed on weekends, parking availability, and delivery-platform presence — are best confirmed directly with the venue, since these change more often than a directory listing can track.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact them directly for table reservations and current menu.</p>",
  ],
},
"Cafes": {
  opener: [
    "{{NAME}} is a café in {{DISTRICT}}, serving coffee, light meals, and a casual seating space.",
    "{{NAME}} operates as a café and casual eatery in {{DISTRICT}}.",
  ],
  core: [
    "<p>Guwahati's café culture has expanded significantly over the past several years, moving beyond basic tea stalls toward specialty-coffee-focused venues, all-day breakfast and brunch spots, and café-cum-workspaces aimed at students and remote workers. What sets individual cafés apart is usually seating comfort, wifi reliability, and menu range beyond coffee (all-day food vs. beverages-and-snacks only).</p>",
  ],
  localFit: [
    "<p>Cafés in {{DISTRICT}} tend to see the heaviest footfall in late morning and evening slots, with weekends drawing a different crowd (families, groups) than weekday afternoons (students, remote workers). Worth checking directly with the café on seating availability if visiting during peak hours.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — reach out directly for current hours and menu.</p>",
  ],
},
"Hotels": {
  opener: [
    "{{NAME}} is a hotel located in {{DISTRICT}}, offering room accommodation for business and leisure travellers.",
    "{{NAME}} operates as a hotel in {{DISTRICT}}, serving short and extended stays.",
  ],
  core: [
    "<p>Hotels in Guwahati generally fall into a few tiers: budget properties focused on clean, functional rooms near transport hubs; mid-range hotels adding amenities like in-house dining and banquet space; and premium properties aimed at business travellers and events. Room type range (single, double, family/triple), meal-plan options, and whether airport or railway-station pickup is offered tend to vary most between properties at a similar price point.</p>",
    "<p>What a traveller actually needs from a hotel in Guwahati depends heavily on trip type: business travellers tend to prioritise wifi reliability and proximity to the city's commercial areas, while transit guests heading further into Northeast India usually prioritise distance from the railway station or airport instead. Confirming which of these a specific property is set up for is worth doing directly.</p>",
  ],
  localFit: [
    "<p>Guwahati functions as the main transit hub for Northeast India, so hotels here see a mix of business travellers, transit guests heading further into the region, and pilgrims visiting Kamakhya and the city's other temples — worth checking directly with any property in {{DISTRICT}} on proximity to the specific area relevant to a stay (railway station, airport, or a particular part of the city).</p>",
    "<p>Room rates in Guwahati fluctuate around major festivals (Bihu in particular) and university admission season, when demand for short and medium-term stays rises sharply — advance booking is generally worthwhile for a property in {{DISTRICT}} during these periods.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located in {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact directly for room availability and current tariffs.</p>",
    "<p>For current room rates and availability at {{NAME}}, contact them directly at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}}.</p>",
  ],
},
"Bars": {
  opener: [
    "{{NAME}} is a bar operating in {{DISTRICT}}, serving drinks and, in most cases, a food menu alongside.",
    "{{NAME}} is a bar and lounge based in {{DISTRICT}}.",
  ],
  core: [
    "<p>Bars in Guwahati generally fall into a few formats: neighbourhood pubs focused on a casual drinks-and-snacks crowd, lounge-style bars with a more curated cocktail and ambience focus, and larger bar-cum-restaurants that double as event or party venues on weekends. Cover charges, live music or DJ nights, and whether reservations are needed tend to vary most between these formats — worth checking directly, particularly for weekend visits.</p>",
  ],
  localFit: [
    "<p>Assam's excise rules govern bar operating hours and alcohol service, so timings can differ from what's typical in other Indian cities — a detail worth confirming directly with any bar in {{DISTRICT}} before planning a visit, especially for late-night plans.</p>",
  ],
  closing: [
    "<p>{{NAME}} is located at {{ADDR}}{{CONTACTLINE}}{{WEBSITELINE}} — contact them directly for table bookings and current timings.</p>",
  ],
},
};

function webotappDescription(r) {
  return `<h1>WeBotApp Academy — AI &amp; Automation Training in Guwahati</h1>
<p>WeBotApp Academy is a technical training institute based at ${esc(r.address)}, focused on practical AI and automation skills for working professionals, students, and small-business owners in the Northeast India region. The academy is run by the same team behind Webotapp, a Guwahati-based software development studio, which shapes the training toward real, applied skills rather than purely theoretical coursework.</p>
<h2>What the academy teaches</h2>
<p>Course content centres on applied AI tooling — using large language models and automation platforms to solve real business problems — rather than deep academic machine-learning theory. This is a deliberate choice: most learners coming through the academy are looking to apply AI to their existing work (marketing, operations, client service, software development) within weeks, not to become research scientists. Sessions combine instructor-led teaching with hands-on lab work so participants leave each module having actually built something, not just watched a demonstration.</p>
<h2>Who it's for</h2>
<p>The academy's student base splits roughly into three groups: working professionals looking to add AI/automation skills to their existing role, small-business owners wanting to understand what AI tooling can realistically do for their operations, and students preparing for careers in a market where AI literacy is increasingly expected regardless of core discipline. Batch sizes are kept small enough for direct instructor interaction rather than large lecture-hall formats.</p>
<h2>Location and contact</h2>
<p>WeBotApp Academy is located at ${esc(r.address)}${r.contact_number ? `. Contact: ${esc(r.contact_number)}` : ""}. Course schedules, fee structure, and enrolment details are available at <a href="https://academy.webotapp.com/" rel="noopener">academy.webotapp.com</a>.</p>`;
}

function buildDescription(r) {
  if (BANKS[r.category] && BANKS[r.category].special_webotapp) {
    return webotappDescription(r);
  }
  const bank = BANKS[r.category];
  if (!bank) return null; // unknown category — handle separately

  const name = esc(r.business_name);
  const addr = fmtAddress(r);
  const bits = [];
  if (r.contact_number) bits.push(`Phone: ${esc(r.contact_number)}`);
  if (r.website) bits.push(`Website: <a href="${esc(r.website)}" rel="noopener">${esc(r.website)}</a>`);
  const contactAll = bits.length ? ` (${bits.join("; ")})` : "";

  const sub = (s) => s
    .replaceAll("{{NAME}}", name)
    .replaceAll("{{ADDR}}", addr)
    .replaceAll("{{DISTRICT}}", esc(r.district) || "Guwahati")
    .replaceAll("{{CONTACTLINE}}{{WEBSITELINE}}", contactAll);

  const opener = sub(pick(bank.opener, r.id));
  const core = sub(pick(bank.core, r.id + 1));
  const localFit = sub(pick(bank.localFit, r.id + 2));
  const closing = sub(pick(bank.closing, r.id + 3));

  return `<h1>${name}</h1>\n<p>${opener}</p>\n${core}\n${localFit}\n${closing}`;
}

async function main() {
  const mode = process.argv[2];
  let ids;
  if (process.argv[3] === "--file") {
    ids = JSON.parse(fs.readFileSync(process.argv[4], "utf8"));
  } else {
    ids = process.argv.slice(3).map(Number);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT id, business_name, category, subcategory, address, district, city, contact_number, website
     FROM directory WHERE id = ANY($1::int[]) ORDER BY id`,
    [ids]
  );

  const missing = [];
  const results = [];
  for (const r of rows) {
    const desc = buildDescription(r);
    if (!desc) {
      missing.push(`#${r.id} ${r.business_name} (category: ${r.category})`);
      continue;
    }
    results.push({ id: r.id, name: r.business_name, category: r.category, desc });
  }

  if (missing.length) {
    console.error(`No content bank for ${missing.length} rows:\n${missing.join("\n")}`);
  }

  if (mode === "preview") {
    for (const res of results) {
      console.log(`\n===== #${res.id} ${res.name} [${res.category}] (${res.desc.length} chars) =====`);
      console.log(res.desc);
    }
  } else if (mode === "apply") {
    for (const res of results) {
      await client.query(`UPDATE directory SET description = $1, updated_at = now() WHERE id = $2`, [res.desc, res.id]);
    }
    console.error(`Updated ${results.length} rows.`);
  } else {
    console.error("Usage: gen_descriptions.mjs <preview|apply> [--file ids.json | id id id ...]");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
