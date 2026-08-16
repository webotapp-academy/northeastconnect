#!/usr/bin/env node
// Generates a text-only branded thumbnail (1200x630) for the culture/wildlife/adventure
// content-completion pass (see ../CULTURE_WILDLIFE_ADVENTURE_PLAN.md), matching the
// visual style already used for /news but with a per-section accent color.
//
// Usage: node thumbnail-listing.mjs "<title>" "<slug>" <section> <outDir>
//   section: culture | wildlife | adventure  (controls gradient accent color)
// Prints { absPath, filename, webPath } JSON to stdout on success.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import * as fontkitNs from "fontkit";
const fontkit = fontkitNs.default ?? fontkitNs;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Reuse the same brand font already used by the nec-write-news skill.
const FONT_PATH = "/Users/webotapppvtltd/.claude/skills/nec-write-news/assets/Poppins-SemiBold.ttf";

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN_X = Math.round(WIDTH * 0.15);
const USABLE_W = WIDTH - MARGIN_X * 2;

const ACCENTS = {
  culture: "#3730a3", // indigo-800, matches /culture page theme
  wildlife: "#065f46", // emerald-800, matches /wildlife page theme (green)
  adventure: "#9a3412", // orange-800/amber, matches /adventure page theme
};

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function measure(font, text, size) {
  const run = font.layout(text);
  const unitsPerEm = font.unitsPerEm;
  let width = 0;
  for (const glyph of run.glyphs) width += glyph.advanceWidth;
  return (width / unitsPerEm) * size;
}

function wrapToTwoLines(font, title, size) {
  const words = title.trim().split(/\s+/);
  let lines = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const test = line ? `${line} ${w}` : w;
    if (measure(font, test, size) > USABLE_W && line) {
      lines.push(line);
      line = w;
      if (lines.length >= 1) {
        line = [w, ...words.slice(i + 1)].join(" ");
        break;
      }
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > 2) lines = lines.slice(0, 2);
  const maxW = Math.max(...lines.map((l) => measure(font, l, size)));
  return { lines, maxW };
}

function fitFontSize(font, title) {
  let lo = 18;
  let hi = 90;
  let best = lo;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const { lines, maxW } = wrapToTwoLines(font, title, mid);
    if (maxW <= USABLE_W && lines.length <= 2) {
      best = mid;
      lo = mid + 2;
    } else {
      hi = mid - 2;
    }
  }
  return best;
}

async function generateThumbnail(title, slug, section, outDir) {
  const accent = ACCENTS[section] || ACCENTS.wildlife;
  const fontBuffer = fs.readFileSync(FONT_PATH);
  const font = fontkit.create(fontBuffer);
  const fontB64 = fontBuffer.toString("base64");

  const fontSize = fitFontSize(font, title);
  const { lines } = wrapToTwoLines(font, title, fontSize);

  const lineHeight = fontSize * 1.35;
  const totalH = lines.length * lineHeight;
  const startY = Math.max((HEIGHT - totalH) / 2, HEIGHT * 0.18) + fontSize * 0.85;

  const textSvg = lines
    .map((ln, i) => {
      const y = startY + i * lineHeight;
      const w = measure(font, ln, fontSize);
      const x = Math.max(MARGIN_X, (WIDTH - w) / 2);
      const escaped = escapeXml(ln);
      return `
        <text x="${x + 2}" y="${y + 2}" font-family="Poppins" font-weight="600" font-size="${fontSize}" fill="rgba(0,0,0,0.45)">${escaped}</text>
        <text x="${x}" y="${y}" font-family="Poppins" font-weight="600" font-size="${fontSize}" fill="#ffffff">${escaped}</text>
      `;
    })
    .join("\n");

  const brand = "North East Connect";

  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: 'Poppins';
          font-weight: 600;
          src: url(data:font/ttf;base64,${fontB64}) format('truetype');
        }
      </style>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" />
        <stop offset="100%" stop-color="${accent}" />
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
    <text x="${WIDTH - 32}" y="50" font-family="Poppins" font-weight="600" font-size="22" fill="rgba(0,0,0,0.45)" text-anchor="end">${escapeXml(brand)}</text>
    <text x="${WIDTH - 34}" y="48" font-family="Poppins" font-weight="600" font-size="22" fill="#ffffff" text-anchor="end">${escapeXml(brand)}</text>
    ${textSvg}
    <text x="${WIDTH - 24}" y="${HEIGHT - 18}" font-family="Poppins" font-weight="600" font-size="14" fill="rgba(255,255,255,0.55)" text-anchor="end">${escapeXml(brand)}</text>
  </svg>`;

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const filename = `${slug}-v${Math.floor(Date.now() / 1000)}.jpg`;
  const absPath = path.join(outDir, filename);

  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(absPath);
  return { absPath, filename };
}

async function main() {
  const [, , title, slug, section, outDir] = process.argv;
  if (!title || !slug || !section || !outDir) {
    console.error('Usage: node thumbnail-listing.mjs "<title>" "<slug>" <section> <outDir>');
    process.exit(1);
  }
  const { absPath, filename } = await generateThumbnail(title, slug, section, outDir);
  console.log(JSON.stringify({ absPath, filename, webPath: `/assets/images/${section}/${filename}` }));
}

main().catch((err) => {
  console.error("Thumbnail generation failed:", err);
  process.exit(1);
});
