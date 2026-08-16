# Plan: Completing the Culture, Wildlife & Adventure Sections

Status: draft plan, not yet executed. Companion to the existing `nec-write-news` content
pipeline — same underlying problem (thin, unverified, placeholder content shipped early in the
project's life), same general fix (real research, real writing, direct-DB publishing, branded
imagery), adapted to three different Prisma tables and page templates.

## 1. Current state (audited 2026-08-15)

Queried the live DB directly (`postgresql://northeastconnect@217.216.59.176/northeastconnect`):

| Table | Rows | Avg description length | Images |
|---|---|---|---|
| `culture` | 10 | 23–51 characters (one sentence fragment) | 9 of 10 rows have `image_urls = null` |
| `wildlife` | 5 | 42–64 characters | Hotlinked Pinterest/Unsplash stock URLs, not owned assets |
| `adventure` | 20 | 23–42 characters | Placeholder filenames (`img3.jpg`, `dzukou1.jpg`, …) that **do not exist** in `public/assets/images/` — every card and detail page is rendering a broken image today |

For comparison, `news` (post the batch we just ran) has 1,000 rows, most now 2,500–3,000-word
articles with sourced facts, FAQ schema, and real generated thumbnails.

**Template gap, independent of data:** the Prisma schema has more fields than the pages render.
None of the three `[id]/page.tsx` detail pages surface everything already defined in
`prisma/schema.prisma`:

- `culture`: `historicalSignificance`, `culturalImportance`, `contactInfo` are stored but never
  displayed.
- `wildlife`: `animalSpecies`, `conservationStatus`, `bestSeason`, `entryFee`, `openingHours`,
  `latitude`/`longitude` are stored but never displayed.
- `adventure`: `duration`, `price`, `includes`, `excludes`, `ageRestrictions`, `fitnessLevel` are
  stored but never displayed.

Also, unlike `news`, these three `description` fields render as plain text
(`whitespace-pre-line` on a `<p>`, not `dangerouslySetInnerHTML`) — no `<h2>`/table/FAQ markup,
and no JSON-LD structured data on any of the three detail pages. That's a template constraint to
design content *for*, not a bug to silently work around.

## 2. Goals

1. Every row in `culture`, `wildlife`, and `adventure` is a real, verifiable place/event/activity
   in Assam or wider Northeast India — no invented festivals, no invented species lists, no
   invented prices.
2. Every row has a substantive description (target: 250–400 words of plain-text, paragraph-broken
   copy — this is not a news article, it's a destination/heritage listing, so the right length is
   shorter and denser than the 3,000-word news bar).
3. Every row has real imagery that the site actually owns and serves (no hotlinked third-party
   URLs, no phantom filenames).
4. The dataset covers all eight Northeast Indian states, not just Assam — the current 35 rows are
   ~90% Assam-only, which undersells the site's "North East Connect" name.
5. (Stretch, Phase 2) Templates are updated to surface the currently-hidden schema fields, since
   filling `animalSpecies` or `entryFee` with real data is wasted work if the page never shows it.

## 3. Non-negotiable content rule (carried over from `nec-write-news`)

**Never fabricate.** No invented entry fees, opening hours, species lists, difficulty ratings, or
prices. If a specific fact (e.g. exact entry fee) can't be sourced from an official park website,
state tourism department, or a reputable travel/news outlet, write around it ("entry fees are
revised periodically by the Forest Department; check the official Kaziranga portal before
visiting") rather than inventing a number. Adventure listings are the highest-risk category for
this — operator pricing changes often and is the easiest thing to fabricate plausibly. Default to
qualitative guidance (difficulty, season, duration range) over a specific rupee figure unless a
current source confirms one.

## 4. Per-section content plan

### 4a. Culture (target: ~45 rows, up from 10)

Real subject matter to draw from, spread across states rather than concentrated in Assam:

- **Assam**: Rongali/Bohag Bihu, Kati/Kongali Bihu, Magh/Bhogali Bihu (three separate rows, not
  one generic "Bihu Festival"), Ambubachi Mela (Kamakhya), Majuli Raas Mahotsav, Ali-Ai-Ligang
  (Mising), Baishagu (Bodo), Jonbeel Mela, Dehing Patkai Festival, Karbi Youth Festival /
  Chomangkan, Sattriya dance, Bihu dance, Sualkuchi Muga/Pat silk weaving, Majuli's Vaishnavite
  Satras, Rang Ghar and Sivasagar's Ahom heritage sites, Kamakhya Temple.
- **Meghalaya**: Wangala (Garo), Behdeinkhlam (Jaintia), Shad Suk Mynsiem (Khasi), living root
  bridges as living heritage.
- **Nagaland**: Hornbill Festival, Sekrenyi (Angami), Moatsu (Ao), Naga textile weaving.
- **Manipur**: Yaoshang, Lai Haraoba, Ningol Chakouba, Manipuri classical dance, Ras Leela.
- **Mizoram**: Chapchar Kut, Cheraw (bamboo dance).
- **Tripura**: Garia Puja, Kharchi Puja, Hojagiri dance.
- **Arunachal Pradesh**: Losar, Solung (Adi), Nyokum (Nyishi).
- **Sikkim**: Losar, Saga Dawa.

Field completion per row: `name`, `type` (Festival / Dance / Handicraft / Heritage Site /
Religious Site — keep the type taxonomy tight so the existing filter dropdown stays usable), full
`description` (250–400 words: origin, what happens, who celebrates it, when), `location`,
`district`, `startDate`/`endDate` where the event is dated (skip for evergreen heritage sites),
`historicalSignificance`, `culturalImportance` (both currently unused by the template but worth
filling now so Phase 2 template work isn't blocked on a second data pass).

### 4b. Wildlife (target: ~26 rows, up from 5)

Real, distinct protected areas across all eight states — this table is the thinnest relative to
how much genuine material exists:

- **Assam**: Kaziranga, Manas, Nameri, Orang, Pobitora, Dibru-Saikhowa, Rajiv Gandhi (Orang),
  Laokhowa-Burhachapori, Hoollongapar Gibbon Sanctuary.
- **Meghalaya**: Balpakram National Park, Nokrek National Park (biosphere reserve).
- **Nagaland**: Intanki National Park.
- **Manipur**: Keibul Lamjao National Park (the world's only floating national park — a genuinely
  distinctive fact worth leading with, not burying).
- **Mizoram**: Dampa Tiger Reserve, Murlen National Park.
- **Tripura**: Sepahijala Wildlife Sanctuary, Trishna Wildlife Sanctuary.
- **Arunachal Pradesh**: Namdapha National Park, Pakke Tiger Reserve, Eaglenest Wildlife
  Sanctuary.
- **Sikkim**: Khangchendzonga National Park (also a UNESCO World Heritage Site — cross-reference
  with the culture table rather than duplicating).

Field completion per row: `description` (250–400 words: what makes the park distinct, habitat
type, why it matters conservation-wise), `animalSpecies` (real, sourced species list — flagship
species first), `conservationStatus` (IUCN status of flagship species, or the park's own
protection designation — Tiger Reserve / Biosphere Reserve / Ramsar Site etc.), `bestSeason`,
`entryFee` and `openingHours` **only if sourced from an official/current listing**, otherwise
leave null rather than guess, `latitude`/`longitude` (real coordinates — cheap to source
accurately and unlocks a future map feature).

### 4c. Adventure (target: ~28 rows, up from 20 — most existing 20 need a full rewrite, not just a
top-up, since their placeholder images and one-line descriptions are the worst offenders in the
audit)

Real, verifiable adventure activities and the regions that actually offer them:

- **Water**: Brahmaputra river rafting/cruising (Guwahati), Siang river rafting (Arunachal —
  among India's most serious whitewater), Teesta river rafting (Sikkim border), Nameri kayaking.
- **Trekking**: Dzukou Valley (Nagaland/Manipur border), Goecha La (Sikkim, Kangchenjunga base
  approach), Green Lake Trek (Sikkim), Tawang–Bumla, Talle Valley (Arunachal).
- **Caving**: Meghalaya's Krem Liat Prah, Mawsmai Cave, Siju Cave — Meghalaya has some of Asia's
  longest surveyed cave systems, a genuinely strong, underused hook.
- **Aerial**: Paragliding at Bomdila/Ziro.
- **Wildlife-linked**: Kaziranga jeep/elephant safari, Manas safari.
- **Cycling/scenic**: Majuli cycling, North Cachar Hills drive.
- **Cultural-adventure crossover**: Ziro Valley homestays, Sualkuchi weaving-village walks, tea
  garden walks — keep these in `adventure` only if they involve a physical activity component,
  otherwise they belong in `culture` instead (don't let the two tables duplicate the same place).

Field completion per row: `description` (200–350 words, activity-focused: what it involves, who
it suits), `difficultyLevel` (Easy/Medium/Hard, consistent scale), `duration`, `bestSeason`,
`ageRestrictions`/`fitnessLevel` where a real operator/park specifies them, `price` **only when a
current, sourced figure exists** — otherwise leave null and let the description say "contact
local operators for current rates," `includes`/`excludes` only when copying from an actual
operator listing (don't invent a generic packing list).

## 5. Image strategy

Reuse the pattern already proven in `nec-write-news`: a **branded, text-only gradient thumbnail**
generated locally via `sharp` (see `~/.claude/skills/nec-write-news/scripts/thumbnail.mjs` for the
existing implementation) rather than hotlinking third-party photos.

Why this over sourcing real photography: real festival/wildlife/adventure photos carry copyright
risk (the current Pinterest hotlinks are already a liability — they can break or be a ToS
violation), and stock-photo subscriptions/attribution add cost and process overhead disproportionate
to a 35→99-row content pass. A consistent branded card also matches how `/news` already looks,
giving the site one coherent visual identity instead of three different image sourcing standards.

Concretely:
- Three new thumbnail variants (or one generic generator with a `section` parameter controlling
  accent color): Culture = purple/indigo gradient (matches existing `/culture` page theme),
  Wildlife = green/emerald gradient, Adventure = orange/amber gradient — reuse the news generator's
  black-to-accent-color diagonal gradient, centered bold title, brand mark.
- Store under `public/assets/images/culture/`, `public/assets/images/wildlife/`,
  `public/assets/images/adventure/` (mirroring `public/assets/images/news/`).
- Each `[id]/page.tsx` gallery section currently expects a comma-separated `imageUrls` list and
  renders every entry as a full-width gallery photo. Generate 1 hero thumbnail per row minimum;
  where a section wants a real "gallery" feel later, that's a Phase 2 photo-sourcing decision, not
  part of this content-completion pass.

## 6. Publishing pipeline (new scripts needed)

`nec-write-news` has `scripts/publish.mjs` (validates → generates thumbnail → inserts into
Postgres → prints `{ok, id, url, liveUrl, image}`) and `scripts/recent-topics.mjs` (duplicate
guard). Nothing equivalent exists yet for these three tables. Before writing any content, build:

- `scripts/publish-culture.mjs`, `scripts/publish-wildlife.mjs`, `scripts/publish-adventure.mjs`
  (or one parametrized `scripts/publish-listing.mjs --table=culture`) — each: reads a JSON file
  matching that table's schema, rejects on exact-name duplicate, generates the branded thumbnail,
  inserts via `pg` against `DATABASE_URL`, prints the same `{ok, id, url, liveUrl, image}` shape
  the news script does so verification stays consistent.
- A shared `scripts/existing-entries.mjs --table=<name>` — lists current row names/districts so a
  batch run can check for duplicates before researching (mirrors `recent-topics.mjs`'s role for
  news, but by name/district instead of by 30-day recency, since these aren't time-sensitive news
  events).
- Slug logic should match what the `[id]/page.tsx` pages already expect:
  `name.toLowerCase().replace(/[^a-z0-9]+/g,"-")-{id}` — the publish script must produce a `name`
  that slugifies cleanly (no leading/trailing punctuation) since the detail page derives the slug
  from `name`, not from a stored `slug` column.

## 7. Batch execution plan

Mirror the `nec-write-news` per-item workflow — research → write → publish → verify → commit
image — one row fully done before starting the next, not batch-researched upfront:

1. **Phase 0 (this plan + tooling)**: build the three publish scripts and image-generator variant
   above. Confirm against one hand-written test row per table before batch-writing content.
2. **Phase 1 — Wildlife (26 rows)**: highest content-to-effort payoff (only 5 rows exist, real
   subject matter is well-documented via state forest department sites and Wikipedia/Britannica-
   grade sources, IUCN status is verifiable). Do this section first.
3. **Phase 2 — Culture (45 rows)**: second, since festival dates need periodic-source care (a
   `startDate`/`endDate` sourced today may need it noted as "typically observed in [month]" rather
   than a hard date, since lunar/harvest festivals shift year to year — don't hardcode a 2026 date
   as if it recurs on that exact date annually).
4. **Phase 3 — Adventure (rewrite existing 20 + add ~8 new)**: last and most labor-intensive
   because it's a full rewrite of already-seeded junk data, not a top-up, and because pricing/
   operator details are the highest fabrication-risk content in this whole plan.
5. Each row: WebSearch for real facts → write description → publish via the relevant script →
   `curl` the `liveUrl` for a 200 → `git add` the generated thumbnail → commit → push (same
   per-item discipline as the news skill, so a mid-batch interruption never leaves an unpublished
   backlog).

## 8. QA checklist (before calling a batch done)

- [ ] No row has a null or broken `imageUrls`.
- [ ] No row's `description` is under ~150 words (the current 23–64-character rows all fail this).
- [ ] Every festival/event date is phrased to survive year-rollover (no hardcoded "August 2026"
      dates for annually-recurring festivals unless the row is genuinely a one-off).
- [ ] Every `adventure.price` and `wildlife.entryFee` is either sourced or null — none are
      invented round numbers.
- [ ] All eight NE states have at least 2 rows in `culture` and at least 1 in `wildlife`
      (adventure can reasonably concentrate more in Assam/Meghalaya/Sikkim/Arunachal where the
      activity infrastructure actually exists).
- [ ] Spot-check 3 random `liveUrl`s per table return 200 and render the new description/image.

## 9. Open decisions for the user

1. **Template enhancement (Phase 2, optional)**: worth updating the three `[id]/page.tsx` files to
   render `animalSpecies`/`conservationStatus`/`entryFee` (wildlife), `historicalSignificance`/
   `culturalImportance` (culture), and `duration`/`price`/`includes`/`excludes` (adventure)? Data
   can be filled either way, but it's wasted if never displayed. Recommend yes, as a follow-on
   task after content is in, not blocking this plan.
2. **Batch sizing**: run all three sections in one long session (like the 12-article news batch),
   or split into three separate sessions/days? Wildlife alone (26 rows) is roughly comparable in
   research effort to the 12-article news batch just completed.
3. **Skill packaging**: should this become a reusable skill (`nec-write-listings` or similar),
   the way `nec-write-news` is, for future top-ups — or is this a one-time cleanup pass? If it's
   likely to recur (new festivals discovered, new parks added), a skill is worth the setup cost;
   if it's a one-time backfill, a plain execution pass is simpler.
