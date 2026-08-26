import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
dotenv.config({ path: path.join(PROJECT_ROOT, ".env"), quiet: true });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const total = await client.query(`SELECT count(*) FROM directory`);
const placeholder = await client.query(`SELECT count(*) FROM directory WHERE description LIKE '%[Business Name]%' OR description LIKE '%[Address]%' OR description LIKE '%e.g.,%'`);
const codeFence = await client.query(`SELECT count(*) FROM directory WHERE description LIKE '%\`\`\`html%'`);
const businessOverviewTemplate = await client.query(`SELECT count(*) FROM directory WHERE description LIKE '%dynamic and rapidly growing%' OR description LIKE '%vibrant business landscape of Assam%'`);
const nullOrEmpty = await client.query(`SELECT count(*) FROM directory WHERE description IS NULL OR length(description) < 50`);
console.log('Total directory rows:', total.rows[0].count);
console.log('Rows with unfilled [placeholder] text:', placeholder.rows[0].count);
console.log('Rows with leaked ```html markdown fence:', codeFence.rows[0].count);
console.log('Rows matching the "dynamic and rapidly growing" boilerplate phrase:', businessOverviewTemplate.rows[0].count);
console.log('Rows with null/near-empty description:', nullOrEmpty.rows[0].count);
await client.end();
