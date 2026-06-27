import fs from "node:fs";
import path from "node:path";

const sourcePath = "C:/Users/Lenovo/Desktop/新站/生肖.txt";
const outDir = path.resolve("docs/keyword-library");
const obsidianDir = process.env.OBSIDIAN_KEYWORD_DIR || "";

const existingPaths = new Set([
  "/",
  "/chinese-zodiac-calculator/",
  "/chinese-zodiac-years/",
  "/chinese-zodiac-animals/",
  "/chinese-zodiac-elements/",
  "/chinese-zodiac-compatibility/",
  "/year-of-the-horse-2026/",
  "/guides/",
  "/guides/horse-chinese-zodiac/",
  "/guides/dragon-chinese-zodiac/",
  "/guides/what-chinese-zodiac-sign-am-i/",
  "/chinese-zodiac/rat/",
  "/chinese-zodiac/ox/",
  "/chinese-zodiac/tiger/",
  "/chinese-zodiac/rabbit/",
  "/chinese-zodiac/dragon/",
  "/chinese-zodiac/snake/",
  "/chinese-zodiac/horse/",
  "/chinese-zodiac/goat/",
  "/chinese-zodiac/monkey/",
  "/chinese-zodiac/rooster/",
  "/chinese-zodiac/dog/",
  "/chinese-zodiac/pig/",
  "/chinese-zodiac/2024/",
  "/chinese-zodiac/2025/",
  "/chinese-zodiac/2026/",
  "/chinese-zodiac/2027/",
  "/chinese-zodiac/2028/",
  "/chinese-zodiac/2029/",
  "/chinese-zodiac/2030/"
]);

const animalSlugs = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "sheep",
  "ram",
  "monkey",
  "rooster",
  "chicken",
  "dog",
  "pig",
  "boar"
];

const elementWords = ["wood", "fire", "earth", "metal", "water"];
const westernZodiac = /\b(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|synastry|birth chart|natal chart|astrology chart|horoscope today)\b/;
const chineseContext = /\b(chinese|asian|eastern|oriental|lunar|zodiac animal|year of the|shengxiao)\b/;
const intentRules = [
  ["calculator", /\b(calculator|find|what is my|what's my|birth|birthday|date of birth)\b/],
  ["compatibility", /\b(compatib|match|love|relationship|friendship|marriage)\b/],
  ["year", /\b(19\d{2}|20\d{2}|2100|years?|year of|what year)\b/],
  ["element", /\b(element|wood|fire|earth|metal|water)\b/],
  ["animal", new RegExp(`\\b(${animalSlugs.join("|")})\\b`)],
  ["meaning", /\b(meaning|personality|traits?|symbol|lucky|color|number)\b/],
  ["festival", /\b(new year|lunar|calendar)\b/]
];

const articleStop = /\b(tattoo|necklace|bracelet|ring|amazon|etsy|calendar 2024|calendar 2025|calendar 2026|printable|wallpaper|clipart|image|png|svg|font|movie|anime|restaurant|near me)\b/;
const irrelevantStop = /\b(birth chart|synastry|natal chart|tarot|moon sign|rising sign|zodiac killer|serial killer|daily horoscope|horoscope for today|today horoscope|horoscope daily|astrology daily|astrology today|for today|pregnancy|gender prediction|baby gender)\b/;
const genericCore = /^(chinese zodiac|asian zodiac|eastern zodiac|oriental zodiac|chinese horoscope sign)$/;

function readRows() {
  const json = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const rows = json.result || json.tasks?.[0]?.result || [];
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("No keyword rows found");
  return rows;
}

function normalizeKeyword(keyword) {
  return String(keyword || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function primaryIntent(keyword) {
  for (const [intent, pattern] of intentRules) {
    if (pattern.test(keyword)) return intent;
  }
  return "general";
}

function proposedUrl(keyword, intent) {
  const slug = keyword
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  if (intent === "compatibility") return `/guides/${slug}/`;
  if (intent === "calculator") return `/guides/${slug}/`;
  if (intent === "element") return `/guides/${slug}/`;
  if (intent === "meaning" || intent === "animal") return `/guides/${slug}/`;
  if (intent === "year") return `/guides/${slug}/`;
  return `/guides/${slug}/`;
}

function coveredByExisting(keyword, intent) {
  if (genericCore.test(keyword)) return "/";
  if (/\bchinese zodiac signs?\b|\bchinese astrological signs?\b|\basian zodiac signs?\b|\beastern zodiac signs?\b|\bchinese zodiac animal\b|\bchinese horoscope animals\b|\bchinese animal signs\b/.test(keyword)) return "/chinese-zodiac-animals/";
  if (/\bchinese horoscope\b|\bchinese astrology\b|\bchinese zodiac astrology\b|\bchinese zodiac horoscope\b/.test(keyword)) return "/";
  if (/\bcalculator\b/.test(keyword)) return "/chinese-zodiac-calculator/";
  if (/\bcompatib|match\b/.test(keyword)) return "/chinese-zodiac-compatibility/";
  const yearMatch = keyword.match(/\b(2024|2025|2026|2027|2028|2029|2030)\b/);
  if (yearMatch) return `/chinese-zodiac/${yearMatch[1]}/`;
  if (/\byear of the horse 2026\b|\b2026 year of the horse\b/.test(keyword)) return "/year-of-the-horse-2026/";
  if (/\belement|wood|fire|earth|metal|water\b/.test(keyword) && !/\bhorse|dragon|snake|rat|ox|tiger|rabbit|goat|monkey|rooster|dog|pig\b/.test(keyword)) return "/chinese-zodiac-elements/";
  if (/\byears?|year chart\b/.test(keyword) && !/\b19\d{2}|20\d{2}|2100\b/.test(keyword)) return "/chinese-zodiac-years/";
  for (const animal of animalSlugs) {
    const canonical = animal === "sheep" || animal === "ram" ? "goat" : animal === "chicken" ? "rooster" : animal === "boar" ? "pig" : animal;
    if (new RegExp(`\\b${animal}\\b`).test(keyword)) {
      const animalPath = `/chinese-zodiac/${canonical}/`;
      if (existingPaths.has(animalPath) && ["animal", "meaning"].includes(intent) && !/\bcompatib|match|love|year|element|lucky|color|number|personality|traits\b/.test(keyword)) return animalPath;
    }
  }
  return "";
}

function difficulty(row) {
  const index = Number(row.competition_index || 0);
  if (index >= 65 || row.competition === "HIGH") return "High";
  if (index >= 35 || row.competition === "MEDIUM") return "Medium";
  return "Low";
}

function opportunityScore(row, keyword, intent, coveredPath) {
  const volume = Number(row.search_volume || 0);
  const comp = Number(row.competition_index || 0);
  const cpc = Number(row.cpc || 0);
  let score = Math.log10(volume + 10) * 24;
  score += Math.min(cpc, 1.5) * 8;
  score -= comp * 0.45;
  if (coveredPath) score -= 24;
  if (genericCore.test(keyword)) score -= 30;
  if (articleStop.test(keyword)) score -= 35;
  if (isIrrelevant(keyword)) score -= 80;
  if (intent === "calculator" || intent === "compatibility") score += 9;
  if (intent === "meaning" || intent === "element") score += 6;
  if (/\b2026|horse\b/.test(keyword)) score += 5;
  if (keyword.split(" ").length >= 4) score += 5;
  return Math.round(score * 10) / 10;
}

function isRelevantToChineseZodiac(keyword) {
  if (chineseContext.test(keyword)) return true;
  if (/\b(19\d{2}|20\d{2}|2100)\b/.test(keyword) && /\bzodiac\b/.test(keyword)) return true;
  if (/\byear of the\b/.test(keyword)) return true;
  if (new RegExp(`\\b(${animalSlugs.join("|")})\\b`).test(keyword) && /\b(zodiac|chinese|year|element|personality|meaning|compatib|lucky)\b/.test(keyword)) return true;
  if (elementWords.some((word) => keyword.includes(word)) && /\bzodiac\b/.test(keyword)) return true;
  return false;
}

function isIrrelevant(keyword) {
  if (irrelevantStop.test(keyword)) return true;
  if (westernZodiac.test(keyword) && !chineseContext.test(keyword)) return true;
  return !isRelevantToChineseZodiac(keyword);
}

function pageType(intent, keyword, coveredPath) {
  if (coveredPath) return "supporting article or existing-page expansion";
  if (intent === "calculator") return "tool-support article";
  if (intent === "compatibility") return "compatibility article";
  if (intent === "element") return "element article";
  if (intent === "year") return "year guide";
  if (intent === "animal" || intent === "meaning") return "animal guide";
  return "guide article";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function table(rows) {
  const header = "| Priority | Keyword | Volume | Competition | Intent | Page Type | URL / Action | Notes |\n|---:|---|---:|---|---|---|---|---|";
  return [header, ...rows.map((r, i) => `| ${i + 1} | ${r.keyword} | ${r.search_volume} | ${r.difficulty} (${r.competition_index}) | ${r.intent} | ${r.pageType} | ${r.urlAction} | ${r.notes} |`)].join("\n");
}

function topicTable(rows) {
  const header = "| Priority | Topic | Primary Keyword | Supporting Keywords | Total Volume | Avg Competition | Intent | URL / Action | Notes |\n|---:|---|---|---|---:|---:|---|---|---|";
  return [header, ...rows.map((row, index) => `| ${index + 1} | ${row.title} | ${row.primary} | ${row.supporting || "-"} | ${row.totalVolume} | ${row.avgCompetition} | ${row.intent} | ${row.urlAction} | ${row.notes} |`)].join("\n");
}

function volumeLabel(volume) {
  const value = Number(volume || 0);
  if (value >= 30000) return "very high";
  if (value >= 10000) return "high";
  if (value >= 3000) return "medium";
  return "low";
}

function statusLabel(row) {
  if (row.urlAction?.startsWith("Expand ")) return "✅ 已有页面";
  if (row.notes?.includes("Irrelevant")) return "🚫 排除";
  if (row.notes?.includes("Commercial")) return "⏳ 后期";
  return "🟡 待发布";
}

function keywordListTable(items, options = {}) {
  const rows = items.map((item) => {
    const keyword = item.primary || item.keyword;
    const volume = item.totalVolume || item.search_volume;
    const category = options.category || item.intent || item.cluster || "general";
    const status = options.status || statusLabel(item);
    return `| ${keyword} | ${status} | ${volumeLabel(volume)} | ${category} |`;
  });
  return ["| 关键词 | 状态 | 搜索量 | 分类 |", "|---|---|---|---|", ...rows].join("\n");
}

function obsidianKeywordList({ testArticles, publishingQueue, expansionBatch, laterBatch }) {
  const yearTopics = publishingQueue.filter((row) => /^year-\d{4}$/.test(row.key)).slice(0, 20);
  const elementTopics = publishingQueue.filter((row) => row.key.startsWith("element-")).slice(0, 20);
  const generalTopics = publishingQueue.filter((row) => !/^year-\d{4}$/.test(row.key) && !row.key.startsWith("element-")).slice(0, 20);
  return `# 关键词列表

## 🔥 高优先级关键词（首批测试文章）

${keywordListTable(testArticles, { category: "first-batch" })}

## 🗓 年份类关键词（适合批量模板页）

${keywordListTable(yearTopics, { category: "year" })}

## 🧩 元素组合关键词（适合专题文章）

${keywordListTable(elementTopics, { category: "element" })}

## 📌 泛主题关键词（需先看 SERP）

${keywordListTable(generalTopics, { category: "general" })}

## ✅ 已有页面扩展词

${keywordListTable(expansionBatch, { category: "existing-page" })}

## 🚫 暂不发布 / 排除词

${keywordListTable(laterBatch, { category: "excluded" })}

## 说明

- 状态为“待发布”的词，可以进入文章生成流程。
- 状态为“已有页面”的词，优先补到现有页面，不建议单独开薄文章。
- 年份类关键词数量多，后续适合批量模板化生成。
- “暂不发布 / 排除词”主要是西方星座、每日运势、怀孕预测、商品素材类，不适合当前生肖工具站广告联盟阶段。
`;
}

function clusterName(row) {
  if (/\bhorse|2026\b/.test(row.keyword)) return "Horse / 2026";
  if (/\bdragon|2024\b/.test(row.keyword)) return "Dragon / 2024";
  if (/\bsnake|2025\b/.test(row.keyword)) return "Snake / 2025";
  if (/\bcompatib|match|love\b/.test(row.keyword)) return "Compatibility";
  if (/\belement|wood|fire|earth|metal|water\b/.test(row.keyword)) return "Elements";
  if (/\bcalculator|birthday|birth|what is my|what's my\b/.test(row.keyword)) return "Calculator / Birthday";
  if (/\blucky|color|number|personality|traits|meaning\b/.test(row.keyword)) return "Meaning / Lucky Symbols";
  if (/\byear\b/.test(row.keyword)) return "Years";
  return "General";
}

function topicKey(row) {
  const keyword = row.keyword;
  const specificYear = keyword.match(/\b(19\d{2}|20\d{2}|2100)\b/)?.[1];
  const animal = animalSlugs.find((slug) => new RegExp(`\\b${slug}\\b`).test(keyword));
  const element = elementWords.find((word) => new RegExp(`\\b${word}\\b`).test(keyword));
  if (element && animal) return `element-${element}-${animal}`;
  if (specificYear) return `year-${specificYear}`;
  if (/\b(birth|birthday|calculate|calculator|what is my|what's my)\b/.test(keyword)) return "tool-birth-sign";
  if (/\bcompatib|match|love\b/.test(keyword)) return "compatibility-general";
  if (animal && /\bmeaning|personality|traits|lucky|color|number\b/.test(keyword)) return `animal-${animal}-meaning`;
  if (animal) return `animal-${animal}`;
  if (element) return `element-${element}`;
  return keyword.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function topicTitle(key, items) {
  const top = items[0];
  const year = key.match(/^year-(\d{4})$/)?.[1];
  if (year) return `${year} Chinese Zodiac Sign`;
  if (key === "tool-birth-sign") return "Chinese Birth Signs by Birthday";
  if (key === "compatibility-general") return "Chinese Zodiac Love Compatibility";
  const elementAnimal = key.match(/^element-(\w+)-(\w+)$/);
  if (elementAnimal) return `${capitalize(elementAnimal[1])} ${capitalize(elementAnimal[2])} Chinese Zodiac`;
  const animalMeaning = key.match(/^animal-(\w+)-meaning$/);
  if (animalMeaning) return `${capitalize(animalMeaning[1])} Chinese Zodiac Meaning`;
  const animal = key.match(/^animal-(\w+)$/);
  if (animal) return `${capitalize(animal[1])} Chinese Zodiac`;
  return top.keyword.replace(/\b\w/g, (char) => char.toUpperCase());
}

function topicUrl(items) {
  const covered = items.find((row) => row.urlAction.startsWith("Expand existing "))?.urlAction.replace("Expand existing ", "");
  if (covered) return `Expand ${covered}`;
  return items[0].urlAction;
}

function topicNotes(key, items) {
  if (items.some((row) => row.urlAction.startsWith("Expand existing "))) return "Use as page expansion first; create support article only if the topic needs a separate angle.";
  if (key === "tool-birth-sign") return "Good first article because it supports the calculator and captures high-intent queries.";
  if (key.startsWith("element-")) return "Good article candidate; explain element + animal with cultural boundaries.";
  if (key.startsWith("year-")) return "Good long-tail year article if the year is not already covered.";
  return "Article candidate after checking SERP manually.";
}

function topicQueue(sourceRows, limit = 35) {
  const map = new Map();
  for (const row of sourceRows) {
    const key = topicKey(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()]
    .map(([key, items]) => {
      const sorted = items.sort((a, b) => b.search_volume - a.search_volume || b.score - a.score);
      return {
        key,
        title: topicTitle(key, sorted),
        primary: sorted[0].keyword,
        supporting: sorted.slice(1, 6).map((row) => row.keyword).join("; "),
        totalVolume: sorted.reduce((sum, row) => sum + Number(row.search_volume || 0), 0),
        maxVolume: sorted[0].search_volume,
        avgCompetition: Math.round(sorted.reduce((sum, row) => sum + Number(row.competition_index || 0), 0) / sorted.length),
        intent: sorted[0].intent,
        urlAction: topicUrl(sorted),
        notes: topicNotes(key, sorted)
      };
    })
    .sort((a, b) => {
      const aExpand = a.urlAction.startsWith("Expand ");
      const bExpand = b.urlAction.startsWith("Expand ");
      if (aExpand !== bExpand) return aExpand ? 1 : -1;
      const aSpecific = /^year-\d{4}$/.test(a.key) || a.key.startsWith("element-") || a.key === "tool-birth-sign" || a.key.startsWith("animal-");
      const bSpecific = /^year-\d{4}$/.test(b.key) || b.key.startsWith("element-") || b.key === "tool-birth-sign" || b.key.startsWith("animal-");
      if (aSpecific !== bSpecific) return aSpecific ? -1 : 1;
      return b.totalVolume - a.totalVolume || a.avgCompetition - b.avgCompetition;
    })
    .slice(0, limit);
}

function recommendedTestArticles(sourceRows) {
  const queue = topicQueue(sourceRows.filter((row) => !row.urlAction.startsWith("Expand existing ")), 200);
  const preferred = queue
    .filter((row) => !row.urlAction.startsWith("Expand "))
    .filter((row) => !/^year-\d{4}$/.test(row.key) || ["year-1990", "year-1989", "year-1994"].includes(row.key))
    .map((row) => {
      let fit = 0;
      if (row.key.startsWith("element-")) fit += 30;
      if (row.key === "tool-birth-sign") fit += 28;
      if (row.key.startsWith("year-")) fit += 16;
      if (row.primary.includes("2026") || row.primary.includes("fire horse")) fit += 20;
      if (row.totalVolume >= 10000) fit += 10;
      fit -= row.avgCompetition * 0.4;
      return { ...row, testFit: Math.round(fit * 10) / 10 };
    })
    .sort((a, b) => b.testFit - a.testFit || b.totalVolume - a.totalVolume)
    .slice(0, 8);
  return preferred;
}

const rows = readRows()
  .map((row) => ({ ...row, keyword: normalizeKeyword(row.keyword) }))
  .filter((row) => row.keyword && Number(row.search_volume || 0) >= 70)
  .filter((row, index, arr) => arr.findIndex((item) => item.keyword === row.keyword) === index)
  .map((row) => {
    const intent = primaryIntent(row.keyword);
    const coveredPath = coveredByExisting(row.keyword, intent);
    const url = proposedUrl(row.keyword, intent);
    const score = opportunityScore(row, row.keyword, intent, coveredPath);
    return {
      keyword: row.keyword,
      search_volume: row.search_volume || 0,
      competition: row.competition || "",
      competition_index: row.competition_index ?? "",
      cpc: row.cpc ?? "",
      difficulty: difficulty(row),
      intent,
      cluster: "",
      pageType: pageType(intent, row.keyword, coveredPath),
      urlAction: coveredPath ? `Expand existing ${coveredPath}` : url,
      score,
      notes: isIrrelevant(row.keyword) ? "Irrelevant to Chinese zodiac; exclude from publishing queue." : articleStop.test(row.keyword) ? "Commercial/media intent; use later or avoid for ads-first stage." : coveredPath ? "Already has a matching page; use for page expansion or supporting paragraph." : "New article candidate."
    };
  })
  .sort((a, b) => b.score - a.score || b.search_volume - a.search_volume);

for (const row of rows) row.cluster = clusterName(row);

const newCandidates = rows.filter((row) => row.notes === "New article candidate.");
const expansionCandidates = rows.filter((row) => row.notes.startsWith("Already has"));
const laterCandidates = rows.filter((row) => row.notes.startsWith("Commercial") || row.notes.startsWith("Irrelevant")).slice(0, 40);

const firstBatch = newCandidates.slice(0, 30);
const expansionBatch = expansionCandidates.slice(0, 25);
const laterBatch = laterCandidates.slice(0, 20);
const publishingQueue = topicQueue(rows.filter((row) => !row.notes.startsWith("Irrelevant") && !row.notes.startsWith("Commercial")), 35);
const testArticles = recommendedTestArticles(rows.filter((row) => row.notes === "New article candidate."));

const byCluster = new Map();
for (const row of rows.slice(0, 500)) {
  if (!byCluster.has(row.cluster)) byCluster.set(row.cluster, []);
  byCluster.get(row.cluster).push(row);
}

const clusterSummary = [...byCluster.entries()]
  .map(([cluster, items]) => ({
    cluster,
    count: items.length,
    maxVolume: Math.max(...items.map((item) => item.search_volume || 0)),
    avgCompetition: Math.round(items.reduce((sum, item) => sum + Number(item.competition_index || 0), 0) / items.length),
    topKeywords: items.slice(0, 5).map((item) => item.keyword).join("; ")
  }))
  .sort((a, b) => b.maxVolume - a.maxVolume);

fs.mkdirSync(outDir, { recursive: true });
if (obsidianDir) fs.mkdirSync(obsidianDir, { recursive: true });

const csvRows = [
  ["priority", "keyword", "search_volume", "competition", "competition_index", "cpc", "intent", "cluster", "page_type", "url_action", "score", "notes"],
  ...rows.map((row, i) => [i + 1, row.keyword, row.search_volume, row.competition, row.competition_index, row.cpc, row.intent, row.cluster, row.pageType, row.urlAction, row.score, row.notes])
];
const csv = csvRows.map((line) => line.map(csvEscape).join(",")).join("\n");
fs.writeFileSync(path.join(outDir, "chinese-zodiac-keyword-library.csv"), csv, "utf8");

const markdown = `# Chinese Zodiac Keyword Library

Source: \`${sourcePath}\`

Generated: 2026-06-27

Rows parsed: ${rows.length}

## Sorting Logic

Priority is based on search volume, competition index, CPC, search intent, existing page coverage, and whether the term is suitable for an ads-first content stage.

- Higher priority: clear informational intent, tool-support intent, compatibility intent, element/meaning intent, and long-tail queries that can become article pages.
- Lower priority: broad head terms already covered by existing pages, commercial product/media queries, tattoo/image/printable terms, or terms likely to be dominated by ecommerce.
- Existing page coverage is not discarded. Those keywords are marked as expansion opportunities for current pages.

## Deduplicated Publishing Topic Queue

Use this section for actual publishing order. It merges repeated wording variants such as "1990 chinese zodiac sign" and "1990 year of the chinese zodiac" into one topic.

${topicTable(publishingQueue)}

## Recommended First Test Articles

These are better for the first publishing-flow test than pure year-template pages.

${topicTable(testArticles)}

## First Batch: Raw New Article Keywords

This table is keyword-level priority. Use it for keyword coverage inside a topic, not as the final publishing order.

${table(firstBatch)}

## Existing Page Expansion Keywords

These should improve current pages before creating more thin articles.

${table(expansionBatch)}

## Later / Avoid For Ads-First Stage

${table(laterBatch)}

## Cluster Summary

| Cluster | Count in Top 500 | Max Volume | Avg Competition Index | Top Keywords |
|---|---:|---:|---:|---|
${clusterSummary.map((item) => `| ${item.cluster} | ${item.count} | ${item.maxVolume} | ${item.avgCompetition} | ${item.topKeywords} |`).join("\n")}

## Recommended Publishing Order

1. Publish 2 test articles from the first batch, preferably one tool-support query and one meaning/element query.
2. Expand existing high-value pages for broad terms before chasing new head terms.
3. Keep commercial/media/product queries for a later ecommerce or affiliate phase.
4. Re-run this library after new DataForSEO exports are added, then compare with GSC impressions.
`;

fs.writeFileSync(path.join(outDir, "chinese-zodiac-keyword-library.md"), markdown, "utf8");
const obsidianListMarkdown = obsidianKeywordList({ testArticles, publishingQueue, expansionBatch, laterBatch });
const fullKeywordDetails = [
  "",
  `## 完整关键词明细（${rows.length} 个）`,
  "",
  "| 关键词 | 状态 | 搜索量 | 搜索量级 | 分类 | 竞争度 |",
  "|---|---|---:|---|---|---:|",
  ...rows.map((row) => `| ${row.keyword} | ${statusLabel(row)} | ${row.search_volume} | ${volumeLabel(row.search_volume)} | ${row.cluster || row.intent || "general"} | ${row.competition_index} |`)
].join("\n");
fs.writeFileSync(path.join(outDir, "chinese-zodiac-keyword-list.md"), obsidianListMarkdown + fullKeywordDetails, "utf8");
if (obsidianDir) {
  fs.writeFileSync(path.join(obsidianDir, "生肖站关键词库.md"), markdown, "utf8");
  fs.writeFileSync(path.join(obsidianDir, "生肖站关键词库.csv"), csv, "utf8");
}

console.log(JSON.stringify({
  parsed: rows.length,
  firstBatch: firstBatch.length,
  publishingTopics: publishingQueue.length,
  testArticles: testArticles.length,
  expansionBatch: expansionBatch.length,
  laterBatch: laterBatch.length,
  projectMarkdown: path.join(outDir, "chinese-zodiac-keyword-library.md"),
  projectCsv: path.join(outDir, "chinese-zodiac-keyword-library.csv"),
  obsidianMarkdown: obsidianDir ? path.join(obsidianDir, "生肖站关键词库.md") : "",
  obsidianCsv: obsidianDir ? path.join(obsidianDir, "生肖站关键词库.csv") : "",
  top10Topics: publishingQueue.slice(0, 10).map((row) => ({ topic: row.title, primary: row.primary, totalVolume: row.totalVolume, competition: row.avgCompetition, intent: row.intent, action: row.urlAction }))
  ,
  recommendedTests: testArticles.slice(0, 5).map((row) => ({ topic: row.title, primary: row.primary, totalVolume: row.totalVolume, action: row.urlAction }))
}, null, 2));
