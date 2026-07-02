import { readFile } from "node:fs/promises";
import { join } from "node:path";

const minimumWords = 1000;
const pages = [
  "/guides/fire-horse-zodiac/",
  "/guides/fire-rat-chinese-zodiac/",
  "/guides/chinese-zodiac-earth-tiger/",
  "/guides/chinese-zodiac-fire-rabbit/",
  "/guides/chinese-zodiac-water-dragon/",
  "/guides/chinese-zodiac-water-horse/",
  "/guides/fire-dragon-chinese-zodiac/",
  "/guides/chinese-zodiac-metal-horse/",
  "/guides/chinese-zodiac-metal-snake/",
  "/guides/1990-year-of-the-chinese-zodiac/",
  "/guides/1989-year-of-the-chinese-zodiac/",
  "/guides/horse-chinese-zodiac/",
  "/guides/dragon-chinese-zodiac/"
];

const issues = [];

for (const page of pages) {
  const htmlPath = join("dist", page, "index.html");
  const html = await readFile(htmlPath, "utf8");
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ");
  const words = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || [];
  if (words.length < minimumWords) {
    issues.push(`${page} -> ${words.length} words, expected at least ${minimumWords}`);
  }
}

if (issues.length) {
  console.error(`Found ${issues.length} content depth issues:`);
  for (const issue of issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(`Checked ${pages.length} published article pages. Content depth passed.`);
