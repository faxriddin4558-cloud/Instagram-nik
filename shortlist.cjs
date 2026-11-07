#!/usr/bin/env node
"use strict";

/**
 * 4 belgili chiroyli niklar ro'yxati — TARMOQSIZ.
 * Instagram'ga hech qanday so'rov yuborilmaydi; barcha nomzodlar "tekshirilmagan".
 *
 *   node shortlist.cjs            -> shortlists/ papkasiga yozadi
 *   node shortlist.cjs --out dir
 */

const fs = require("node:fs");
const path = require("node:path");
const { rankBeauty4, pickManual } = require("./lib/beauty4.cjs");
const { toCsv } = require("./lib/csv.cjs");

const outIdx = process.argv.indexOf("--out");
const outDir = outIdx > 0 ? path.resolve(process.argv[outIdx + 1]) : path.join(__dirname, "shortlists");
fs.mkdirSync(outDir, { recursive: true });

const PINNED = ["7112", "7007", "7771", "f7x9"];
const ranked = rankBeauty4();
const top30 = pickManual(ranked, { pinned: PINNED });

fs.writeFileSync(
  path.join(outDir, "beauty4_shortlist.csv"),
  toCsv(ranked.slice(0, 500), ["username", "type", "pattern", "score", "chance_hint", "status"]),
);
fs.writeFileSync(
  path.join(outDir, "manual_top30.csv"),
  toCsv(
    top30.map((c) => ({ ...c, ilova_natijasi: "" })),
    ["rank", "username", "type", "pattern", "score", "chance_hint", "why", "status", "ilova_natijasi"],
  ),
);

const md = [
  "# Qo'lda tekshirish: eng yaxshi 30 ta 4 belgili nik",
  "",
  "Hammasi **tekshirilmagan**. Instagram'ga hech qanday so'rov yuborilmagan.",
  "",
  "Ilovada: Profil → **Profilni tahrirlash** → **Foydalanuvchi nomi** → nikni yozing.",
  "✓ belgisi = bo'sh (darhol saqlang), \"Bu nom band\" = band.",
  "",
  "| # | Nik | Tur | Shablon | Ball | Taxminiy imkoniyat | Natija |",
  "|---|---|---|---|---|---|---|",
  ...top30.map((c) => `| ${c.rank} | \`${c.username}\` | ${c.type} | ${c.pattern} | ${c.score} | ${c.chance_hint} | ☐ bo'sh ☐ band |`),
  "",
  "> \"Taxminiy imkoniyat\" faqat yo'l-yo'riq: raqamli 4 belgili niklarning deyarli hammasi band,",
  "> aralash (harf+raqam) niklarda imkoniyat yuqoriroq.",
  "",
].join("\n");
fs.writeFileSync(path.join(outDir, "MANUAL_TOP30.md"), md);

console.log(`${ranked.length} ta chiroyli 4 belgili nomzod topildi (hammasi tekshirilmagan).`);
console.log(`Eng yaxshi 30 ta qo'lda tekshirish uchun:\n`);
for (const c of top30) console.log(`${String(c.rank).padStart(2)}. ${c.username}  ${c.type.padEnd(7)} ${String(c.score).padStart(3)}  ${c.pattern}`);
console.log(`\nFayllar: ${outDir}/{beauty4_shortlist.csv, manual_top30.csv, MANUAL_TOP30.md}`);
