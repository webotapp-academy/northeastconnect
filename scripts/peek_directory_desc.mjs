import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const ids = process.argv.slice(2).map(Number);
const { rows } = await client.query(
  `SELECT id, business_name, description FROM directory WHERE id = ANY($1::int[]) ORDER BY id`,
  [ids]
);
await client.end();
for (const r of rows) {
  console.log(`\n===== #${r.id} ${r.business_name} =====`);
  console.log(r.description);
}
