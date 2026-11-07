"use strict";

/**
 * 4 belgili "chiroyli" niklar uchun alohida baholash (7112, 7007, 7771, f7x9 kabi).
 * Tarmoqqa murojaat qilmaydi — natija faqat TEKSHIRILMAGAN nomzodlar.
 */

const { generateAll, usernameType } = require("./candidates.cjs");

const DIG = /[0-9]/;
const PREMIUM = new Set("xzqvkjf".split(""));
const CONFUSABLE = new Set(["o", "0", "l", "1", "i"]);
const VOWELS = new Set("aeiou".split(""));

/** Belgilarni A/B/C... skeletiga aylantiradi: 7112 -> ABBC, f7x9 -> ABCD. */
function skeleton(u) {
  const map = new Map();
  return [...u].map((c) => {
    if (!map.has(c)) map.set(c, String.fromCharCode(65 + map.size));
    return map.get(c);
  }).join("");
}

/** Harf/raqam joylashuvi: f7x9 -> LDLD. */
function layout(u) {
  return [...u].map((c) => (DIG.test(c) ? "D" : "L")).join("");
}

function isSeq(u) {
  if (!/^[0-9]{4}$/.test(u)) return false;
  const d = [...u].map(Number);
  const step = d[1] - d[0];
  return (step === 1 || step === -1) && d.every((x, i) => i === 0 || x - d[i - 1] === step);
}

/**
 * @returns {{score:number, pattern:string}|null} — chiroyli shablonga tushmasa null.
 */
function beauty4(u) {
  if (u.length !== 4) return null;
  const type = usernameType(u);
  const sk = skeleton(u);
  const lay = layout(u);
  let score = 0;
  let pattern = "";

  if (type === "digits") {
    if (sk === "AAAA") [score, pattern] = [100, "AAAA (7777)"];
    else if (/^[1-9]000$/.test(u)) [score, pattern] = [80, "X000 (7000)"];
    else if (sk === "AAAB" || (sk === "ABBB")) [score, pattern] = [80, "AAAB (7771/1777)"];
    else if (sk === "ABBA") [score, pattern] = [78, "ABBA (7007)"];
    else if (sk === "ABAB") [score, pattern] = [75, "ABAB (7070)"];
    else if (sk === "AABB") [score, pattern] = [72, "AABB (7711)"];
    else if (isSeq(u)) [score, pattern] = [70, "ketma-ket (1234)"];
    else if (/^[1-9][1-9]00$/.test(u)) [score, pattern] = [60, "XY00 (7100)"];
    else if (sk === "ABBC" || sk === "AABC" || sk === "ABCC") [score, pattern] = [55, "ABBC (7112)"];
    else return null;
    score += [...u].filter((c) => c === "7").length * 3;
    if (u[0] === "0") score -= 15;
  } else if (type === "mixed") {
    const L = [...u].filter((c) => !DIG.test(c));
    const D = [...u].filter((c) => DIG.test(c));
    if (lay === "LDDD" && new Set(D).size === 1) [score, pattern] = [78, "L+DDD (x777)"];
    else if (lay === "DDDL" && new Set(D).size === 1) [score, pattern] = [72, "DDD+L (777x)"];
    else if (lay === "LDLD" && sk === "ABAB") [score, pattern] = [76, "LDLD takror (x7x7)"];
    else if (lay === "LDLD") [score, pattern] = [68, "LDLD (f7x9)"];
    else if (lay === "LDDL" && u[0] === u[3]) [score, pattern] = [70, "LDDL palindrom (x77x)"];
    else if (lay === "LLDD" && D[0] === D[1]) [score, pattern] = [66, "LLDD (fx77)"];
    else if (lay === "LLDD") [score, pattern] = [58, "LLDD (fx79)"];
    else if (lay === "DLLD" && u[0] === u[3]) [score, pattern] = [62, "DLLD palindrom (7xx7)"];
    else if (lay === "LDDD") [score, pattern] = [50, "L+DDD (f712)"];
    else return null;
    score += Math.min(8, L.filter((c) => PREMIUM.has(c)).length * 4);
    score += D.filter((c) => c === "7").length * 3;
    if ([...u].some((c) => CONFUSABLE.has(c))) score -= 8;
  } else {
    const cv = [...u].map((c) => (VOWELS.has(c) ? "V" : "C")).join("");
    if (sk === "AAAA") [score, pattern] = [90, "AAAA (xxxx)"];
    else if (sk === "ABAB" && (cv === "CVCV" || cv === "VCVC")) [score, pattern] = [72, "ABAB (lolo)"];
    else if (cv === "CVCV") [score, pattern] = [60, "CVCV (nova)"];
    else if (sk === "ABBA") [score, pattern] = [58, "ABBA (anna)"];
    else if (sk === "AABB") [score, pattern] = [50, "AABB (xxzz)"];
    else return null;
    score += Math.min(8, [...u].filter((c) => PREMIUM.has(c)).length * 4);
    if ([...u].some((c) => c === "l" || c === "i")) score -= 3;
  }
  return { score, pattern };
}

/** Taxminiy bo'sh bo'lish ehtimoli (faqat yo'l-yo'riq, tekshiruv emas). */
function chanceHint(type) {
  return { digits: "juda past", letters: "past", mixed: "o'rtacha" }[type];
}

/** Barqaror (deterministik) hash — teng balllilarni alifbo bo'yicha emas, aralash tartibda beradi. */
function hash(u) {
  let h = 2166136261;
  for (const c of u) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

function rankBeauty4() {
  const out = [];
  for (const u of generateAll([4])) {
    const b = beauty4(u);
    if (!b) continue;
    const type = usernameType(u);
    out.push({ username: u, type, pattern: b.pattern, score: b.score, chance_hint: chanceHint(type), status: "tekshirilmagan" });
  }
  out.sort((a, b) => b.score - a.score || hash(a.username) - hash(b.username));
  return out;
}

/**
 * Qo'lda tekshirish uchun xilma-xil ro'yxat: namunalar birinchi,
 * keyin turlar bo'yicha kvota va har bir shablondan ko'pi bilan `perPattern` ta.
 * Aralash niklar ko'proq — ularning bo'sh bo'lish ehtimoli yuqoriroq.
 */
function pickManual(ranked, { total = 30, pinned = [], quotas = { mixed: 14, digits: 10, letters: 6 }, perPattern = 3 } = {}) {
  const byName = new Map(ranked.map((c) => [c.username, c]));
  const picked = [];
  const seen = new Set();
  const patCount = new Map();
  const typeCount = { mixed: 0, digits: 0, letters: 0 };
  // Xilma-xillik: bitta harf ko'pi bilan 2 ta nikda, raqamli niklarda asosiy raqam ko'pi bilan 4 marta.
  const letterUse = new Map();
  const mainDigitUse = new Map();
  const mainDigit = (u) => [...u].sort((a, b) => u.split(b).length - u.split(a).length)[0];
  const letters = (u) => [...new Set(u.replace(/[0-9]/g, ""))];
  const take = (c, why) => {
    picked.push({ ...c, why });
    seen.add(c.username);
    patCount.set(c.pattern, (patCount.get(c.pattern) || 0) + 1);
    typeCount[c.type]++;
    for (const l of letters(c.username)) letterUse.set(l, (letterUse.get(l) || 0) + 1);
    if (c.type === "digits") mainDigitUse.set(mainDigit(c.username), (mainDigitUse.get(mainDigit(c.username)) || 0) + 1);
  };
  for (const u of pinned) if (byName.has(u)) take(byName.get(u), "siz bergan namuna");
  for (const c of ranked) {
    if (picked.length >= total) break;
    if (seen.has(c.username)) continue;
    if (typeCount[c.type] >= quotas[c.type]) continue;
    if ((patCount.get(c.pattern) || 0) >= perPattern) continue;
    if (letters(c.username).some((l) => (letterUse.get(l) || 0) >= 2)) continue;
    if (c.type === "digits" && (mainDigitUse.get(mainDigit(c.username)) || 0) >= 4) continue;
    take(c, "yuqori ball");
  }
  return picked.slice(0, total).map((c, i) => ({ rank: i + 1, ...c }));
}

module.exports = { beauty4, skeleton, layout, rankBeauty4, pickManual };
