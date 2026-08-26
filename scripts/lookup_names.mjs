import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const names = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const results = [];
for (const n of names) {
  const { rows } = await client.query(
    `SELECT id, business_name, category, subcategory, address, district, city, contact_number, website, length(description) as desc_len
     FROM directory WHERE business_name ILIKE $1 AND district = 'Kamrup Metro' ORDER BY id`,
    [`%${n}%`]
  );
  if (rows.length === 0) console.error(`NO MATCH: ${n}`);
  for (const r of rows) results.push(r);
}
await client.end();
fs.writeFileSync("scratch/remaining_rows.json", JSON.stringify(results, null, 0));
console.error(`Matched ${results.length} rows for ${names.length} names`);
