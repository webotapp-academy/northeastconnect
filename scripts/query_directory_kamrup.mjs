import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(
  `SELECT id, business_name, category, subcategory, district, city, rating, reviews_count,
          length(description) as desc_len, status
   FROM directory
   WHERE district = 'Kamrup Metro' OR city ILIKE '%Guwahati%' OR city ILIKE '%Kamrup%'
   ORDER BY id ASC`
);
await client.end();
console.log(`Total rows: ${rows.length}`);
for (const r of rows) {
  console.log(`#${r.id} | ${r.business_name} | ${r.category} > ${r.subcategory} | rating=${r.rating} reviews=${r.reviews_count} | desc_len=${r.desc_len} | status=${r.status}`);
}
