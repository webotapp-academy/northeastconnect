#!/usr/bin/env node
// Lists current rows (name + district) for a culture/wildlife/adventure table so a
// research/writing pass can avoid duplicating a place/event already in the DB.
// Mirrors nec-write-news's recent-topics.mjs, but by name/district instead of
// recency, since these aren't time-sensitive news events.
//
// Usage: node existing-entries.mjs <culture|wildlife|adventure>

import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const TABLES = ["culture", "wildlife", "adventure"];

async function main() {
  const table = process.argv[2];
  if (!TABLES.includes(table)) {
    console.error(`Usage: node existing-entries.mjs <${TABLES.join("|")}>`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rows } = await client.query(
    `SELECT id, name, district, location FROM ${table} ORDER BY id ASC`
  );
  await client.end();

  for (const r of rows) {
    console.log(`#${r.id} ${r.name} — ${r.district || r.location || "(no district)"}`);
  }
  console.error(`\n(${rows.length} rows currently in ${table})`);
}

main().catch((err) => {
  console.error("Failed to list existing entries:", err);
  process.exit(1);
});
