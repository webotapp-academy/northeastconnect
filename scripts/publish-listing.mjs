#!/usr/bin/env node
// Publishes one researched, fully-written culture/wildlife/adventure listing row
// and generates its branded thumbnail. Mirrors the nec-write-news skill's
// publish.mjs, adapted to these three tables per ../CULTURE_WILDLIFE_ADVENTURE_PLAN.md.
//
// Usage: node publish-listing.mjs <table:culture|wildlife|adventure> <path-to-row.json>
//
// Shared JSON fields (all tables): name (required), description (required),
//   location, district, contactInfo, status, imageTitle (optional shorter text
//   for the thumbnail if `name` is too long)
//
// wildlife-only: latitude, longitude, bestSeason, entryFee, openingHours,
//   animalSpecies, conservationStatus
// culture-only: type, startDate, endDate, historicalSignificance, culturalImportance
// adventure-only: type, difficultyLevel, duration, price, includes, excludes,
//   ageRestrictions, fitnessLevel, bestSeason

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import dotenv from "dotenv";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const TABLES = {
  wildlife: {
    table: "wildlife",
    columns: {
      name: "name",
      description: "description",
      location: "location",
      district: "district",
      latitude: "latitude",
      longitude: "longitude",
      bestSeason: "best_season",
      entryFee: "entry_fee",
      openingHours: "opening_hours",
      animalSpecies: "animal_species",
      conservationStatus: "conservation_status",
      contactInfo: "contact_info",
    },
    defaultStatus: "Active",
  },
  culture: {
    table: "culture",
    columns: {
      name: "name",
      type: "type",
      description: "description",
      location: "location",
      district: "district",
      startDate: "start_date",
      endDate: "end_date",
      historicalSignificance: "historical_significance",
      culturalImportance: "cultural_importance",
      contactInfo: "contact_info",
    },
    defaultStatus: "Active",
  },
  adventure: {
    table: "adventure",
    columns: {
      name: "name",
      type: "type",
      description: "description",
      location: "location",
      district: "district",
      difficultyLevel: "difficulty_level",
      duration: "duration",
      price: "price",
      includes: "includes",
      excludes: "excludes",
      ageRestrictions: "age_restrictions",
      fitnessLevel: "fitness_level",
      bestSeason: "best_season",
      contactInfo: "contact_info",
    },
    defaultStatus: "Available",
  },
};

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";
}

async function main() {
  const section = process.argv[2];
  const jsonPath = process.argv[3];
  const cfg = TABLES[section];
  if (!cfg || !jsonPath) {
    console.error("Usage: node publish-listing.mjs <culture|wildlife|adventure> <path-to-row.json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(path.resolve(jsonPath), "utf8");
  const row = JSON.parse(raw);

  if (!row.name || !row.description) {
    console.error("Row JSON must include at least: name, description");
    process.exit(1);
  }

  const name = row.name.trim();
  const slug = slugify(name);
  const status = row.status?.trim() || cfg.defaultStatus;

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const dupe = await client.query(
      `SELECT id, name FROM ${cfg.table} WHERE lower(name) = lower($1) LIMIT 1`,
      [name]
    );
    if (dupe.rows.length > 0) {
      console.error(
        `Refusing to publish: ${section} #${dupe.rows[0].id} ("${dupe.rows[0].name}") already exists with this name.`
      );
      process.exit(2);
    }

    // Generate the branded thumbnail image.
    const thumbScript = path.join(__dirname, "thumbnail-listing.mjs");
    const outDir = path.join(PROJECT_ROOT, "public", "assets", "images", section);
    const thumbTitle = row.imageTitle?.trim() || name;
    const thumbOut = execFileSync(
      process.execPath,
      [thumbScript, thumbTitle, slug, section, outDir],
      { encoding: "utf8" }
    );
    const { webPath } = JSON.parse(thumbOut.trim());

    const fieldNames = ["name", "imageUrls", "status"];
    const values = [name, webPath, status];
    for (const [jsonKey, column] of Object.entries(cfg.columns)) {
      if (jsonKey === "name") continue;
      if (row[jsonKey] === undefined || row[jsonKey] === null || row[jsonKey] === "") continue;
      fieldNames.push(jsonKey);
      values.push(row[jsonKey]);
    }

    const dbColumns = fieldNames.map((k) =>
      k === "name" ? "name" : k === "imageUrls" ? "image_urls" : k === "status" ? "status" : cfg.columns[k]
    );
    const placeholders = values.map((_, i) => `$${i + 1}`);

    const insert = await client.query(
      `INSERT INTO ${cfg.table} (${dbColumns.join(", ")}, created_at)
       VALUES (${placeholders.join(", ")}, NOW())
       RETURNING id, name`,
      values
    );

    const inserted = insert.rows[0];
    const detailSlug = `${slug}-${inserted.id}`;
    console.log(
      JSON.stringify(
        {
          ok: true,
          id: inserted.id,
          name: inserted.name,
          liveUrl: `http://localhost:3099/${section}/${detailSlug}`,
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
