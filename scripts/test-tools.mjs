import { readFile } from "node:fs/promises";

const animals = JSON.parse(await readFile("data/zodiac-animals.json", "utf8"));
const seedYears = JSON.parse(await readFile("data/zodiac-years.json", "utf8"));
const compatibility = JSON.parse(await readFile("data/compatibility.json", "utf8"));
const years = buildZodiacYears(1900, 2100, seedYears);
const byYear = Object.fromEntries(years.map((year) => [String(year.year), year]));
const bySlug = Object.fromEntries(animals.map((animal) => [animal.animal, animal]));

assert(findZodiac(new Date("2026-02-16T00:00:00Z")).animal === "snake", "2026-02-16 should still be Snake");
assert(findZodiac(new Date("2026-02-17T00:00:00Z")).animal === "horse", "2026-02-17 should be Horse");
assert(findZodiac(new Date("1990-01-26T00:00:00Z")).animal === "snake", "1990-01-26 should still be Snake");
assert(findZodiac(new Date("1990-01-27T00:00:00Z")).animal === "horse", "1990-01-27 should be Horse");
assert(findZodiac(new Date("1900-01-30T00:00:00Z")) === null, "1900-01-30 should be outside supported zodiac boundary");
assert(findZodiac(new Date("1900-01-31T00:00:00Z")).animal === "rat", "1900-01-31 should be Rat");

assert(byYear["2026"].animal === "horse", "2026 year lookup should be Horse");
assert(byYear["2024"].animal === "dragon", "2024 year lookup should be Dragon");

assert(searchTarget("Horse") === "/chinese-zodiac/horse/", "Horse search should route to Horse guide");
assert(searchTarget("2026") === "/chinese-zodiac/2026/", "2026 search should route to 2026 guide");
assert(searchTarget("Dragon Rat") === "/chinese-zodiac-compatibility/rat-and-dragon-compatibility/", "Dragon Rat search should route to pair guide");
assert(searchTarget("compatibility") === "/chinese-zodiac-compatibility/", "Compatibility search should route to compatibility page");

const dragonRat = compatibilityDetails("dragon", "rat");
assert(dragonRat.score === 88, "Dragon + Rat should be harmonious");
assert(dragonRat.level === "Traditionally harmonious", "Dragon + Rat level should be harmonious");

console.log("Tool logic tests passed.");

function findZodiac(date) {
  const y = date.getUTCFullYear();
  let row = years.find((item) => item.year === y);
  if (!row) return null;
  const boundary = new Date(`${row.lunarNewYear}T00:00:00Z`);
  if (date < boundary) {
    const previous = years.find((item) => item.year === y - 1);
    if (!previous) return null;
    row = previous;
  }
  return row;
}

function buildZodiacYears(start, end, seed) {
  const knownDates = new Map(seed.map((item) => [item.year, item.lunarNewYear]));
  const zodiacCycle = ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "goat", "monkey", "rooster", "dog", "pig"];
  const elementCycle = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"];
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const year = start + index;
    return {
      year,
      animal: zodiacCycle[mod(year - 2020, 12)],
      element: elementCycle[mod(year - 2020, 10)],
      lunarNewYear: knownDates.get(year) || findLunarNewYear(year)
    };
  });
}

function findLunarNewYear(year) {
  const formatter = new Intl.DateTimeFormat("en-u-ca-chinese", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC"
  });
  for (let month = 0; month <= 1; month += 1) {
    const first = month === 0 ? 21 : 1;
    const last = month === 0 ? 31 : 21;
    for (let day = first; day <= last; day += 1) {
      const date = new Date(Date.UTC(year, month, day));
      const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
      if (parts.month === "1" && parts.day === "1" && Number(parts.relatedYear) === year) {
        return date.toISOString().slice(0, 10);
      }
    }
  }
  return `${year}-02-01`;
}

function mod(value, base) {
  return ((value % base) + base) % base;
}

function pairKey(first, second) {
  return [first, second].sort().join("|");
}

function pairSlug(first, second) {
  return `${first}-and-${second}-compatibility`;
}

function compatibilityDetails(first, second) {
  const same = first === second;
  const key = pairKey(first, second);
  const bestPairKeys = new Set(compatibility.best.map(([a, b]) => pairKey(a, b)));
  const challengingPairKeys = new Set(compatibility.challenging.map(([a, b]) => pairKey(a, b)));

  if (same) return { first, second, level: "Same sign", score: 74 };
  if (bestPairKeys.has(key)) return { first, second, level: "Traditionally harmonious", score: 88 };
  if (challengingPairKeys.has(key)) return { first, second, level: "Traditionally challenging", score: 46 };
  return { first, second, level: "Balanced or mixed", score: 64 };
}

function searchTarget(raw) {
  const q = String(raw || "").trim().toLowerCase();
  const searchAliases = animals.flatMap((animal) => [
    { term: animal.animal, slug: animal.animal },
    { term: animal.name.toLowerCase(), slug: animal.animal },
    { term: animal.chinese, slug: animal.animal },
    { term: animal.pinyin.toLowerCase(), slug: animal.animal }
  ]);

  if (!q) return "/chinese-zodiac-animals/";

  const year = (q.match(/\b(19\d{2}|20\d{2}|2100)\b/) || [])[1];
  if (year && byYear[year]) {
    return Number(year) >= 2024 && Number(year) <= 2030 ? `/chinese-zodiac/${year}/` : "/chinese-zodiac-years/";
  }

  const found = [];
  for (const item of searchAliases) {
    if (item.term && q.includes(item.term) && !found.includes(item.slug)) {
      found.push(item.slug);
    }
  }

  if (found.length >= 2) {
    const pair = compatibilityDetails(found[0], found[1]);
    return `/chinese-zodiac-compatibility/${pairSlug(pair.first, pair.second)}/`;
  }
  if (found.length === 1) return `/chinese-zodiac/${found[0]}/`;
  if (q.includes("compat") || q.includes("match") || q.includes("love")) return "/chinese-zodiac-compatibility/";
  if (q.includes("element")) return "/chinese-zodiac-elements/";
  if (q.includes("year")) return "/chinese-zodiac-years/";
  return "/chinese-zodiac-animals/";
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
