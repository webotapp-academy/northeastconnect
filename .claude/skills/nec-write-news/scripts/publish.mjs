#!/usr/bin/env node
// Publishes one researched, fully-written news article to the `news` table and
// generates its brand-styled thumbnail. Intended to be called once per article
// by the /nec-write-news skill after the article JSON has been written.
//
// Usage: node publish.mjs <path-to-article.json>
//
// Expected JSON shape:
// {
//   "title": "string (required)",
//   "content": "string HTML (required, the full article body)",
//   "category": "string (default 'News')",
//   "tags": "comma,separated,tags",
//   "author": "string (default 'North East Connect Editorial')",
//   "source": "string (default 'North East Connect Research Desk')",
//   "status": "Published|Draft (default 'Published')",
//   "publishedDate": "ISO date string, optional (defaults to now)"
// }

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..", "..", "..", "..");
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "news-item";
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: node publish.mjs <path-to-article.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(jsonPath), "utf8");
  const article = JSON.parse(raw);

  if (!article.title || !article.content) {
    console.error("Article JSON must include at least: title, content");
    process.exit(1);
  }

  const title = article.title.trim();
  const slug = slugify(article.title);
  const category = article.category?.trim() || "News";
  const tags = article.tags?.trim() || "";
  const author = article.author?.trim() || "North East Connect Editorial";
  const source = article.source?.trim() || "North East Connect Research Desk";
  const status = article.status?.trim() || "Published";
  const publishedDate = article.publishedDate ? new Date(article.publishedDate) : new Date();

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    // Dedup guard: refuse to publish if an article with the same slug/title
    // already exists, so re-runs of the skill never create duplicates.
    const dupe = await client.query(
      `SELECT id, title FROM news WHERE url = $1 OR lower(title) = lower($2) LIMIT 1`,
      [slug, title]
    );
    if (dupe.rows.length > 0) {
      console.error(
        `Refusing to publish: article #${dupe.rows[0].id} ("${dupe.rows[0].title}") already has this slug/title.`
      );
      process.exit(2);
    }

    // Generate the branded thumbnail image.
    const outDir = path.join(PROJECT_ROOT, "public", "assets", "images", "news");
    const thumbScript = path.join(__dirname, "thumbnail.mjs");
    const thumbOut = execFileSync(
      process.execPath,
      [thumbScript, title, slug, outDir],
      { encoding: "utf8" }
    );
    const { webPath } = JSON.parse(thumbOut.trim());

    const insert = await client.query(
      `INSERT INTO news (title, url, category, content, author, source, published_date, image_urls, tags, views_count, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, NOW())
       RETURNING id, url`,
      [title, slug, category, article.content, author, source, publishedDate, webPath, tags, status]
    );

    const row = insert.rows[0];
    console.log(
      JSON.stringify(
        {
          ok: true,
          id: row.id,
          url: row.url,
          liveUrl: `http://localhost:3000/news/${row.url}`,
          image: webPath,
        },
        null,
        2
      )
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Publish failed:", err);
  process.exit(1);
});
