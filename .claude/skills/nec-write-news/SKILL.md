---
name: nec-write-news
description: >
  Research real, current news about Assam, Northeast India, and Guwahati, then write and
  publish 10-30 long-form (3000+ word), EEAT-optimized news articles directly to the North
  East Connect news database (northeastconnect project) — complete with comparison tables,
  FAQ sections with schema markup, and a brand-styled text-only thumbnail per article. Use
  when the user runs /nec-write-news, asks to "write news", "post news", or "publish news
  articles" for North East Connect / northeastconnect.in / the localhost:3000/news site.
argument-hint: "[count 10-30] [optional: focus topic or category]"
---

# NEC Write News

Autonomously researches, writes, and publishes a batch of long-form, SEO/AEO/GEO-ready news
articles to the North East Connect news database — the same DB-direct publishing pattern used
elsewhere in this user's projects. This replaces the site's old thin (~400-500 word, no schema,
no FAQ) auto-pipeline with genuinely rankable long-form content, while keeping the same visual
brand (text-only gradient thumbnail) the user already uses.

Project root: `/Users/webotapppvtltd/node_projects/northeastconnect`
Live site during dev: `http://localhost:3000` (news list at `/news`, article at `/news/<slug>`)

## Before you start

1. **Confirm the batch size.** Default to 12 articles if the user didn't specify a number
   (valid range 10-30). If they gave a focus (e.g. "just sports", "focus on Guwahati
   infrastructure"), keep every article within that focus; otherwise spread naturally across
   categories: state politics/government, infrastructure & development, crime & law, sports,
   culture & festivals, education, business & economy, health, environment/wildlife/weather,
   tourism. Don't let more than ~2-3 articles land on the same category in one batch.
2. **Check for duplicate topics.** Run:
   ```
   node .claude/skills/nec-write-news/scripts/recent-topics.mjs 30 300
   ```
   from the project root. This lists every article published in the last 30 days. Skim titles
   before picking stories — never write a second article on a story already covered recently.
   The publish script also hard-blocks exact title/slug collisions as a safety net, but don't
   rely on that; pick genuinely distinct stories up front.
3. **Track progress with TaskCreate/TaskUpdate** — one task per article ("Research & write:
   <working title>") so both you and the user can see progress through a long batch. Mark each
   completed only after the publish script confirms success.

## Per-article workflow

Do this sequentially, one article fully researched → written → published before starting the
next. Do not batch-research everything up front — stories go stale and context gets messy.

### 1. Research (WebSearch)

Find a real, recent, verifiable news story about Assam, Northeast India, or Guwahati specifically.
Search things like `Assam news today`, `Guwahati [topic]`, `Northeast India [category] latest`,
plus specific angles (a district name, a ministry, a festival, a sports team). Prefer stories with
identifiable facts: names, official titles, numbers, dates, locations, direct quotes. Good source
outlets to look for: PTI, ANI, The Assam Tribune, EastMojo, Northeast Now, The Sentinel (Assam),
India Today NE, Times of India NE edition, Hindustan Times NE, official government press releases
(PIB, Assam government portals).

**Never fabricate facts, quotes, or statistics.** If search results are thin on a story, either
dig further with follow-up searches or pick a different story — don't pad with invented details.
Everything you assert as fact must trace back to something you actually found in search results.

### 2. Write the article (3000+ words, EEAT structure)

Write clean, factual HTML matching the existing content style used on the site (the article body
renders via `dangerouslySetInnerHTML` inside a `.prose` container — plain HTML tags like `<p>`,
`<h2>`, `<h3>`, `<b>`, `<ul>`/`<li>`, `<table>`, `<blockquote>` all render correctly; no need for
`<html>`/`<body>` wrappers).

Required structure, in order:

1. **Lead paragraph** — the core news fact, who/what/when/where, in the first 2-3 sentences
   (inverted pyramid, standard news writing).
2. **`<h2>Background</h2>`** — context a reader needs: what led here, relevant history, why it
   matters to Assam/NE India specifically.
3. **`<h2>Key Details</h2>`** — the specific facts: numbers, names, dates, quotes you found in
   research, as a mix of prose and a bulleted list.
4. **`<h2>At a Glance</h2>` — a comparison/summary `<table>`.** This is required for every
   article; pick whichever comparison is actually meaningful for the story (don't force a fake
   one): before vs. after, this scheme vs. the previous one, this year vs. last year, this
   district vs. neighboring ones, budget allocated vs. budget utilized, timeline of key dates,
   or competing parties'/stakeholders' positions. Real numbers from research only.
5. **`<h2>Local Impact</h2>`** — what this specifically means for residents of Assam/Guwahati/NE
   India (jobs, commute, safety, cost, culture, tourism — whatever applies).
6. **`<h2>What Happens Next</h2>`** — timeline, next steps, pending decisions, upcoming dates,
   if known; otherwise reasonable, clearly-labeled expectations (don't present speculation as
   fact — phrase it as "is expected to" / "officials indicated").
7. **`<h2>Frequently Asked Questions</h2>`** — 6-8 genuinely useful Q&As a reader searching this
   topic would ask (good for AI Overviews / featured snippets). Format each as `<h3>Question?</h3>
   <p>Answer.</p>`. Immediately after the FAQ section, embed a matching FAQPage JSON-LD block as
   literal HTML so it ships inside the article content:
   ```html
   <script type="application/ld+json">
   {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
     {"@type":"Question","name":"<question 1>","acceptedAnswer":{"@type":"Answer","text":"<answer 1>"}},
     {"@type":"Question","name":"<question 2>","acceptedAnswer":{"@type":"Answer","text":"<answer 2>"}}
   ]}
   </script>
   ```
   (The page already emits `NewsArticle` JSON-LD automatically from the DB row — do not duplicate
   that; only add the FAQPage block here, and only if you wrote a genuine FAQ section.)
8. **`<h2>Sources</h2>`** — a short list of the outlets/reports you drew facts from (by name; you
   don't have permalinks, so naming the outlet e.g. "PTI", "The Assam Tribune" is sufficient).
   This is an E-E-A-T trust signal — real articles cite where facts came from.

**E-E-A-T checklist before moving on:**
- Experience/Expertise: written with specific, concrete detail (not generic filler) — a reader
  should learn things they couldn't get from the headline alone.
- Authoritativeness: sources named, official titles used correctly, no vague "reports suggest"
  without attribution.
- Trustworthiness: no fabricated stats/quotes; speculation clearly flagged as speculation;
  balanced (both sides represented on any contested/political topic).
- Length: 3000+ words in the rendered article body. Check with a rough word count before
  finalizing — if short, the fix is more genuine reporting depth (more researched detail in
  Background/Key Details/Local Impact), never filler repetition.

**Title style:** clear, specific, keyword-rich, matching how the existing site writes headlines
(numbers when natural — "3 Key Takeaways...", "₹500 Crore..." — but never misleading clickbait).
Keep it under ~90 characters so it fits the thumbnail's 2-line limit.

### 3. Publish

Write the article to a JSON file in the scratchpad directory, then publish it:

```json
{
  "title": "Article title",
  "content": "<p>...full HTML body from step 2...</p>",
  "category": "News",
  "tags": "comma, separated, topical, tags, for, this, story",
  "author": "North East Connect Editorial",
  "source": "North East Connect Research Desk",
  "status": "Published"
}
```

- `category`: use `"News"` unless the story is unambiguously one of Tourism / Culture / Events /
  Government (matches the existing site convention — nearly all published articles use `"News"`,
  with topical nuance carried in `tags` instead).
- `tags`: 6-10 comma-separated topical tags (place names, subject, entities involved) — used for
  on-page tag chips and general topical signal.

Run:
```
node .claude/skills/nec-write-news/scripts/publish.mjs /path/to/article.json
```

This will:
- Reject the article (exit code 2) if the slug or exact title already exists — pick a different
  angle or story and retry rather than overwriting.
- Generate the brand thumbnail automatically (1200x630, black-to-emerald gradient, centered bold
  title, "North East Connect" brand mark) via `scripts/thumbnail.mjs` and save it to
  `public/assets/images/news/`.
- Insert the row into the `news` table and print `{ ok, id, url, liveUrl, image }` as JSON.

Verify the live page loads before marking the task complete:
```
curl -s -o /dev/null -w "%{http_code}\n" "<liveUrl from the publish output>"
```
Expect `200`. If you get a non-200, stop and investigate before continuing the batch — don't
publish more articles on top of a broken pipeline.

## After the batch

Report a short summary table to the user: title, category, live URL, for every article
published in this run. Mention the total word count range and remind them articles are already
live (`status: "Published"`) on `/news`.

## Known-good baseline (do not need to redo)

As of this skill's creation, the following were verified working and do not need re-checking
every run: `node_modules` has `sharp` and `fontkit` available (pinned in `package.json`
devDependencies) for thumbnail generation; the news article page (`src/app/news/[id]/page.tsx`)
has per-article `generateMetadata` (unique title/description/OG/canonical) and slug-based routing
works correctly. If a future change to that page removes `generateMetadata` or breaks slug
lookups, that's a regression worth flagging to the user — the whole point of this skill is
content that's actually indexable and rankable.
