import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

const SITE = {
  name: "Chinese Zodiac Guide",
  url: "https://www.chinesezodiacfinder.com",
  description: "Find your Chinese zodiac sign, zodiac year, animal meaning, and traditional compatibility with a fast cultural reference tool."
};

const animals = JSON.parse(await readFile("data/zodiac-animals.json", "utf8"));
const years = JSON.parse(await readFile("data/zodiac-years.json", "utf8"));
const compatibility = JSON.parse(await readFile("data/compatibility.json", "utf8"));
const animalBySlug = Object.fromEntries(animals.map((animal) => [animal.animal, animal]));

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await copyFile("public/assets/zodiac-wheel.svg", "dist/assets/zodiac-wheel.svg");
await copyFile("public/assets/logo.svg", "dist/assets/logo.svg");
await copyFile("public/google1c43509ea14adc51.html", "dist/google1c43509ea14adc51.html");

const pages = [];

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
  <link rel="stylesheet" href="/styles.css">
  ${schema}
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="${SITE.name} home"><img class="brand-logo" src="/assets/logo.svg" alt="">${SITE.name}</a>
    <nav class="nav" aria-label="Main navigation">
      <a href="/chinese-zodiac-calculator/">Calculator</a>
      <a href="/chinese-zodiac-years/">Years</a>
      <a href="/chinese-zodiac-animals/">Animals</a>
      <a href="/chinese-zodiac-elements/">Elements</a>
      <a href="/chinese-zodiac-compatibility/">Compatibility</a>
      <a href="/year-of-the-horse-2026/">Year of the Horse</a>
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
  <script src="/calculator.js" defer></script>
</body>
</html>`;
}

function adSlot(position) {
  return `<aside class="ad-slot" data-ad-position="${position}">Ad placement reserved for display ads</aside>`;
}

function animalCard(animal) {
  return `<a class="animal-card" href="/chinese-zodiac/${animal.animal}/">
    <span class="animal-order">${animal.order}</span>
    <strong>${animal.name}</strong>
    <span>${animal.chinese} · ${animal.pinyin}</span>
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
      <p class="eyebrow">Compatibility checker</p>
      <h2>Check two zodiac animals</h2>
      <p>This checker gives a traditional cultural interpretation for fun. It is not relationship advice.</p>
    </div>
    <form class="calculator-form" data-compat-form>
      <label>First animal<select name="first">${options}</select></label>
      <label>Second animal<select name="second">${options}</select></label>
      <button type="submit">Check compatibility</button>
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
    ${zodiacCalculatorBlock()}
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
    <section class="content-section">
      <h2>Five elements overview</h2>
      <div class="element-grid">
        <div><strong>Wood</strong><p>Growth, flexibility, and renewal in traditional correspondence systems.</p></div>
        <div><strong>Fire</strong><p>Energy, visibility, warmth, and active expression.</p></div>
        <div><strong>Earth</strong><p>Stability, grounding, patience, and practical support.</p></div>
        <div><strong>Metal</strong><p>Structure, clarity, refinement, and endurance.</p></div>
        <div><strong>Water</strong><p>Adaptability, flow, reflection, and quiet strength.</p></div>
      </div>
    </section>
    <section class="content-section">
      <h2>Recent zodiac element years</h2>
      ${yearsTable(years.slice(-20))}
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
    ${compatibilityBlock()}
    <section class="content-section">
      <h2>Traditional compatibility groups</h2>
      <p>Chinese zodiac compatibility is traditionally explained through animal relationships, element cycles, and cultural symbolism. It should be read as folklore and entertainment.</p>
    </section>
    ${faqBlock(standardFaqs())}`
}));

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
          <span>Yin/Yang: ${animal.yinYang}</span>
        </div>
      </section>
      <section class="content-section">
        <h2>${animal.name} years</h2>
        ${yearsTable(animalYears)}
      </section>
      <section class="content-section">
        <h2>Cultural meaning</h2>
        <p>${animal.meaning}</p>
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

await writePage("/privacy/", simpleLegalPage("Privacy Policy", "This prototype uses privacy-friendly static pages. If analytics or advertising scripts are enabled later, this page should disclose the tools used and how data is processed."));
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
  await writeFile("dist/calculator.js", `const years=${JSON.stringify(years)};const animals=${JSON.stringify(animals)};const compatibility=${JSON.stringify(compatibility)};
const bySlug=Object.fromEntries(animals.map(a=>[a.animal,a]));
function findZodiac(date){const y=date.getUTCFullYear();let row=years.find(x=>x.year===y);if(!row)return null;const boundary=new Date(row.lunarNewYear+'T00:00:00Z');if(date<boundary){row=years.find(x=>x.year===y-1)||row;}return row;}
function resultHtml(row){const a=bySlug[row.animal];return '<h3>Your Chinese zodiac sign is '+a.name+'</h3><p><strong>'+a.chinese+' · '+a.pinyin+'</strong> · '+row.element+' · '+a.yinYang+'</p><p>'+a.summary+'</p><p class="note">Lunar New Year for '+row.year+' began on '+row.lunarNewYear+'. Early-year birthdays may belong to the previous zodiac year.</p><a class="button-link" href="/chinese-zodiac/'+a.animal+'/">Read the '+a.name+' guide</a>'}
document.querySelectorAll('[data-zodiac-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const raw=new FormData(form).get('birthdate');const box=form.parentElement.querySelector('[data-zodiac-result]');if(!raw){return}const row=findZodiac(new Date(raw+'T00:00:00Z'));box.hidden=false;box.innerHTML=row?resultHtml(row):'<h3>Date outside prototype range</h3><p>This prototype currently covers 1970-2035. The production site should cover 1900-2100.</p>';}));
function pairStatus(a,b){const same=a===b;if(same)return ['Same sign','Two people with the same zodiac animal may share similar traditional associations.'];const key=[a,b].join('|');const rev=[b,a].join('|');if(compatibility.best.some(p=>p.join('|')===key||p.join('|')===rev))return ['Traditionally harmonious','This pair is often described as harmonious in traditional zodiac compatibility.'];if(compatibility.challenging.some(p=>p.join('|')===key||p.join('|')===rev))return ['Traditionally challenging','This pair is sometimes described as needing more patience and understanding in traditional zodiac compatibility.'];return ['Balanced or neutral','This pair has a balanced traditional reading. Context and real relationships matter more than zodiac folklore.'];}
document.querySelectorAll('[data-compat-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const first=data.get('first');const second=data.get('second');const box=form.parentElement.querySelector('[data-compat-result]');const [label,text]=pairStatus(first,second);box.hidden=false;box.innerHTML='<h3>'+bySlug[first].name+' + '+bySlug[second].name+': '+label+'</h3><p>'+text+'</p><p class="note">For cultural reference and entertainment only.</p>';}));`, "utf8");
  await writeFile("dist/styles.css", css(), "utf8");
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
  await writePage("/admin/seo-report/", `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SEO Report</title><link rel="stylesheet" href="/styles.css"></head><body><main class="content-section"><h1>SEO Report</h1><p>Prototype build report for title, description, FAQ, and basic page coverage.</p><div class="table-wrap"><table><thead><tr><th>URL</th><th>Title length</th><th>Description length</th><th>FAQ</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table></div></main></body></html>`);
}

function css() {
  return `:root{--ink:#24201b;--muted:#6c665e;--paper:#f8f5ee;--panel:#fffdf8;--line:#e3d9c9;--red:#b3343a;--red-dark:#84272d;--gold:#b99455;--jade:#2f7167;--blue:#31485f;--shadow:0 14px 34px rgba(47,37,23,.09)}*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.62}a{color:inherit}.site-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:28px;padding:14px clamp(18px,4vw,52px);background:rgba(248,245,238,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:17px;font-weight:850;white-space:nowrap}.brand-logo{display:block;width:34px;height:34px;border-radius:8px;box-shadow:0 8px 18px rgba(179,52,58,.18)}.nav{display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}.nav a{text-decoration:none;color:var(--muted);font-size:15px;font-weight:760;line-height:1.2;padding:4px 0}.nav a:hover{color:var(--red)}main{min-height:70vh}.page-hero{padding:38px clamp(18px,4vw,52px) 20px;max-width:1160px;margin:auto}.page-hero h1{font-family:Georgia,serif;font-size:clamp(34px,4.4vw,54px);line-height:1.08;margin:10px 0 14px;letter-spacing:0;color:#211b17}.intro{font-size:17px;max-width:760px;color:var(--muted)}.eyebrow{display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border-radius:999px;background:rgba(47,113,103,.08);border:1px solid rgba(47,113,103,.18);text-transform:uppercase;letter-spacing:.05em;color:var(--jade);font-size:13px;line-height:1;font-weight:850;margin:0}.hero-grid,.content-section{max-width:1160px;margin:0 auto 24px;padding:0 clamp(18px,4vw,52px)}.hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr);gap:24px;align-items:stretch}.tool-panel,.visual-panel,.content-section:not(.split),.fact-card{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px}.tool-panel{padding:24px;border-top:4px solid var(--red)}.tool-copy h2,.section-heading h2,.content-section h2{font-family:Georgia,serif;font-size:clamp(25px,2.7vw,30px);line-height:1.18;margin:8px 0 12px;color:#241f1a}.calculator-form{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:end;margin-top:18px}.calculator-form label{display:grid;gap:7px;font-size:15px;font-weight:750}.calculator-form input,.calculator-form select{height:44px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff}.calculator-form button,.button-link{height:44px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--red);color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:0 16px;cursor:pointer}.calculator-form button:hover,.button-link:hover{background:var(--red-dark)}.result-card{margin-top:18px;padding:16px;border-left:4px solid var(--jade);background:#eff7f3;border-radius:8px}.result-card h3{margin:0 0 6px;font-size:21px}.note{color:var(--muted);font-size:14px}.visual-panel{margin:0;display:grid;place-items:center;overflow:hidden;background:#f1eadc}.visual-panel img{width:100%;height:100%;object-fit:cover}.ad-slot{max-width:1056px;margin:0 auto 24px;border:1px dashed #d2c3ae;background:#fff9ee;color:#8a7257;border-radius:8px;min-height:78px;display:grid;place-items:center;font-size:14px;font-weight:750}.section-heading{margin-bottom:16px}.fact-grid,.animal-grid,.step-grid,.element-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.element-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.fact-grid div,.animal-card,.step-grid div,.element-grid div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.step-grid span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#edf5f2;color:var(--jade);font-weight:900;margin-bottom:8px}.step-grid strong,.element-grid strong{display:block;font-size:18px}.step-grid p,.element-grid p{margin:6px 0 0;color:var(--muted);font-size:15px}.fact-grid strong,.fact-grid span{display:block}.fact-grid span,.animal-card span,.animal-card p{color:var(--muted)}.animal-card{text-decoration:none;min-height:166px;display:grid;gap:7px;position:relative}.animal-card:hover{border-color:#d2ad73;box-shadow:0 10px 24px rgba(47,37,23,.08)}.animal-card strong{font-size:21px}.animal-card p{font-size:15px;margin:0}.animal-order{position:absolute;right:14px;top:12px;color:var(--gold);font-weight:900}.split{display:grid;grid-template-columns:1fr 1fr;gap:22px}.split>div{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px;padding:22px}.fact-card{display:grid;gap:8px}.fact-card strong{font-size:20px}.fact-card span{display:block;color:var(--muted)}.table-wrap{overflow:auto}.content-section table{width:100%;border-collapse:collapse;background:#fff;font-size:15px}.content-section th,.content-section td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left}.content-section th{background:#f1eadc;color:#352b22}.faq-list details{border-bottom:1px solid var(--line);padding:12px 0}.faq-list summary{font-weight:800;cursor:pointer}.site-footer{margin-top:48px;padding:30px clamp(18px,4vw,52px);background:#24201b;color:#fffaf0;display:flex;justify-content:space-between;gap:28px}.site-footer p{color:#d7cbbd;max-width:680px;font-size:14px}.site-footer nav{display:flex;gap:16px;align-items:start;flex-wrap:wrap}.site-footer a{color:#fffaf0}@media(max-width:980px){.element-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){body{font-size:15px}.site-header{align-items:flex-start;flex-direction:column}.nav{justify-content:flex-start;gap:14px}.nav a{font-size:14px}.hero-grid,.split{grid-template-columns:1fr}.calculator-form{grid-template-columns:1fr}.fact-grid,.animal-grid,.step-grid,.element-grid{grid-template-columns:1fr}.page-hero{padding-top:32px}.page-hero h1{font-size:34px}.intro{font-size:16px}.site-footer{flex-direction:column}}`;
}
