#!/usr/bin/env node
// Lists recent news titles + tags + urls so a research/writing agent can avoid
// duplicating a story that was already published.
//
// Usage: node recent-topics.mjs [days=45] [limit=400]

import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the project .env explicitly in case cwd differs when invoked.
dotenv.config({ path: path.join(__dirname, "..", "..", "..", "..", ".env"), quiet: true });

async function main() {
  const days = Number(process.argv[2] || 45);
  const limit = Number(process.argv[3] || 400);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT id, title, url, category, tags, published_date
     FROM news
     WHERE published_date >= NOW() - ($1 || ' days')::interval
     ORDER BY published_date DESC
     LIMIT $2`,
    [String(days), limit]
  );
  await client.end();

  for (const r of rows) {
    console.log(`#${r.id} [${r.published_date?.toISOString?.().slice(0, 10) || ""}] ${r.title}`);
  }
  console.error(`\n(${rows.length} articles published in the last ${days} days)`);
}

main().catch((err) => {
  console.error("Failed to list recent topics:", err);
  process.exit(1);
});
