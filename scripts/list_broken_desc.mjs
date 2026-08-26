import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(`
  SELECT id, business_name, category, subcategory, address, district, city, contact_number, website
  FROM directory
  WHERE description LIKE '%[Business Name]%' OR description LIKE '%[Address]%' OR description LIKE '%e.g.,%'
     OR description LIKE '%\`\`\`html%'
  ORDER BY id
`);
await client.end();
console.log(JSON.stringify(rows, null, 0));
console.error(`\n(${rows.length} broken rows)`);
