import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const distDir = "dist";
const htmlFiles = await listHtmlFiles(distDir);
const missing = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const links = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)]
    .map((match) => match[1])
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => href.split("#")[0].split("?")[0])
    .filter(Boolean);

  for (const link of links) {
    if (!localTargetExists(link)) {
      missing.push({ file, link });
    }
  }
}

if (missing.length) {
  console.error(`Found ${missing.length} missing internal links:`);
  for (const item of missing) {
    console.error(`${item.file} -> ${item.link}`);
  }
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files. No missing internal links found.`);

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(path));
    } else if (entry.isFile() && extname(entry.name) === ".html") {
      files.push(path);
    }
  }
  return files;
}

function localTargetExists(pathname) {
  if (pathname === "/") {
    return existsSync(join(distDir, "index.html"));
  }

  const clean = pathname.replace(/^\/+/, "");
  const directFile = normalize(join(distDir, clean));
  const indexFile = normalize(join(distDir, clean, "index.html"));

  return existsSync(directFile) || existsSync(indexFile);
}
