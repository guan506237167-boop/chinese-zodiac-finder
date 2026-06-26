import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = {
  name: "Chinese Zodiac Guide",
  url: "https://www.chinesezodiacfinder.com",
  description: "Find your Chinese zodiac sign, zodiac year, animal meaning, and traditional compatibility with a fast cultural reference tool.",
  assetVersion: "20260626-3"
};

const animals = JSON.parse(await readFile("data/zodiac-animals.json", "utf8"));
const seedYears = JSON.parse(await readFile("data/zodiac-years.json", "utf8"));
const years = buildZodiacYears(1900, 2100, seedYears);
const compatibility = JSON.parse(await readFile("data/compatibility.json", "utf8"));
const animalBySlug = Object.fromEntries(animals.map((animal) => [animal.animal, animal]));
const bestPairKeys = new Set(compatibility.best.map(([first, second]) => pairKey(first, second)));
const challengingPairKeys = new Set(compatibility.challenging.map(([first, second]) => pairKey(first, second)));
const elementInfo = {
  Wood: {
    keywords: "growth, renewal, flexibility",
    meaning: "Wood is traditionally associated with growth, renewal, flexibility, and steady development."
  },
  Fire: {
    keywords: "energy, visibility, action",
    meaning: "Fire is traditionally associated with energy, visibility, warmth, expression, and active movement."
  },
  Earth: {
    keywords: "stability, patience, support",
    meaning: "Earth is traditionally associated with stability, patience, grounding, and practical support."
  },
  Metal: {
    keywords: "structure, clarity, endurance",
    meaning: "Metal is traditionally associated with structure, clarity, refinement, and endurance."
  },
  Water: {
    keywords: "adaptability, reflection, flow",
    meaning: "Water is traditionally associated with adaptability, reflection, flow, and quiet strength."
  }
};

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await copyFile("public/assets/zodiac-wheel.svg", "dist/assets/zodiac-wheel.svg");
await copyFile("public/assets/logo.svg", "dist/assets/logo.svg");
await copyFile("public/google1c43509ea14adc51.html", "dist/google1c43509ea14adc51.html");

const pages = [];

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
  const firstAnimal = animalBySlug[first];
  const secondAnimal = animalBySlug[second];
  const same = first === second;
  const key = pairKey(first, second);
  if (same) {
    return {
      first,
      second,
      level: "Same sign",
      score: 74,
      love: 72,
      friendship: 78,
      work: 70,
      summary: `${firstAnimal.name} and ${secondAnimal.name} share the same zodiac symbolism, so the match is traditionally read as familiar, direct, and easy to understand.`,
      advice: "The strength of a same-sign match is shared rhythm. The challenge is that similar habits can reinforce each other, so patience and self-awareness matter."
    };
  }
  if (bestPairKeys.has(key)) {
    return {
      first,
      second,
      level: "Traditionally harmonious",
      score: 88,
      love: 90,
      friendship: 86,
      work: 84,
      summary: `${firstAnimal.name} and ${secondAnimal.name} are often described as a harmonious zodiac pairing in traditional compatibility readings.`,
      advice: "This match is usually read as supportive and naturally cooperative. It works best when both sides keep the relationship balanced instead of relying only on symbolic luck."
    };
  }
  if (challengingPairKeys.has(key)) {
    return {
      first,
      second,
      level: "Traditionally challenging",
      score: 46,
      love: 44,
      friendship: 52,
      work: 48,
      summary: `${firstAnimal.name} and ${secondAnimal.name} are sometimes described as a more challenging zodiac pairing in traditional readings.`,
      advice: "This match is not a warning or a fixed result. It simply suggests that communication style, expectations, and timing may need more conscious effort."
    };
  }
  return {
    first,
    second,
    level: "Balanced or mixed",
    score: 64,
    love: 64,
    friendship: 66,
    work: 62,
    summary: `${firstAnimal.name} and ${secondAnimal.name} have a balanced traditional reading, without being one of the strongest harmony pairs or the most difficult pairs.`,
    advice: "A neutral match leaves more room for real-life context. Personality, values, and communication matter more than the zodiac label."
  };
}

function allCompatibilityPairs() {
  const pairs = [];
  animals.forEach((first, firstIndex) => {
    animals.slice(firstIndex).forEach((second) => {
      pairs.push(compatibilityDetails(first.animal, second.animal));
    });
  });
  return pairs;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugPath(path) {
  return path.endsWith("/") ? path : `${path}/`;
}

function absolute(path) {
  return `${SITE.url}${path === "/" ? "" : path}`;
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function breadcrumbSchema(items) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.url)
    }))
  });
}

function faqSchema(faqs) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  });
}

function pageLayout({ title, description, path, h1, intro, body, faqs = [], pageType = "WebPage", extraSchema = "" }) {
  const canonical = absolute(path);
  const schema = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": pageType,
      name: title,
      description,
      url: canonical,
      inLanguage: "en"
    }),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: h1, url: path }
    ]),
    faqs.length ? faqSchema(faqs) : "",
    extraSchema
  ].join("\n");

  pages.push({ path, title, description, h1, faqs: faqs.length });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE.url}/assets/zodiac-wheel.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css?v=${SITE.assetVersion}">
  ${schema}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="${SITE.name} home"><img class="brand-logo" src="/assets/logo.svg" alt="">${SITE.name}</a>
    <nav class="nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/chinese-zodiac-calculator/">Calculator</a>
      <a href="/chinese-zodiac-years/">Years</a>
      <a href="/chinese-zodiac-animals/">Animals</a>
      <a href="/chinese-zodiac-elements/">Elements</a>
      <a href="/chinese-zodiac-compatibility/">Zodiac Match</a>
    </nav>
  </header>
  <main>
    <section class="page-hero">
      <div>
        <p class="eyebrow">Chinese culture tool</p>
        <h1>${h1}</h1>
        <p class="intro">${intro}</p>
      </div>
    </section>
    ${body}
  </main>
  <footer class="site-footer">
    <div>
      <strong>${SITE.name}</strong>
      <p>This site explains Chinese zodiac traditions for cultural and entertainment purposes. It does not provide professional, financial, relationship, or life advice.</p>
    </div>
    <nav aria-label="Footer navigation">
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/chinese-zodiac-faq/">FAQ</a>
      <a href="/admin/seo-report/">SEO Report</a>
    </nav>
  </footer>
  <script src="/calculator.js?v=${SITE.assetVersion}" defer></script>
</body>
</html>`;
}

function adSlot(position) {
  return `<aside class="ad-slot" data-ad-position="${position}" aria-label="Advertisement area">Advertisement</aside>`;
}

function animalCard(animal) {
  return `<a class="animal-card" href="/chinese-zodiac/${animal.animal}/">
    <span class="animal-order">${animal.order}</span>
    <strong>${animal.name}</strong>
    <span>${animal.chinese} &middot; ${animal.pinyin} &middot; ${animal.alsoKnownAs}</span>
    <p>${animal.summary}</p>
  </a>`;
}

async function writePage(path, html) {
  const file = path === "/" ? join("dist", "index.html") : join("dist", path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
}

function yearsForAnimal(slug) {
  return years.filter((item) => item.animal === slug);
}

function zodiacCalculatorBlock() {
  return `<section class="tool-panel" id="calculator">
    <div class="tool-copy">
      <p class="eyebrow">Free calculator</p>
      <h2>Find your Chinese zodiac sign</h2>
      <p>Enter your birth date. The calculator uses Lunar New Year boundaries, so early January or February birthdays may belong to the previous zodiac year.</p>
    </div>
    <form class="calculator-form" data-zodiac-form>
      <label>Birth date
        <input type="date" name="birthdate" required>
      </label>
      <button type="submit">Calculate sign</button>
    </form>
    <div class="result-card" data-zodiac-result hidden></div>
  </section>`;
}

function compatibilityBlock() {
  const options = animals.map((animal) => `<option value="${animal.animal}">${animal.name}</option>`).join("");
  return `<section class="tool-panel" id="compatibility">
    <div class="tool-copy">
      <p class="eyebrow">Zodiac match</p>
      <h2>Check two zodiac signs</h2>
      <p>Compare two Chinese zodiac animals across love, friendship, and work using traditional compatibility symbolism.</p>
    </div>
    <form class="calculator-form match-form" data-compat-form>
      <label>First animal<select name="first">${options}</select></label>
      <label>Second animal<select name="second">${options}</select></label>
      <button type="submit">Check match</button>
    </form>
    <div class="result-card" data-compat-result hidden></div>
  </section>`;
}

function yearsTable(items = years) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Year</th><th>Zodiac</th><th>Element</th><th>Lunar New Year</th></tr></thead>
    <tbody>${items.map((item) => {
      const animal = animalBySlug[item.animal];
      return `<tr><td>${item.year}</td><td><a href="/chinese-zodiac/${item.animal}/">${animal.name}</a></td><td>${item.element}</td><td>${item.lunarNewYear}</td></tr>`;
    }).join("")}</tbody>
  </table></div>`;
}

function yearSearchBlock() {
  return `<section class="tool-panel compact-tool" id="year-search">
    <div class="tool-copy">
      <p class="eyebrow">Year lookup</p>
      <h2>Look up a Chinese zodiac year</h2>
      <p>Enter any year from 1900 to 2100 to get the zodiac animal, element, and Lunar New Year start date.</p>
    </div>
    <form class="calculator-form" data-year-form>
      <label>Gregorian year
        <input type="number" name="year" min="1900" max="2100" inputmode="numeric" placeholder="2026" required>
      </label>
      <button type="submit">Find year</button>
    </form>
    <div class="result-card" data-year-result hidden></div>
  </section>`;
}

function standardFaqs() {
  return [
    {
      q: "Does the Chinese zodiac year start on January 1?",
      a: "No. Chinese zodiac years follow the Lunar New Year, so the start date changes each Gregorian year."
    },
    {
      q: "Why can early-year birthdays have a different zodiac sign?",
      a: "If a birthday falls before Lunar New Year, traditional zodiac calculation uses the previous zodiac year."
    },
    {
      q: "Is Chinese zodiac compatibility scientific?",
      a: "No. Compatibility explanations are traditional cultural interpretations for reference and entertainment."
    }
  ];
}

await writePage("/", pageLayout({
  title: "Chinese Zodiac Guide: Calculator, Years, Animals, and Meanings",
  description: "Use a Chinese zodiac calculator, browse zodiac years, learn the 12 animals in order, and explore traditional zodiac meanings.",
  path: "/",
  h1: "Chinese Zodiac Guide",
  intro: "Find your Chinese zodiac sign with a Lunar New Year-aware calculator, then explore years, animals, elements, and traditional compatibility.",
  extraSchema: jsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Chinese Zodiac Calculator",
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Web",
    url: absolute("/chinese-zodiac-calculator/")
  }),
  body: `
    <section class="hero-grid">
      ${zodiacCalculatorBlock()}
      <figure class="visual-panel"><img src="/assets/zodiac-wheel.svg" alt="Chinese zodiac wheel with twelve animals"></figure>
    </section>
    <section class="content-section tool-strip">
      ${yearSearchBlock()}
      ${compatibilityBlock()}
    </section>
    ${adSlot("after-calculator")}
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Quick facts</p>
        <h2>Chinese zodiac at a glance</h2>
      </div>
      <div class="fact-grid">
        <div><strong>12 animals</strong><span>Rat to Pig in a repeating cycle.</span></div>
        <div><strong>Lunar boundary</strong><span>The zodiac year starts at Lunar New Year.</span></div>
        <div><strong>Five elements</strong><span>Wood, Fire, Earth, Metal, and Water rotate with years.</span></div>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Start here</p>
        <h2>Use the site in three steps</h2>
      </div>
      <div class="step-grid">
        <div><span>1</span><strong>Calculate your sign</strong><p>Use your birthday and Lunar New Year boundaries to find the right animal.</p></div>
        <div><span>2</span><strong>Read the animal guide</strong><p>Review years, Chinese name, pinyin, element cycle, and traditional meaning.</p></div>
        <div><span>3</span><strong>Explore yearly topics</strong><p>Open annual pages such as Year of the Horse 2026 and compatibility guides.</p></div>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Animals</p>
        <h2>Explore the 12 zodiac animals</h2>
      </div>
      <div class="animal-grid">${animals.map(animalCard).join("")}</div>
    </section>
    ${adSlot("mid-home")}
    <section class="content-section split">
      <div>
        <p class="eyebrow">2026 topic</p>
        <h2>Year of the Horse 2026</h2>
        <p>2026 is traditionally the Year of the Horse, beginning on February 17, 2026. The Horse is associated with energy, movement, and independence.</p>
        <a class="button-link" href="/year-of-the-horse-2026/">Read the 2026 guide</a>
      </div>
      <div>
        <p class="eyebrow">Years chart</p>
        <h2>Check zodiac years</h2>
        <p>Use the chart to compare Gregorian years with zodiac animals and Lunar New Year start dates.</p>
        <a class="button-link" href="/chinese-zodiac-years/">Open years chart</a>
      </div>
    </section>`
}));

await writePage("/chinese-zodiac-calculator/", pageLayout({
  title: "Chinese Zodiac Calculator: Find Your Zodiac Animal by Birth Date",
  description: "Find your Chinese zodiac sign by birth date with a calculator that respects Lunar New Year boundaries.",
  path: "/chinese-zodiac-calculator/",
  h1: "Chinese Zodiac Calculator",
  intro: "Use your birth date to find your Chinese zodiac animal, element, and Lunar New Year boundary note.",
  faqs: standardFaqs(),
  extraSchema: jsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Chinese Zodiac Calculator",
    applicationCategory: "ReferenceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  }),
  body: `
    <section class="tool-page">${zodiacCalculatorBlock()}</section>
    <section class="content-section">
      <h2>How this calculator works</h2>
      <p>The Chinese zodiac is tied to the Lunar New Year, not January 1. If your birthday is before Lunar New Year in your birth year, the calculator uses the previous zodiac year.</p>
      ${yearsTable(years.slice(-16))}
    </section>
    ${faqBlock(standardFaqs())}`
}));

await writePage("/chinese-zodiac-years/", pageLayout({
  title: "Chinese Zodiac Years Chart with Lunar New Year Dates",
  description: "Browse a Chinese zodiac years chart with animals, elements, and Lunar New Year start dates.",
  path: "/chinese-zodiac-years/",
  h1: "Chinese Zodiac Years Chart",
  intro: "Use this chart to compare Gregorian years with Chinese zodiac animals, elements, and Lunar New Year start dates.",
  faqs: standardFaqs(),
  body: `
    <section class="tool-page">${yearSearchBlock()}</section>
    <section class="content-section">
      <h2>Chinese zodiac years</h2>
      ${yearsTable()}
    </section>
    ${faqBlock(standardFaqs())}`
}));

await writePage("/chinese-zodiac-animals/", pageLayout({
  title: "Chinese Zodiac Animals in Order: 12 Signs and Meanings",
  description: "Learn the 12 Chinese zodiac animals in order, with Chinese names, pinyin, and short cultural meanings.",
  path: "/chinese-zodiac-animals/",
  h1: "Chinese Zodiac Animals in Order",
  intro: "The twelve Chinese zodiac animals repeat in a fixed cycle from Rat to Pig.",
  body: `
    <section class="content-section">
      <div class="animal-grid">${animals.map(animalCard).join("")}</div>
    </section>`
}));

await writePage("/chinese-zodiac-elements/", pageLayout({
  title: "Chinese Zodiac Elements: Wood, Fire, Earth, Metal, and Water",
  description: "Learn how the five Chinese zodiac elements work with animal years, including Fire Horse, Wood Dragon, and other element combinations.",
  path: "/chinese-zodiac-elements/",
  h1: "Chinese Zodiac Elements",
  intro: "Chinese zodiac years combine the twelve animals with the five elements: Wood, Fire, Earth, Metal, and Water.",
  faqs: [
    { q: "What are the five Chinese zodiac elements?", a: "The five elements are Wood, Fire, Earth, Metal, and Water. They rotate through zodiac years." },
    { q: "What does Fire Horse mean?", a: "Fire Horse combines the Horse zodiac animal with the Fire element, a traditional pairing associated with energy and movement." },
    ...standardFaqs().slice(0, 2)
  ],
  body: `
    <section class="tool-page">${yearSearchBlock()}</section>
    <section class="content-section">
      <h2>Five elements overview</h2>
      <div class="element-grid">
        ${Object.entries(elementInfo).map(([name, info]) => `<div><strong>${name}</strong><span>${info.keywords}</span><p>${info.meaning}</p></div>`).join("")}
      </div>
    </section>
    <section class="content-section">
      <h2>Element cycle years</h2>
      <p>The element cycle repeats in pairs across the Chinese zodiac year sequence. Use the year lookup above for a specific year, or browse the chart below.</p>
      ${yearsTable(years.slice(-20))}
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Examples</p>
        <h2>Popular zodiac element combinations</h2>
      </div>
      <div class="fact-grid">
        <div><strong>Fire Horse</strong><span>2026</span><p>Energy, independence, movement, and visible action.</p></div>
        <div><strong>Wood Dragon</strong><span>2024</span><p>Growth-oriented Dragon symbolism with renewal and expansion.</p></div>
        <div><strong>Wood Snake</strong><span>2025</span><p>Snake symbolism combined with patience, learning, and steady development.</p></div>
      </div>
    </section>
    ${faqBlock([
      { q: "What are the five Chinese zodiac elements?", a: "The five elements are Wood, Fire, Earth, Metal, and Water. They rotate through zodiac years." },
      { q: "Are zodiac elements predictions?", a: "No. This site explains zodiac elements as cultural and traditional associations." }
    ])}`
}));

await writePage("/year-of-the-horse-2026/", pageLayout({
  title: "Year of the Horse 2026: Dates, Element, and Meaning",
  description: "2026 is the Year of the Horse. Learn when it starts, its Fire element, and what the Horse means in Chinese zodiac culture.",
  path: "/year-of-the-horse-2026/",
  h1: "Year of the Horse 2026",
  intro: "2026 is traditionally the Year of the Horse, beginning on February 17, 2026 and associated with the Fire element.",
  faqs: [
    { q: "When does the Year of the Horse 2026 start?", a: "It starts on February 17, 2026, the Lunar New Year date for that year." },
    { q: "What element is the 2026 Horse year?", a: "2026 is traditionally associated with the Fire element." },
    ...standardFaqs().slice(1)
  ],
  body: `
    <section class="content-section split">
      <div>
        <h2>Quick answer</h2>
        <p>2026 is the Year of the Horse in the Chinese zodiac. It begins on February 17, 2026. In traditional interpretation, the Horse is associated with energy, movement, freedom, and a lively spirit.</p>
      </div>
      <div class="fact-card">
        <strong>2026 zodiac</strong>
        <span>Animal: Horse</span>
        <span>Element: Fire</span>
        <span>Starts: 2026-02-17</span>
      </div>
    </section>
    <section class="content-section">
      <h2>What does the Horse mean?</h2>
      <p>${animalBySlug.horse.meaning}</p>
      <a class="button-link" href="/chinese-zodiac/horse/">Open the Horse zodiac guide</a>
    </section>
    ${faqBlock([
      { q: "When does the Year of the Horse 2026 start?", a: "It starts on February 17, 2026, the Lunar New Year date for that year." },
      { q: "What element is the 2026 Horse year?", a: "2026 is traditionally associated with the Fire element." }
    ])}`
}));

await writePage("/chinese-zodiac-compatibility/", pageLayout({
  title: "Chinese Zodiac Compatibility Checker",
  description: "Check two Chinese zodiac animals and read a traditional cultural compatibility interpretation for fun.",
  path: "/chinese-zodiac-compatibility/",
  h1: "Chinese Zodiac Compatibility",
  intro: "Choose two zodiac animals to see a traditional compatibility note. This is a cultural reference, not relationship advice.",
  faqs: standardFaqs(),
  body: `
    <section class="tool-page">${compatibilityBlock()}</section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Pair guides</p>
        <h2>Chinese zodiac compatibility pairs</h2>
      </div>
      <p>Open a pair guide for a fuller traditional reading with love, friendship, work, and practical notes.</p>
      <div class="pair-grid">${allCompatibilityPairs().map((pair) => {
        const firstAnimal = animalBySlug[pair.first];
        const secondAnimal = animalBySlug[pair.second];
        return `<a class="pair-card" href="/chinese-zodiac-compatibility/${pairSlug(pair.first, pair.second)}/"><strong>${firstAnimal.name} + ${secondAnimal.name}</strong><span>${pair.level}</span><small>${pair.score}/100 match score</small></a>`;
      }).join("")}</div>
    </section>
    <section class="content-section">
      <h2>How to read zodiac compatibility</h2>
      <p>Chinese zodiac compatibility is traditionally explained through animal relationships, element cycles, and cultural symbolism. It should be read as folklore and entertainment, not as relationship advice.</p>
    </section>
    ${faqBlock(standardFaqs())}`
}));

for (const pair of allCompatibilityPairs()) {
  const firstAnimal = animalBySlug[pair.first];
  const secondAnimal = animalBySlug[pair.second];
  const path = `/chinese-zodiac-compatibility/${pairSlug(pair.first, pair.second)}/`;
  await writePage(path, pageLayout({
    title: `${firstAnimal.name} and ${secondAnimal.name} Chinese Zodiac Compatibility`,
    description: `Read the ${firstAnimal.name} and ${secondAnimal.name} Chinese zodiac compatibility match for love, friendship, work, and traditional meaning.`,
    path,
    h1: `${firstAnimal.name} and ${secondAnimal.name} Compatibility`,
    intro: `${pair.summary} This guide explains the pair as a cultural reference, not as relationship advice.`,
    faqs: [
      { q: `Are ${firstAnimal.name} and ${secondAnimal.name} compatible in Chinese zodiac?`, a: pair.summary },
      { q: `What is the match score for ${firstAnimal.name} and ${secondAnimal.name}?`, a: `This cultural reference gives the pair a ${pair.score}/100 symbolic match score.` },
      ...standardFaqs().slice(1)
    ],
    body: `
      <section class="content-section split">
        <div>
          <h2>Quick answer</h2>
          <p>${pair.summary}</p>
          <p>${pair.advice}</p>
        </div>
        <div class="fact-card">
          <strong>${pair.level}</strong>
          <span>Overall: ${pair.score}/100</span>
          <span>Love: ${pair.love}/100</span>
          <span>Friendship: ${pair.friendship}/100</span>
          <span>Work: ${pair.work}/100</span>
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <p class="eyebrow">Dimensions</p>
          <h2>Love, friendship, and work</h2>
        </div>
        <div class="score-grid">
          <div><strong>Love</strong><span>${pair.love}/100</span><p>${pair.love >= 80 ? "Traditionally read as warm and naturally supportive." : pair.love >= 60 ? "Traditionally read as workable with good communication." : "Traditionally read as needing more patience and clarity."}</p></div>
          <div><strong>Friendship</strong><span>${pair.friendship}/100</span><p>${pair.friendship >= 80 ? "Often described as easygoing and mutually encouraging." : pair.friendship >= 60 ? "Often described as balanced, with room for differences." : "May require more space, listening, and shared expectations."}</p></div>
          <div><strong>Work</strong><span>${pair.work}/100</span><p>${pair.work >= 80 ? "Symbolically strong for cooperation and shared goals." : pair.work >= 60 ? "Can work well when roles and timing are clear." : "Benefits from clear responsibilities and less assumption."}</p></div>
        </div>
      </section>
      <section class="content-section split">
        <div>
          <h2>${firstAnimal.name} sign reference</h2>
          <p>${firstAnimal.summary}</p>
          <a class="button-link secondary" href="/chinese-zodiac/${firstAnimal.animal}/">Open ${firstAnimal.name} guide</a>
        </div>
        <div>
          <h2>${secondAnimal.name} sign reference</h2>
          <p>${secondAnimal.summary}</p>
          <a class="button-link secondary" href="/chinese-zodiac/${secondAnimal.animal}/">Open ${secondAnimal.name} guide</a>
        </div>
      </section>
      ${faqBlock([
        { q: `Are ${firstAnimal.name} and ${secondAnimal.name} compatible?`, a: pair.summary },
        { q: "Is zodiac compatibility scientific?", a: "No. It is a traditional cultural interpretation for reference and entertainment." }
      ])}`
  }));
}

for (const item of years.filter((row) => row.year >= 2024 && row.year <= 2030)) {
  const animal = animalBySlug[item.animal];
  await writePage(`/chinese-zodiac/${item.year}/`, pageLayout({
    title: `${item.year} Chinese Zodiac: Year of the ${animal.name}, Element, and Dates`,
    description: `${item.year} is the Year of the ${animal.name}. Learn the Lunar New Year start date, element, and traditional zodiac meaning.`,
    path: `/chinese-zodiac/${item.year}/`,
    h1: `${item.year} Chinese Zodiac`,
    intro: `${item.year} is traditionally the Year of the ${animal.name}, beginning on ${item.lunarNewYear}.`,
    faqs: [
      { q: `What is the Chinese zodiac for ${item.year}?`, a: `${item.year} is the Year of the ${animal.name} in the Chinese zodiac.` },
      { q: `When does the ${item.year} Chinese zodiac year start?`, a: `It starts on ${item.lunarNewYear}, the Lunar New Year date for ${item.year}.` },
      ...standardFaqs().slice(0, 2)
    ],
    body: `
      <section class="content-section split">
        <div>
          <h2>Quick answer</h2>
          <p>${item.year} is the Year of the ${animal.name}. The zodiac year begins on ${item.lunarNewYear}, not January 1.</p>
          <a class="button-link" href="/chinese-zodiac/${animal.animal}/">Read the ${animal.name} guide</a>
        </div>
        <div class="fact-card">
          <strong>${item.year} facts</strong>
          <span>Animal: ${animal.name}</span>
          <span>Element: ${item.element}</span>
          <span>Starts: ${item.lunarNewYear}</span>
        </div>
      </section>
      <section class="content-section">
        <h2>Traditional meaning</h2>
        <p>${animal.meaning}</p>
        <p>The ${item.element} element adds another layer of traditional interpretation. These associations are cultural references, not predictions.</p>
      </section>
      ${faqBlock([
        { q: `What is the Chinese zodiac for ${item.year}?`, a: `${item.year} is the Year of the ${animal.name}.` },
        { q: `Does ${item.year} start as a zodiac year on January 1?`, a: `No. It starts on ${item.lunarNewYear}, the Lunar New Year date.` }
      ])}`
  }));
}

for (const animal of animals) {
  const animalYears = yearsForAnimal(animal.animal);
  await writePage(`/chinese-zodiac/${animal.animal}/`, pageLayout({
    title: `${animal.name} Chinese Zodiac: Years, Meaning, Personality, and Element`,
    description: `Learn the ${animal.name} Chinese zodiac years, cultural meaning, element cycle, and traditional personality associations.`,
    path: `/chinese-zodiac/${animal.animal}/`,
    h1: `${animal.name} Chinese Zodiac`,
    intro: `${animal.summary} This guide explains years, cultural meaning, and traditional associations.`,
    faqs: [
      { q: `What years are the ${animal.name} zodiac?`, a: `${animal.name} years repeat every 12 years. Use the years table on this page and check Lunar New Year boundaries for early-year birthdays.` },
      { q: `What does the ${animal.name} mean in Chinese zodiac culture?`, a: animal.meaning },
      ...standardFaqs().slice(0, 2)
    ],
    body: `
      <section class="content-section split">
        <div>
          <h2>Quick answer</h2>
          <p>${animal.summary} The ${animal.name} is animal number ${animal.order} in the twelve-year zodiac cycle.</p>
        </div>
        <div class="fact-card">
          <strong>${animal.name} facts</strong>
          <span>Chinese: ${animal.chinese}</span>
          <span>Pinyin: ${animal.pinyin}</span>
          <span>Also known as: ${animal.alsoKnownAs}</span>
          <span>Yin/Yang: ${animal.yinYang}</span>
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <p class="eyebrow">Reference</p>
          <h2>${animal.name} zodiac quick facts</h2>
        </div>
        <div class="fact-grid">
          <div><strong>Lucky numbers</strong><span>${animal.luckyNumbers}</span></div>
          <div><strong>Lucky colors</strong><span>${animal.luckyColors}</span></div>
          <div><strong>Cycle order</strong><span>No. ${animal.order} in the 12-animal cycle</span></div>
        </div>
      </section>
      <section class="content-section">
        <h2>${animal.name} years</h2>
        ${yearsTable(animalYears)}
      </section>
      <section class="content-section">
        <h2>Cultural meaning</h2>
        <p>${animal.meaning}</p>
        <p>${animal.personality}</p>
        <p>These descriptions are traditional associations, not scientific personality claims.</p>
      </section>
      ${adSlot(`animal-${animal.animal}`)}
      ${faqBlock([
        { q: `What years are the ${animal.name} zodiac?`, a: `${animal.name} years repeat every 12 years. Check Lunar New Year boundaries for early-year birthdays.` },
        { q: `What does the ${animal.name} mean?`, a: animal.meaning }
      ])}`
  }));
}

await writePage("/chinese-zodiac-faq/", pageLayout({
  title: "Chinese Zodiac FAQ: Signs, Years, Animals, and Lunar New Year",
  description: "Common questions about Chinese zodiac signs, zodiac years, Lunar New Year boundaries, and compatibility.",
  path: "/chinese-zodiac-faq/",
  h1: "Chinese Zodiac FAQ",
  intro: "Clear answers to common Chinese zodiac questions.",
  faqs: standardFaqs(),
  body: faqBlock(standardFaqs())
}));

await writePage("/privacy/", simpleLegalPage("Privacy Policy", "This site uses privacy-friendly static pages. If analytics or advertising scripts are enabled later, this page should disclose the tools used and how data is processed."));
await writePage("/terms/", simpleLegalPage("Terms of Use", "This website provides cultural and educational information. Zodiac tools are for entertainment and cultural reference, not professional advice."));

await writeStaticAssets();
await writeSitemap();
await writeRobots();
await writeSeoReport();

function faqBlock(faqs) {
  return `<section class="content-section faq-list">
    <h2>FAQ</h2>
    ${faqs.map((faq) => `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(faq.a)}</p></details>`).join("")}
  </section>`;
}

function simpleLegalPage(h1, text) {
  const path = h1 === "Privacy Policy" ? "/privacy/" : "/terms/";
  return pageLayout({
    title: `${h1} | ${SITE.name}`,
    description: text.slice(0, 155),
    path,
    h1,
    intro: text,
    body: `<section class="content-section"><p>${text}</p><p>Last updated: 2026-06-26.</p></section>`
  });
}

async function writeStaticAssets() {
  await writeFile("dist/calculator.js", clientScript(), "utf8");
  await writeFile("dist/styles.css", css(), "utf8");
}

function clientScript() {
  return `const years=${JSON.stringify(years)};const animals=${JSON.stringify(animals)};const compatibilityPairs=${JSON.stringify(allCompatibilityPairs())};
const bySlug=Object.fromEntries(animals.map(a=>[a.animal,a]));
const byYear=Object.fromEntries(years.map(y=>[String(y.year),y]));
const byPair=Object.fromEntries(compatibilityPairs.map(p=>[[p.first,p.second].sort().join('|'),p]));
function findZodiac(date){const y=date.getUTCFullYear();let row=years.find(x=>x.year===y);if(!row)return null;const boundary=new Date(row.lunarNewYear+'T00:00:00Z');if(date<boundary){row=years.find(x=>x.year===y-1)||row;}return row;}
function animalMeta(row){return bySlug[row.animal];}
function yearLink(year){return year>=2024&&year<=2030?'<a class="button-link secondary" href="/chinese-zodiac/'+year+'/">Open '+year+' guide</a>':''}
function resultHtml(row){const a=animalMeta(row);return '<h3>Your Chinese zodiac sign is '+a.name+'</h3><div class="result-facts"><span><strong>Chinese</strong>'+a.chinese+' · '+a.pinyin+'</span><span><strong>Element</strong>'+row.element+'</span><span><strong>Yin/Yang</strong>'+a.yinYang+'</span><span><strong>Lunar New Year</strong>'+row.lunarNewYear+'</span></div><p>'+a.summary+'</p><p>'+a.personality+'</p><p class="note">If your birthday is before Lunar New Year, the traditional zodiac year belongs to the previous Gregorian year. This calculator already applies that boundary.</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac/'+a.animal+'/">Read the '+a.name+' guide</a>'+yearLink(row.year)+'</div>'}
document.querySelectorAll('[data-zodiac-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const raw=new FormData(form).get('birthdate');const box=form.parentElement.querySelector('[data-zodiac-result]');if(!raw){return}const row=findZodiac(new Date(raw+'T00:00:00Z'));box.hidden=false;box.innerHTML=row?resultHtml(row):'<h3>Date outside supported range</h3><p>This calculator currently supports birth dates from 1900 to 2100.</p>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));
function yearResultHtml(row){const a=animalMeta(row);return '<h3>'+row.year+' is the Year of the '+a.name+'</h3><div class="result-facts"><span><strong>Animal</strong>'+a.name+' · '+a.chinese+'</span><span><strong>Element</strong>'+row.element+'</span><span><strong>Starts</strong>'+row.lunarNewYear+'</span><span><strong>Order</strong>No. '+a.order+'</span></div><p>'+a.meaning+'</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac/'+a.animal+'/">Read the '+a.name+' guide</a>'+yearLink(row.year)+'</div>'}
document.querySelectorAll('[data-year-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const year=String(new FormData(form).get('year')||'').trim();const box=form.parentElement.querySelector('[data-year-result]');const row=byYear[year];box.hidden=false;box.innerHTML=row?yearResultHtml(row):'<h3>Year outside supported range</h3><p>Enter a Gregorian year from 1900 to 2100.</p>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));
function pairDetails(first,second){return byPair[[first,second].sort().join('|')]}
document.querySelectorAll('[data-compat-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const first=data.get('first');const second=data.get('second');const box=form.parentElement.querySelector('[data-compat-result]');const pair=pairDetails(first,second);const slug=pair.first+'-and-'+pair.second+'-compatibility';box.hidden=false;box.innerHTML='<h3>'+bySlug[first].name+' + '+bySlug[second].name+': '+pair.level+'</h3><div class="result-facts"><span><strong>Overall</strong>'+pair.score+'/100</span><span><strong>Love</strong>'+pair.love+'/100</span><span><strong>Friendship</strong>'+pair.friendship+'/100</span><span><strong>Work</strong>'+pair.work+'/100</span></div><p>'+pair.summary+'</p><p class="note">For cultural reference and entertainment only.</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac-compatibility/'+slug+'/">Open full match guide</a><a class="button-link secondary" href="/chinese-zodiac/'+first+'/">First animal</a><a class="button-link secondary" href="/chinese-zodiac/'+second+'/">Second animal</a></div>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));`;
}

async function writeSitemap() {
  const urls = pages.map((page) => `  <url><loc>${absolute(page.path)}</loc><lastmod>2026-06-26</lastmod></url>`).join("\n");
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
}

async function writeRobots() {
  await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`, "utf8");
}

async function writeSeoReport() {
  const rows = pages.map((page) => {
    const titleOk = page.title.length >= 35 && page.title.length <= 70;
    const descOk = page.description.length >= 90 && page.description.length <= 165;
    const score = [titleOk, descOk, page.h1, page.faqs > 0].filter(Boolean).length;
    return `<tr><td><a href="${page.path}">${page.path}</a></td><td>${page.title.length}</td><td>${page.description.length}</td><td>${page.faqs}</td><td>${score}/4</td></tr>`;
  }).join("");
  await writePage("/admin/seo-report/", `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SEO Report</title><link rel="stylesheet" href="/styles.css?v=${SITE.assetVersion}"></head><body><main class="content-section"><h1>SEO Report</h1><p>Prototype build report for title, description, FAQ, and basic page coverage.</p><div class="table-wrap"><table><thead><tr><th>URL</th><th>Title length</th><th>Description length</th><th>FAQ</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table></div></main></body></html>`);
}

function css() {
  return compactCss();
}

function compactCss() {
  return `:root{--ink:#24201b;--muted:#686159;--paper:#f8f5ee;--panel:#fffdf8;--line:#e3d9c9;--red:#b3343a;--red-dark:#84272d;--gold:#b99455;--jade:#2f7167;--blue:#31485f;--shadow:0 10px 28px rgba(47,37,23,.08)}*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.62}a{color:inherit}.site-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:13px clamp(18px,4vw,52px);background:rgba(248,245,238,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:17px;font-weight:850;white-space:nowrap}.brand-logo{display:block;width:34px;height:34px;border-radius:8px;box-shadow:0 8px 18px rgba(179,52,58,.18)}.nav{display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}.nav a{text-decoration:none;color:#554d45;font-size:15px;font-weight:780;line-height:1.2;padding:4px 0}.nav a:hover{color:var(--red)}main{min-height:70vh}.page-hero{padding:28px clamp(18px,4vw,52px) 16px;max-width:1160px;margin:auto}.page-hero h1{font-family:Georgia,serif;font-size:clamp(31px,3.6vw,46px);line-height:1.1;margin:9px 0 10px;color:#211b17}.intro{font-size:16px;max-width:760px;color:var(--muted)}.eyebrow{display:inline-flex;align-items:center;min-height:28px;padding:0 11px;border-radius:999px;background:rgba(47,113,103,.08);border:1px solid rgba(47,113,103,.18);text-transform:uppercase;letter-spacing:.05em;color:var(--jade);font-size:12px;line-height:1;font-weight:850;margin:0}.hero-grid,.content-section{max-width:1160px;margin:0 auto 22px;padding:0 clamp(18px,4vw,52px)}.hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr);gap:22px;align-items:stretch}.tool-page{max-width:820px;margin:0 auto 22px;padding:0 clamp(18px,4vw,40px)}.tool-page .tool-panel{max-width:720px;margin:0 auto;padding:20px 22px}.tool-strip{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:transparent!important;border:0!important;box-shadow:none!important}.tool-panel,.visual-panel,.content-section:not(.split),.fact-card{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px}.tool-panel{padding:22px;border-top:4px solid var(--red)}.compact-tool{height:auto}.tool-copy h2,.section-heading h2,.content-section h2{font-family:Georgia,serif;font-size:clamp(22px,2.2vw,27px);line-height:1.18;margin:8px 0 10px;color:#241f1a}.tool-page .tool-copy h2{font-size:25px}.tool-copy p{max-width:640px}.content-section p{max-width:820px}.calculator-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:end;margin-top:16px;max-width:560px}.tool-page .calculator-form{max-width:100%}.match-form{grid-template-columns:1fr 1fr;max-width:100%}.match-form button{grid-column:1/-1;width:100%}.calculator-form label{display:grid;gap:7px;font-size:14px;font-weight:750}.calculator-form input,.calculator-form select{height:43px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff;width:100%;min-width:0}.calculator-form button,.button-link{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--red);color:#fff;font-size:14px;font-weight:800;text-decoration:none;padding:0 15px;cursor:pointer;white-space:nowrap}.button-link.secondary{background:#f2eadf;color:#3a3028;border:1px solid #dfd1bd}.calculator-form button:hover,.button-link:hover{background:var(--red-dark);color:#fff}.result-card{margin-top:16px;padding:16px;border-left:4px solid var(--jade);background:#eff7f3;border-radius:8px}.result-card h3{margin:0 0 10px;font-size:20px}.result-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}.result-facts span{background:#fff;border:1px solid #d8e8df;border-radius:8px;padding:10px;color:#3f564f}.result-facts strong{display:block;color:#1f332e;font-size:12px;text-transform:uppercase;letter-spacing:.04em}.result-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.note{color:var(--muted);font-size:14px}.visual-panel{margin:0;display:grid;place-items:center;overflow:hidden;background:#f1eadc}.visual-panel img{width:100%;height:100%;object-fit:cover}.ad-slot{max-width:1056px;margin:0 auto 22px;border:1px dashed #d7c8b5;background:#fffaf1;color:#8a7257;border-radius:8px;min-height:70px;display:grid;place-items:center;font-size:13px;font-weight:750}.section-heading{margin-bottom:14px}.fact-grid,.animal-grid,.step-grid,.element-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.element-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.fact-grid div,.animal-card,.step-grid div,.element-grid div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.step-grid span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#edf5f2;color:var(--jade);font-weight:900;margin-bottom:8px}.step-grid strong,.element-grid strong{display:block;font-size:17px}.step-grid p,.element-grid p{margin:6px 0 0;color:var(--muted);font-size:15px}.fact-grid strong,.fact-grid span{display:block}.fact-grid span,.animal-card span,.animal-card p{color:var(--muted)}.animal-card{text-decoration:none;min-height:168px;display:grid;gap:7px;position:relative}.animal-card:hover{border-color:#d2ad73;box-shadow:0 10px 24px rgba(47,37,23,.08)}.animal-card strong{font-size:20px}.animal-card p{font-size:15px;margin:0}.animal-order{position:absolute;right:14px;top:12px;color:var(--gold);font-weight:900}.split{display:grid;grid-template-columns:1fr 1fr;gap:22px}.split>div{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px;padding:22px}.fact-card{display:grid;gap:8px}.fact-card strong{font-size:20px}.fact-card span{display:block;color:var(--muted)}.table-wrap{overflow:auto}.content-section table{width:100%;border-collapse:collapse;background:#fff;font-size:15px}.content-section th,.content-section td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left}.content-section th{background:#f1eadc;color:#352b22}.pair-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.pair-card{display:grid;gap:5px;text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pair-card:hover{border-color:#d2ad73;box-shadow:0 10px 24px rgba(47,37,23,.08)}.pair-card strong{font-size:16px}.pair-card span{color:var(--jade);font-weight:800}.pair-card small{color:var(--muted)}.score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.score-grid div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.score-grid strong,.score-grid span{display:block}.score-grid span{font-size:22px;font-weight:900;color:var(--red);margin:4px 0}.score-grid p{margin:0;color:var(--muted);font-size:15px}.faq-list details{border-bottom:1px solid var(--line);padding:12px 0}.faq-list summary{font-weight:800;cursor:pointer}.site-footer{margin-top:44px;padding:30px clamp(18px,4vw,52px);background:#24201b;color:#fffaf0;display:flex;justify-content:space-between;gap:28px}.site-footer p{color:#d7cbbd;max-width:680px;font-size:14px}.site-footer nav{display:flex;gap:16px;align-items:start;flex-wrap:wrap}.site-footer a{color:#fffaf0}@media(max-width:980px){.element-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tool-strip{grid-template-columns:1fr}.pair-grid,.score-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){body{font-size:15px}.site-header{align-items:flex-start;flex-direction:column}.nav{justify-content:flex-start;gap:14px}.nav a{font-size:14px}.hero-grid,.split{grid-template-columns:1fr}.tool-page{max-width:100%;padding:0 16px}.tool-page .tool-panel{max-width:100%;padding:18px}.calculator-form,.match-form{grid-template-columns:1fr}.fact-grid,.animal-grid,.step-grid,.element-grid,.result-facts,.pair-grid,.score-grid{grid-template-columns:1fr}.page-hero{padding-top:24px}.page-hero h1{font-size:31px}.intro{font-size:16px}.site-footer{flex-direction:column}}`;
}
