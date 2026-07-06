import { mkdir, readFile, rm, writeFile, copyFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE = {
  name: "Chinese Zodiac Guide",
  url: "https://www.chinesezodiacfinder.com",
  description: "Find your Chinese zodiac sign, zodiac year, animal meaning, and traditional compatibility with a fast cultural reference tool.",
  assetVersion: "20260628-01"
};
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || "G-VB9E7T2VCF";

const animals = JSON.parse(await readFile("data/zodiac-animals.json", "utf8"));
const seedYears = JSON.parse(await readFile("data/zodiac-years.json", "utf8"));
const years = buildZodiacYears(1900, 2100, seedYears);
const compatibility = JSON.parse(await readFile("data/compatibility.json", "utf8"));
const animalBySlug = Object.fromEntries(animals.map((animal) => [animal.animal, animal]));
const animalVisuals = {
  rat: { mark: "鼠", accent: "#b63b45", soft: "#fff0f0" },
  ox: { mark: "牛", accent: "#9a6734", soft: "#fff4e7" },
  tiger: { mark: "虎", accent: "#c05d2b", soft: "#fff2e8" },
  rabbit: { mark: "兔", accent: "#b84c75", soft: "#fff0f6" },
  dragon: { mark: "龙", accent: "#b58a21", soft: "#fff7d8" },
  snake: { mark: "蛇", accent: "#5f7c3c", soft: "#f1f7e7" },
  horse: { mark: "马", accent: "#ba4d2d", soft: "#fff0e7" },
  goat: { mark: "羊", accent: "#8f6a3c", soft: "#fbf3e6" },
  monkey: { mark: "猴", accent: "#b77723", soft: "#fff5df" },
  rooster: { mark: "鸡", accent: "#9d3d63", soft: "#fff0f5" },
  dog: { mark: "狗", accent: "#586e9d", soft: "#eef3ff" },
  pig: { mark: "猪", accent: "#a45a74", soft: "#fff1f5" }
};
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
for (const asset of await readdir("public/assets")) {
  await copyFile(join("public/assets", asset), join("dist/assets", asset));
}
await copyFile("public/google1c43509ea14adc51.html", "dist/google1c43509ea14adc51.html");
await copyFile("public/_headers", "dist/_headers");

const pages = [];
const guides = [
  {
    title: "What Chinese Zodiac Sign Am I?",
    path: "/guides/what-chinese-zodiac-sign-am-i/",
    category: "Calculator Guides",
    description: "Learn how to find your Chinese zodiac sign by birth date and Lunar New Year boundary."
  },
  {
    title: "Fire Horse Chinese Zodiac",
    path: "/guides/fire-horse-zodiac/",
    category: "Element Guides",
    description: "Fire Horse years, 2026 context, traditional meaning, personality associations, and Lunar New Year boundaries."
  },
  {
    title: "Fire Rat Chinese Zodiac",
    path: "/guides/fire-rat-chinese-zodiac/",
    category: "Element Guides",
    description: "Fire Rat years, traditional meaning, personality associations, and how the Fire element changes the Rat reading."
  },
  {
    title: "Earth Tiger Chinese Zodiac",
    path: "/guides/chinese-zodiac-earth-tiger/",
    category: "Element Guides",
    description: "Earth Tiger years, traditional meaning, personality associations, and how the Earth element changes the Tiger reading."
  },
  {
    title: "Fire Rabbit Chinese Zodiac",
    path: "/guides/chinese-zodiac-fire-rabbit/",
    category: "Element Guides",
    description: "Fire Rabbit years, traditional meaning, personality associations, and how the Fire element changes the Rabbit reading."
  },
  {
    title: "Water Dragon Chinese Zodiac",
    path: "/guides/chinese-zodiac-water-dragon/",
    category: "Element Guides",
    description: "Water Dragon years, traditional meaning, personality associations, and how the Water element changes the Dragon reading."
  },
  {
    title: "Water Horse Chinese Zodiac",
    path: "/guides/chinese-zodiac-water-horse/",
    category: "Element Guides",
    description: "Water Horse years, traditional meaning, personality associations, and how the Water element changes the Horse reading."
  },
  {
    title: "Fire Dragon Chinese Zodiac",
    path: "/guides/fire-dragon-chinese-zodiac/",
    category: "Element Guides",
    description: "Fire Dragon years, traditional meaning, personality associations, and how the Fire element changes the Dragon reading."
  },
  {
    title: "Metal Horse Chinese Zodiac",
    path: "/guides/chinese-zodiac-metal-horse/",
    category: "Element Guides",
    description: "Metal Horse years, traditional meaning, personality associations, and how the Metal element changes the Horse reading."
  },
  {
    title: "Metal Snake Chinese Zodiac",
    path: "/guides/chinese-zodiac-metal-snake/",
    category: "Element Guides",
    description: "Metal Snake years, traditional meaning, personality associations, and how the Metal element changes the Snake reading."
  },
  {
    title: "1988 Year of the Chinese Zodiac",
    path: "/guides/1988-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "Learn the 1988 Chinese zodiac sign, Earth Dragon meaning, Lunar New Year start date, and date-boundary checks."
  },
  {
    title: "1990 Year of the Chinese Zodiac",
    path: "/guides/1990-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1990 Chinese zodiac sign, Metal Horse meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "1989 Year of the Chinese Zodiac",
    path: "/guides/1989-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1989 Chinese zodiac sign, Earth Snake meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "1996 Year of the Chinese Zodiac",
    path: "/guides/1996-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1996 Chinese zodiac sign, Fire Rat meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "1997 Year of the Chinese Zodiac",
    path: "/guides/1997-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1997 Chinese zodiac sign, Fire Ox meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "1998 Year of the Chinese Zodiac",
    path: "/guides/1998-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1998 Chinese zodiac sign, Earth Tiger meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "1999 Year of the Chinese Zodiac",
    path: "/guides/1999-year-of-the-chinese-zodiac/",
    category: "Year Guides",
    description: "1999 Chinese zodiac sign, Earth Rabbit meaning, Lunar New Year boundary, and related lookup notes."
  },
  {
    title: "Chinese Birth Signs by Birthday",
    path: "/guides/chinese-birth-signs/",
    category: "Calculator Guides",
    description: "Learn how Chinese birth signs work by birthday and why Lunar New Year matters for January and February births."
  },
  {
    title: "Dragon Chinese Zodiac: Years and Meaning",
    path: "/guides/dragon-chinese-zodiac/",
    category: "Animal Guides",
    description: "A full article-style guide to Dragon years, meaning, personality associations, and cultural notes."
  },
  {
    title: "Horse Chinese Zodiac: Years and Meaning",
    path: "/guides/horse-chinese-zodiac/",
    category: "Animal Guides",
    description: "A full article-style guide to Horse years, meaning, personality associations, and Lunar New Year boundaries."
  },
  {
    title: "Year of the Horse 2026",
    path: "/year-of-the-horse-2026/",
    category: "Year Guides",
    description: "Dates, Fire element, and traditional meaning for the 2026 Horse year."
  },
  {
    title: "Chinese Zodiac Years Chart",
    path: "/chinese-zodiac-years/",
    category: "Year Guides",
    description: "Browse zodiac years, animals, elements, and Lunar New Year start dates."
  },
  {
    title: "Chinese Zodiac Animals in Order",
    path: "/chinese-zodiac-animals/",
    category: "Animal Guides",
    description: "Learn the twelve animals in order with short cultural meanings."
  },
  {
    title: "Chinese Zodiac Elements",
    path: "/chinese-zodiac-elements/",
    category: "Element Guides",
    description: "Understand Wood, Fire, Earth, Metal, and Water in zodiac years."
  },
  {
    title: "Chinese Zodiac Compatibility",
    path: "/chinese-zodiac-compatibility/",
    category: "Compatibility Guides",
    description: "Start with pair matching and traditional compatibility notes."
  },
  {
    title: "Horse Chinese Zodiac",
    path: "/chinese-zodiac/horse/",
    category: "Animal Guides",
    description: "Horse years, meaning, personality associations, and cultural notes."
  },

  { title: 'Chinese Zodiac Compatibility Chart', path: '/guides/chinese-zodiac-compatibility-chart/', category: 'Compatibility Guides', description: 'Read animal matches with responsible limits.' },
  { title: 'Chinese Zodiac Lucky Colors', path: '/guides/chinese-zodiac-lucky-colors/', category: 'Meaning Guides', description: 'Use zodiac colors for gifts and decor responsibly.' },
  { title: '2003 Year of the Chinese Zodiac', path: '/guides/2003-year-of-the-chinese-zodiac/', category: 'Year Guides', description: 'Understand the 2003 Goat year and date boundaries.' },
];

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

function animalTraits(animal) {
  const profiles = {
    rat: {
      strength: "quick adjustment, practical observation, and the ability to find an opening when a situation changes",
      caution: "overthinking, impatience with slower rhythms, or reading too much into small signals",
      work: "planning, research, communication, trade, and roles that reward fast comparison",
      relationship: "clear expectations and honest timing help the Rat feel secure without becoming overly strategic"
    },
    ox: {
      strength: "steady effort, patience, dependability, and the willingness to build slowly",
      caution: "stubbornness, delayed emotional expression, or resistance to sudden change",
      work: "operations, finance, farming symbolism, quality control, and long-term responsibilities",
      relationship: "consistent routines and visible reliability usually matter more than dramatic gestures"
    },
    tiger: {
      strength: "courage, protection, direct action, and strong personal presence",
      caution: "restlessness, pride, or acting before the other side has time to respond",
      work: "leadership, advocacy, sales, public-facing roles, and projects that need momentum",
      relationship: "respect for independence is important, but warmth needs to be shown in practical ways"
    },
    rabbit: {
      strength: "diplomacy, sensitivity, aesthetic judgment, and calm social awareness",
      caution: "avoidance of hard conversations, indirect communication, or too much concern with atmosphere",
      work: "design, education, hospitality, writing, coordination, and roles that require tact",
      relationship: "gentle communication works well, but important decisions should not be postponed forever"
    },
    dragon: {
      strength: "confidence, ambition, visibility, and the ability to inspire attention",
      caution: "dominance, impatience with ordinary details, or expecting others to match the same intensity",
      work: "branding, leadership, entrepreneurship, public projects, and high-visibility initiatives",
      relationship: "admiration helps, but the relationship also needs humility, listening, and shared responsibility"
    },
    snake: {
      strength: "insight, patience, strategy, and quiet evaluation before acting",
      caution: "secrecy, suspicion, or keeping too much analysis private",
      work: "research, planning, finance, design, negotiation, and work that rewards careful timing",
      relationship: "trust grows when intentions are explained clearly instead of leaving the other side guessing"
    },
    horse: {
      strength: "movement, independence, optimism, and social energy",
      caution: "restlessness, inconsistency, or leaving practical follow-through to others",
      work: "travel, media, events, sales, teaching, and work that benefits from momentum",
      relationship: "space and movement matter, but promises need follow-through to feel reliable"
    },
    goat: {
      strength: "harmony, imagination, kindness, and appreciation for comfort and beauty",
      caution: "hesitation, sensitivity to criticism, or depending too much on the mood of the group",
      work: "creative direction, care work, interiors, craft, education, and support roles",
      relationship: "emotional safety is important, but practical decisions still need clear timing"
    },
    monkey: {
      strength: "curiosity, invention, humor, and flexible problem-solving",
      caution: "distraction, teasing at the wrong time, or changing plans too quickly",
      work: "technology, marketing, research, entertainment, teaching, and experimental projects",
      relationship: "mental stimulation helps, but trust depends on consistency as much as cleverness"
    },
    rooster: {
      strength: "organization, precision, alertness, and the desire to do things properly",
      caution: "criticism, perfectionism, or focusing on details before feelings are settled",
      work: "administration, editing, design review, operations, scheduling, and quality standards",
      relationship: "directness can be useful when it is balanced with appreciation and patience"
    },
    dog: {
      strength: "loyalty, fairness, protection, and moral steadiness",
      caution: "worry, defensiveness, or testing whether people are trustworthy for too long",
      work: "service, law, safety, education, community work, and roles that require responsibility",
      relationship: "trust and fairness matter most, and reassurance should be practical rather than vague"
    },
    pig: {
      strength: "warmth, generosity, patience, and enjoyment of family or social comfort",
      caution: "overgiving, avoiding conflict, or expecting goodwill to solve practical problems",
      work: "hospitality, food, care, community roles, lifestyle products, and steady client relationships",
      relationship: "kindness is the base, but boundaries and shared plans keep the connection balanced"
    }
  };
  return profiles[animal.animal];
}

function compatibilityNarrative(pair, firstAnimal, secondAnimal) {
  const first = animalTraits(firstAnimal);
  const second = animalTraits(secondAnimal);
  const tone = pair.score >= 80
    ? "This is one of the easier traditional readings, so the page should explain why the symbols are said to support each other rather than only showing a high score."
    : pair.score >= 60
      ? "This is a mixed or balanced reading, which means the practical details matter more than a single score."
      : "This is a challenging traditional reading, but it should not be treated as a warning or a fixed outcome.";
  return `
      <section class="content-section article-body">
        <h2>What the ${firstAnimal.name} and ${secondAnimal.name} match means</h2>
        <p>${tone} The ${firstAnimal.name} side brings ${first.strength}. The ${secondAnimal.name} side brings ${second.strength}. In a compatibility reading, the useful question is whether those traits create a natural rhythm or whether they ask both people to slow down and translate their expectations.</p>
        <p>For love, this pair works best when symbolic attraction is supported by ordinary habits: listening, timing, respect, and follow-through. A high score does not replace communication, and a lower score does not mean a relationship cannot work. The zodiac language simply gives a cultural vocabulary for discussing pace, temperament, and likely friction.</p>
        <p>For friendship, compare how both signs handle trust and shared activity. ${firstAnimal.name} energy may be shaped by ${first.caution}. ${secondAnimal.name} energy may be shaped by ${second.caution}. When those patterns are named clearly, the friendship has a better chance of staying warm instead of turning small differences into repeated misunderstandings.</p>
      </section>
      <section class="content-section article-body">
        <h2>Strengths, friction points, and practical advice</h2>
        <p>The strongest side of this match is the chance to combine ${firstAnimal.name} qualities such as ${first.strength} with ${secondAnimal.name} qualities such as ${second.strength}. That can be helpful in daily life when both people recognize the other's style instead of assuming that one rhythm is automatically better.</p>
        <p>The main friction point is the contrast between ${first.caution} and ${second.caution}. In real relationships, this can appear as different speeds, different comfort zones, or different ways of showing care. The practical solution is to make expectations visible: what needs quick action, what needs patience, and what should not be decided only in an emotional moment.</p>
        <p>For work or collaboration, ${firstAnimal.name} symbolism connects well with ${first.work}, while ${secondAnimal.name} symbolism connects well with ${second.work}. A good partnership defines roles early. One person may be better at momentum, another at review, support, planning, or social connection. The score becomes more useful when it points to role clarity instead of vague fortune-telling.</p>
        <p>Read this page as cultural interpretation and entertainment. It is useful for learning Chinese zodiac symbolism, comparing traditional relationship language, and understanding why certain pairs are described as smooth or difficult. It should not be used as the only basis for dating, marriage, hiring, investment, health, or any serious personal decision.</p>
        <p>When comparing this pair with another match, do not look only at the overall score. Check the love, friendship, and work dimensions separately. Some pairs are easier socially but need clearer work roles. Some pairs may feel intense in love but work better when both people protect personal space. This dimensional reading makes the page more useful than a simple ranking table.</p>
        <p>If the two signs belong to people with birthdays near January or February, confirm both signs with the calculator before reading the match. A wrong animal label creates a wrong compatibility page. The most reliable path is full birth date first, animal confirmation second, and compatibility interpretation third.</p>
      </section>
      <section class="content-section article-body">
        <h2>How this pair fits into the wider zodiac system</h2>
        <p>${firstAnimal.name} and ${secondAnimal.name} compatibility is part of a larger symbolic system that includes animal order, five elements, Lunar New Year boundaries, and the 60-year cycle. The pair page focuses on animal relationship language, but the full reading can change in tone when the exact birth year and element are considered.</p>
        <p>For example, two people may share the same animal signs but belong to different element years. One ${firstAnimal.name} may be a Wood, Fire, Earth, Metal, or Water ${firstAnimal.name}, and the same is true for ${secondAnimal.name}. The element does not erase the animal match, but it can add language about pace, communication style, or emotional tone.</p>
        <p>The most responsible use of this page is as a starting point. Open each animal guide to understand the basic symbolism, then use the year chart if the exact birth year matters. If the question is only casual curiosity, the quick score is enough. If the question is about a real relationship, friendship, or work partnership, treat the zodiac reading as conversation material rather than a decision rule.</p>
      </section>`;
}

function yearReferenceNarrative(item, animal) {
  const traits = animalTraits(animal);
  const element = elementInfo[item.element];
  return `
      <section class="content-section article-body">
        <h2>How to read the ${item.year} ${animal.name} year</h2>
        <p>The first rule is calendar accuracy. ${item.year} is a ${item.element} ${animal.name} year only after Lunar New Year begins on ${item.lunarNewYear}. A birthday before that date still belongs to the previous zodiac year. This is why a proper zodiac year page should always show the Lunar New Year boundary instead of using January 1 as the start.</p>
        <p>The second rule is interpretation. The ${animal.name} animal is traditionally associated with ${traits.strength}. The ${item.element} element adds themes of ${element.keywords}. Together, the page describes a cultural label in the 60-year cycle, not a scientific personality category or a prediction about what will happen in the year.</p>
        <p>For readers checking a birth year, the safest workflow is to confirm the exact birthday, compare it with the Lunar New Year date, then open the ${animal.name} animal guide and the elements guide for context. For readers checking annual meaning, the page can explain cultural language, seasonal content, and common search questions without turning symbolism into advice.</p>
      </section>
      <section class="content-section article-body">
        <h2>Common mistakes with ${item.year} zodiac lookup</h2>
        <p>The most common mistake is assigning every person born in ${item.year} to the ${animal.name}. That is wrong for January and early February birthdays before ${item.lunarNewYear}. Another mistake is ignoring the element. A ${item.element} ${animal.name} year shares the same animal with other ${animal.name} years, but the element gives a second layer of traditional wording.</p>
        <p>A third mistake is treating lucky colors, numbers, personality notes, or compatibility comments as fixed rules. On this site, those details are presented as cultural references. They can help explain how Chinese zodiac language works, but they are not professional guidance for relationships, business, health, or money.</p>
        <p>Use the related links to move from broad year lookup into more specific pages. The animal page explains the recurring 12-year sign. The year chart compares nearby years. The compatibility page explains relationship symbolism. This internal path gives readers a complete answer instead of leaving them with a short label.</p>
        <p>If the reader is checking a child, family member, partner, or historical figure, the same method applies. Record the full date first, compare it with Lunar New Year, then read the animal and element. A year page is strongest when it answers both the quick question and the boundary question, because those are the two points that most often cause wrong zodiac answers.</p>
        <p>For content planning or seasonal pages, ${item.year} can be described as a ${item.element} ${animal.name} year, but the article should still mention the actual start date. This keeps the page useful for searchers who want a short cultural answer and for readers who need an accurate birthday lookup.</p>
      </section>
      <section class="content-section article-body">
        <h2>${item.year} next steps and related checks</h2>
        <p>After confirming that ${item.year} is a ${item.element} ${animal.name} year, the next useful step depends on the reader's intent. If the question is personal birth-year lookup, use the calculator with the full birth date. If the question is cultural meaning, open the ${animal.name} animal page and the elements guide. If the question is a relationship comparison, confirm both people's signs before using compatibility pages.</p>
        <p>For quick reference, remember the order: date boundary first, animal second, element third, interpretation last. This prevents the page from becoming a thin answer and gives readers a reliable path through the site. It also makes the year guide useful for education, family questions, content planning, and cultural curiosity without presenting zodiac symbolism as professional advice.</p>
        <p>The ${item.element} ${animal.name} label is strongest when it is connected to verifiable details: the Gregorian year, the Lunar New Year start date, the animal order, and the five-element cycle. Those facts give the page a stable base, while personality, luck, and compatibility notes remain clearly marked as traditional symbolism.</p>
        <p>For quick sharing, cite the complete label as ${item.year} ${item.element} ${animal.name}, then add the start date, element, animal, and early-birthday exception. That small habit prevents the most common misunderstanding and makes the answer useful even outside this page for quick reference checks, classroom notes, family questions, and cultural planning.</p>
      </section>`;
}

function animalReferenceNarrative(animal) {
  const traits = animalTraits(animal);
  return `
      <section class="content-section article-body">
        <h2>${animal.name} personality and practical interpretation</h2>
        <p>Traditional ${animal.name} symbolism emphasizes ${traits.strength}. This makes the sign useful as cultural vocabulary: it gives readers a way to understand how Chinese zodiac texts describe temperament, timing, and social style. It should not be used as a fixed personality test, because real people are shaped by family, education, choices, environment, and experience.</p>
        <p>The positive side of the ${animal.name} sign is clearest when its strengths are used with awareness. In work or study, the sign is often connected with ${traits.work}. In relationships, ${traits.relationship}. These notes are practical interpretations of symbolism, not claims that every person born in a ${animal.name} year behaves the same way.</p>
        <p>The caution side is also important. ${animal.name} symbolism can point to ${traits.caution}. A useful zodiac page should name that risk carefully because it helps readers understand the sign with balance. The goal is not to flatter the sign or make it sound unlucky; the goal is to explain both the appealing qualities and the habits that may need attention.</p>
      </section>
      <section class="content-section article-body">
        <h2>How the ${animal.name} connects with years, elements, and compatibility</h2>
        <p>The ${animal.name} repeats every 12 years, but the complete zodiac label also includes one of the five elements. That means a Wood ${animal.name}, Fire ${animal.name}, Earth ${animal.name}, Metal ${animal.name}, and Water ${animal.name} share the same animal base while using different element language. For accurate reference, always check the year table and the Lunar New Year start date.</p>
        <p>Compatibility should be read in the same careful way. A pair page can explain traditional harmony or challenge, but it should not decide whether two people belong together. Real compatibility depends on communication, values, habits, timing, and mutual respect. The zodiac gives a cultural framework for comparison, not a final verdict.</p>
        <p>If you are using this page for learning Chinese culture, start with the Chinese character, pinyin, order in the cycle, and year table. If you are using it for a birthday, use the calculator first. If you are using it for relationship symbolism, open the compatibility checker after confirming both signs. That sequence prevents the most common lookup errors.</p>
      </section>`;
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

function pageLayout({ title, description, path, h1, intro, body, faqs = [], pageType = "WebPage", extraSchema = "", articleSidebar = false }) {
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
  ${analyticsSnippet()}
  ${schema}
</head>
<body class="${pageClass(path)}">
  <header class="site-header">
    <a class="brand" href="/" aria-label="${SITE.name} home"><img class="brand-logo" src="/assets/logo.svg" alt="${SITE.name} logo">${SITE.name}</a>
    <nav class="nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/chinese-zodiac-calculator/">Calculator</a>
      <a href="/chinese-zodiac-years/">Year Chart</a>
      <a href="/chinese-zodiac-animals/">Animals</a>
      <a href="/guides/">Guides</a>
      <a href="/chinese-zodiac-elements/">Five Elements</a>
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
    ${articleSidebar ? articleLayout(body) : body}
  </main>
  <footer class="site-footer">
    <div class="footer-about">
      <strong>${SITE.name}</strong>
      <p>This site explains Chinese zodiac traditions for cultural and entertainment purposes. It does not provide professional, financial, relationship, or life advice.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      <div>
        <span>Tools</span>
        <a href="/chinese-zodiac-calculator/">Calculator</a>
        <a href="/chinese-zodiac-compatibility/">Zodiac Match</a>
        <a href="/chinese-zodiac-elements/">Five Elements</a>
      </div>
      <div>
        <span>Guides</span>
        <a href="/chinese-zodiac-years/">Year Chart</a>
        <a href="/chinese-zodiac-animals/">Animals</a>
        <a href="/chinese-zodiac-faq/">FAQ</a>
      </div>
      <div>
        <span>Site</span>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
      </div>
    </nav>
  </footer>
  <script src="/calculator.js?v=${SITE.assetVersion}" defer></script>
</body>
</html>`;
}

function analyticsSnippet() {
  if (!GA_MEASUREMENT_ID) return "";
  const id = escapeHtml(GA_MEASUREMENT_ID);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  </script>`;
}

function adSlot(position) {
  return `<aside class="ad-slot" data-ad-position="${position}" aria-label="Advertisement area">Advertisement</aside>`;
}

function pageClass(path) {
  if (path === "/") return "page-home";
  return `page-${path.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

function animalCard(animal) {
  const visual = animalVisuals[animal.animal];
  return `<a class="animal-card" href="/chinese-zodiac/${animal.animal}/">
    <span class="animal-seal" style="--animal-accent:${visual.accent};--animal-soft:${visual.soft};">${visual.mark}</span>
    <span class="animal-order">${animal.order}</span>
    <strong>${animal.name}</strong>
    <span>${animal.chinese} &middot; ${animal.pinyin} &middot; ${animal.alsoKnownAs}</span>
    <p>${animal.summary}</p>
  </a>`;
}

function animalSeal(slug, label = "") {
  const visual = animalVisuals[slug];
  const animal = animalBySlug[slug];
  return `<span class="mini-seal" style="--animal-accent:${visual.accent};--animal-soft:${visual.soft};" aria-label="${escapeHtml(label || animal.name)}">${visual.mark}</span>`;
}

function zodiacHeroWheel() {
  return `<div class="zodiac-wheel-stage" aria-label="Animated Chinese zodiac wheel">
    <div class="zodiac-orbit">
      ${animals.map((animal, index) => {
        const visual = animalVisuals[animal.animal];
        return `<a class="zodiac-orbit-item" style="--i:${index};--animal-accent:${visual.accent};--animal-soft:${visual.soft};" href="/chinese-zodiac/${animal.animal}/">
          <span>${visual.mark}</span><small>${animal.name}</small>
        </a>`;
      }).join("")}
    </div>
    <div class="zodiac-wheel-core">
      <strong>十二生肖</strong>
      <span>Chinese Zodiac</span>
    </div>
  </div>`;
}

function guideCard(guide) {
  return `<a class="guide-card" href="${guide.path}" data-guide-card data-guide-category="${slugify(guide.category)}">
    <span>${escapeHtml(guide.category)}</span>
    <strong>${escapeHtml(guide.title)}</strong>
    <p>${escapeHtml(guide.description)}</p>
  </a>`;
}

function articleFigure({ src, alt, title, text }) {
  return `<figure class="content-section article-figure">
    <img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">
    <figcaption>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </figcaption>
  </figure>`;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function latestGuidesBlock(items = guides.slice(0, 6)) {
  return `<section class="content-section latest-guides">
    <div class="section-heading">
      <p class="eyebrow">Latest Guides</p>
      <h2>Latest Chinese zodiac guides</h2>
    </div>
    <div class="guide-grid">${items.map(guideCard).join("")}</div>
    <div class="section-action"><a class="button-link secondary" href="/guides/">Browse all guides</a></div>
  </section>`;
}

function guideFilterBlock() {
  const categories = ["Calculator Guides", "Element Guides", "Animal Guides", "Year Guides", "Compatibility Guides"];
  const buttons = [
    `<button type="button" class="is-active" data-guide-filter="all">All</button>`,
    ...categories.map((category) => `<button type="button" data-guide-filter="${slugify(category)}">${escapeHtml(category.replace(" Guides", ""))}</button>`)
  ].join("");
  return `<nav class="guide-filter-nav" aria-label="Filter guides by category">${buttons}</nav>`;
}

function articleLayout(body) {
  return `<div class="article-shell">
    <div class="article-main">${body}</div>
    ${articleSidebarBlock()}
  </div>`;
}

function articleSidebarBlock() {
  const items = [
    guides.find((guide) => guide.path === "/guides/what-chinese-zodiac-sign-am-i/"),
    guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
    guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
    guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/")
  ].filter(Boolean);
  return `<aside class="article-sidebar" aria-label="Related guides">
    <section class="sidebar-card">
      <p class="eyebrow">Popular Guides</p>
      <h2>Continue reading</h2>
      <div class="sidebar-link-list">${items.map((item) => `<a href="${item.path}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </a>`).join("")}</div>
    </section>
    <section class="sidebar-card compact">
      <p class="eyebrow">Tools</p>
      <a class="button-link" href="/chinese-zodiac-calculator/">Calculator</a>
      <a class="button-link secondary" href="/chinese-zodiac-compatibility/">Zodiac Match</a>
    </section>
  </aside>`;
}

function yearCardsBlock(title = "Recent and upcoming zodiac years", items = years.filter((row) => row.year >= 2024 && row.year <= 2030)) {
  return `<section class="content-section year-links">
    <div class="section-heading">
      <p class="eyebrow">Year Guides</p>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="year-link-grid">${items.map((item) => {
      const animal = animalBySlug[item.animal];
      return `<a class="year-link-card" href="/chinese-zodiac/${item.year}/">
        <strong>${item.year}</strong>
        <span>Year of the ${animal.name}</span>
        <small>${item.element} &middot; starts ${item.lunarNewYear}</small>
      </a>`;
    }).join("")}</div>
  </section>`;
}

function relatedGuidesBlock(title, items) {
  return `<section class="content-section related-guides">
    <div class="section-heading">
      <p class="eyebrow">Related Guides</p>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="guide-grid compact">${items.map(guideCard).join("")}</div>
  </section>`;
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
    <form class="calculator-form birthdate-form" data-zodiac-form>
      <label>Birth year
        <input type="text" name="birthYear" inputmode="numeric" pattern="[0-9]*" placeholder="1990" required>
      </label>
      <label>Month
        <input type="text" name="birthMonth" inputmode="numeric" pattern="[0-9]*" placeholder="06" required>
      </label>
      <label>Day
        <input type="text" name="birthDay" inputmode="numeric" pattern="[0-9]*" placeholder="15" required>
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

function elementAnimalArticle({
  path,
  title,
  description,
  h1,
  intro,
  animalSlug,
  elementName,
  yearsRange,
  primaryKeyword,
  supportingKeywords,
  faqs,
  image
}) {
  const animal = animalBySlug[animalSlug];
  const rows = years.filter((row) => row.animal === animalSlug && row.element === elementName && row.year >= yearsRange[0] && row.year <= yearsRange[1]);
  const yearText = rows.map((row) => row.year).join(", ");
  const element = elementInfo[elementName];
  return writePage(path, pageLayout({
    title,
    description,
    path,
    h1,
    intro,
    faqs,
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
      <section class="content-section article-body">
        <p class="lead-answer">${primaryKeyword} refers to a ${animal.name} zodiac year paired with the ${elementName} element in the 60-year Chinese zodiac cycle. Modern ${elementName} ${animal.name} years include ${yearText}. Always check the Lunar New Year start date before assigning the sign, because Chinese zodiac years do not begin on January 1.</p>
        <p>This guide explains the animal, the element, recent years, personality associations, compatibility notes, and common lookup mistakes. It is written as a cultural reference, not fortune-telling or personal advice.</p>
      </section>
      ${articleFigure(image)}
      <section class="content-section split">
        <div>
          <p class="eyebrow">Short Answer</p>
          <h2>What does ${elementName} ${animal.name} mean?</h2>
          <p>${elementName} ${animal.name} combines the ${animal.name} animal with the ${elementName} element. The ${animal.name} is traditionally associated with ${animal.summary.replace(/^The [A-Za-z]+ is traditionally associated with /, "").replace(/\.$/, "")}. The ${elementName} element adds the theme of ${element.keywords}. Read this as symbolism, not as a fixed personality result.</p>
        </div>
        <div class="fact-card">
          <strong>${elementName} ${animal.name} facts</strong>
          <span>Animal: ${animal.name}</span>
          <span>Element: ${elementName}</span>
          <span>Recent years: ${yearText}</span>
          <span>Cycle: 60-year zodiac cycle</span>
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <p class="eyebrow">Years</p>
          <h2>${elementName} ${animal.name} years and Lunar New Year dates</h2>
        </div>
        <p>The Chinese zodiac combines a 12-animal cycle with a 5-element cycle. Because each element appears with each animal once every 60 years, ${elementName} ${animal.name} years are separated by six decades.</p>
        ${yearsTable(rows)}
        <p>If a birthday falls before Lunar New Year in one of these Gregorian years, the person still belongs to the previous zodiac year. This boundary is the most important detail for accurate zodiac lookup.</p>
      </section>
      <section class="content-section">
        <h2>${elementName} ${animal.name} personality associations</h2>
        <p>Traditional personality descriptions combine the animal image with the element image. For ${elementName} ${animal.name}, common cultural associations include:</p>
        <ul class="article-list">
          <li>The ${animal.name} side: ${animal.personality}</li>
          <li>The ${elementName} side: ${element.meaning}</li>
          <li>A combined reading that emphasizes how ${elementName.toLowerCase()} qualities shape the ${animal.name} animal's traditional style.</li>
          <li>A practical reminder that zodiac traits are cultural descriptions, not scientific personality tests.</li>
        </ul>
        <p>The safest interpretation is symbolic. A zodiac article can explain cultural language and traditional imagery, but it cannot define a real person's choices, character, or future.</p>
      </section>
      <section class="content-section">
        <h2>${elementName} ${animal.name} compatibility and relationships</h2>
        <p>${elementName} ${animal.name} compatibility is usually read by starting with the ${animal.name} animal, then adding element language as a secondary layer. The animal relationship explains the traditional match pattern; the element adds tone, style, or temperament in cultural descriptions.</p>
        <p>Use compatibility pages as cultural reference only. Real relationships depend on communication, values, timing, and behavior more than zodiac labels.</p>
        <a class="button-link" href="/chinese-zodiac-compatibility/">Open compatibility checker</a>
      </section>
      <section class="content-section">
        <h2>Common search terms covered</h2>
        <p>This page is written for searchers using terms such as ${supportingKeywords.map((keyword) => `<strong>${escapeHtml(keyword)}</strong>`).join(", ")}. These searches usually have the same intent: find the correct years, understand the symbolic meaning, and avoid the Lunar New Year boundary mistake.</p>
      </section>
      <section class="content-section">
        <h2>How to use this guide responsibly</h2>
        <p>The most useful way to read a ${elementName} ${animal.name} page is to separate factual lookup from symbolic interpretation. The factual layer includes the animal, element, 60-year cycle, and Lunar New Year boundary. Those details can be checked against a calendar. The symbolic layer includes personality language, compatibility tone, and cultural associations. Those are traditional references, not evidence-based judgments about a person.</p>
        <p>This distinction matters for readers who arrive from a birthday, a family question, or a compatibility search. Use the year table to confirm the sign first, then read the meaning as cultural context. If the birthday is near January or February, use the calculator before relying on the animal label. That keeps the page helpful without turning zodiac symbolism into a promise or prediction.</p>
        <p>For content comparison, the animal alone gives the broad zodiac sign, while the element makes the reading more specific. A ${elementName} ${animal.name} page should therefore answer three separate questions: which years belong to this sign, what the animal traditionally represents, and what the element adds to the interpretation. Keeping those questions separate makes the page easier to verify and easier for readers to reuse as a reference.</p>
        <p>If the page is used for personal lookup, write down the full birth date first and then confirm whether the birthday is before or after Lunar New Year. If the page is used for cultural learning, compare this element-animal guide with the general ${animal.name} page and the five elements page. Those two paths answer different needs, and mixing them together is the main reason many zodiac explanations become vague.</p>
        <p>For older dates, the same rule still applies: check the calendar boundary first, then read the symbol. This is especially important when a chart lists only Gregorian years without showing Lunar New Year dates.</p>
      </section>
      ${relatedGuidesBlock(`Related ${animal.name} and element guides`, [
        { title: `${animal.name} Chinese Zodiac`, path: `/chinese-zodiac/${animal.animal}/`, category: "Animal Guides", description: `${animal.name} years, quick facts, and traditional associations.` },
        guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
        guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
        guides.find((guide) => guide.path === "/guides/chinese-birth-signs/")
      ].filter(Boolean))}
      ${faqBlock(faqs)}` 
  }));
}

function yearGuideArticle({ year, title, description, path, h1, primaryKeyword, supportingKeywords }) {
  const row = years.find((item) => item.year === year);
  const animal = animalBySlug[row.animal];
  const element = elementInfo[row.element];
  const previousYear = year - 1;
  const nextSameAnimalYear = year + 12;
  const faqs = [
    { q: `What Chinese zodiac sign is ${year}?`, a: `${year} is the Year of the ${animal.name} in Chinese zodiac, with the ${row.element} element. The zodiac year begins on ${row.lunarNewYear}.` },
    { q: `What element is ${year} in Chinese zodiac?`, a: `${year} is a ${row.element} ${animal.name} year. The ${row.element} element adds themes such as ${element.keywords}.` },
    { q: `Does the ${year} Chinese zodiac year start on January 1?`, a: `No. The ${year} Chinese zodiac year starts on Lunar New Year, ${row.lunarNewYear}. Birthdays before that date belong to the previous zodiac year.` },
    { q: `Is ${year} Chinese zodiac personality scientific?`, a: "No. Chinese zodiac personality descriptions are traditional cultural associations, not scientific personality tests or fixed predictions." }
  ];
  return writePage(path, pageLayout({
    title,
    description,
    path,
    h1,
    intro: `${year} is traditionally read as a ${row.element} ${animal.name} year in the Chinese zodiac cycle, but the exact sign depends on the Lunar New Year boundary.`,
    faqs,
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
      <section class="content-section article-body">
        <p class="lead-answer">${primaryKeyword} is the ${row.element} ${animal.name}. The key detail is the start date: the ${year} Chinese zodiac year begins on ${row.lunarNewYear}, not January 1. If someone was born before that Lunar New Year date, their traditional zodiac sign belongs to ${previousYear} instead.</p>
        <p>This guide explains the ${year} zodiac animal, element, meaning, personality associations, compatibility context, and the most common lookup mistake for early-year birthdays.</p>
      </section>
      ${articleFigure({
        src: "/assets/zodiac-wheel.svg",
        alt: `Chinese zodiac wheel illustration for ${year} ${animal.name} zodiac guide`,
        title: `${year} ${animal.name} visual note`,
        text: `The ${year} year combines the ${animal.name} animal with the ${row.element} element in the 60-year Chinese zodiac cycle.`
      })}
      <section class="content-section split">
        <div>
          <p class="eyebrow">Short Answer</p>
          <h2>What is the Chinese zodiac sign for ${year}?</h2>
          <p>The Chinese zodiac sign for ${year} is the ${animal.name}. The element is ${row.element}, so the fuller traditional label is ${row.element} ${animal.name}. For accurate lookup, compare the birthday with ${row.lunarNewYear}.</p>
        </div>
        <div class="fact-card">
          <strong>${year} zodiac facts</strong>
          <span>Animal: ${animal.name}</span>
          <span>Element: ${row.element}</span>
          <span>Lunar New Year: ${row.lunarNewYear}</span>
          <span>Next ${animal.name} year: ${nextSameAnimalYear}</span>
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <p class="eyebrow">Boundary</p>
          <h2>Why the Lunar New Year date matters</h2>
        </div>
        <p>Many people search by Gregorian year, but Chinese zodiac years do not follow January 1. The ${year} zodiac year starts on ${row.lunarNewYear}. A birthday from January 1 to the day before that date is still counted under the previous Chinese zodiac year.</p>
        <p>For example, a birthday before ${row.lunarNewYear} belongs to the previous zodiac cycle. A birthday on or after ${row.lunarNewYear} belongs to the ${row.element} ${animal.name} year.</p>
        <a class="button-link" href="/chinese-zodiac-calculator/">Check a full birth date</a>
      </section>
      <section class="content-section">
        <h2>${row.element} ${animal.name} meaning and personality associations</h2>
        <p>${animal.meaning}</p>
        <p>${animal.personality}</p>
        <p>The ${row.element} element adds a second symbolic layer. ${element.meaning} Combined with the ${animal.name}, this creates a traditional cultural reading of ${row.element.toLowerCase()} qualities expressed through ${animal.name} symbolism.</p>
      </section>
      <section class="content-section">
        <h2>${year} zodiac compatibility context</h2>
        <p>Compatibility is usually read through the animal first, then the element as a secondary tone. For a ${row.element} ${animal.name}, start with the ${animal.name} compatibility pattern and then read the ${row.element} element as cultural color.</p>
        <p>Use compatibility as a traditional reference only. Real relationships depend on communication, values, behavior, and timing more than any zodiac label.</p>
        <a class="button-link" href="/chinese-zodiac-compatibility/">Open compatibility checker</a>
      </section>
      <section class="content-section">
        <h2>How to use this ${year} zodiac guide</h2>
        <p>Use this page first as a date-checking guide. The most important fact is whether the birthday happened before or after ${row.lunarNewYear}. Once that boundary is clear, the animal and element can be read as traditional cultural information. This prevents the common error of assigning every person born in ${year} to the same zodiac sign without checking the Lunar New Year date.</p>
        <p>After the date is confirmed, compare the ${animal.name} animal guide, the ${row.element} element explanation, and the compatibility section if that is relevant to the user's question. The goal is not to turn a birth year into a fixed identity label. The goal is to give a clear cultural reference with enough context for readers to understand why the answer is different from a simple January 1 chart.</p>
        <p>This page is also useful for checking family or gift questions. If someone asks what ${year} means in Chinese zodiac culture, the short answer is the ${row.element} ${animal.name}; the complete answer includes the Lunar New Year start date, the element layer, and the reminder that zodiac meaning is symbolic rather than predictive.</p>
      </section>
      <section class="content-section">
        <h2>Common searches this guide answers</h2>
        <p>This guide covers related searches such as ${supportingKeywords.map((keyword) => `<strong>${escapeHtml(keyword)}</strong>`).join(", ")}. These searches usually ask the same practical question: what animal and element belong to ${year}, and how should early-year birthdays be handled?</p>
      </section>
      ${relatedGuidesBlock(`Related ${year} and ${animal.name} guides`, [
        { title: `${animal.name} Chinese Zodiac`, path: `/chinese-zodiac/${animal.animal}/`, category: "Animal Guides", description: `${animal.name} years, meaning, personality associations, and cultural notes.` },
        guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
        guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
        guides.find((guide) => guide.path === "/guides/chinese-birth-signs/")
      ].filter(Boolean))}
      ${faqBlock(faqs)}
      <section class="content-section article-body">
        <h2>Summary</h2>
        <p>The main point is simple: ${year} is a ${row.element} ${animal.name} year, but the zodiac year starts on ${row.lunarNewYear}. Check the full birth date before assigning the sign, then use the animal and element meanings as cultural symbolism rather than fixed personality rules.</p>
      </section>`
  }));
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
        <input type="text" name="year" inputmode="numeric" pattern="[0-9]*" placeholder="2026" required>
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
    <section class="zodiac-hero">
      <div class="zodiac-hero-copy">
        <p class="eyebrow">Chinese Zodiac Guide</p>
        <h2>Find your sign inside the 12-animal cycle</h2>
        <p>Use a Lunar New Year-aware calculator, then explore zodiac years, animal meanings, five elements, and traditional compatibility in one cultural reference hub.</p>
        <div class="zodiac-hero-actions">
          <a class="button-link" href="/chinese-zodiac-calculator/">Open calculator</a>
          <a class="button-link secondary" href="/chinese-zodiac-animals/">Explore animals</a>
        </div>
      </div>
      <figure class="zodiac-hero-visual">
        ${zodiacHeroWheel()}
        <figcaption><strong>12 Animals</strong><span>Lunar year cycle and five-element context</span></figcaption>
      </figure>
    </section>
    <section class="zodiac-quick-tool">
      ${zodiacCalculatorBlock()}
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
    ${yearCardsBlock()}
    ${latestGuidesBlock()}
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

await writePage("/guides/", pageLayout({
  title: "Chinese Zodiac Guides: Years, Animals, Elements, and Compatibility",
  description: "Browse Chinese zodiac guides about zodiac years, animals, elements, compatibility, and traditional meanings.",
  path: "/guides/",
  h1: "Chinese Zodiac Guides",
  intro: "Browse the full guide library for Chinese zodiac years, animals, elements, and compatibility topics.",
  body: `
    ${articleSearchBlock()}
    <section class="content-section latest-guides">
      <div class="section-heading">
        <p class="eyebrow">Latest Guides</p>
        <h2>Latest Chinese zodiac guides</h2>
      </div>
      ${guideFilterBlock()}
      <div class="guide-grid">${guides.map(guideCard).join("")}</div>
    </section>
    <section class="content-section guide-next">
      <div>
        <p class="eyebrow">Start Here</p>
        <h2>Not sure where to begin?</h2>
        <p>Use the calculator first, then open the years chart, animal guide, and elements guide for context.</p>
      </div>
      <a class="button-link" href="/chinese-zodiac-calculator/">Open calculator</a>
    </section>`
}));

await writePage("/guides/fire-horse-zodiac/", pageLayout({
  title: "Fire Horse Chinese Zodiac: Years, Meaning, Personality, and 2026",
  description: "Learn what Fire Horse means in Chinese zodiac culture, including Fire Horse years, 2026 context, personality associations, and Lunar New Year boundaries.",
  path: "/guides/fire-horse-zodiac/",
  h1: "Fire Horse Chinese Zodiac",
  intro: "The Fire Horse combines the Horse zodiac animal with the Fire element, a traditional pairing linked with energy, movement, visibility, and independence.",
  faqs: [
    { q: "What is a Fire Horse in Chinese zodiac?", a: "A Fire Horse is a Horse year paired with the Fire element in the 60-year Chinese zodiac cycle. It is traditionally associated with movement, expression, energy, and independence." },
    { q: "Is 2026 a Fire Horse year?", a: "Yes. 2026 is a Fire Horse year, and it begins on February 17, 2026, the Lunar New Year date for that year." },
    { q: "What years are Fire Horse years?", a: "Modern Fire Horse years include 1966 and 2026. The next Fire Horse year after 2026 will be 2086." },
    { q: "Is Fire Horse personality scientific?", a: "No. Fire Horse personality descriptions are cultural associations, not scientific personality tests or fixed predictions." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">A Fire Horse is a Horse year combined with the Fire element in the traditional 60-year Chinese zodiac cycle. Modern Fire Horse years include 1966 and 2026. The 2026 Fire Horse year begins on February 17, 2026, so a person born before that Lunar New Year date still belongs to the previous zodiac year.</p>
      <p>The Fire Horse topic is popular because it combines two vivid symbols. Horse is associated with movement, freedom, speed, and social energy. Fire is associated with warmth, expression, visibility, and active momentum. Together, Fire Horse is usually described as one of the more energetic element-animal combinations in Chinese zodiac culture.</p>
    </section>
    ${articleFigure({
      src: "/assets/fire-horse-papercut.svg",
      alt: "Red and gold papercut style Fire Horse Chinese zodiac illustration",
      title: "Fire Horse visual note",
      text: "An original papercut-style illustration using red, gold, and horse movement to support the article without relying on copyrighted images."
    })}
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>What does Fire Horse mean?</h2>
        <p>Fire Horse means the Horse zodiac animal is paired with the Fire element. In cultural explanations, this pairing emphasizes independence, forward motion, expression, and visible action. It should be read as symbolic tradition, not as a prediction about a person's future.</p>
      </div>
      <div class="fact-card">
        <strong>Fire Horse facts</strong>
        <span>Recent years: 1966, 2026</span>
        <span>2026 starts: February 17, 2026</span>
        <span>Animal: Horse</span>
        <span>Element: Fire</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Years</p>
        <h2>Fire Horse years and calendar boundaries</h2>
      </div>
      <p>The Chinese zodiac uses a 12-animal cycle and a 5-element cycle. When the animal and element are combined, the full cycle repeats every 60 years. That is why 1966 and 2026 are both Fire Horse years.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fire Horse year</th><th>Lunar New Year start</th><th>Traditional reading</th></tr></thead>
          <tbody>
            <tr><td>1966</td><td>January 21, 1966</td><td>Fire Horse in the modern 60-year cycle.</td></tr>
            <tr><td>2026</td><td>February 17, 2026</td><td>Fire Horse year for the current cycle.</td></tr>
            <tr><td>2086</td><td>Future cycle</td><td>The next Fire Horse year after 2026.</td></tr>
          </tbody>
        </table>
      </div>
      <p>If a birthday falls in January or early February, check the exact Lunar New Year date before assigning the sign. This is the most common mistake in Fire Horse searches.</p>
    </section>
    <section class="content-section">
      <h2>Fire Horse personality associations</h2>
      <p>Fire Horse descriptions usually combine the active image of the Horse with the expressive image of Fire. Common cultural associations include:</p>
      <ul class="article-list">
        <li>Energetic, active, and quick to move toward new situations.</li>
        <li>Independent and uncomfortable with overly narrow routines.</li>
        <li>Expressive, visible, and often socially noticeable.</li>
        <li>Warm, enthusiastic, and direct in style.</li>
        <li>Sometimes impatient when progress feels slow.</li>
      </ul>
      <p>These are not scientific claims. A useful reading is that Fire Horse symbolism describes a lively, outward-moving image within Chinese zodiac tradition. Real personality depends on upbringing, choices, context, and lived experience.</p>
    </section>
    <section class="content-section">
      <h2>Why 2026 is often called a Fire Horse year</h2>
      <p>In the 2026 zodiac year, the animal is Horse and the element is Fire. On this site, 2026 is treated as a Fire Horse year from February 17, 2026, through the day before the next Lunar New Year in 2027.</p>
      <p>This distinction matters for both searchers and content planning. Someone born on February 10, 2026 is not yet in the Fire Horse year, while someone born on February 20, 2026 is. The zodiac calculator is the safest way to check an individual birthday.</p>
      <a class="button-link" href="/chinese-zodiac-calculator/">Check a birth date</a>
    </section>
    <section class="content-section">
      <h2>Fire Horse compared with other Horse elements</h2>
      <p>Every Horse year has the same animal base, but the element changes the traditional wording. Fire Horse tends to emphasize expression and visible movement. Metal Horse may be described with more structure and resolve. Water Horse may be described with more adaptability. Wood Horse often emphasizes growth and flexibility, while Earth Horse emphasizes stability and practical support.</p>
      <p>The element is best used as a cultural layer on top of the animal, not as a separate fortune-telling result.</p>
    </section>
    <section class="content-section">
      <h2>How to use the Fire Horse guide responsibly</h2>
      <p>Use this page first to confirm the calendar boundary, then use the meaning sections as cultural vocabulary. The Fire Horse label is useful for understanding traditional zodiac language, but it should not be treated as a fixed personality result or a prediction. If the question is about a specific person, the full birth date matters more than the Gregorian year alone.</p>
      <p>For comparison, open the Horse animal page and the five elements page after reading this guide. That separates the Horse layer from the Fire layer and makes the interpretation clearer.</p>
    </section>
    ${relatedGuidesBlock("Related Fire Horse guides", [
      guides.find((guide) => guide.path === "/year-of-the-horse-2026/"),
      guides.find((guide) => guide.path === "/guides/horse-chinese-zodiac/"),
      guides.find((guide) => guide.path === "/chinese-zodiac/horse/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-elements/")
    ].filter(Boolean))}
    ${faqBlock([
      { q: "What is a Fire Horse in Chinese zodiac?", a: "A Fire Horse is a Horse year paired with the Fire element in the 60-year Chinese zodiac cycle. It is traditionally associated with movement, expression, energy, and independence." },
      { q: "Is 2026 a Fire Horse year?", a: "Yes. 2026 is a Fire Horse year, and it begins on February 17, 2026, the Lunar New Year date for that year." },
      { q: "What years are Fire Horse years?", a: "Modern Fire Horse years include 1966 and 2026. The next Fire Horse year after 2026 will be 2086." },
      { q: "Is Fire Horse personality scientific?", a: "No. Fire Horse personality descriptions are cultural associations, not scientific personality tests or fixed predictions." }
    ])}`
}));

await elementAnimalArticle({
  title: "Fire Rat Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Fire Rat means in Chinese zodiac culture, including Fire Rat years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/fire-rat-chinese-zodiac/",
  h1: "Fire Rat Chinese Zodiac",
  intro: "The Fire Rat combines the Rat zodiac animal with the Fire element, a traditional pairing linked with alertness, adaptability, visibility, and active expression.",
  animalSlug: "rat",
  elementName: "Fire",
  yearsRange: [1936, 2060],
  primaryKeyword: "Fire Rat Chinese Zodiac",
  supportingKeywords: ["fire rat chinese zodiac", "fire rat zodiac", "fire rat chinese zodiac personality"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Fire Rat zodiac guide",
    title: "Fire Rat visual note",
    text: "The Rat belongs to the twelve-animal cycle, while Fire adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Fire Rat in Chinese zodiac?", a: "A Fire Rat is a Rat zodiac year paired with the Fire element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Fire Rat years?", a: "Modern Fire Rat years include 1936 and 1996. The next Fire Rat year after 1996 is 2056." },
    { q: "What does Fire Rat personality mean?", a: "Fire Rat personality descriptions combine Rat symbolism, such as alertness and resourcefulness, with Fire symbolism, such as energy and expression." },
    { q: "Does a Fire Rat year start on January 1?", a: "No. A Fire Rat year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Earth Tiger Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Earth Tiger means in Chinese zodiac culture, including Earth Tiger years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-earth-tiger/",
  h1: "Earth Tiger Chinese Zodiac",
  intro: "The Earth Tiger combines the Tiger zodiac animal with the Earth element, a traditional pairing linked with courage, protection, stability, and grounded action.",
  animalSlug: "tiger",
  elementName: "Earth",
  yearsRange: [1938, 2060],
  primaryKeyword: "Chinese Zodiac Earth Tiger",
  supportingKeywords: ["chinese zodiac earth tiger", "earth tiger zodiac", "earth tiger chinese zodiac personality"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Earth Tiger zodiac guide",
    title: "Earth Tiger visual note",
    text: "The Tiger belongs to the twelve-animal cycle, while Earth adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is an Earth Tiger in Chinese zodiac?", a: "An Earth Tiger is a Tiger zodiac year paired with the Earth element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Earth Tiger years?", a: "Modern Earth Tiger years include 1938 and 1998. The next Earth Tiger year after 1998 is 2058." },
    { q: "What does Earth Tiger personality mean?", a: "Earth Tiger personality descriptions combine Tiger symbolism, such as courage and vitality, with Earth symbolism, such as stability and practical support." },
    { q: "Does an Earth Tiger year start on January 1?", a: "No. An Earth Tiger year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Fire Rabbit Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Fire Rabbit means in Chinese zodiac culture, including Fire Rabbit years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-fire-rabbit/",
  h1: "Fire Rabbit Chinese Zodiac",
  intro: "The Fire Rabbit combines the Rabbit zodiac animal with the Fire element, a traditional pairing linked with grace, social warmth, sensitivity, and visible creative expression.",
  animalSlug: "rabbit",
  elementName: "Fire",
  yearsRange: [1927, 2047],
  primaryKeyword: "Chinese Zodiac Fire Rabbit",
  supportingKeywords: ["chinese zodiac fire rabbit", "fire rabbit zodiac", "fire rabbit chinese zodiac personality"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Fire Rabbit zodiac guide",
    title: "Fire Rabbit visual note",
    text: "The Rabbit belongs to the twelve-animal cycle, while Fire adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Fire Rabbit in Chinese zodiac?", a: "A Fire Rabbit is a Rabbit zodiac year paired with the Fire element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Fire Rabbit years?", a: "Modern Fire Rabbit years include 1927 and 1987. The next Fire Rabbit year after 1987 is 2047." },
    { q: "What does Fire Rabbit personality mean?", a: "Fire Rabbit personality descriptions combine Rabbit symbolism, such as gentleness and careful judgment, with Fire symbolism, such as energy and visible expression." },
    { q: "Does a Fire Rabbit year start on January 1?", a: "No. A Fire Rabbit year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Water Dragon Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Water Dragon means in Chinese zodiac culture, including Water Dragon years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-water-dragon/",
  h1: "Water Dragon Chinese Zodiac",
  intro: "The Water Dragon combines the Dragon zodiac animal with the Water element, a traditional pairing linked with confidence, adaptability, imagination, and flowing momentum.",
  animalSlug: "dragon",
  elementName: "Water",
  yearsRange: [1952, 2072],
  primaryKeyword: "Chinese Zodiac Water Dragon",
  supportingKeywords: ["chinese zodiac water dragon", "water dragon zodiac", "water dragon chinese zodiac personality", "water dragon chinese zodiac 2012"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Water Dragon zodiac guide",
    title: "Water Dragon visual note",
    text: "The Dragon belongs to the twelve-animal cycle, while Water adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Water Dragon in Chinese zodiac?", a: "A Water Dragon is a Dragon zodiac year paired with the Water element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Water Dragon years?", a: "Modern Water Dragon years include 1952 and 2012. The next Water Dragon year after 2012 is 2072." },
    { q: "What does Water Dragon personality mean?", a: "Water Dragon personality descriptions combine Dragon symbolism, such as strength and auspicious energy, with Water symbolism, such as adaptability and reflection." },
    { q: "Does a Water Dragon year start on January 1?", a: "No. A Water Dragon year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Water Horse Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Water Horse means in Chinese zodiac culture, including Water Horse years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-water-horse/",
  h1: "Water Horse Chinese Zodiac",
  intro: "The Water Horse combines the Horse zodiac animal with the Water element, a traditional pairing linked with movement, independence, adaptability, and flexible social energy.",
  animalSlug: "horse",
  elementName: "Water",
  yearsRange: [1942, 2062],
  primaryKeyword: "Chinese Zodiac Water Horse",
  supportingKeywords: ["chinese zodiac water horse", "water horse zodiac", "water horse chinese zodiac personality"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Water Horse zodiac guide",
    title: "Water Horse visual note",
    text: "The Horse belongs to the twelve-animal cycle, while Water adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Water Horse in Chinese zodiac?", a: "A Water Horse is a Horse zodiac year paired with the Water element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Water Horse years?", a: "Modern Water Horse years include 1942 and 2002. The next Water Horse year after 2002 is 2062." },
    { q: "What does Water Horse personality mean?", a: "Water Horse personality descriptions combine Horse symbolism, such as energy and independence, with Water symbolism, such as adaptability and flow." },
    { q: "Does a Water Horse year start on January 1?", a: "No. A Water Horse year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Fire Dragon Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Fire Dragon means in Chinese zodiac culture, including Fire Dragon years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/fire-dragon-chinese-zodiac/",
  h1: "Fire Dragon Chinese Zodiac",
  intro: "The Fire Dragon combines the Dragon zodiac animal with the Fire element, a traditional pairing linked with strength, charisma, visibility, and bold expression.",
  animalSlug: "dragon",
  elementName: "Fire",
  yearsRange: [1916, 2036],
  primaryKeyword: "Fire Dragon Chinese Zodiac",
  supportingKeywords: ["fire dragon chinese zodiac", "fire dragon zodiac", "fire dragon chinese zodiac 1976"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Fire Dragon zodiac guide",
    title: "Fire Dragon visual note",
    text: "The Dragon belongs to the twelve-animal cycle, while Fire adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Fire Dragon in Chinese zodiac?", a: "A Fire Dragon is a Dragon zodiac year paired with the Fire element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Fire Dragon years?", a: "Modern Fire Dragon years include 1916 and 1976. The next Fire Dragon year after 1976 is 2036." },
    { q: "What does Fire Dragon personality mean?", a: "Fire Dragon personality descriptions combine Dragon symbolism, such as auspicious strength and confidence, with Fire symbolism, such as energy and visible expression." },
    { q: "Does a Fire Dragon year start on January 1?", a: "No. A Fire Dragon year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Metal Horse Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Metal Horse means in Chinese zodiac culture, including Metal Horse years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-metal-horse/",
  h1: "Metal Horse Chinese Zodiac",
  intro: "The Metal Horse combines the Horse zodiac animal with the Metal element, a traditional pairing linked with movement, independence, structure, clarity, and endurance.",
  animalSlug: "horse",
  elementName: "Metal",
  yearsRange: [1930, 2050],
  primaryKeyword: "Chinese Zodiac Metal Horse",
  supportingKeywords: ["chinese zodiac metal horse", "metal horse zodiac", "metal horse chinese zodiac"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Metal Horse zodiac guide",
    title: "Metal Horse visual note",
    text: "The Horse belongs to the twelve-animal cycle, while Metal adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Metal Horse in Chinese zodiac?", a: "A Metal Horse is a Horse zodiac year paired with the Metal element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Metal Horse years?", a: "Modern Metal Horse years include 1930 and 1990. The next Metal Horse year after 1990 is 2050." },
    { q: "What does Metal Horse personality mean?", a: "Metal Horse personality descriptions combine Horse symbolism, such as independence and movement, with Metal symbolism, such as structure, clarity, and endurance." },
    { q: "Does a Metal Horse year start on January 1?", a: "No. A Metal Horse year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await elementAnimalArticle({
  title: "Metal Snake Chinese Zodiac: Years, Meaning, Personality, and Elements",
  description: "Learn what Metal Snake means in Chinese zodiac culture, including Metal Snake years, personality associations, element meaning, and Lunar New Year boundaries.",
  path: "/guides/chinese-zodiac-metal-snake/",
  h1: "Metal Snake Chinese Zodiac",
  intro: "The Metal Snake combines the Snake zodiac animal with the Metal element, a traditional pairing linked with reflection, strategy, structure, clarity, and endurance.",
  animalSlug: "snake",
  elementName: "Metal",
  yearsRange: [1941, 2061],
  primaryKeyword: "Chinese Zodiac Metal Snake",
  supportingKeywords: ["chinese zodiac metal snake", "metal snake zodiac", "metal snake chinese zodiac"],
  image: {
    src: "/assets/zodiac-wheel.svg",
    alt: "Chinese zodiac wheel illustration for Metal Snake zodiac guide",
    title: "Metal Snake visual note",
    text: "The Snake belongs to the twelve-animal cycle, while Metal adds the element layer in the 60-year zodiac cycle."
  },
  faqs: [
    { q: "What is a Metal Snake in Chinese zodiac?", a: "A Metal Snake is a Snake zodiac year paired with the Metal element in the 60-year Chinese zodiac cycle." },
    { q: "What years are Metal Snake years?", a: "Modern Metal Snake years include 1941 and 2001. The next Metal Snake year after 2001 is 2061." },
    { q: "What does Metal Snake personality mean?", a: "Metal Snake personality descriptions combine Snake symbolism, such as reflection and strategy, with Metal symbolism, such as structure, clarity, and endurance." },
    { q: "Does a Metal Snake year start on January 1?", a: "No. A Metal Snake year starts at Lunar New Year, so early January or February birthdays may belong to the previous zodiac year." }
  ]
});

await yearGuideArticle({
  year: 1988,
  title: "1988 Year of the Chinese Zodiac: Earth Dragon Meaning",
  description: "Learn the 1988 Chinese zodiac sign, Earth Dragon meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1988-year-of-the-chinese-zodiac/",
  h1: "1988 Year of the Chinese Zodiac: Earth Dragon Meaning",
  primaryKeyword: "1988 year of the Chinese zodiac",
  supportingKeywords: ["1988 chinese zodiac", "1988 chinese sign", "1988 zodiac animal", "1988 chinese year"]
});

await yearGuideArticle({
  year: 1990,
  title: "1990 Year of the Chinese Zodiac: Metal Horse Meaning",
  description: "Learn the 1990 Chinese zodiac sign, Metal Horse meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1990-year-of-the-chinese-zodiac/",
  h1: "1990 Year of the Chinese Zodiac",
  primaryKeyword: "1990 year of the Chinese zodiac",
  supportingKeywords: ["1990 chinese zodiac", "1990 chinese sign", "1990 zodiac animal", "1990 zodiac"]
});

await yearGuideArticle({
  year: 1989,
  title: "1989 Year of the Chinese Zodiac: Earth Snake Meaning",
  description: "Learn the 1989 Chinese zodiac sign, Earth Snake meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1989-year-of-the-chinese-zodiac/",
  h1: "1989 Year of the Chinese Zodiac",
  primaryKeyword: "1989 year of the Chinese zodiac",
  supportingKeywords: ["1989 chinese zodiac", "1989 chinese sign", "1989 in chinese zodiac", "1989 zodiac animal"]
});

await yearGuideArticle({
  year: 1996,
  title: "1996 Year of the Chinese Zodiac: Fire Rat Meaning",
  description: "Learn the 1996 Chinese zodiac sign, Fire Rat meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1996-year-of-the-chinese-zodiac/",
  h1: "1996 Year of the Chinese Zodiac: Fire Rat Meaning",
  primaryKeyword: "1996 year of the Chinese zodiac",
  supportingKeywords: ["1996 chinese zodiac", "1996 chinese year", "1996 chinese sign", "1996 zodiac animal"]
});
await yearGuideArticle({
  year: 1997,
  title: "1997 Year of the Chinese Zodiac: Fire Ox Meaning",
  description: "Learn the 1997 Chinese zodiac sign, Fire Ox meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1997-year-of-the-chinese-zodiac/",
  h1: "1997 Year of the Chinese Zodiac: Fire Ox Meaning",
  primaryKeyword: "1997 year of the Chinese zodiac",
  supportingKeywords: ["1997 chinese zodiac", "1997 chinese year", "1997 chinese sign", "1997 zodiac animal"]
});

await yearGuideArticle({
  year: 1998,
  title: "1998 Year of the Chinese Zodiac: Earth Tiger Meaning",
  description: "Learn the 1998 Chinese zodiac sign, Earth Tiger meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1998-year-of-the-chinese-zodiac/",
  h1: "1998 Year of the Chinese Zodiac: Earth Tiger Meaning",
  primaryKeyword: "1998 year of the Chinese zodiac",
  supportingKeywords: ["1998 chinese zodiac", "1998 chinese year", "1998 chinese sign", "1998 zodiac animal"]
});

await yearGuideArticle({
  year: 1999,
  title: "1999 Year of the Chinese Zodiac: Earth Rabbit Meaning",
  description: "Learn the 1999 Chinese zodiac sign, Earth Rabbit meaning, Lunar New Year start date, personality associations, and compatibility context.",
  path: "/guides/1999-year-of-the-chinese-zodiac/",
  h1: "1999 Year of the Chinese Zodiac: Earth Rabbit Meaning",
  primaryKeyword: "1999 year of the Chinese zodiac",
  supportingKeywords: ["1999 chinese zodiac", "1999 chinese year", "1999 chinese sign", "1999 zodiac animal"]
});

await writePage("/guides/chinese-birth-signs/", pageLayout({
  title: "Chinese Birth Signs by Birthday: Find Your Zodiac Animal Correctly",
  description: "Learn how Chinese birth signs work by birthday, why Lunar New Year matters, and how to avoid the common January and February zodiac mistake.",
  path: "/guides/chinese-birth-signs/",
  h1: "Chinese Birth Signs by Birthday",
  intro: "Chinese birth signs are based on your birth date and the Lunar New Year boundary, not simply the January-to-December Gregorian year.",
  faqs: [
    { q: "How do I find my Chinese birth sign?", a: "Use your full birth date and compare it with the Lunar New Year date for that year. If your birthday is before Lunar New Year, use the previous zodiac year." },
    { q: "Does Chinese zodiac use birthday or birth year?", a: "It uses the birth year, but the year changes at Lunar New Year. That means the full birthday is needed for January and February births." },
    { q: "Why are January and February birthdays different?", a: "Many Lunar New Year dates fall in January or February, so early-year birthdays can belong to the previous Chinese zodiac year." },
    { q: "Can I use a calculator for Chinese birth signs?", a: "Yes. A Lunar New Year-aware calculator is the easiest way to avoid assigning the wrong zodiac sign." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="tool-page">${zodiacCalculatorBlock()}</section>
    <section class="content-section article-body">
      <p class="lead-answer">To find Chinese birth signs correctly, use the full birthday. Chinese zodiac signs are based on zodiac years, but those years begin at Lunar New Year, not January 1. If your birthday is before Lunar New Year in your birth year, your Chinese birth sign belongs to the previous zodiac year.</p>
      <p>This is why a person born in January or early February can have a different Chinese zodiac sign from someone born later in the same Gregorian year.</p>
    </section>
    ${articleFigure({
      src: "/assets/birth-signs-calendar.svg",
      alt: "Calendar and zodiac wheel illustration for Chinese birth signs",
      title: "Birth sign visual note",
      text: "An original calendar-and-zodiac-wheel illustration showing why birthday lookup depends on the Lunar New Year boundary."
    })}
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>How do Chinese birth signs work?</h2>
        <p>Chinese birth signs use the zodiac animal for the lunar year of birth. The correct sign depends on whether the birthday falls before or after that year's Lunar New Year. For most birthdays after Lunar New Year, the Gregorian year is enough; for early-year birthdays, the exact date matters.</p>
      </div>
      <div class="fact-card">
        <strong>Birth sign rule</strong>
        <span>Use full birth date</span>
        <span>Check Lunar New Year</span>
        <span>Before Lunar New Year: previous sign</span>
        <span>After Lunar New Year: current sign</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Method</p>
        <h2>How to find your Chinese birth sign</h2>
      </div>
      <ol class="article-list">
        <li>Write down the full birth date: year, month, and day.</li>
        <li>Look up the Lunar New Year date for that Gregorian year.</li>
        <li>If the birthday is before Lunar New Year, use the previous zodiac year.</li>
        <li>If the birthday is on or after Lunar New Year, use the zodiac year that begins on that date.</li>
        <li>Read the animal first, then add the element if you need a more specific traditional description.</li>
      </ol>
      <p>This date check is more reliable than guessing from the birth year alone.</p>
    </section>
    <section class="content-section">
      <h2>Why January and February birthdays need extra checking</h2>
      <p>The Lunar New Year date changes each year. It usually falls between late January and mid-February. Because of that, birthdays in this period can be confusing. A January 1990 birthday, for example, may still belong to the previous zodiac year, while a March 1990 birthday belongs to the zodiac year that started in 1990.</p>
      <p>For users, the practical rule is simple: if the birthday is in January or February, check the calendar boundary. If the birthday is from March through December, the Gregorian year usually matches the Chinese zodiac year for practical lookup.</p>
    </section>
    <section class="content-section">
      <h2>Birth sign, zodiac animal, and element</h2>
      <p>The birth sign usually means the zodiac animal: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, or Pig. Each year also has an element: Wood, Fire, Earth, Metal, or Water. Together, the animal and element form a more specific 60-year cycle label, such as Fire Horse, Wood Dragon, or Metal Snake.</p>
      <p>For most visitors, the first step is finding the correct animal. The element can be added after the date boundary is clear.</p>
      <div class="fact-grid">
        <div><strong>Animal cycle</strong><span>12 signs</span></div>
        <div><strong>Element cycle</strong><span>5 elements</span></div>
        <div><strong>Full cycle</strong><span>60 years</span></div>
      </div>
    </section>
    <section class="content-section">
      <h2>Common mistakes when checking Chinese birth signs</h2>
      <p>The first mistake is using January 1 as the zodiac boundary. The second mistake is using only a birth year for a January or February birthday. The third mistake is treating zodiac personality notes as fixed facts. Chinese birth signs are part of cultural tradition and symbolic learning; they are not scientific personality tests or life predictions.</p>
      <p>Use the result for cultural context, learning, naming inspiration, or entertainment. Do not use it as professional advice about relationships, career, health, money, or major life decisions.</p>
    </section>
    ${relatedGuidesBlock("Related birth sign guides", [
      guides.find((guide) => guide.path === "/chinese-zodiac-calculator/"),
      guides.find((guide) => guide.path === "/guides/what-chinese-zodiac-sign-am-i/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-animals/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-elements/")
    ].filter(Boolean))}
    ${faqBlock([
      { q: "How do I find my Chinese birth sign?", a: "Use your full birth date and compare it with the Lunar New Year date for that year. If your birthday is before Lunar New Year, use the previous zodiac year." },
      { q: "Does Chinese zodiac use birthday or birth year?", a: "It uses the birth year, but the year changes at Lunar New Year. That means the full birthday is needed for January and February births." },
      { q: "Why are January and February birthdays different?", a: "Many Lunar New Year dates fall in January or February, so early-year birthdays can belong to the previous Chinese zodiac year." },
      { q: "Can I use a calculator for Chinese birth signs?", a: "Yes. A Lunar New Year-aware calculator is the easiest way to avoid assigning the wrong zodiac sign." }
    ])}`
}));

await writePage("/guides/horse-chinese-zodiac/", pageLayout({
  title: "Horse Chinese Zodiac: Years, Meaning, Personality, and Dates",
  description: "Learn the Horse Chinese zodiac years, traditional meaning, personality associations, lucky symbols, compatibility notes, and Lunar New Year boundary.",
  path: "/guides/horse-chinese-zodiac/",
  h1: "Horse Chinese Zodiac: Years, Meaning, and Personality",
  intro: "The Horse is the seventh animal in the Chinese zodiac cycle, traditionally linked with movement, freedom, independence, and an active spirit.",
  faqs: [
    { q: "What years are the Horse in Chinese zodiac?", a: "Recent Horse years include 1978, 1990, 2002, 2014, and 2026. The exact sign depends on the Lunar New Year boundary in each year." },
    { q: "Is 2026 the Year of the Horse?", a: "Yes. 2026 is the Year of the Horse, and it begins on February 17, 2026, the Lunar New Year date for that year." },
    { q: "What does the Horse mean in Chinese zodiac culture?", a: "The Horse is traditionally associated with movement, freedom, energy, independence, and an active spirit." },
    { q: "Are Horse zodiac personality traits scientific?", a: "No. Horse traits are cultural personality associations, not scientific claims or fixed judgments about a person." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">The Horse is the seventh animal in the Chinese zodiac cycle. It is traditionally associated with movement, independence, confidence, and an active social spirit. If you are checking whether you are a Horse, do not use January 1 as the only boundary. Chinese zodiac years follow Lunar New Year, so a birthday in January or early February may still belong to the previous zodiac year.</p>
      <p>That boundary matters because most people search for their zodiac sign by Gregorian year, while the traditional zodiac calendar changes on Lunar New Year.</p>
    </section>
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>What does the Horse mean?</h2>
        <p>In Chinese zodiac culture, the Horse represents energy, freedom, speed, and forward movement. Horse years include 1978, 1990, 2002, 2014, and 2026, but the exact sign depends on the Lunar New Year date in the birth year.</p>
      </div>
      <div class="fact-card">
        <strong>Horse facts</strong>
        <span>Chinese: 马</span>
        <span>Pinyin: ma</span>
        <span>Cycle order: No. 7</span>
        <span>Yin/Yang: Yang</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Years and Elements</p>
        <h2>Horse years and Lunar New Year starts</h2>
      </div>
      <p>The Horse repeats every 12 years. Each Horse year also connects with one of the five traditional elements: Wood, Fire, Earth, Metal, or Water.</p>
      ${yearsTable(years.filter((row) => row.animal === "horse" && row.year >= 1978 && row.year <= 2026))}
      <p>Once the animal is clear, the element adds another layer to the traditional reading. For example, 2026 is often described as a Fire Horse year, while 1990 is a Metal Horse year.</p>
    </section>
    <section class="content-section">
      <h2>Horse meaning in Chinese zodiac culture</h2>
      <p>The Horse often represents speed, freedom, endurance, and visible action. In older cultural symbolism, the horse is connected with travel, military movement, communication, and the ability to cover distance. That is why modern zodiac explanations often describe the Horse as energetic, independent, and eager to move toward new situations.</p>
      <p>This meaning should be read as cultural symbolism. It does not mean every Horse person has the same personality, and it should not be used to make serious decisions about relationships, work, health, or money.</p>
    </section>
    <section class="content-section">
      <h2>Horse personality associations</h2>
      <p>Traditional Horse descriptions usually focus on movement and openness. Common associations include:</p>
      <ul class="article-list">
        <li>Lively and expressive.</li>
        <li>Independent and freedom-seeking.</li>
        <li>Comfortable with change and activity.</li>
        <li>Drawn to new experiences.</li>
        <li>Sometimes impatient with slow routines.</li>
      </ul>
      <p>The useful way to read these traits is not "this is exactly who you are." A better reading is: Chinese zodiac culture uses the Horse to describe a type of energetic, outward-moving temperament.</p>
    </section>
    <section class="content-section">
      <h2>Lucky numbers and colors</h2>
      <p>Lucky symbols are another part of traditional zodiac reading. They are symbolic references, not guaranteed outcomes.</p>
      <div class="fact-grid">
        <div><strong>Lucky numbers</strong><span>2, 3, 7</span></div>
        <div><strong>Lucky colors</strong><span>Green, red, purple</span></div>
        <div><strong>Also known as</strong><span>Wu Horse</span></div>
      </div>
    </section>
    <section class="content-section">
      <h2>Horse compatibility</h2>
      <p>Horse compatibility is usually read through traditional animal relationships. Some pairings are described as smoother, while others are described as more challenging. The result is best used as a cultural guide rather than relationship advice.</p>
      <p>If a pair looks challenging in zodiac symbolism, that does not mean the real relationship is bad. Communication, values, timing, and real-life behavior matter more than a zodiac label.</p>
      <a class="button-link" href="/chinese-zodiac-compatibility/">Open compatibility checker</a>
    </section>
    <section class="content-section">
      <h2>Common mistakes</h2>
      <p>The biggest mistake is assuming a zodiac year starts on January 1. It does not. Chinese zodiac years start on Lunar New Year, and that date changes each Gregorian year.</p>
      <p>Another common mistake is reading zodiac personality as a fixed truth. On this site, zodiac meanings are explained as traditional cultural associations. They can be interesting, useful for learning, and helpful for symbolic content, but they are not scientific personality tests.</p>
    </section>
    ${relatedGuidesBlock("Related Horse and zodiac guides", [
      { title: "Horse Chinese Zodiac", path: "/chinese-zodiac/horse/", category: "Animal Guides", description: "Horse years, quick facts, and traditional associations." },
      guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/")
    ].filter(Boolean))}
    ${faqBlock([
      { q: "What years are the Horse in Chinese zodiac?", a: "Recent Horse years include 1978, 1990, 2002, 2014, and 2026. The exact sign depends on the Lunar New Year boundary in each year." },
      { q: "Is 2026 the Year of the Horse?", a: "Yes. 2026 is the Year of the Horse, and it begins on February 17, 2026, the Lunar New Year date for that year." },
      { q: "What does the Horse mean in Chinese zodiac culture?", a: "The Horse is traditionally associated with movement, freedom, energy, independence, and an active spirit." },
      { q: "Are Horse zodiac personality traits scientific?", a: "No. Horse traits are cultural personality associations, not scientific claims or fixed judgments about a person." }
    ])}
    <section class="content-section article-body">
      <h2>Final note</h2>
      <p>The main point is simple: the Horse sign is useful only after you check the Lunar New Year boundary for the birth year. Once the sign is confirmed, you can read the Horse meaning, compare compatibility, or use the zodiac calculator to check another birthday. Treat the result as a cultural guide, not a fixed rule about personality or relationships.</p>
    </section>`
}));

await writePage("/guides/dragon-chinese-zodiac/", pageLayout({
  title: "Dragon Chinese Zodiac: Years, Meaning, Personality, and Dates",
  description: "Learn the Dragon Chinese zodiac years, traditional meaning, personality associations, lucky symbols, elements, and Lunar New Year boundary.",
  path: "/guides/dragon-chinese-zodiac/",
  h1: "Dragon Chinese Zodiac: Years, Meaning, and Personality",
  intro: "The Dragon is the fifth animal in the Chinese zodiac cycle and one of the strongest auspicious symbols in Chinese culture.",
  faqs: [
    { q: "What years are the Dragon in Chinese zodiac?", a: "Recent Dragon years include 1976, 1988, 2000, 2012, and 2024. The exact sign depends on the Lunar New Year boundary in each year." },
    { q: "Is 2024 the Year of the Dragon?", a: "Yes. 2024 is the Year of the Dragon, and it begins on February 10, 2024, the Lunar New Year date for that year." },
    { q: "What does the Dragon mean in Chinese zodiac culture?", a: "The Dragon is traditionally associated with strength, charisma, auspicious energy, ambition, and visible momentum." },
    { q: "Are Dragon zodiac traits scientific?", a: "No. Dragon traits are cultural personality associations, not scientific claims or fixed judgments about a person." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">The Dragon is the fifth animal in the Chinese zodiac cycle. It is traditionally associated with strength, charisma, confidence, and auspicious energy. If you are checking whether you are a Dragon, use the Lunar New Year boundary instead of January 1. A birthday in January or early February can still belong to the previous zodiac year.</p>
      <p>This matters because Dragon years are popular search topics, but the traditional zodiac year follows the lunar calendar rather than the Gregorian calendar.</p>
    </section>
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>What does the Dragon mean?</h2>
        <p>In Chinese zodiac culture, the Dragon represents auspicious power, ambition, leadership, and visible momentum. Dragon years include 1976, 1988, 2000, 2012, and 2024, but the exact sign depends on the Lunar New Year date in the birth year.</p>
      </div>
      <div class="fact-card">
        <strong>Dragon facts</strong>
        <span>Chinese: 龙</span>
        <span>Pinyin: long</span>
        <span>Cycle order: No. 5</span>
        <span>Yin/Yang: Yang</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Years and Elements</p>
        <h2>Dragon years and Lunar New Year starts</h2>
      </div>
      <p>The Dragon repeats every 12 years. Each Dragon year also connects with one of the five traditional elements: Wood, Fire, Earth, Metal, or Water.</p>
      ${yearsTable(years.filter((row) => row.animal === "dragon" && row.year >= 1976 && row.year <= 2024))}
      <p>Once the animal is clear, the element gives a more specific traditional reading. For example, 2024 is a Wood Dragon year, while 2000 is a Metal Dragon year.</p>
    </section>
    <section class="content-section">
      <h2>Dragon meaning in Chinese zodiac culture</h2>
      <p>The Dragon is one of the most important cultural symbols in Chinese tradition. It is often linked with power, prosperity, imperial imagery, and auspicious movement. In zodiac writing, this is why the Dragon is usually described as confident, expressive, ambitious, and strongly associated with momentum.</p>
      <p>This meaning should be read as cultural symbolism. It does not mean every Dragon person has the same personality, and it should not be used to make serious decisions about relationships, work, health, or money.</p>
    </section>
    <section class="content-section">
      <h2>Dragon personality associations</h2>
      <p>Traditional Dragon descriptions usually focus on confidence and visible energy. Common associations include:</p>
      <ul class="article-list">
        <li>Confident and expressive.</li>
        <li>Ambitious and goal-oriented.</li>
        <li>Drawn to leadership or visible roles.</li>
        <li>Energetic when pursuing a clear direction.</li>
        <li>Sometimes impatient with slow progress.</li>
      </ul>
      <p>A practical way to read these traits is not as a fixed label, but as a cultural image of strong outward momentum.</p>
    </section>
    <section class="content-section">
      <h2>Lucky numbers and colors</h2>
      <p>Lucky symbols are part of traditional zodiac reading. They are symbolic references, not guaranteed outcomes.</p>
      <div class="fact-grid">
        <div><strong>Lucky numbers</strong><span>1, 6, 7</span></div>
        <div><strong>Lucky colors</strong><span>Gold, silver, gray</span></div>
        <div><strong>Also known as</strong><span>Chen Dragon</span></div>
      </div>
    </section>
    <section class="content-section">
      <h2>Common mistakes</h2>
      <p>The biggest mistake is assuming a Dragon year starts on January 1. Chinese zodiac years begin at Lunar New Year, so the start date changes each Gregorian year.</p>
      <p>Another mistake is treating Dragon symbolism as prediction. On this site, Dragon meanings are explained as traditional cultural associations, not scientific personality tests.</p>
    </section>
    <section class="content-section">
      <h2>How to use the Dragon guide</h2>
      <p>Use this page as a reference for Dragon years, meanings, and symbolic vocabulary. If you are checking a birthday, start with the year table and Lunar New Year date. If you are comparing zodiac meanings, use the Dragon animal guide first, then move to element pages for more specific 60-year-cycle labels.</p>
      <p>This separation keeps the answer accurate. The Dragon sign gives the animal layer, while Wood, Fire, Earth, Metal, or Water gives the element layer. Both can be useful, but neither should be used as a fixed judgment about a real person's future or character.</p>
    </section>
    ${relatedGuidesBlock("Related Dragon and zodiac guides", [
      { title: "Dragon Chinese Zodiac", path: "/chinese-zodiac/dragon/", category: "Animal Guides", description: "Dragon years, quick facts, and traditional associations." },
      guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/")
    ].filter(Boolean))}
    ${faqBlock([
      { q: "What years are the Dragon in Chinese zodiac?", a: "Recent Dragon years include 1976, 1988, 2000, 2012, and 2024. The exact sign depends on the Lunar New Year boundary in each year." },
      { q: "Is 2024 the Year of the Dragon?", a: "Yes. 2024 is the Year of the Dragon, and it begins on February 10, 2024, the Lunar New Year date for that year." },
      { q: "What does the Dragon mean in Chinese zodiac culture?", a: "The Dragon is traditionally associated with strength, charisma, auspicious energy, ambition, and visible momentum." },
      { q: "Are Dragon zodiac traits scientific?", a: "No. Dragon traits are cultural personality associations, not scientific claims or fixed judgments about a person." }
    ])}
    <section class="content-section article-body">
      <h2>Final note</h2>
      <p>The main point is simple: the Dragon sign is useful only after you check the Lunar New Year boundary for the birth year. Once the sign is confirmed, you can read the Dragon meaning, compare compatibility, or use the zodiac calculator to check another birthday.</p>
    </section>`
}));

await writePage("/guides/what-chinese-zodiac-sign-am-i/", pageLayout({
  title: "What Chinese Zodiac Sign Am I? Find Your Sign by Birth Date",
  description: "Find your Chinese zodiac sign by birth date, learn why Lunar New Year matters, and use a calculator to avoid early-year birthday mistakes.",
  path: "/guides/what-chinese-zodiac-sign-am-i/",
  h1: "What Chinese Zodiac Sign Am I?",
  intro: "Your Chinese zodiac sign depends on your birth date and the Lunar New Year start date for your birth year.",
    faqs: [
    { q: "How do I find my Chinese zodiac sign?", a: "Use your full birth date and compare it with the Lunar New Year date for that year. If your birthday is before Lunar New Year, use the previous zodiac year." },
    { q: "Does Chinese zodiac start on January 1?", a: "No. Chinese zodiac years start at Lunar New Year, so the start date changes each Gregorian year." },
    { q: "Why do January and February birthdays need checking?", a: "Because many Lunar New Year dates fall in January or February, so early-year birthdays can belong to the previous zodiac sign." },
    { q: "Can I use a calculator to find my Chinese zodiac sign?", a: "Yes. A Lunar New Year-aware calculator is the safest way to check the correct sign." }
  ],
  extraSchema: jsonLd({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to find your Chinese zodiac sign",
    step: [
      { "@type": "HowToStep", name: "Enter your full birth date" },
      { "@type": "HowToStep", name: "Check the Lunar New Year boundary" },
      { "@type": "HowToStep", name: "Use the zodiac animal and element for that year" }
    ]
  }),
  articleSidebar: true,
  body: `
    <section class="tool-page">${zodiacCalculatorBlock()}</section>
    <section class="content-section article-body">
      <p class="lead-answer">To find your Chinese zodiac sign, use your full birth date, not only your birth year. Chinese zodiac years start at Lunar New Year, not January 1. If your birthday is before Lunar New Year in your birth year, your traditional zodiac sign belongs to the previous zodiac year.</p>
      <p>This is the reason a person born in January or early February may get a different result from someone born later in the same Gregorian year.</p>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Short Answer</p>
        <h2>How to check your sign</h2>
      </div>
      <ol class="article-list">
        <li>Find your full birth date.</li>
        <li>Check the Lunar New Year date for your birth year.</li>
        <li>If your birthday is before Lunar New Year, use the previous zodiac year.</li>
        <li>Read the animal and element for that year.</li>
      </ol>
    </section>
    <section class="content-section article-body">
      <h2>How to avoid the most common lookup errors</h2>
      <p>The most common error is using the Gregorian year alone. This works for many birthdays, but it can fail for people born before Lunar New Year. The second error is ignoring the element. The animal repeats every 12 years, while the full animal-and-element label repeats every 60 years. Both details matter if the reader wants a precise cultural reference.</p>
      <p>The third error is treating the result as a fixed personality judgment. Chinese zodiac signs are traditional symbols. They can describe cultural themes, lucky colors, compatibility language, and annual labels, but they should not be used as proof about character, relationship outcome, career success, health, or money.</p>
      <p>A better workflow is simple: enter the full birth date, confirm the animal and element, open the animal guide, then read compatibility or element pages only if that is relevant to the question. That keeps the answer accurate and prevents one short chart from becoming misleading.</p>
    </section>
    <section class="content-section">
      <h2>Why birth year alone can be wrong</h2>
      <p>Many quick zodiac charts assign an animal by Gregorian year. That works for many birthdays, but it can be wrong for people born before Lunar New Year. Traditional Chinese zodiac years follow the lunar calendar, so the exact start date changes each year.</p>
      <p>For example, 2026 is the Year of the Horse, but it begins on February 17, 2026. A birthday before that date still belongs to the previous zodiac year.</p>
    </section>
    <section class="content-section">
      <h2>Quick reference chart</h2>
      <p>Use this chart for recent years, then use the calculator above if your birthday is near January or February.</p>
      ${yearsTable(years.filter((row) => row.year >= 2020 && row.year <= 2030))}
    </section>
    <section class="content-section">
      <h2>What the result means</h2>
      <p>Your zodiac result gives the traditional animal, element, and cultural associations for that birth year. It can be useful for learning Chinese culture, checking compatibility symbolism, or exploring lucky numbers and colors.</p>
      <p>It should not be treated as a scientific personality test or a fixed rule for relationships, work, health, or money.</p>
    </section>
    <section class="content-section article-body">
      <h2>What to read after finding your sign</h2>
      <p>If you only need the animal, the calculator result is enough. If you want to understand the meaning, open the animal page for years, Chinese character, pinyin, lucky symbols, personality associations, and cultural notes. If you want the full year label, compare the result with the element guide.</p>
      <p>If the question is about another person, check that person's full birth date separately. Do not assume two people born in the same Gregorian year have the same sign when one birthday is before Lunar New Year and the other is after it. For relationship questions, use the compatibility checker as a cultural reference, not as advice about what decision to make.</p>
      <p>For learning Chinese culture, the best path is animal order first, then year chart, then element cycle, then compatibility. That sequence explains the system more clearly than jumping directly from a birthday to a personality description.</p>
    </section>
    ${relatedGuidesBlock("Related zodiac lookup guides", [
      guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-animals/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-elements/"),
      guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/")
    ].filter(Boolean))}
    ${faqBlock([
      { q: "How do I find my Chinese zodiac sign?", a: "Use your full birth date and compare it with the Lunar New Year date for that year. If your birthday is before Lunar New Year, use the previous zodiac year." },
      { q: "Does Chinese zodiac start on January 1?", a: "No. Chinese zodiac years start at Lunar New Year, so the start date changes each Gregorian year." },
      { q: "Why do January and February birthdays need checking?", a: "Because many Lunar New Year dates fall in January or February, so early-year birthdays can belong to the previous zodiac sign." },
      { q: "Can I use a calculator to find my Chinese zodiac sign?", a: "Yes. A Lunar New Year-aware calculator is the safest way to check the correct sign." }
    ])}
    <section class="content-section article-body">
      <h2>Final note</h2>
      <p>The safest answer to "what Chinese zodiac sign am I?" comes from a full birth date and the Lunar New Year boundary. Use the calculator first, then open the animal guide to read the traditional meaning and cultural notes for your sign.</p>
    </section>`
}));

await writePage("/chinese-zodiac-calculator/", pageLayout({
  title: "Chinese Zodiac Calculator: Find Your Zodiac Animal by Birth Date",
  description: "Find your Chinese zodiac sign by birth date with a calculator that respects Lunar New Year boundaries.",
  path: "/chinese-zodiac-calculator/",
  h1: "Chinese Zodiac Calculator",
  intro: "Use your birth date to find your Chinese zodiac animal, element, and Lunar New Year boundary note.",
    faqs: [
    {
      q: "Why does the calculator ask for a full birth date?",
      a: "The full birth date is needed because Chinese zodiac years start at Lunar New Year, not January 1."
    },
    {
      q: "Can early January or February birthdays use the previous zodiac sign?",
      a: "Yes. If the birthday is before Lunar New Year, the traditional zodiac sign belongs to the previous zodiac year."
    }
  ],
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
    ${faqBlock([
      { q: "Why does the calculator ask for a full birth date?", a: "The full birth date is needed because Chinese zodiac years start at Lunar New Year, not January 1." },
      { q: "Can early January or February birthdays use the previous zodiac sign?", a: "Yes. If the birthday is before Lunar New Year, the traditional zodiac sign belongs to the previous zodiac year." }
    ])}`
}));

await writePage("/chinese-zodiac-years/", pageLayout({
  title: "Chinese Zodiac Years Chart with Lunar New Year Dates",
  description: "Browse a Chinese zodiac years chart with animals, elements, and Lunar New Year start dates.",
  path: "/chinese-zodiac-years/",
  h1: "Chinese Zodiac Years Chart",
  intro: "Use this chart to compare Gregorian years with Chinese zodiac animals, elements, and Lunar New Year start dates.",
  faqs: [
    {
      q: "Does each Chinese zodiac year start on January 1?",
      a: "No. Each zodiac year starts at Lunar New Year, so the start date changes by Gregorian year."
    },
    {
      q: "What does the element column mean?",
      a: "The element column shows the traditional five-element cycle paired with each zodiac animal year."
    }
  ],
  body: `
    <section class="tool-page">${yearSearchBlock()}</section>
    <section class="content-section">
      <h2>Chinese zodiac years</h2>
      ${yearsTable()}
    </section>
    ${yearCardsBlock("Featured yearly zodiac guides")}
    ${faqBlock([
      { q: "Does each Chinese zodiac year start on January 1?", a: "No. Each zodiac year starts at Lunar New Year, so the start date changes by Gregorian year." },
      { q: "What does the element column mean?", a: "The element column shows the traditional five-element cycle paired with each zodiac animal year." }
    ])}`
}));

await writePage("/chinese-zodiac-animals/", pageLayout({
  title: "Chinese Zodiac Animals in Order: 12 Signs and Meanings",
  description: "Learn the 12 Chinese zodiac animals in order, with Chinese names, pinyin, and short cultural meanings.",
  path: "/chinese-zodiac-animals/",
  h1: "Chinese Zodiac Animals in Order",
  intro: "The twelve Chinese zodiac animals repeat in a fixed cycle from Rat to Pig.",
  faqs: [
    { q: "What are the 12 Chinese zodiac animals in order?", a: "The order is Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig." },
    { q: "Do Chinese zodiac animals start on January 1?", a: "No. A Chinese zodiac year starts at Lunar New Year, so January and early February birthdays need a date check." },
    { q: "Are zodiac animal meanings fixed personality facts?", a: "No. Animal meanings are traditional cultural symbols, not scientific personality labels or predictions." }
  ],
  articleSidebar: true,
  body: `
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Animal Order</p>
        <h2>12 Chinese zodiac animals</h2>
      </div>
      <p>The Chinese zodiac animal cycle has a fixed order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig. Each animal page explains recent years, Chinese name, pinyin, element cycle, and traditional cultural meaning.</p>
      <div class="animal-grid">${animals.map(animalCard).join("")}</div>
    </section>
    <section class="content-section article-body">
      <h2>How to use the 12-animal order</h2>
      <p>The animal order is useful because it connects several parts of Chinese zodiac lookup. A birth year gives an animal, the animal points to a repeating 12-year cycle, and the exact sign still depends on the Lunar New Year boundary for that year. This means the animal list should be used with the year chart or calculator, not as a standalone January 1 chart.</p>
      <p>Each animal also carries a cultural vocabulary. Rat is often connected with resourcefulness, Ox with steady effort, Tiger with courage, Rabbit with diplomacy, Dragon with auspicious strength, Snake with insight, Horse with movement, Goat with harmony, Monkey with cleverness, Rooster with order, Dog with loyalty, and Pig with warmth. These meanings explain traditional symbolism; they are not scientific personality labels.</p>
      <p>For practical use, start with the animal order, then open the animal detail page for years, Chinese character, pinyin, lucky symbols, element context, and compatibility links. If the birthday is in January or February, use the calculator before trusting the animal label.</p>
      <p>The animal order also helps readers understand why signs repeat. After Pig, the cycle returns to Rat. This is why a person born twelve years apart from another person may share the same animal sign, while still having a different element. The animal list is therefore the entry point, but not the full system.</p>
    </section>
    <section class="content-section article-body">
      <h2>Animal signs, elements, and compatibility</h2>
      <p>The twelve animals are only one layer of the Chinese zodiac system. The five elements add a second layer, creating labels such as Wood Dragon, Fire Horse, Earth Tiger, Metal Snake, and Water Rabbit. Because the animal cycle and element cycle combine, the full animal-and-element pattern repeats every 60 years.</p>
      <p>Compatibility pages use the animals as cultural symbols for relationship, friendship, and work comparisons. They can be interesting for learning traditional language, but they should not be treated as final relationship advice. A responsible reading checks the two animal signs, reads the cultural symbolism, and still gives more weight to communication, values, timing, and real behavior.</p>
      <p>This page is therefore an index for deeper learning. Use it to choose an animal, then continue to the year chart, element guide, compatibility checker, or individual animal page depending on what question you are trying to answer.</p>
      <p>For readers exploring cultural gifts, zodiac decor, printable charts, or classroom materials, the animal order is still the safest starting point. Any gift idea or learning resource should connect back to accurate year lookup, because a beautiful zodiac chart loses trust if the sign calculation is wrong.</p>
    </section>
    <section class="content-section article-body">
      <h2>Why this page matters before reading detailed guides</h2>
      <p>The animal list gives the structure behind the whole site. Without it, a reader may jump directly into a year page, compatibility page, or lucky-symbol article without understanding how the twelve signs repeat. The order also explains why the same animal appears across many different Gregorian years.</p>
      <p>Use this page as the broad map. The year chart answers calendar questions, the animal pages answer meaning questions, the element guide answers 60-year-cycle questions, and the compatibility checker answers pair-comparison questions. Keeping those jobs separate makes the site easier to use and reduces the chance that a short zodiac label is mistaken for a complete explanation.</p>
      <p>For users comparing several signs, the best next step is to open the animal pages one at a time instead of relying only on the card summaries. The cards are useful for orientation, but the detail pages include years, elements, compatibility links, and the Lunar New Year reminder that prevents wrong sign assignments.</p>
    </section>
    ${faqBlock([
      { q: "What are the 12 Chinese zodiac animals in order?", a: "The order is Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig." },
      { q: "Do Chinese zodiac animals start on January 1?", a: "No. A Chinese zodiac year starts at Lunar New Year, so January and early February birthdays need a date check." },
      { q: "Are zodiac animal meanings fixed personality facts?", a: "No. Animal meanings are traditional cultural symbols, not scientific personality labels or predictions." }
    ])}`
}));

await writePage("/chinese-zodiac-elements/", pageLayout({
  title: "Chinese Zodiac Elements: Wood, Fire, Earth, Metal, and Water",
  description: "Learn how the five Chinese zodiac elements work with animal years, including Fire Horse, Wood Dragon, and other element combinations.",
  path: "/chinese-zodiac-elements/",
  h1: "Chinese Zodiac Elements",
  intro: "Chinese zodiac years combine the twelve animals with the five elements: Wood, Fire, Earth, Metal, and Water.",
  faqs: [
    { q: "What are the five Chinese zodiac elements?", a: "The five elements are Wood, Fire, Earth, Metal, and Water. They rotate through zodiac years." },
    { q: "What does Fire Horse mean?", a: "Fire Horse combines the Horse zodiac animal with the Fire element, a traditional pairing associated with energy and movement." }
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
    <section class="content-section article-body">
      <h2>How the five elements change a zodiac reading</h2>
      <p>The five elements do not replace the animal sign. They add tone to it. The animal gives the main symbol, while the element adds language about growth, action, stability, structure, or adaptability. That is why two people with the same animal sign can still have different full zodiac labels if they were born in different 60-year cycles.</p>
      <p>Wood is often read through growth and flexibility. Fire is read through energy and visibility. Earth is read through stability and support. Metal is read through structure and clarity. Water is read through adaptability and reflection. These meanings are traditional associations, not scientific descriptions of personality or fate.</p>
      <p>For accurate lookup, confirm the exact zodiac year first. The element belongs to the zodiac year, and the zodiac year begins at Lunar New Year. A January or early February birthday can belong to the previous animal and previous element, so the calculator or year table should be used before reading the element meaning.</p>
      <p>This is especially important for popular combinations such as Fire Horse, Wood Dragon, Water Rabbit, Metal Snake, or Earth Tiger. Searchers often remember the animal name first, but the element is what turns a general animal year into a specific 60-year-cycle label.</p>
    </section>
    <section class="content-section article-body">
      <h2>Common mistakes with Chinese zodiac elements</h2>
      <p>The first mistake is reading the element without the animal. Fire alone is not a complete zodiac sign; Fire Horse, Fire Rabbit, and Fire Dragon all use Fire language differently because the animal layer is different. The second mistake is treating element language as a fixed prediction. On this site, element notes are cultural explanations for learning and reference.</p>
      <p>The third mistake is ignoring the 60-year cycle. The same animal returns every 12 years, but the same animal-element combination returns every 60 years. A 2026 Fire Horse and a 1966 Fire Horse share the same full label, while a 2014 Horse has a different element. This is why element pages should always connect back to years, animal pages, and Lunar New Year dates.</p>
      <p>If you are comparing two zodiac signs, use the element as a secondary detail. Start with the animal, confirm the date, then read the element for extra cultural context. That order keeps the interpretation clear and avoids turning a symbolic system into an unsupported prediction.</p>
      <p>For a complete reference path, use the year lookup tool, open the animal page, then compare the element meaning. If the question is about two people, confirm both dates before opening compatibility pages. This keeps the site internally consistent and helps readers move from quick lookup to deeper cultural explanation.</p>
    </section>
    <section class="content-section article-body">
      <h2>Element meanings are secondary, not standalone answers</h2>
      <p>A common search pattern is to ask only for a phrase like Fire Horse, Wood Dragon, or Water Snake. The phrase is useful, but it is still built from two parts. The animal gives the primary zodiac symbol. The element gives the modifying tone. A good explanation should show both parts instead of treating the element as a separate horoscope.</p>
      <p>This is why element pages should link back to year pages and animal pages. If a reader wants to know what Fire Horse means, they need the Horse animal, the Fire element, the year boundary, and the reminder that the meaning is cultural symbolism. If one of those pieces is missing, the answer becomes too thin for real reference use.</p>
      <p>Use the full label.</p>
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
    { q: "What element is the 2026 Horse year?", a: "2026 is traditionally associated with the Fire element." }
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
      <p>The Fire element gives the 2026 Horse year a more active traditional reading. In cultural references, Fire is linked with visibility, warmth, expression, and forward motion. Combined with the Horse, the year is often described through themes of movement, initiative, travel, independence, and social energy.</p>
      <p>These meanings are educational and symbolic. They are useful for understanding Chinese zodiac language, seasonal content, and cultural references, but they should not be treated as personal predictions or professional advice.</p>
      <a class="button-link" href="/chinese-zodiac/horse/">Open the Horse zodiac guide</a>
    </section>
    <section class="content-section article-body">
      <h2>Why the 2026 Horse year does not start on January 1</h2>
      <p>The 2026 Chinese zodiac year begins on February 17, 2026. That date matters because Chinese zodiac years follow Lunar New Year, not the Gregorian calendar. Someone born on February 10, 2026 is still counted under the previous zodiac year, while someone born on February 20, 2026 belongs to the 2026 Fire Horse year.</p>
      <p>This boundary is the most important practical detail on the page. Many quick charts say 2026 is the Year of the Horse, which is broadly true, but the exact answer for a person depends on the full birth date. If the birthday is in January or February, use the zodiac calculator before assigning the sign.</p>
      <p>The same rule applies to every Chinese zodiac year. A year label is useful for culture, holidays, content planning, and broad reference, but birth-date lookup needs the Lunar New Year date. This is why the site links year pages, animal pages, and the calculator together.</p>
      <p>For 2026 content, the date boundary is also important because many people will search for Year of the Horse information before Lunar New Year arrives. The correct wording is that 2026 becomes the Fire Horse zodiac year on February 17, 2026, not automatically on January 1.</p>
    </section>
    <section class="content-section article-body">
      <h2>How to read Fire Horse symbolism responsibly</h2>
      <p>Fire Horse symbolism combines Horse themes with Fire themes. The Horse side points to movement, freedom, energy, and visible activity. The Fire side adds expression, warmth, action, and outward momentum. Together, the phrase Fire Horse is often used for a lively and high-energy cultural reading.</p>
      <p>That does not mean every person born in the Fire Horse year has the same personality. It also does not mean the year guarantees a particular event. The stronger use of this page is educational: it explains the animal, the element, the date boundary, and the traditional wording people may see in Chinese zodiac articles.</p>
      <p>For deeper reading, open the Horse guide to understand the animal sign, the elements guide to compare Fire with Wood, Earth, Metal, and Water, and the compatibility checker if the question is about symbolic relationship matching. Each step adds context without turning zodiac tradition into fixed advice.</p>
      <p>This page can also support practical seasonal content such as Lunar New Year explanations, zodiac gift ideas, classroom references, and cultural calendar pages. Those uses are appropriate as long as the article keeps the distinction between factual date lookup and symbolic meaning clear.</p>
    </section>
    <section class="content-section article-body">
      <h2>What to check before using the 2026 label</h2>
      <p>Before using the Year of the Horse 2026 label for a person, confirm whether the birthday is before or after February 17, 2026. Before using it for a calendar article, explain that the zodiac year begins at Lunar New Year. Before using it for compatibility or lucky-symbol content, connect the reader back to the Horse page, element page, and calculator.</p>
      <p>This extra context matters because 2026 will attract many short seasonal searches. A thin page might only say that 2026 is the Year of the Horse. A useful page explains the start date, Fire element, Horse symbolism, early-birthday exception, and next pages for deeper reading.</p>
      <p>For readers planning Lunar New Year content, this page should be used as a date and meaning reference. The factual layer is February 17, 2026, Horse, and Fire. The symbolic layer is movement, energy, independence, and visible action. Keeping those layers separate makes the page useful for calendars, classroom notes, cultural articles, and product planning without overstating what zodiac symbolism can prove.</p>
      <p>For readers checking a personal birthday, the practical action is different: enter the full date in the calculator, then read the Horse page only if the calculator confirms the Horse sign. That workflow matters because early-year birthdays are the main source of wrong answers.</p>
      <p>The same distinction also matters for internal linking. A reader who wants the 2026 annual meaning should stay on this page, then open the Horse and Fire element references. A reader who wants their own sign should go to the calculator first. A reader who wants relationship symbolism should confirm both signs before opening compatibility pages. Those paths make the page more useful than a short seasonal note for real visitors and searchers.</p>
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
  faqs: [
    {
      q: "What does the compatibility checker compare?",
      a: "It compares two zodiac animals across traditional love, friendship, and work symbolism."
    },
    {
      q: "Is the compatibility score scientific?",
      a: "No. The score is a cultural and entertainment reference, not relationship advice."
    }
  ],
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
        return `<a class="pair-card" href="/chinese-zodiac-compatibility/${pairSlug(pair.first, pair.second)}/">
          <span class="pair-icons">${animalSeal(pair.first, firstAnimal.name)}${animalSeal(pair.second, secondAnimal.name)}</span>
          <strong>${firstAnimal.name} + ${secondAnimal.name}</strong>
          <span class="match-label">${pair.level}</span>
          <small>${pair.score}/100 match score</small>
        </a>`;
      }).join("")}</div>
    </section>
    <section class="content-section">
      <h2>How to read zodiac compatibility</h2>
      <p>Chinese zodiac compatibility is traditionally explained through animal relationships, element cycles, and cultural symbolism. It should be read as folklore and entertainment, not as relationship advice.</p>
    </section>
    ${faqBlock([
      { q: "What does the compatibility checker compare?", a: "It compares two zodiac animals across traditional love, friendship, and work symbolism." },
      { q: "Is the compatibility score scientific?", a: "No. The score is a cultural and entertainment reference, not relationship advice." }
    ])}`
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
      { q: `What is the match score for ${firstAnimal.name} and ${secondAnimal.name}?`, a: `This cultural reference gives the pair a ${pair.score}/100 symbolic match score.` }
    ],
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
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
      ${compatibilityNarrative(pair, firstAnimal, secondAnimal)}
      ${relatedGuidesBlock("Compatibility guides", [
        guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/"),
        { title: `${firstAnimal.name} Chinese Zodiac`, path: `/chinese-zodiac/${firstAnimal.animal}/`, category: "Animal Guides", description: `${firstAnimal.name} years, meaning, and cultural associations.` },
        { title: `${secondAnimal.name} Chinese Zodiac`, path: `/chinese-zodiac/${secondAnimal.animal}/`, category: "Animal Guides", description: `${secondAnimal.name} years, meaning, and cultural associations.` }
      ].filter(Boolean))}
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
      { q: `When does the ${item.year} Chinese zodiac year start?`, a: `It starts on ${item.lunarNewYear}, the Lunar New Year date for ${item.year}.` }
    ],
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
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
      ${yearReferenceNarrative(item, animal)}
      ${relatedGuidesBlock("Related zodiac guides", [
        { title: `${animal.name} Chinese Zodiac`, path: `/chinese-zodiac/${animal.animal}/`, category: "Animal Guides", description: `${animal.name} years, meaning, and cultural associations.` },
        guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
        guides.find((guide) => guide.path === "/chinese-zodiac-elements/")
      ].filter(Boolean))}
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
      { q: `What does the ${animal.name} mean in Chinese zodiac culture?`, a: animal.meaning }
    ],
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
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
      <section class="content-section">
        <h2>How to read the ${animal.name} sign accurately</h2>
        <p>The ${animal.name} sign should be read with two checks. First, confirm the birth year against the Lunar New Year boundary, especially for January and February birthdays. Second, separate the animal sign from the element cycle. The animal repeats every 12 years, while the full animal-and-element combination repeats every 60 years.</p>
        <p>This matters because two ${animal.name} years can have different element labels and different cultural wording. A Wood ${animal.name}, Fire ${animal.name}, Earth ${animal.name}, Metal ${animal.name}, and Water ${animal.name} all share the animal, but the element gives a second layer of traditional interpretation. For practical use, start with the year table, then move to element and compatibility pages only after the sign is confirmed.</p>
        <p>When using the ${animal.name} page for quick reference, treat the lucky numbers, colors, and personality notes as cultural vocabulary. They can help explain how the sign is described in traditional writing, but they should not be used as instructions for decisions about work, relationships, health, or money.</p>
        <p>If you need a more specific reading, move from this animal page to a year page or an element page. That gives the exact Gregorian year, Lunar New Year start date, and element label instead of relying on the animal sign alone.</p>
      </section>
      ${animalReferenceNarrative(animal)}
      ${relatedGuidesBlock("Related zodiac guides", [
        guides.find((guide) => guide.path === "/chinese-zodiac-animals/"),
        guides.find((guide) => guide.path === "/chinese-zodiac-years/"),
        guides.find((guide) => guide.path === "/chinese-zodiac-compatibility/")
      ].filter(Boolean))}
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
  body: `${articleSearchBlock()}
    <section class="content-section article-body">
      <h2>How to use this FAQ</h2>
      <p>This FAQ collects the most common Chinese zodiac questions about signs, years, Lunar New Year boundaries, animals, elements, and compatibility. Start with birth date questions if you want to find your own sign, then use the animal and compatibility sections for traditional cultural meanings.</p>
      <p>The answers are written for quick reference. Chinese zodiac years do not always match January 1, so questions about January and February birthdays should always be checked against the Lunar New Year date for the birth year.</p>
      <p>Compatibility and personality descriptions on this site are cultural explanations, not scientific tests or fixed predictions. They are best used as learning material for Chinese zodiac symbolism.</p>
    </section>
    ${faqBlock(standardFaqs())}`
}));

await writePage("/about/", simpleInfoPage({
  path: "/about/",
  h1: "About Chinese Zodiac Guide",
  title: "About Chinese Zodiac Guide",
  intro: "Chinese Zodiac Guide is an English reference site for learning Chinese zodiac signs, years, animals, elements, and compatibility traditions.",
  sections: [
    {
      title: "What this site provides",
      text: "Chinese Zodiac Guide explains Chinese zodiac culture in a practical, easy-to-read format. The site includes a birth date calculator, zodiac year chart, animal guides, five element explanations, compatibility references, and article-style guides for common search questions."
    },
    {
      title: "How the content is written",
      text: "The content is built around clear definitions, Lunar New Year boundaries, traditional symbolism, and internal cross-references. The goal is to help readers understand Chinese zodiac topics without treating folklore as fixed prediction or professional advice."
    },
    {
      title: "Cultural and educational purpose",
      text: "Chinese zodiac meanings, lucky symbols, elements, and compatibility notes are presented as cultural references. They are suitable for learning, comparison, and entertainment, but they should not be used as medical, legal, financial, relationship, or life advice."
    },
    {
      title: "Corrections and updates",
      text: "If you notice an unclear explanation, a date that should be checked, or a topic that needs better cultural context, you can contact the site owner by email."
    }
  ]
}));

await writePage("/contact/", simpleInfoPage({
  path: "/contact/",
  h1: "Contact Chinese Zodiac Guide",
  title: "Contact Chinese Zodiac Guide",
  intro: "Use this page for questions, corrections, feedback, and business contact related to Chinese Zodiac Guide.",
  sections: [
    {
      title: "Email contact",
      text: "For site feedback, correction requests, partnership questions, or general business contact, email guan@shanyuegroup.com."
    },
    {
      title: "Content corrections",
      text: "If you contact us about a zodiac year, Lunar New Year boundary, animal meaning, element explanation, or compatibility page, please include the page URL and the specific sentence or date you want us to review."
    },
    {
      title: "Advertising and business inquiries",
      text: "Advertising, sponsorship, affiliate, ecommerce, and product collaboration inquiries can also be sent to guan@shanyuegroup.com. We do not accept requests that would make cultural reference content misleading or unsafe."
    },
    {
      title: "Response expectations",
      text: "This is a small independent website, so response times may vary. The site does not provide personal fortune-telling, professional advice, or individual life decision guidance by email."
    }
  ]
}));

await writePage("/privacy/", simpleLegalPage({
  h1: "Privacy Policy",
  intro: "This privacy policy explains how Chinese Zodiac Guide handles basic site data, analytics, and third-party services.",
  sections: [
    {
      title: "Information this site collects",
      text: "Chinese Zodiac Guide is a static cultural reference website. The public pages do not require login, account registration, or user profiles. If analytics is enabled, the site may collect aggregate usage data such as page views, device type, browser type, approximate region, traffic source, and interaction events. This data is used to understand which zodiac tools and guides are useful."
    },
    {
      title: "Analytics and advertising",
      text: "The site may use Google Analytics or similar privacy-conscious analytics tools. These tools help measure traffic and improve page quality. If advertising is added later, ad partners may use cookies or similar technologies according to their own policies. The site does not sell personal user profiles."
    },
    {
      title: "Contact and data requests",
      text: "If contact forms, email links, payment tools, or subscription features are added later, this policy should be updated before those features go live. Any future API keys, payment secrets, or private credentials must be stored outside frontend code and handled through secure environment variables or server-side services."
    }
  ]
}));
await writePage("/terms/", simpleLegalPage({
  h1: "Terms of Use",
  intro: "These terms explain how to use Chinese Zodiac Guide and the limits of the cultural information provided on this site.",
  sections: [
    {
      title: "Cultural reference only",
      text: "Chinese Zodiac Guide provides educational and cultural information about zodiac animals, years, elements, compatibility symbolism, and related traditions. The tools and articles are for learning, reference, and entertainment. They are not professional, financial, legal, medical, relationship, or life advice."
    },
    {
      title: "Accuracy and limitations",
      text: "The site aims to explain Chinese zodiac year boundaries, Lunar New Year dates, animal meanings, and traditional associations clearly. However, zodiac interpretations vary by source and cultural context. Users should treat compatibility scores, lucky symbols, and personality descriptions as symbolic references rather than fixed facts or predictions."
    },
    {
      title: "Use of the website",
      text: "You may use the site for personal learning and general cultural research. Do not misuse the website, attempt to disrupt its availability, scrape it in a way that harms performance, or represent the cultural explanations as guaranteed outcomes. If paid products, subscriptions, or ecommerce features are added later, separate payment and refund terms should be published before launch."
    }
  ]
}));


const dailyArticles20260706 = [
  {
    "title": "Chinese Zodiac Compatibility Chart: Animal Matches and Reading Limits",
    "path": "/guides/chinese-zodiac-compatibility-chart/",
    "description": "Read a Chinese zodiac compatibility chart with animal matches, practical limits, and responsible relationship interpretation.",
    "h1": "Chinese Zodiac Compatibility Chart: Animal Matches and Reading Limits",
    "intro": "A Chinese zodiac compatibility chart is useful only when it is read as symbolic guidance, not as a relationship verdict.",
    "answer": "A Chinese zodiac compatibility chart compares animal pairs as symbolic relationship patterns, but it should be used as cultural reference rather than proof that two people will succeed or fail together.",
    "details": [
      "For chinese zodiac compatibility chart, the useful answer starts with the reader's situation rather than a broad definition. Someone searching this phrase usually wants to make a decision, compare a few choices, or avoid a mistake before spending time or money. The safest reading is to treat animal matches and symbolic relationship reading as practical guidance with cultural context, not as a fixed rule that applies to every family, meal, product, or tradition. That matters for relationship comparison, dating curiosity, and cultural learning, because a short answer can be technically correct but still fail if it does not explain what the reader should check next.",
      "A strong page should give the main answer early, then separate cultural meaning, practical judgment, common mistakes, and the next reader path. That structure helps a beginner get oriented quickly while still giving enough detail for search engines and answer engines to extract a clear explanation.",
      "The key boundary is responsibility. Chinese Zodiac Compatibility Chart can be useful and interesting, but the page should not promise guaranteed luck, perfect compatibility, permanent results, or universal family history. It should show how to evaluate the topic and when to keep checking context."
    ],
    "sections": [
      {
        "title": "How to read the chart first",
        "paragraphs": [
          "The direct answer is this: A Chinese zodiac compatibility chart compares animal pairs as symbolic relationship patterns, but it should be used as cultural reference rather than proof that two people will succeed or fail together. The first decision is not whether the topic is important in theory, but whether it solves the reader's actual problem. If the reader is choosing a product, planning a gift, learning a technique, or researching a family name, the page should give a usable next step instead of only repeating background information.",
          "A common scenario is a visitor who knows one phrase but not the surrounding context. They may know the English spelling, the product name, a symbolic color, or the tutorial label, yet still be unsure which detail matters. This is why the opening answer needs to define the topic and immediately explain how to use that definition in real life."
        ]
      },
      {
        "title": "Cultural meaning behind animal matches",
        "paragraphs": [
          "Cultural context gives the topic meaning, but it should not turn into decoration. The reader needs to know where the idea fits, why people care about it, and which claims should be treated carefully. For chinese zodiac compatibility chart, the strongest explanation connects tradition with a practical situation: choosing, learning, comparing, gifting, or researching.",
          "The cautious approach is to describe symbolism as symbolism. A color can express a wish, a surname can point toward a lineage clue, a knot can represent connection, and a tool can support reflection. None of those meanings should be written as a guaranteed outcome. Clear boundaries make the page more trustworthy and more useful for long-term SEO."
        ]
      },
      {
        "title": "Practical checks before trusting a match",
        "paragraphs": [
          "The practical check is to compare the visible details. Look at material, spelling, source, date, use case, photo evidence, or the exact question the visitor is trying to answer. If those details are missing, the page should say so. A responsible guide gives the reader a checklist rather than pretending one short answer covers every case.",
          "A good comparison also explains tradeoffs. A beginner may need ease before beauty. A gift buyer may need presentation before technical depth. A researcher may need primary records before a neat story. A culture-focused reader may need meaning and limitations together. Those tradeoffs are what make the article feel written for a person rather than generated for a keyword."
        ]
      },
      {
        "title": "Common mistakes in compatibility pages",
        "paragraphs": [
          "The most common mistake is overgeneralizing. Readers often want a single best answer, but chinese zodiac compatibility chart usually depends on context. The page should warn against vague product descriptions, missing character evidence, unclear tutorial steps, or symbolic claims that sound stronger than the tradition supports.",
          "Another mistake is ignoring the next action. After reading, the visitor should know whether to compare related guides, use a tool, check a material list, review pronunciation, or look for a better product photo. A page that ends without a next step wastes attention and weakens internal linking."
        ]
      },
      {
        "title": "Reader paths for couples, learners, and writers",
        "paragraphs": [
          "Different readers need different paths. Beginners should start with the simplest working version. Buyers should check quality signals before style. Gift givers should match symbolism with the recipient and occasion. Researchers should verify spelling, source, and historical context before repeating a claim.",
          "This reader-path section is also where internal links matter. The article should route people toward the closest guide instead of dumping every related page at the end. Natural routing helps visitors continue and helps search engines understand the topical cluster."
        ]
      },
      {
        "title": "Final judgment for responsible use",
        "paragraphs": [
          "The final decision rule is simple: use chinese zodiac compatibility chart as a structured reference, then check the detail that changes the answer. If the detail is material, inspect construction and care. If the detail is culture, keep the wording bounded. If the detail is family history, verify the character or source. If the detail is a learning task, practice the simplest version first.",
          "This makes the page useful today and expandable later. Product blocks, paid reports, printable guides, or affiliate recommendations can be added only after the core explanation is strong enough to stand on its own. That is the standard these new pages should follow."
        ]
      }
    ],
    "table": {
      "title": "Quick decision table",
      "headers": [
        "Reader goal",
        "What to check",
        "Why it matters"
      ],
      "rows": [
        [
          "Beginner",
          "Start with the simplest safe version",
          "It reduces confusion and makes the first result easier to judge"
        ],
        [
          "Buyer or gift giver",
          "Check material, size, photos, and explanation",
          "Good presentation should not hide weak construction or vague claims"
        ],
        [
          "Researcher",
          "Verify source, spelling, date, or cultural context",
          "A clean claim is not reliable unless the evidence behind it is clear"
        ],
        [
          "Culture-focused reader",
          "Read meaning and limitation together",
          "Symbolic language is useful when it stays responsible"
        ]
      ]
    },
    "faqs": [
      {
        "q": "What is the short answer about chinese zodiac compatibility chart?",
        "a": "A Chinese zodiac compatibility chart compares animal pairs as symbolic relationship patterns, but it should be used as cultural reference rather than proof that two people will succeed or fail together."
      },
      {
        "q": "What is the biggest mistake with chinese zodiac compatibility chart?",
        "a": "The biggest mistake is treating one symbolic or practical rule as universal. The better approach is to check the use case, source, material, spelling, or learning context before making a decision."
      },
      {
        "q": "Can chinese zodiac compatibility chart be used for buying or paid products later?",
        "a": "Yes, but only after the free explanation is useful on its own. Product or report offers should support the reader's decision instead of replacing clear guidance."
      },
      {
        "q": "How should a beginner use this chinese zodiac compatibility chart guide?",
        "a": "A beginner should read the answer first, follow the checklist, avoid overclaiming, and then move to the most closely related guide for the next step."
      }
    ],
    "related": [
      {
        "title": "Chinese Zodiac Compatibility",
        "path": "/chinese-zodiac-compatibility/",
        "category": "Compatibility",
        "description": "Use the compatibility tool and pair notes."
      },
      {
        "title": "Chinese Zodiac Animals",
        "path": "/chinese-zodiac-animals/",
        "category": "Animals",
        "description": "Review the twelve animal meanings."
      },
      {
        "title": "What Chinese Zodiac Sign Am I?",
        "path": "/guides/what-chinese-zodiac-sign-am-i/",
        "category": "Guide",
        "description": "Check the correct animal before comparing."
      }
    ]
  },
  {
    "title": "Chinese Zodiac Lucky Colors: Meanings, Uses, and Limits",
    "path": "/guides/chinese-zodiac-lucky-colors/",
    "description": "Understand Chinese zodiac lucky colors by animal symbolism, practical use, cultural limits, and responsible wording.",
    "h1": "Chinese Zodiac Lucky Colors: Meanings, Uses, and Limits",
    "intro": "Lucky colors are best treated as cultural symbols that can guide gifts, decor, and personal style, not as guaranteed outcomes.",
    "answer": "Chinese zodiac lucky colors are symbolic color associations linked to animals, elements, seasons, and cultural taste; they can guide gifts or decor, but they should not be described as guaranteed luck.",
    "details": [
      "For chinese zodiac lucky colors, the useful answer starts with the reader's situation rather than a broad definition. Someone searching this phrase usually wants to make a decision, compare a few choices, or avoid a mistake before spending time or money. The safest reading is to treat color symbolism and practical cultural use as practical guidance with cultural context, not as a fixed rule that applies to every family, meal, product, or tradition. That matters for gift choices, decor ideas, and zodiac reference writing, because a short answer can be technically correct but still fail if it does not explain what the reader should check next.",
      "A strong page should give the main answer early, then separate cultural meaning, practical judgment, common mistakes, and the next reader path. That structure helps a beginner get oriented quickly while still giving enough detail for search engines and answer engines to extract a clear explanation.",
      "The key boundary is responsibility. Chinese Zodiac Lucky Colors can be useful and interesting, but the page should not promise guaranteed luck, perfect compatibility, permanent results, or universal family history. It should show how to evaluate the topic and when to keep checking context."
    ],
    "sections": [
      {
        "title": "What lucky colors mean in practice",
        "paragraphs": [
          "The direct answer is this: Chinese zodiac lucky colors are symbolic color associations linked to animals, elements, seasons, and cultural taste; they can guide gifts or decor, but they should not be described as guaranteed luck. The first decision is not whether the topic is important in theory, but whether it solves the reader's actual problem. If the reader is choosing a product, planning a gift, learning a technique, or researching a family name, the page should give a usable next step instead of only repeating background information.",
          "A common scenario is a visitor who knows one phrase but not the surrounding context. They may know the English spelling, the product name, a symbolic color, or the tutorial label, yet still be unsure which detail matters. This is why the opening answer needs to define the topic and immediately explain how to use that definition in real life."
        ]
      },
      {
        "title": "Where zodiac color symbolism comes from",
        "paragraphs": [
          "Cultural context gives the topic meaning, but it should not turn into decoration. The reader needs to know where the idea fits, why people care about it, and which claims should be treated carefully. For chinese zodiac lucky colors, the strongest explanation connects tradition with a practical situation: choosing, learning, comparing, gifting, or researching.",
          "The cautious approach is to describe symbolism as symbolism. A color can express a wish, a surname can point toward a lineage clue, a knot can represent connection, and a tool can support reflection. None of those meanings should be written as a guaranteed outcome. Clear boundaries make the page more trustworthy and more useful for long-term SEO."
        ]
      },
      {
        "title": "How to use colors for gifts and decor",
        "paragraphs": [
          "The practical check is to compare the visible details. Look at material, spelling, source, date, use case, photo evidence, or the exact question the visitor is trying to answer. If those details are missing, the page should say so. A responsible guide gives the reader a checklist rather than pretending one short answer covers every case.",
          "A good comparison also explains tradeoffs. A beginner may need ease before beauty. A gift buyer may need presentation before technical depth. A researcher may need primary records before a neat story. A culture-focused reader may need meaning and limitations together. Those tradeoffs are what make the article feel written for a person rather than generated for a keyword."
        ]
      },
      {
        "title": "Mistakes to avoid with color claims",
        "paragraphs": [
          "The most common mistake is overgeneralizing. Readers often want a single best answer, but chinese zodiac lucky colors usually depends on context. The page should warn against vague product descriptions, missing character evidence, unclear tutorial steps, or symbolic claims that sound stronger than the tradition supports.",
          "Another mistake is ignoring the next action. After reading, the visitor should know whether to compare related guides, use a tool, check a material list, review pronunciation, or look for a better product photo. A page that ends without a next step wastes attention and weakens internal linking."
        ]
      },
      {
        "title": "Reader paths by use case",
        "paragraphs": [
          "Different readers need different paths. Beginners should start with the simplest working version. Buyers should check quality signals before style. Gift givers should match symbolism with the recipient and occasion. Researchers should verify spelling, source, and historical context before repeating a claim.",
          "This reader-path section is also where internal links matter. The article should route people toward the closest guide instead of dumping every related page at the end. Natural routing helps visitors continue and helps search engines understand the topical cluster."
        ]
      },
      {
        "title": "Final judgment for color guidance",
        "paragraphs": [
          "The final decision rule is simple: use chinese zodiac lucky colors as a structured reference, then check the detail that changes the answer. If the detail is material, inspect construction and care. If the detail is culture, keep the wording bounded. If the detail is family history, verify the character or source. If the detail is a learning task, practice the simplest version first.",
          "This makes the page useful today and expandable later. Product blocks, paid reports, printable guides, or affiliate recommendations can be added only after the core explanation is strong enough to stand on its own. That is the standard these new pages should follow."
        ]
      }
    ],
    "table": {
      "title": "Quick decision table",
      "headers": [
        "Reader goal",
        "What to check",
        "Why it matters"
      ],
      "rows": [
        [
          "Beginner",
          "Start with the simplest safe version",
          "It reduces confusion and makes the first result easier to judge"
        ],
        [
          "Buyer or gift giver",
          "Check material, size, photos, and explanation",
          "Good presentation should not hide weak construction or vague claims"
        ],
        [
          "Researcher",
          "Verify source, spelling, date, or cultural context",
          "A clean claim is not reliable unless the evidence behind it is clear"
        ],
        [
          "Culture-focused reader",
          "Read meaning and limitation together",
          "Symbolic language is useful when it stays responsible"
        ]
      ]
    },
    "faqs": [
      {
        "q": "What is the short answer about chinese zodiac lucky colors?",
        "a": "Chinese zodiac lucky colors are symbolic color associations linked to animals, elements, seasons, and cultural taste; they can guide gifts or decor, but they should not be described as guaranteed luck."
      },
      {
        "q": "What is the biggest mistake with chinese zodiac lucky colors?",
        "a": "The biggest mistake is treating one symbolic or practical rule as universal. The better approach is to check the use case, source, material, spelling, or learning context before making a decision."
      },
      {
        "q": "Can chinese zodiac lucky colors be used for buying or paid products later?",
        "a": "Yes, but only after the free explanation is useful on its own. Product or report offers should support the reader's decision instead of replacing clear guidance."
      },
      {
        "q": "How should a beginner use this chinese zodiac lucky colors guide?",
        "a": "A beginner should read the answer first, follow the checklist, avoid overclaiming, and then move to the most closely related guide for the next step."
      }
    ],
    "related": [
      {
        "title": "Chinese Zodiac Elements",
        "path": "/chinese-zodiac-elements/",
        "category": "Elements",
        "description": "Read element context with colors."
      },
      {
        "title": "Year of the Horse 2026",
        "path": "/year-of-the-horse-2026/",
        "category": "Year Guide",
        "description": "See year-specific symbolic notes."
      },
      {
        "title": "Chinese Zodiac Animals",
        "path": "/chinese-zodiac-animals/",
        "category": "Animals",
        "description": "Compare animal meanings first."
      }
    ]
  },
  {
    "title": "1996 Year of the Chinese Zodiac: Fire Rat Meaning and Date Checks",
    "path": "/guides/1996-year-of-the-chinese-zodiac/",
    "description": "Check the 1996 year of the Chinese zodiac, Fire Rat meaning, lunar New Year boundary, personality notes, compatibility, and responsible use.",
    "h1": "1996 Year of the Chinese Zodiac: Fire Rat Meaning and Date Checks",
    "intro": "Most people born after the 1996 Lunar New Year belong to the Fire Rat year, but January and early February birthdays need a boundary check.",
    "answer": "The 1996 year of the Chinese zodiac is usually the Fire Rat year for people born from February 19, 1996 to February 6, 1997; people born before that Lunar New Year date are usually counted in the previous Pig year.",
    "details": [
      "The main query looks simple, but the answer depends on the Chinese lunar calendar rather than January 1. If a visitor was born in January or early February 1996, the correct next step is to check the exact birthday against the Lunar New Year boundary before reading Rat meanings.",
      "For most later 1996 birthdays, the useful interpretation is Fire Rat: Rat gives the animal framework, while Fire adds a more active, expressive, and visible quality in traditional five-element language. These are cultural associations, not personality tests.",
      "The safest way to use this guide is to separate three jobs: identify the correct sign, understand the symbolic meaning, and decide whether the reader needs a calculator, compatibility page, or year-specific reference next."
    ],
    "sections": [
      {
        "title": "How the 1996 boundary works",
        "paragraphs": [
          "Chinese zodiac years follow the lunar New year rhythm, so 1996 does not begin with the Rat on January 1. The practical boundary is February 19, 1996. A person born on February 20 can normally read the Fire Rat notes. A person born on February 1 should not assume Rat without checking the previous year.",
          "This matters because many quick charts only list a Western year and animal. That shortcut is fine for casual browsing, but it creates wrong answers for early-year birthdays. When you use a zodiac calculator or prepare a birthday article, the birth date is more important than the calendar-year label."
        ]
      },
      {
        "title": "What Fire Rat means",
        "paragraphs": [
          "Rat symbolism is often connected with alertness, resourcefulness, planning, and social awareness. Fire adds imagery of visibility, warmth, speed, and outward confidence. Read together, Fire Rat descriptions often sound energetic and quick-moving, with a stronger need to manage impatience or overextension.",
          "These meanings are traditional shorthand. They can be useful for learning, gift copy, classroom content, or cultural curiosity, but they should not be used to judge a person. A real person is shaped by family, education, choices, environment, and many factors outside a zodiac label."
        ]
      },
      {
        "title": "Compatibility and relationship reading",
        "paragraphs": [
          "For compatibility, Rat is often compared with Dragon, Monkey, and Ox in simplified charts, while Horse is sometimes shown as more challenging. Treat those pairings as symbolic conversation starters. They are not evidence that a relationship will work or fail.",
          "If you are checking a partner, the useful question is not only whether the animals match. First confirm both birth dates, then read the compatibility page for relationship themes, communication style, and limits. A chart is weaker when it gives a yes-or-no answer without explaining why."
        ]
      },
      {
        "title": "Common mistakes with 1996 zodiac pages",
        "paragraphs": [
          "The biggest mistake is assigning Rat to every person born in 1996. The second mistake is reading Fire Rat traits as fixed destiny. The third mistake is mixing Western zodiac months with Chinese zodiac years and then expecting one system to answer every question.",
          "Another practical mistake is ignoring the element. A plain Rat page can explain the animal, but a Fire Rat page gives a more specific cultural reading. If the reader needs a precise answer for a birthday gift, baby-name note, or family article, the element should be mentioned clearly."
        ]
      },
      {
        "title": "How to use this answer responsibly",
        "paragraphs": [
          "Use the 1996 Fire Rat result as a starting point. For a birthday before February 19, use the zodiac calculator. For a relationship question, move to the compatibility chart. For symbolic colors, read the lucky-color guide and keep the wording bounded.",
          "This article also supports future paid or interactive tools because the free answer is already complete: date boundary, animal, element, meaning, limits, and next path. That structure is what prevents a year page from feeling thin."
        ]
      }
    ],
    "table": {
      "title": "Quick decision table",
      "headers": ["Reader goal", "What to check", "Why it matters"],
      "rows": [
        [
          "Beginner",
          "Start with the one detail that changes the answer",
          "It prevents the article from becoming a broad definition with no action"
        ],
        [
          "Buyer or gift giver",
          "Compare use case, photos, material, and maintenance",
          "A practical purchase needs more than a decorative claim"
        ],
        [
          "Researcher",
          "Verify calendar, spelling, character, or source context",
          "Clean wording is not reliable unless the evidence is clear"
        ],
        [
          "Culture-focused reader",
          "Read symbolic meaning with its limits",
          "Responsible wording keeps cultural content useful and credible"
        ]
      ]
    },
    "faqs": [
      {
        "q": "What Chinese zodiac animal is 1996?",
        "a": "Most people born from February 19, 1996 to February 6, 1997 are Fire Rat in the Chinese zodiac."
      },
      {
        "q": "Is everyone born in 1996 a Rat?",
        "a": "No. People born before the 1996 Lunar New Year date usually belong to the previous Pig year, so early-year birthdays need a date check."
      },
      {
        "q": "What does Fire Rat mean?",
        "a": "Fire Rat combines Rat symbolism such as alertness and resourcefulness with Fire symbolism such as energy, visibility, and quick action."
      },
      {
        "q": "Can 1996 Chinese zodiac predict personality?",
        "a": "No. It is a traditional cultural association, not a scientific personality test or fixed life prediction."
      }
    ],
    "related": [
      {
        "title": "Chinese Birth Signs",
        "path": "/guides/chinese-birth-signs/",
        "category": "Calculator",
        "description": "Check early-year birthdays."
      },
      {
        "title": "Chinese Zodiac Compatibility Chart",
        "path": "/guides/chinese-zodiac-compatibility-chart/",
        "category": "Compatibility",
        "description": "Compare animal pairings responsibly."
      },
      {
        "title": "Chinese Zodiac Lucky Colors",
        "path": "/guides/chinese-zodiac-lucky-colors/",
        "category": "Meaning",
        "description": "Use color symbolism with limits."
      }
    ]
  },
  {
    "title": "2003 Year of the Chinese Zodiac: Water Goat Meaning and Boundary",
    "path": "/guides/2003-year-of-the-chinese-zodiac/",
    "description": "Understand the 2003 year of the Chinese zodiac, Water Goat meaning, Lunar New Year boundary, traits, compatibility, and common mistakes.",
    "h1": "2003 Year of the Chinese Zodiac: Water Goat Meaning and Boundary",
    "intro": "The 2003 Chinese zodiac is usually the Water Goat year, but January birthdays belong to the previous Horse year unless the lunar boundary has passed.",
    "answer": "The 2003 year of the Chinese zodiac is usually Water Goat for people born from February 1, 2003 to January 21, 2004; people born before February 1, 2003 are usually counted in the previous Horse year.",
    "details": [
      "A 2003 zodiac search usually comes from a birthday check, a compatibility question, or a quick meaning lookup. The answer should therefore begin with the lunar boundary before moving into Goat symbolism.",
      "Goat is often associated with gentleness, taste, patience, and sensitivity in Chinese zodiac writing. Water adds flexibility, emotional awareness, and a softer style of response. These are cultural patterns, not permanent judgments about a person.",
      "The best use of this page is practical: confirm the sign, understand the element, avoid overclaiming, then continue to a calculator, compatibility page, animal guide, or symbolic-color page depending on the reader's goal."
    ],
    "sections": [
      {
        "title": "The 2003 lunar boundary",
        "paragraphs": [
          "The Water Goat year begins on February 1, 2003. That means a person born on January 20, 2003 is not automatically a Goat. They usually belong to the previous Water Horse year, because the Chinese zodiac year had not changed yet.",
          "This is the most important check for any year page. A clean article should make the boundary visible near the top. Without that, the page can rank for the keyword but still give the wrong answer to exactly the readers who need help most."
        ]
      },
      {
        "title": "What Water Goat means",
        "paragraphs": [
          "Goat symbolism is commonly linked with calmness, care, aesthetics, harmony, and the wish to avoid harsh conflict. Water adds a more adaptable and emotionally observant tone. Together, Water Goat is often described as gentle, thoughtful, and responsive to the surrounding environment.",
          "Those words should be handled carefully. A zodiac page can describe traditional associations, but it should not tell someone who they are. It is better to say that the sign suggests themes for reflection, gift language, or cultural learning."
        ]
      },
      {
        "title": "Compatibility, gifts, and daily use",
        "paragraphs": [
          "When readers ask about the 2003 Goat for compatibility, they often want to compare a partner, child, or friend. Simplified charts may pair Goat with Rabbit, Pig, or Horse and mark Ox as more challenging, but these are symbolic patterns rather than relationship rules.",
          "For gifts or decor, Goat symbolism can support softer colors, handmade objects, calm design, or thoughtful messages. The stronger buying advice is still practical: choose something the recipient will use, check quality, and avoid making a symbolic claim stronger than the tradition supports."
        ]
      },
      {
        "title": "Mistakes to avoid",
        "paragraphs": [
          "The first mistake is treating all 2003 birthdays as Goat. The second is confusing the animal with the element. The third is copying compatibility claims as if they were personal evidence. These mistakes make a page look confident but unreliable.",
          "Another mistake is writing only a few trait words. A high-quality year guide should explain the date range, animal, element, common uses, limits, and next step. That is what makes it useful for visitors and stronger for long-term search performance."
        ]
      },
      {
        "title": "Next steps after identifying Water Goat",
        "paragraphs": [
          "If the birthday is near the boundary, use the birth-sign calculator. If the reader wants relationship meaning, use the compatibility guide. If the reader wants symbolic presentation, read the lucky-color and animal pages before buying gifts or writing descriptions.",
          "For most readers, the final answer is simple: 2003 is Water Goat after February 1, but the right use of the sign depends on context. Keep the cultural meaning, practical check, and personal limits together."
        ]
      }
    ],
    "table": {
      "title": "Quick decision table",
      "headers": ["Reader goal", "What to check", "Why it matters"],
      "rows": [
        [
          "Beginner",
          "Start with the one detail that changes the answer",
          "It prevents the article from becoming a broad definition with no action"
        ],
        [
          "Buyer or gift giver",
          "Compare use case, photos, material, and maintenance",
          "A practical purchase needs more than a decorative claim"
        ],
        [
          "Researcher",
          "Verify calendar, spelling, character, or source context",
          "Clean wording is not reliable unless the evidence is clear"
        ],
        [
          "Culture-focused reader",
          "Read symbolic meaning with its limits",
          "Responsible wording keeps cultural content useful and credible"
        ]
      ]
    },
    "faqs": [
      {
        "q": "What Chinese zodiac animal is 2003?",
        "a": "Most people born from February 1, 2003 to January 21, 2004 are Water Goat in the Chinese zodiac."
      },
      {
        "q": "Is January 2003 Goat or Horse?",
        "a": "Most January 2003 birthdays are still Water Horse because the 2003 Lunar New Year began on February 1."
      },
      {
        "q": "What does Water Goat mean?",
        "a": "Water Goat combines Goat symbolism such as gentleness and harmony with Water symbolism such as adaptability and emotional awareness."
      },
      {
        "q": "Can 2003 zodiac compatibility decide a relationship?",
        "a": "No. Compatibility charts are symbolic cultural references, not proof of relationship outcome."
      }
    ],
    "related": [
      {
        "title": "Chinese Zodiac Animals",
        "path": "/chinese-zodiac-animals/",
        "category": "Animals",
        "description": "Compare animal meanings."
      },
      {
        "title": "Chinese Zodiac Compatibility",
        "path": "/chinese-zodiac-compatibility/",
        "category": "Tool",
        "description": "Use pair guidance carefully."
      },
      {
        "title": "Chinese Birth Signs",
        "path": "/guides/chinese-birth-signs/",
        "category": "Calculator",
        "description": "Check boundary birthdays."
      }
    ]
  }
];

function dailyArticlePage20260706(article) {
  const rows = article.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  const body = `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">${escapeHtml(article.answer)}</p>
      ${article.details.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </section>
    ${article.sections.map((section) => `<section class="content-section article-body"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("")}
    <section class="content-section"><p class="eyebrow">Decision Table</p><h2>${escapeHtml(article.table.title)}</h2><div class="table-wrap"><table><thead><tr>${article.table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>
    ${relatedGuidesBlock("Related guides", article.related)}
    ${faqBlock(article.faqs)}
  `;
  return pageLayout({
    title: article.title,
    description: article.description,
    path: article.path,
    h1: article.h1,
    intro: article.intro,
    faqs: article.faqs,
    pageType: "Article",
    articleSidebar: true,
    heroLabel: "New guide",
    body
  });
}

for (const article of dailyArticles20260706) {
  await writePage(article.path, dailyArticlePage20260706(article));
}

await writeStaticAssets();
await writeSitemap();
await writeRobots();
await writeLlms();
await writeSeoReport();

function faqBlock(faqs) {
  const groups = faqGroups(faqs);
  return `<section class="content-section faq-list">
    <h2>FAQ</h2>
    <div class="faq-layout" data-faq-layout>
      <aside class="faq-sidebar" aria-label="FAQ categories">
        ${groups.map((group, index) => `<section class="faq-menu-group${index === 0 ? " is-open" : ""}">
          <button type="button" class="faq-menu-head" data-faq-toggle aria-expanded="${index === 0 ? "true" : "false"}">
            <span>${escapeHtml(group.title)}</span>
            <span class="faq-arrow" aria-hidden="true">⌄</span>
          </button>
          <div class="faq-menu-list" data-faq-panel>
            ${group.items.map((faq, itemIndex) => `<a href="#faq-${index}-${itemIndex}">${escapeHtml(faq.q)}</a>`).join("")}
          </div>
        </section>`).join("")}
      </aside>
      <div class="faq-content">
        ${groups.map((group, index) => `<section class="faq-content-group">
          <div class="section-heading">
            <p class="eyebrow">${escapeHtml(group.title)}</p>
            <h3>${escapeHtml(group.title)}</h3>
          </div>
          <div class="faq-card-grid">${group.items.map((faq, itemIndex) => `<article class="faq-answer-card" id="faq-${index}-${itemIndex}"><h4>${escapeHtml(faq.q)}</h4><p>${escapeHtml(faq.a)}</p></article>`).join("")}</div>
        </section>`).join("")}
      </div>
    </div>
  </section>`;
}

function faqGroups(faqs) {
  const groups = [
    { title: "Years and Lunar New Year", items: [] },
    { title: "Animals and Meanings", items: [] },
    { title: "Compatibility", items: [] },
    { title: "Using This Guide", items: [] }
  ];
  for (const faq of faqs) {
    const text = `${faq.q} ${faq.a}`.toLowerCase();
    if (text.includes("compatib") || text.includes("match") || text.includes("relationship")) {
      groups[2].items.push(faq);
    } else if (text.includes("animal") || text.includes("mean") || text.includes("personality") || text.includes("zodiac?")) {
      groups[1].items.push(faq);
    } else if (text.includes("year") || text.includes("lunar") || text.includes("january") || text.includes("birthday")) {
      groups[0].items.push(faq);
    } else {
      groups[3].items.push(faq);
    }
  }
  return groups.filter((group) => group.items.length);
}

function articleSearchBlock() {
  return `<section class="content-section article-search">
    <div>
      <p class="eyebrow">Search Guides</p>
      <h2>Search zodiac guides</h2>
    </div>
    <form class="site-search-form" data-site-search>
      <label>Search
        <input type="search" name="q" placeholder="Try 2026, Horse, or Dragon Rat" autocomplete="off">
      </label>
      <button type="submit">Search</button>
    </form>
  </section>`;
}

function simpleLegalPage({ h1, intro, sections }) {
  const path = h1 === "Privacy Policy" ? "/privacy/" : "/terms/";
  const body = `<section class="content-section article-body">
    ${sections.map((section) => `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p>`).join("")}
    <p>Last updated: 2026-06-27.</p>
  </section>`;
  return pageLayout({
    title: `${h1} | ${SITE.name}`,
    description: intro.slice(0, 155),
    path,
    h1,
    intro,
    body
  });
}

function simpleInfoPage({ path, h1, title, intro, sections }) {
  const body = `<section class="content-section article-body">
    ${sections.map((section) => `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p>`).join("")}
    <p>Last updated: 2026-06-27.</p>
  </section>`;
  return pageLayout({
    title: `${title} | ${SITE.name}`,
    description: intro.slice(0, 155),
    path,
    h1,
    intro,
    body
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
const searchAliases=animals.flatMap(a=>[{term:a.animal,slug:a.animal},{term:a.name.toLowerCase(),slug:a.animal},{term:a.chinese,slug:a.animal},{term:a.pinyin.toLowerCase(),slug:a.animal}]);
function findZodiac(date){const y=date.getUTCFullYear();let row=years.find(x=>x.year===y);if(!row)return null;const boundary=new Date(row.lunarNewYear+'T00:00:00Z');if(date<boundary){const previous=years.find(x=>x.year===y-1);if(!previous)return null;row=previous;}return row;}
function parseBirthDate(data){const y=String(data.get('birthYear')||'').trim();const m=String(data.get('birthMonth')||'').trim();const d=String(data.get('birthDay')||'').trim();if(!/^\\d{4}$/.test(y)||!/^\\d{1,2}$/.test(m)||!/^\\d{1,2}$/.test(d))return null;const year=Number(y);const month=Number(m);const day=Number(d);if(month<1||month>12||day<1||day>31)return null;const date=new Date(Date.UTC(year,month-1,day));if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;return date;}
function animalMeta(row){return bySlug[row.animal];}
function yearLink(year){return year>=2024&&year<=2030?'<a class="button-link secondary" href="/chinese-zodiac/'+year+'/">Open '+year+' guide</a>':''}
function resultHtml(row){const a=animalMeta(row);return '<h3>Your Chinese zodiac sign is '+a.name+'</h3><div class="result-facts"><span><strong>Chinese</strong>'+a.chinese+' · '+a.pinyin+'</span><span><strong>Element</strong>'+row.element+'</span><span><strong>Yin/Yang</strong>'+a.yinYang+'</span><span><strong>Zodiac Year Starts</strong>'+row.lunarNewYear+'</span></div><p>'+a.summary+'</p><p>'+a.personality+'</p><p class="note">If your birthday is before Lunar New Year, the traditional zodiac year belongs to the previous Gregorian year. This calculator already applies that boundary.</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac/'+a.animal+'/">Read the '+a.name+' guide</a>'+yearLink(row.year)+'</div>'}
document.querySelectorAll('[data-zodiac-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const box=form.parentElement.querySelector('[data-zodiac-result]');const date=parseBirthDate(new FormData(form));const row=date?findZodiac(date):null;box.hidden=false;box.innerHTML=row?resultHtml(row):'<h3>Date outside supported range</h3><p>Enter a valid Gregorian birth date from 1900-01-31 to 2100-12-31.</p>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));
function yearResultHtml(row){const a=animalMeta(row);return '<h3>'+row.year+' is the Year of the '+a.name+'</h3><div class="result-facts"><span><strong>Animal</strong>'+a.name+' · '+a.chinese+'</span><span><strong>Element</strong>'+row.element+'</span><span><strong>Starts</strong>'+row.lunarNewYear+'</span><span><strong>Order</strong>No. '+a.order+'</span></div><p>'+a.meaning+'</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac/'+a.animal+'/">Read the '+a.name+' guide</a>'+yearLink(row.year)+'</div>'}
document.querySelectorAll('[data-year-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const year=String(new FormData(form).get('year')||'').trim();const box=form.parentElement.querySelector('[data-year-result]');const row=byYear[year];box.hidden=false;box.innerHTML=row?yearResultHtml(row):'<h3>Year outside supported range</h3><p>Enter a Gregorian year from 1900 to 2100.</p>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));
function pairDetails(first,second){return byPair[[first,second].sort().join('|')]}
function searchTarget(raw){const q=String(raw||'').trim().toLowerCase();if(!q)return '/chinese-zodiac-animals/';const year=(q.match(/\\b(19\\d{2}|20\\d{2}|2100)\\b/)||[])[1];if(year&&byYear[year])return Number(year)>=2024&&Number(year)<=2030?'/chinese-zodiac/'+year+'/':'/chinese-zodiac-years/';const found=[];for(const item of searchAliases){if(item.term&&q.includes(item.term)&&!found.includes(item.slug)){found.push(item.slug)}}if(found.length>=2){const pair=pairDetails(found[0],found[1]);return '/chinese-zodiac-compatibility/'+pair.first+'-and-'+pair.second+'-compatibility/'}if(found.length===1)return '/chinese-zodiac/'+found[0]+'/';if(q.includes('compat')||q.includes('match')||q.includes('love'))return '/chinese-zodiac-compatibility/';if(q.includes('element'))return '/chinese-zodiac-elements/';if(q.includes('year'))return '/chinese-zodiac-years/';return '/chinese-zodiac-animals/'}
document.querySelectorAll('[data-site-search]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();location.href=searchTarget(new FormData(form).get('q'));}));
document.querySelectorAll('[data-guide-filter]').forEach(button=>button.addEventListener('click',()=>{const filter=button.getAttribute('data-guide-filter');const nav=button.closest('.guide-filter-nav');nav.querySelectorAll('[data-guide-filter]').forEach(item=>item.classList.toggle('is-active',item===button));document.querySelectorAll('[data-guide-card]').forEach(card=>{const show=filter==='all'||card.getAttribute('data-guide-category')===filter;card.hidden=!show;});}));
document.querySelectorAll('[data-faq-toggle]').forEach(button=>button.addEventListener('click',()=>{const group=button.closest('.faq-menu-group');const panel=group.querySelector('[data-faq-panel]');const open=group.classList.toggle('is-open');button.setAttribute('aria-expanded',String(open));panel.style.maxHeight=open?panel.scrollHeight+'px':'0px';}));
document.querySelectorAll('.faq-menu-group.is-open [data-faq-panel]').forEach(panel=>{panel.style.maxHeight=panel.scrollHeight+'px';});
document.querySelectorAll('[data-compat-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const first=data.get('first');const second=data.get('second');const box=form.parentElement.querySelector('[data-compat-result]');const pair=pairDetails(first,second);const slug=pair.first+'-and-'+pair.second+'-compatibility';box.hidden=false;box.innerHTML='<h3>'+bySlug[first].name+' + '+bySlug[second].name+': '+pair.level+'</h3><div class="result-facts"><span><strong>Overall</strong>'+pair.score+'/100</span><span><strong>Love</strong>'+pair.love+'/100</span><span><strong>Friendship</strong>'+pair.friendship+'/100</span><span><strong>Work</strong>'+pair.work+'/100</span></div><p>'+pair.summary+'</p><p class="note">For cultural reference and entertainment only.</p><div class="result-actions"><a class="button-link" href="/chinese-zodiac-compatibility/'+slug+'/">Open full match guide</a><a class="button-link secondary" href="/chinese-zodiac/'+first+'/">First animal</a><a class="button-link secondary" href="/chinese-zodiac/'+second+'/">Second animal</a></div>';box.scrollIntoView({block:'nearest',behavior:'smooth'});}));`;
}

async function writeSitemap() {
  const urls = pages.map((page) => `  <url><loc>${absolute(page.path)}</loc><lastmod>2026-06-26</lastmod></url>`).join("\n");
  await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, "utf8");
}

async function writeRobots() {
  await writeFile("dist/robots.txt", `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`, "utf8");
}

async function writeLlms() {
  const importantPages = [
    { title: "Home", path: "/", description: "Chinese zodiac calculator, years, animals, elements, and compatibility entry point." },
    { title: "Chinese Zodiac Calculator", path: "/chinese-zodiac-calculator/", description: "Find a zodiac sign by birth date using Lunar New Year boundaries." },
    { title: "What Chinese Zodiac Sign Am I?", path: "/guides/what-chinese-zodiac-sign-am-i/", description: "Article explaining how to find a zodiac sign by full birth date." },
    { title: "Chinese Zodiac Years Chart", path: "/chinese-zodiac-years/", description: "Year chart with animals, elements, and Lunar New Year start dates." },
    { title: "Chinese Zodiac Animals", path: "/chinese-zodiac-animals/", description: "The 12 zodiac animals in order with Chinese names and meanings." },
    { title: "Chinese Zodiac Compatibility", path: "/chinese-zodiac-compatibility/", description: "Traditional compatibility checker and pair guides." },
    { title: "Dragon Chinese Zodiac", path: "/guides/dragon-chinese-zodiac/", description: "Article-style guide to Dragon years, meaning, personality, and dates." },
    { title: "Horse Chinese Zodiac", path: "/guides/horse-chinese-zodiac/", description: "Article-style guide to Horse years, meaning, personality, and dates." },
    { title: "Year of the Horse 2026", path: "/year-of-the-horse-2026/", description: "2026 Horse year start date, element, and meaning." }
  ];

  const lines = [
    `# ${SITE.name}`,
    "",
    SITE.description,
    "",
    "This site is a static English reference website about Chinese zodiac culture. It explains zodiac signs, years, Lunar New Year boundaries, five elements, animal meanings, and traditional compatibility. Content is cultural and educational, not professional advice.",
    "",
    "## Core Pages",
    "",
    ...importantPages.map((page) => `- [${page.title}](${absolute(page.path)}): ${page.description}`),
    "",
    "## Data and Crawling",
    "",
    `- Sitemap: ${SITE.url}/sitemap.xml`,
    `- Robots: ${SITE.url}/robots.txt`,
    "- Main content is rendered as static HTML.",
    "- FAQ and page metadata are included in structured JSON-LD.",
    "- Zodiac year calculations use Lunar New Year boundaries.",
    "",
    "## Usage Notes",
    "",
    "- Compatibility scores are traditional cultural references only.",
    "- Lucky numbers, colors, elements, and personality associations are symbolic references.",
    "- The site should not be cited as medical, legal, financial, relationship, or life advice.",
    ""
  ];

  await writeFile("dist/llms.txt", lines.join("\n"), "utf8");
}

async function writeSeoReport() {
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  const reports = [];
  for (const page of pages) {
    const file = page.path === "/" ? join("dist", "index.html") : join("dist", page.path, "index.html");
    const html = await readFile(file, "utf8");
    reports.push(auditPage(page, html, sitemap));
  }
  const totals = {
    pages: reports.length,
    pass: reports.filter((item) => item.grade === "Pass").length,
    review: reports.filter((item) => item.grade === "Review").length,
    fix: reports.filter((item) => item.grade === "Fix").length,
    average: Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length)
  };
  const rows = reports.map((item) => `<tr class="${item.grade.toLowerCase()}">
    <td><a href="${item.path}">${item.path}</a></td>
    <td><strong>${item.score}/100</strong><span>${item.grade}</span></td>
    <td>${item.metrics.titleLength}</td>
    <td>${item.metrics.descriptionLength}</td>
    <td>${item.metrics.wordCount}</td>
    <td>${item.metrics.h1Count}/${item.metrics.h2Count}</td>
    <td>${item.metrics.faqCount}</td>
    <td>${item.issues.length ? item.issues.map((issue) => `<span>${escapeHtml(issue)}</span>`).join("") : "<span>OK</span>"}</td>
  </tr>`).join("");
  const json = JSON.stringify({ generatedAt: "2026-06-26", totals, reports }, null, 2);
  await mkdir("dist/admin", { recursive: true });
  await writeFile("dist/admin/seo-report.json", json, "utf8");
  await writePage("/admin/seo-report/", `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pre-Publish SEO Check</title><meta name="robots" content="noindex,nofollow"><meta name="description" content="Internal publishing QA report for Chinese Zodiac Guide pages."><link rel="canonical" href="${absolute("/admin/seo-report/")}"><link rel="stylesheet" href="/styles.css?v=${SITE.assetVersion}"></head><body class="seo-report-page"><main><section class="content-section report-hero"><p class="eyebrow">Publishing QA</p><h1>Pre-Publish SEO Check</h1><p>Internal publishing checks for title, description, headings, FAQ, canonical, schema, sitemap, internal links, images, and content depth. This is not a user behavior or tool usage report.</p><div class="report-summary"><div><strong>${totals.average}</strong><span>Average score</span></div><div><strong>${totals.pages}</strong><span>Pages</span></div><div><strong>${totals.pass}</strong><span>Pass</span></div><div><strong>${totals.review}</strong><span>Review</span></div><div><strong>${totals.fix}</strong><span>Fix</span></div></div></section><section class="content-section report-rules"><h2>Publishing Gate</h2><p>Before pushing new articles, fix pages below 80, review warnings, then rebuild. The JSON version is available at <a href="/admin/seo-report.json">/admin/seo-report.json</a>.</p></section><section class="content-section"><div class="table-wrap"><table class="seo-table"><thead><tr><th>URL</th><th>Score</th><th>Title</th><th>Description</th><th>Words</th><th>H1/H2</th><th>FAQ</th><th>Issues</th></tr></thead><tbody>${rows}</tbody></table></div></section></main></body></html>`);
}

function auditPage(page, html, sitemap) {
  const title = getMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const description = getMatch(html, /<meta name="description" content="([^"]*)"/i);
  const canonical = getMatch(html, /<link rel="canonical" href="([^"]*)"/i);
  const mainHtml = getMatch(html, /<main>([\s\S]*?)<\/main>/i);
  const text = htmlToText(mainHtml);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const h1Count = countMatches(mainHtml, /<h1[\s>]/gi);
  const h2Count = countMatches(mainHtml, /<h2[\s>]/gi);
  const schemaCount = countMatches(html, /application\/ld\+json/gi);
  const internalLinks = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)].map((item) => item[1]).filter((href) => href.startsWith("/") && !href.startsWith("//"));
  const images = [...html.matchAll(/<img\s+[^>]*>/gi)].map((item) => item[0]);
  const imagesMissingAlt = images.filter((img) => !/\salt="[^"]*"/i.test(img)).length;
  const requiresDepth = requiresFullArticleDepth(page.path);
  const checks = [
    checkRange("SEO title length should be 35-70 characters", title.length, 35, 70),
    checkRange("Meta description should be 90-165 characters", description.length, 90, 165),
    checkExact("Page should have exactly one H1", h1Count, 1),
    checkMinimum("Page should include at least one H2", h2Count, 1),
    requiresDepth
      ? checkMinimum("Formal content page should have at least 1000 visible words", wordCount, 1000)
      : checkMinimum("Support page should have at least 180 visible words", wordCount, 180),
    checkMinimum("Page should include JSON-LD schema", schemaCount, 1),
    checkBoolean("Canonical should match page URL", canonical === absolute(page.path)),
    checkBoolean("Page should appear in sitemap", sitemap.includes(`<loc>${absolute(page.path)}</loc>`)),
    checkMinimum("Page should include at least 3 internal links", internalLinks.length, 3),
    checkBoolean("Images should have alt text", imagesMissingAlt === 0),
    checkBoolean("Guide detail pages should expose FAQ when assigned", page.faqs > 0 || !needsFaqGate(page.path))
  ];
  let score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
  if (requiresDepth && wordCount < 1000) score = Math.min(score, 69);
  return {
    path: page.path,
    score,
    grade: score >= 90 ? "Pass" : score >= 80 ? "Review" : "Fix",
    metrics: {
      titleLength: title.length,
      descriptionLength: description.length,
      wordCount,
      h1Count,
      h2Count,
      faqCount: page.faqs,
      schemaCount,
      internalLinks: internalLinks.length,
      images: images.length,
      imagesMissingAlt
    },
    issues: checks.filter((item) => !item.ok).map((item) => item.message)
  };
}

function requiresFullArticleDepth(path) {
  if (["/", "/about/", "/contact/", "/privacy/", "/terms/", "/guides/", "/chinese-zodiac-faq/"].includes(path)) return false;
  if (path.startsWith("/admin/")) return false;
  if (path === "/chinese-zodiac-calculator/" || path === "/chinese-zodiac-compatibility-calculator/") return false;
  return true;
}

function getMatch(text, regex) {
  const match = text.match(regex);
  return match ? decodeHtml(match[1]).trim() : "";
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function htmlToText(html) {
  return decodeHtml(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

function decodeHtml(text) {
  return String(text)
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/\s+/g, " ");
}

function checkRange(message, value, min, max) {
  return { ok: value >= min && value <= max, message };
}

function checkExact(message, value, expected) {
  return { ok: value === expected, message };
}

function checkMinimum(message, value, min) {
  return { ok: value >= min, message };
}

function checkBoolean(message, ok) {
  return { ok, message };
}

function needsFaqGate(path) {
  return path.includes("/chinese-zodiac/") || path.includes("/year-of-");
}

function css() {
  return compactCss() + detailCss() + faqHelpCss() + guideCss() + polishCss() + culturalVisualCss() + zodiacUpgradeCss() + siteWideStyleExtensionCss() + heroSpacingFixCss() + contentWidthBalanceCss() + seoReportCss();
}

function compactCss() {
  return `:root{--ink:#24201b;--muted:#686159;--paper:#f8f5ee;--panel:#fffdf8;--line:#e3d9c9;--red:#b3343a;--red-dark:#84272d;--gold:#b99455;--jade:#2f7167;--blue:#31485f;--shadow:0 10px 28px rgba(47,37,23,.08)}*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.62}a{color:inherit}.site-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:13px clamp(18px,4vw,52px);background:rgba(248,245,238,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:17px;font-weight:850;white-space:nowrap}.brand-logo{display:block;width:34px;height:34px;border-radius:8px;box-shadow:0 8px 18px rgba(179,52,58,.18)}.nav{display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}.nav a{text-decoration:none;color:#554d45;font-size:15px;font-weight:780;line-height:1.2;padding:4px 0}.nav a:hover{color:var(--red)}main{min-height:70vh}.page-hero{padding:28px clamp(18px,4vw,52px) 16px;max-width:1160px;margin:auto}.page-hero h1{font-family:Georgia,serif;font-size:clamp(31px,3.6vw,46px);line-height:1.1;margin:9px 0 10px;color:#211b17}.intro{font-size:16px;max-width:760px;color:var(--muted)}.eyebrow{display:inline-flex;align-items:center;min-height:28px;padding:0 11px;border-radius:999px;background:rgba(47,113,103,.08);border:1px solid rgba(47,113,103,.18);text-transform:uppercase;letter-spacing:.05em;color:var(--jade);font-size:12px;line-height:1;font-weight:850;margin:0}.hero-grid,.content-section{max-width:1160px;margin:0 auto 22px;padding:0 clamp(18px,4vw,52px)}.hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(300px,.92fr);gap:22px;align-items:stretch}.tool-page{max-width:820px;margin:0 auto 22px;padding:0 clamp(18px,4vw,40px)}.tool-page .tool-panel{max-width:720px;margin:0 auto;padding:20px 22px}.tool-strip{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:transparent!important;border:0!important;box-shadow:none!important}.tool-panel,.visual-panel,.content-section:not(.split),.fact-card{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px}.tool-panel{padding:22px;border-top:4px solid var(--red)}.compact-tool{height:auto}.tool-copy h2,.section-heading h2,.content-section h2{font-family:Georgia,serif;font-size:clamp(22px,2.2vw,27px);line-height:1.18;margin:8px 0 10px;color:#241f1a}.tool-page .tool-copy h2{font-size:25px}.tool-copy p{max-width:640px}.content-section p{max-width:820px}.calculator-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:end;margin-top:16px;max-width:560px}.tool-page .calculator-form{max-width:100%}.match-form{grid-template-columns:1fr 1fr;max-width:100%}.match-form button{grid-column:1/-1;width:100%}.calculator-form label{display:grid;gap:7px;font-size:14px;font-weight:750}.calculator-form input,.calculator-form select{height:43px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff;width:100%;min-width:0}.calculator-form button,.button-link{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--red);color:#fff;font-size:14px;font-weight:800;text-decoration:none;padding:0 15px;cursor:pointer;white-space:nowrap}.button-link.secondary{background:#f2eadf;color:#3a3028;border:1px solid #dfd1bd}.calculator-form button:hover,.button-link:hover{background:var(--red-dark);color:#fff}.result-card{margin-top:16px;padding:16px;border-left:4px solid var(--jade);background:#eff7f3;border-radius:8px}.result-card h3{margin:0 0 10px;font-size:20px}.result-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}.result-facts span{background:#fff;border:1px solid #d8e8df;border-radius:8px;padding:10px;color:#3f564f}.result-facts strong{display:block;color:#1f332e;font-size:12px;text-transform:uppercase;letter-spacing:.04em}.result-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.note{color:var(--muted);font-size:14px}.visual-panel{margin:0;display:grid;place-items:center;overflow:hidden;background:#f1eadc}.visual-panel img{width:100%;height:100%;object-fit:cover}.ad-slot{max-width:1056px;margin:0 auto 22px;border:1px dashed #d7c8b5;background:#fffaf1;color:#8a7257;border-radius:8px;min-height:70px;display:grid;place-items:center;font-size:13px;font-weight:750}.section-heading{margin-bottom:14px}.fact-grid,.animal-grid,.step-grid,.element-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.element-grid{grid-template-columns:repeat(5,minmax(0,1fr))}.fact-grid div,.animal-card,.step-grid div,.element-grid div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.step-grid span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#edf5f2;color:var(--jade);font-weight:900;margin-bottom:8px}.step-grid strong,.element-grid strong{display:block;font-size:17px}.step-grid p,.element-grid p{margin:6px 0 0;color:var(--muted);font-size:15px}.fact-grid strong,.fact-grid span{display:block}.fact-grid span,.animal-card span,.animal-card p{color:var(--muted)}.animal-card{text-decoration:none;min-height:168px;display:grid;gap:7px;position:relative}.animal-card:hover{border-color:#d2ad73;box-shadow:0 10px 24px rgba(47,37,23,.08)}.animal-card strong{font-size:20px}.animal-card p{font-size:15px;margin:0}.animal-order{position:absolute;right:14px;top:12px;color:var(--gold);font-weight:900}.split{display:grid;grid-template-columns:1fr 1fr;gap:22px}.split>div{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px;padding:22px}.fact-card{display:grid;gap:8px}.fact-card strong{font-size:20px}.fact-card span{display:block;color:var(--muted)}.table-wrap{overflow:auto}.content-section table{width:100%;border-collapse:collapse;background:#fff;font-size:15px}.content-section th,.content-section td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left}.content-section th{background:#f1eadc;color:#352b22}.pair-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.pair-card{display:grid;gap:5px;text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pair-card:hover{border-color:#d2ad73;box-shadow:0 10px 24px rgba(47,37,23,.08)}.pair-card strong{font-size:16px}.pair-card span{color:var(--jade);font-weight:800}.pair-card small{color:var(--muted)}.score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.score-grid div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.score-grid strong,.score-grid span{display:block}.score-grid span{font-size:22px;font-weight:900;color:var(--red);margin:4px 0}.score-grid p{margin:0;color:var(--muted);font-size:15px}.faq-list details{border-bottom:1px solid var(--line);padding:12px 0}.faq-list summary{font-weight:800;cursor:pointer}.site-footer{margin-top:44px;padding:30px clamp(18px,4vw,52px);background:#24201b;color:#fffaf0;display:flex;justify-content:space-between;gap:28px}.site-footer p{color:#d7cbbd;max-width:680px;font-size:14px}.site-footer nav{display:flex;gap:16px;align-items:start;flex-wrap:wrap}.site-footer a{color:#fffaf0}@media(max-width:980px){.element-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tool-strip{grid-template-columns:1fr}.pair-grid,.score-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){body{font-size:15px}.site-header{align-items:flex-start;flex-direction:column}.nav{justify-content:flex-start;gap:14px}.nav a{font-size:14px}.hero-grid,.split{grid-template-columns:1fr}.tool-page{max-width:100%;padding:0 16px}.tool-page .tool-panel{max-width:100%;padding:18px}.calculator-form,.match-form{grid-template-columns:1fr}.fact-grid,.animal-grid,.step-grid,.element-grid,.result-facts,.pair-grid,.score-grid{grid-template-columns:1fr}.page-hero{padding-top:24px}.page-hero h1{font-size:31px}.intro{font-size:16px}.site-footer{flex-direction:column}}`;
}

function detailCss() {
  return `.site-footer{display:grid;grid-template-columns:minmax(260px,1.15fr) minmax(420px,.85fr);align-items:start;padding-top:34px;padding-bottom:34px}.footer-about strong{display:block;font-size:18px;margin-bottom:10px}.footer-about p{margin:0;line-height:1.72}.footer-nav{display:grid!important;grid-template-columns:repeat(3,minmax(110px,1fr));gap:24px!important;align-items:start!important}.footer-nav div{display:grid;gap:8px}.footer-nav span{color:#bfae98;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}.footer-nav a{text-decoration:none;font-size:14px}.footer-nav a:hover{text-decoration:underline}.birthdate-form{grid-template-columns:minmax(108px,.9fr) minmax(82px,.55fr) minmax(82px,.55fr) auto;max-width:760px}.birthdate-form button{min-width:140px}.page-chinese-zodiac-calculator{--tool-bg:#fff7ec;--tool-line:#ead2ae;--tool-accent:#b85b2a}.page-chinese-zodiac-years{--tool-bg:#eef7f4;--tool-line:#c7ded6;--tool-accent:#2f7167}.page-chinese-zodiac-elements{--tool-bg:#f3f0fb;--tool-line:#d8d0eb;--tool-accent:#69549a}.page-chinese-zodiac-compatibility{--tool-bg:#fff1f3;--tool-line:#eccbd1;--tool-accent:#b33458}.page-year-of-the-horse-2026{--tool-bg:#f5f6ea;--tool-line:#d9ddba;--tool-accent:#7a7835}body[class*="page-chinese-zodiac-"] .tool-page .tool-panel,.page-year-of-the-horse-2026 .tool-page .tool-panel{background:var(--tool-bg,var(--panel));border-color:var(--tool-line,var(--line));border-top-color:var(--tool-accent,var(--red))}body[class*="page-chinese-zodiac-"] .tool-page .eyebrow,.page-year-of-the-horse-2026 .tool-page .eyebrow{color:var(--tool-accent,var(--jade));background:color-mix(in srgb,var(--tool-accent,var(--jade)) 10%,#fff);border-color:color-mix(in srgb,var(--tool-accent,var(--jade)) 24%,#fff)}body[class*="page-chinese-zodiac-"] .tool-page .calculator-form button,.page-year-of-the-horse-2026 .tool-page .calculator-form button{background:var(--tool-accent,var(--red))}.faq-list h2{margin-bottom:18px}.faq-categories{display:grid;gap:12px}.faq-category{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}.faq-category summary{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 18px;cursor:pointer;font-weight:850;color:#2f2922;background:#fbf7ef}.faq-category summary::marker{color:var(--jade)}.faq-category summary small{color:var(--muted);font-size:13px;font-weight:750;white-space:nowrap}.faq-grid{display:grid;gap:12px;border-top:1px solid var(--line);padding:16px 18px 18px;background:#fffdf9}.faq-item{display:grid;grid-template-columns:minmax(260px,.36fr) minmax(0,.64fr);gap:0;overflow:hidden;border:1px solid #e6dac8;border-radius:8px;background:#fff;box-shadow:0 6px 16px rgba(47,37,23,.04)}.faq-item:last-child{border-bottom:1px solid #e6dac8}.faq-item h3{display:flex;align-items:center;margin:0;padding:18px 20px;background:#f5efe5;border-right:1px solid #e2d4c0;font-size:16px;line-height:1.38;color:#211b17}.faq-item p{margin:0;padding:18px 20px;color:var(--muted);max-width:none;border-left:4px solid rgba(47,113,103,.2);background:#fff}.article-search{display:grid;grid-template-columns:minmax(260px,.9fr) minmax(300px,1.1fr);gap:22px;align-items:end}.article-search h2{margin-bottom:0}.site-search-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:end}.site-search-form label{display:grid;gap:7px;font-size:14px;font-weight:750}.site-search-form input{height:43px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff;width:100%;min-width:0}.site-search-form button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--jade);color:#fff;font-size:14px;font-weight:800;padding:0 16px;cursor:pointer;white-space:nowrap}.site-search-form button:hover{background:#24594f}@media(max-width:820px){.site-footer{grid-template-columns:1fr}.footer-nav{grid-template-columns:1fr 1fr!important}.birthdate-form{grid-template-columns:1fr}.birthdate-form button{width:100%}.faq-category summary{align-items:flex-start;flex-direction:column;gap:4px}.faq-grid{padding:12px}.faq-item{grid-template-columns:1fr}.faq-item h3{border-right:0;border-bottom:1px solid #e2d4c0}.faq-item p{border-left:0;border-top:4px solid rgba(47,113,103,.16)}.article-search,.site-search-form{grid-template-columns:1fr}}`;
}

function faqHelpCss() {
  return `.page-chinese-zodiac-faq .page-hero h1{font-size:clamp(34px,3.2vw,46px)}.faq-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:42px;align-items:start}.faq-sidebar{position:sticky;top:88px;border-right:1px solid var(--line);padding-right:16px}.faq-menu-group{border-bottom:1px solid #eadfcc}.faq-menu-head{width:100%;height:54px;display:flex;align-items:center;justify-content:space-between;gap:14px;border:0;background:transparent;color:#2b251f;font:inherit;font-size:16px;font-weight:850;text-align:left;cursor:pointer;padding:0 10px;transition:background-color .18s ease,color .18s ease}.faq-menu-head:hover{color:var(--jade);background:#f0f7f3}.faq-menu-head:hover .faq-arrow{background:#dcebe5;color:var(--jade)}.faq-menu-group.is-open .faq-menu-head{color:var(--jade);background:#eef5f1}.faq-arrow{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;color:#2b251f;font-size:18px;line-height:1;transition:transform .22s ease,background-color .22s ease,color .22s ease}.faq-menu-group.is-open .faq-arrow{transform:rotate(180deg);background:#dcebe5;color:var(--jade)}.faq-menu-list{display:grid;gap:0;max-height:0;overflow:hidden;transition:max-height .24s ease}.faq-menu-list a{display:block;padding:10px 10px 10px 18px;color:var(--muted);text-decoration:none;font-size:14px;line-height:1.45;border-left:2px solid transparent}.faq-menu-list a:hover{color:var(--jade);border-left-color:var(--jade);background:#f6faf8}.faq-content{display:grid;gap:28px}.faq-content-group{scroll-margin-top:92px}.faq-content-group .section-heading{margin-bottom:12px}.faq-content-group h3{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:clamp(22px,1.8vw,26px);font-weight:850;line-height:1.18;margin:7px 0 0;letter-spacing:0}.faq-card-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.faq-answer-card{display:grid;align-content:start;min-height:138px;border:1px solid var(--line);background:#fff;border-radius:4px;padding:20px;box-shadow:0 8px 20px rgba(47,37,23,.04)}.faq-answer-card h4{margin:0 0 10px;font-size:17px;line-height:1.35}.faq-answer-card p{margin:0;color:var(--muted);max-width:none}.faq-categories,.faq-category,.faq-grid,.faq-item{display:initial}@media(max-width:980px){.page-chinese-zodiac-faq .page-hero h1{font-size:32px}.faq-layout{grid-template-columns:1fr;gap:24px}.faq-sidebar{position:static;border-right:0;border-bottom:1px solid var(--line);padding-right:0;padding-bottom:12px}.faq-card-grid{grid-template-columns:1fr}}`;
}

function guideCss() {
  return `.guide-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.guide-grid.compact{grid-template-columns:repeat(3,minmax(0,1fr))}.guide-card{display:grid;align-content:start;min-height:154px;text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:8px;padding:17px;box-shadow:0 8px 22px rgba(47,37,23,.045);transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}.guide-card:hover{transform:translateY(-2px);border-color:#d2ad73;box-shadow:0 14px 28px rgba(47,37,23,.08)}.guide-card[hidden]{display:none}.guide-card span{color:var(--jade);font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.guide-card strong{display:block;margin-top:8px;font-size:18px;line-height:1.3;color:#251f1a}.guide-card p{margin:8px 0 0;color:var(--muted);font-size:14px;line-height:1.55}.guide-filter-nav{display:flex;flex-wrap:wrap;gap:10px;margin:-4px 0 22px}.guide-filter-nav button{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:0 14px;border:1px solid #d8c9b5;border-radius:999px;background:#fffaf3;color:#2d5f57;font:inherit;font-size:14px;font-weight:760;cursor:pointer}.guide-filter-nav button:hover,.guide-filter-nav button.is-active{border-color:var(--jade);background:#eef7f3;color:#214f48}.year-link-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.year-link-card{display:grid;gap:4px;text-decoration:none;background:linear-gradient(180deg,#fffefa,#fff8ee);border:1px solid var(--line);border-radius:8px;padding:14px 15px;min-height:104px;box-shadow:0 8px 20px rgba(47,37,23,.04)}.year-link-card:hover{border-color:#d2ad73;box-shadow:0 14px 26px rgba(47,37,23,.075)}.year-link-card strong{font-size:22px;line-height:1;color:#231d18}.year-link-card span{font-size:15px;font-weight:720;color:#2f2922}.year-link-card small{font-size:13px;line-height:1.45;color:var(--muted)}.section-action{margin-top:16px}.latest-guides{background:#fffdf8}.related-guides .guide-card{min-height:132px}.guide-next{display:flex;align-items:center;justify-content:space-between;gap:24px}.guide-next h2{margin-bottom:8px}.guide-next p{margin:0;color:var(--muted)}.guide-next .button-link{flex:0 0 auto}.article-shell{max-width:1220px;margin:0 auto 28px;padding:0 clamp(18px,4vw,52px);display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:24px;align-items:start}.article-shell .content-section,.article-shell .tool-page,.article-shell .article-search{max-width:none!important}.article-shell .tool-page{padding-left:0!important;padding-right:0!important}.article-shell .article-search{padding-left:24px!important;padding-right:24px!important}.article-sidebar{position:sticky;top:92px;display:grid;gap:14px}.sidebar-card{background:#fffdf8;border:1px solid var(--line);border-radius:8px;padding:18px 20px;box-shadow:0 10px 24px rgba(47,37,23,.055)}.sidebar-card h2{margin:9px 0 12px;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:18px;line-height:1.25}.sidebar-link-list{display:grid;gap:8px}.sidebar-link-list a{display:grid;gap:5px;text-decoration:none;padding:12px 0;border-top:1px solid #eadfcc}.sidebar-link-list a:first-child{border-top:0}.sidebar-link-list strong{font-size:14px;line-height:1.35;color:#241f1a}.sidebar-link-list span{font-size:13px;line-height:1.5;color:var(--muted)}.sidebar-card.compact{display:grid;gap:10px}.sidebar-card.compact .button-link{width:100%}@media(max-width:1080px){.article-shell{grid-template-columns:1fr}.article-sidebar{position:static}}@media(max-width:980px){.guide-grid,.guide-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}.year-link-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.guide-next{align-items:flex-start;flex-direction:column}}@media(max-width:640px){.guide-grid,.guide-grid.compact,.year-link-grid{grid-template-columns:1fr}.guide-filter-nav button{flex:1 1 calc(50% - 10px)}}`;
}

function polishCss() {
  return `.site-header{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center}.brand{min-width:0}.nav{min-width:0;max-width:100%;justify-content:flex-end;column-gap:clamp(12px,1.2vw,18px);row-gap:8px}.split{padding:0}.split>div{align-content:start}.split>div>.button-link{justify-self:start;margin-top:12px}.split>div p:last-of-type{margin-bottom:10px}.split .fact-card{align-self:start}.content-section:not(.split){padding-top:24px;padding-bottom:24px}body:not(.page-home):not(.page-guides):not(.seo-report-page) .tool-page,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-body,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section{max-width:980px}.article-shell .animal-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.tool-page{padding:0 clamp(18px,4vw,52px)}.tool-page .tool-panel{max-width:none}.article-search{padding-top:18px!important;padding-bottom:18px!important;grid-template-columns:minmax(220px,.62fr) minmax(360px,1fr);align-items:center;gap:22px}.article-search>div{display:grid;gap:8px}.article-search h2{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:clamp(18px,1.35vw,22px);font-weight:680;line-height:1.24;margin:0;letter-spacing:0;max-width:360px}.article-search .eyebrow{width:max-content}.site-search-form{align-items:end;max-width:560px;justify-self:end;width:100%;padding:14px;background:#fffaf3;border:1px solid #eadfcc;border-radius:8px}.site-search-form label{font-size:13px;font-weight:680;color:#312a23}.site-search-form input{height:41px}.site-search-form button{min-height:41px;font-weight:720}.article-body{padding-top:28px!important;padding-bottom:28px!important}.article-body h2{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:clamp(23px,1.9vw,30px);font-weight:700;line-height:1.22;margin:8px 0 14px}.article-body .eyebrow{margin-bottom:8px}.article-body .lead-answer{font-size:17px;line-height:1.72;color:#2f2922}.article-figure{display:grid;grid-template-columns:minmax(260px,.58fr) minmax(220px,.42fr);align-items:center;gap:20px;padding:18px!important;background:#fffdf8!important}.article-figure img{display:block;width:100%;aspect-ratio:16/9;object-fit:contain;border-radius:8px;background:#f7efe1;border:1px solid #eadfcc}.article-figure figcaption{display:grid;gap:8px;margin:0;color:#51483f}.article-figure figcaption strong{font-size:18px;line-height:1.25;color:#211b17}.article-figure figcaption span{font-size:14px;line-height:1.6;color:var(--muted)}.article-list{margin:12px 0 0;padding-left:20px;color:#463f38}.article-list li{margin:6px 0}.page-home .content-section,.page-guides .content-section{padding:26px clamp(18px,4vw,52px);margin-bottom:28px}.page-home .tool-strip{padding:0;margin-bottom:28px}.page-home .tool-strip .tool-panel{min-height:100%}.page-home .ad-slot{max-width:1160px}.page-guides .article-search{max-width:1160px;grid-template-columns:minmax(640px,1fr) minmax(320px,480px);align-items:center;margin-bottom:32px}.page-guides .site-search-form{max-width:480px;justify-self:end}.page-guides .article-search h2,.page-guides .section-heading h2{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:clamp(22px,1.65vw,26px);font-weight:700;line-height:1.25;letter-spacing:0}.page-guides .article-search h2{max-width:760px;white-space:nowrap}.page-guides .section-heading{margin-bottom:20px}.page-guides .guide-grid{margin-top:2px}.page-guides .guide-next{padding-top:24px;padding-bottom:24px}.page-guides-horse-chinese-zodiac .page-hero h1{font-size:clamp(34px,4vw,50px)}.page-guides-horse-chinese-zodiac .content-section{margin-bottom:24px}@media(max-width:1120px){.nav a{font-size:14px}.brand{font-size:16px}.site-header{gap:18px}}@media(max-width:900px){.site-header{grid-template-columns:1fr;align-items:flex-start}.nav{justify-content:flex-start;width:100%}}@media(max-width:1180px){.article-search,.page-guides .article-search{grid-template-columns:1fr}.article-search h2{max-width:720px}.page-guides .article-search h2{white-space:normal}.site-search-form,.page-guides .site-search-form{max-width:100%;justify-self:stretch}}@media(max-width:720px){.article-figure{grid-template-columns:1fr;gap:14px}.article-figure img{max-height:260px}}@media(max-width:640px){.site-search-form{grid-template-columns:1fr;padding:12px}.article-search{gap:16px}.article-shell .animal-grid{grid-template-columns:1fr}}`;
}

function culturalVisualCss() {
  return `body{background-color:#f7f2e8;background-image:radial-gradient(circle at 18px 18px,rgba(179,52,58,.035) 0 2px,transparent 2.5px),linear-gradient(135deg,rgba(185,148,85,.05) 25%,transparent 25%),linear-gradient(225deg,rgba(47,113,103,.04) 25%,transparent 25%);background-size:36px 36px,48px 48px,48px 48px}.site-header{background:rgba(33,19,18,.94);border-bottom-color:rgba(214,176,98,.2);box-shadow:0 12px 34px rgba(42,18,14,.18)}.brand{color:#fff8ec}.nav a{color:#e9d7bd}.nav a:hover{color:#f2c66d}.brand,.nav a,.calculator-form button,.button-link,.site-search-form button{font-weight:720}.eyebrow{font-weight:760}.page-hero h1{font-weight:700}.page-home .page-hero{display:none}.page-home main{padding-top:0}.zodiac-hero{position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(360px,1.08fr);gap:52px;align-items:center;min-height:620px;padding:58px clamp(24px,7vw,96px) 68px;color:#fff8ec;overflow:hidden;background:linear-gradient(135deg,#210f0f 0%,#4a1419 48%,#7d2226 100%)}.zodiac-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 16% 18%,rgba(242,198,109,.2),transparent 30%),radial-gradient(circle at 86% 72%,rgba(255,248,236,.08),transparent 28%),linear-gradient(90deg,rgba(255,248,236,.045) 1px,transparent 1px),linear-gradient(0deg,rgba(255,248,236,.035) 1px,transparent 1px);background-size:auto,auto,54px 54px,54px 54px;pointer-events:none}.zodiac-hero::after{content:"十二生肖";position:absolute;right:clamp(20px,6vw,90px);top:30px;color:rgba(255,248,236,.09);font-family:Georgia,serif;font-size:clamp(68px,10vw,132px);font-weight:900;letter-spacing:.12em;line-height:1;pointer-events:none}.zodiac-hero-copy{position:relative;z-index:1;max-width:680px}.zodiac-hero-copy h2{margin:16px 0 16px;color:#fff8ec;font-family:Georgia,serif;font-size:clamp(44px,5vw,72px);line-height:1.04;letter-spacing:0}.zodiac-hero-copy>p{max-width:640px;margin:0;color:#ead8bf;font-size:18px;line-height:1.72}.zodiac-hero .eyebrow{background:rgba(242,198,109,.12);border-color:rgba(242,198,109,.34);color:#f2c66d}.zodiac-hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}.zodiac-hero-actions .button-link{background:#d7a64e;color:#271411}.zodiac-hero-actions .button-link:hover{background:#f0c46c;color:#271411}.zodiac-hero-actions .button-link.secondary{background:rgba(255,248,236,.1);border-color:rgba(255,248,236,.24);color:#fff8ec}.zodiac-hero-visual{position:relative;z-index:1;min-height:470px;margin:0;display:grid;place-items:center;border:1px solid rgba(242,198,109,.34);border-radius:10px;background:radial-gradient(circle at 50% 44%,rgba(255,248,236,.12),rgba(0,0,0,.18) 62%,rgba(0,0,0,.3));box-shadow:0 38px 90px rgba(18,6,4,.36);overflow:hidden}.zodiac-hero-visual::before{content:"";position:absolute;inset:22px;border:1px solid rgba(242,198,109,.24);border-radius:50%;background:repeating-radial-gradient(circle at 50% 50%,rgba(242,198,109,.14) 0 1px,transparent 1px 30px);pointer-events:none}.zodiac-hero-visual img{position:relative;z-index:1;width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 30px 42px rgba(0,0,0,.3))}.zodiac-hero-visual figcaption{position:absolute;z-index:2;left:28px;bottom:28px;display:grid;gap:3px;padding:14px 16px;border:1px solid rgba(255,248,236,.2);border-radius:8px;background:rgba(34,12,10,.68);backdrop-filter:blur(10px);box-shadow:0 18px 38px rgba(0,0,0,.24)}.zodiac-hero-visual strong{font-family:Georgia,serif;font-size:20px;color:#fff3d6}.zodiac-hero-visual span{font-size:13px;color:#ead8bf}.zodiac-quick-tool{position:relative;z-index:2;max-width:1160px;margin:-44px auto 28px;padding:0 clamp(18px,4vw,52px)}.zodiac-quick-tool .tool-panel{border:1px solid rgba(214,176,98,.42);border-left:5px solid #d7a64e;border-top:0;background:linear-gradient(180deg,#fffdf8,#f7ead7);box-shadow:0 24px 60px rgba(42,18,14,.18)}.zodiac-quick-tool .tool-copy h2{font-size:clamp(28px,2.8vw,38px)}.tool-copy h2,.section-heading h2,.content-section h2{font-weight:720}.tool-copy p,.content-section p,.pair-card small,.guide-card p,.animal-card p{color:#463f38}.visual-panel{position:relative;background:linear-gradient(145deg,#fffaf0,#f1eadb);padding:18px}.visual-panel::before{content:"";position:absolute;inset:14px;border:1px solid rgba(179,52,58,.14);border-radius:8px;background:repeating-radial-gradient(circle at 50% 50%,rgba(185,148,85,.12) 0 1px,transparent 1px 22px);pointer-events:none}.visual-panel img{position:relative;width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 18px 28px rgba(80,50,25,.12))}.animal-grid{gap:16px}.animal-card{display:grid;grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto auto 1fr;column-gap:16px;row-gap:6px;min-height:178px;padding:22px;overflow:hidden;isolation:isolate;background:linear-gradient(180deg,#fffefa,#fff7ec);box-shadow:0 14px 30px rgba(60,45,26,.065)}.animal-card::after{content:"";position:absolute;right:-46px;bottom:-50px;z-index:0;width:104px;height:104px;border-radius:50%;background:var(--animal-soft,#fff2e8);opacity:.28}.animal-card strong,.animal-card p,.animal-card>span{position:relative;z-index:1}.animal-seal{position:relative!important;left:auto;top:auto;grid-column:1;grid-row:1/3;align-self:start;display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--animal-soft,#fff0e7);border:1px solid color-mix(in srgb,var(--animal-accent,#b3343a) 42%,#fff);color:var(--animal-accent,#b3343a);font-family:Georgia,serif;font-size:25px;font-weight:850;line-height:1;box-shadow:0 10px 18px rgba(60,40,20,.09)}.animal-card strong{grid-column:2;grid-row:1;padding-right:34px;margin-top:1px;color:#12100e;font-size:19px;font-weight:760}.animal-card>span:not(.animal-order):not(.animal-seal){grid-column:2;grid-row:2;color:#4d463f;font-size:14px}.animal-card p{grid-column:2;grid-row:3;margin-top:8px}.animal-order{position:absolute!important;right:18px;top:18px;z-index:2;color:#b99455;font-size:13px;font-weight:780}.fact-grid div,.step-grid div,.element-grid div,.guide-card,.pair-card,.score-grid div{background:linear-gradient(180deg,#fffefa,#fffaf2)}.fact-grid strong,.step-grid strong,.element-grid strong,.guide-card strong,.pair-card strong,.score-grid strong{font-weight:720}.pair-card{position:relative;grid-template-columns:auto 1fr auto;align-items:center;gap:8px 12px;padding:16px 16px 15px;min-height:122px;overflow:hidden;isolation:isolate}.pair-card::after{content:"";position:absolute;right:-40px;bottom:-46px;z-index:0;width:116px;height:116px;border-radius:50%;background:rgba(185,148,85,.06)}.pair-icons{grid-row:1/4;display:flex;flex-direction:column;gap:5px;z-index:1}.mini-seal{display:grid;place-items:center;width:29px;height:29px;border-radius:9px;background:var(--animal-soft,#fff0e7);border:1px solid color-mix(in srgb,var(--animal-accent,#b3343a) 34%,#fff);color:var(--animal-accent,#b3343a);font-family:Georgia,serif;font-size:17px;font-weight:800;line-height:1}.pair-card strong{z-index:1;font-size:16px}.pair-card .match-label{z-index:1;justify-self:start;display:inline-flex;align-items:center;min-height:27px;padding:0 10px;border-radius:999px;background:#edf5f2;color:#28665d;font-size:13px;font-weight:680}.pair-card small{z-index:1;grid-column:2/4;font-size:13px}.score-grid span{font-size:20px;font-weight:760}.result-card h3{font-weight:720}.result-facts strong{font-weight:720}.guide-card span{font-weight:760}.guide-card strong{font-size:17px}.content-section:not(.split),.tool-panel,.visual-panel,.fact-card{box-shadow:0 12px 30px rgba(60,45,26,.065)}body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero{max-width:1180px;padding-top:42px;padding-bottom:24px}body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero h1{max-width:920px;color:#2a1714;font-size:clamp(28px,2.25vw,34px);line-height:1.16}body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero .intro{max-width:820px;color:#5b5145;font-size:17px;line-height:1.68}@media(max-width:980px){.zodiac-hero{grid-template-columns:1fr;min-height:auto;padding:52px 22px 86px}.zodiac-hero-visual{min-height:390px}.zodiac-quick-tool{margin-top:-54px}}@media(max-width:820px){.animal-card{grid-template-columns:42px minmax(0,1fr);padding:18px}.animal-seal{width:42px;height:42px}.pair-card{grid-template-columns:auto 1fr}.pair-card small{grid-column:2}.visual-panel img{width:100%;height:100%}}@media(max-width:640px){.zodiac-hero-copy h2{font-size:40px}.zodiac-hero-actions{display:grid}.zodiac-hero-actions .button-link{width:100%}.zodiac-hero-visual{min-height:300px}.zodiac-hero-visual figcaption{left:16px;right:16px;bottom:16px}}`;
}

function seoReportCss() {
  return `.seo-report-page{padding:36px 0}.report-hero h1{font-family:Inter,Segoe UI,Arial,sans-serif;font-size:34px;line-height:1.12;margin:12px 0 10px}.report-summary{display:grid;grid-template-columns:repeat(5,minmax(120px,1fr));gap:12px;margin-top:22px}.report-summary div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.report-summary strong{display:block;font-size:28px;line-height:1;color:#1d1814}.report-summary span{display:block;margin-top:8px;color:var(--muted);font-size:13px;font-weight:720}.report-rules p{margin:0}.seo-table td:nth-child(2){white-space:nowrap}.seo-table td:nth-child(2) strong{display:block;font-size:18px}.seo-table td:nth-child(2) span{display:inline-flex;margin-top:4px;padding:2px 8px;border-radius:999px;background:#eee;color:#4a4038;font-size:12px;font-weight:760}.seo-table tr.pass td:nth-child(2) span{background:#e8f5ee;color:#236349}.seo-table tr.review td:nth-child(2) span{background:#fff3d8;color:#8a5a16}.seo-table tr.fix td:nth-child(2) span{background:#fde8e8;color:#a42b2b}.seo-table td:last-child span{display:block;margin:3px 0;font-size:13px;color:#5c534b}@media(max-width:820px){.report-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
}

function zodiacUpgradeCss() {
  return `.zodiac-hero{min-height:680px;padding-bottom:82px}.zodiac-hero-visual{min-height:540px;background:radial-gradient(circle at 50% 46%,rgba(242,198,109,.2),rgba(125,34,38,.18) 45%,rgba(0,0,0,.3) 78%)}.zodiac-hero-visual::before{inset:18px;border-radius:12px;background:linear-gradient(135deg,rgba(255,248,236,.06),transparent 38%),repeating-linear-gradient(90deg,rgba(242,198,109,.08) 0 1px,transparent 1px 44px),repeating-linear-gradient(0deg,rgba(242,198,109,.06) 0 1px,transparent 1px 44px)}.zodiac-wheel-stage{position:relative;width:min(500px,86vw);aspect-ratio:1;display:grid;place-items:center}.zodiac-wheel-stage::before,.zodiac-wheel-stage::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none}.zodiac-wheel-stage::before{border:2px solid rgba(242,198,109,.55);box-shadow:0 0 0 22px rgba(242,198,109,.06),0 0 0 44px rgba(255,248,236,.035),0 34px 70px rgba(0,0,0,.32)}.zodiac-wheel-stage::after{inset:50px;border:1px solid rgba(255,248,236,.24);background:radial-gradient(circle,rgba(255,248,236,.08),transparent 62%)}.zodiac-orbit{position:absolute;inset:0;border-radius:50%;animation:zodiacSpin 42s linear infinite}.zodiac-orbit::before{content:"";position:absolute;inset:96px;border-radius:50%;border:1px dashed rgba(242,198,109,.34);box-shadow:0 0 0 54px rgba(255,248,236,.025)}.zodiac-orbit-item{--angle:calc(var(--i) * 30deg);position:absolute;left:50%;top:50%;width:74px;height:74px;margin:-37px;display:grid;place-items:center;gap:2px;text-decoration:none;color:#fff8ec;transform:rotate(var(--angle)) translate(210px) rotate(calc(-1 * var(--angle)));z-index:2}.zodiac-orbit-item span{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--animal-soft,#fff0e7);border:1px solid color-mix(in srgb,var(--animal-accent,#b3343a) 48%,#fff);color:var(--animal-accent,#b3343a);font-family:Georgia,serif;font-size:24px;font-weight:850;box-shadow:0 12px 24px rgba(0,0,0,.2)}.zodiac-orbit-item small{padding:3px 8px;border-radius:999px;background:rgba(33,12,10,.58);font-size:12px;font-weight:760;color:#fff3d6;box-shadow:0 8px 16px rgba(0,0,0,.16)}.zodiac-wheel-core{position:relative;z-index:3;display:grid;align-content:center;justify-items:center;gap:4px;width:210px;height:210px;padding:18px 18px 20px;border-radius:50%;background:radial-gradient(circle at 36% 30%,#df5054,#a71f31 66%,#69131f);border:2px solid rgba(242,198,109,.72);box-shadow:0 20px 46px rgba(0,0,0,.32),0 0 0 24px rgba(242,198,109,.08),0 0 0 56px rgba(255,248,236,.045),inset 0 0 0 12px rgba(255,248,236,.06);color:#fff8ec;text-align:center}.zodiac-wheel-core::before{content:"";position:absolute;inset:-74px;border-radius:50%;border:1px solid rgba(242,198,109,.2);background:conic-gradient(from 0deg,rgba(242,198,109,.16) 0 2deg,transparent 2deg 30deg);pointer-events:none}.zodiac-wheel-core::after{content:"";position:absolute;inset:18px;border-radius:50%;border:1px solid rgba(255,248,236,.16);pointer-events:none}.zodiac-wheel-core strong{font-family:Georgia,serif;font-size:36px;line-height:.94;display:block;margin:0}.zodiac-wheel-core span{font-size:14px;line-height:1.02;letter-spacing:.08em;text-transform:uppercase;color:#f7d895;display:block;margin:0}.zodiac-hero-visual:hover .zodiac-orbit{animation-play-state:paused}.zodiac-hero-visual figcaption{left:24px;top:24px;bottom:auto;padding:10px 13px;background:rgba(34,12,10,.5)}.zodiac-hero-visual figcaption strong{font-size:16px}.zodiac-hero-visual figcaption span{font-size:12px}.zodiac-quick-tool{margin:34px auto 30px}.zodiac-quick-tool .tool-panel{box-shadow:0 18px 44px rgba(42,18,14,.12)}@keyframes zodiacSpin{to{transform:rotate(360deg)}}@media(max-width:980px){.zodiac-hero{min-height:auto;padding-bottom:54px}.zodiac-wheel-stage{width:min(440px,88vw)}.zodiac-orbit-item{transform:rotate(var(--angle)) translate(184px) rotate(calc(-1 * var(--angle)))}.zodiac-wheel-core{width:184px;height:184px;gap:4px;padding:16px 16px 18px}.zodiac-quick-tool{margin-top:28px}}@media(max-width:640px){.zodiac-hero-visual{min-height:390px}.zodiac-wheel-stage{width:min(320px,82vw)}.zodiac-orbit-item{width:58px;height:58px;margin:-29px;transform:rotate(var(--angle)) translate(136px) rotate(calc(-1 * var(--angle)))}.zodiac-orbit-item span{width:34px;height:34px;font-size:19px}.zodiac-orbit-item small{font-size:10px;padding:2px 6px}.zodiac-wheel-core{width:132px;height:132px;gap:3px;padding:12px 12px 14px}.zodiac-wheel-core::before{inset:-48px}.zodiac-wheel-core strong{font-size:25px}.zodiac-wheel-core span{font-size:11px}.zodiac-hero-visual figcaption{position:absolute;left:14px;top:14px;right:auto;bottom:auto}}`;
}

function siteWideStyleExtensionCss() {
  return `body:not(.page-home):not(.seo-report-page) main{position:relative}body:not(.page-home):not(.seo-report-page) main::before{content:"";position:absolute;inset:0 0 auto;height:300px;background:linear-gradient(135deg,rgba(33,15,15,.98),rgba(74,20,25,.95) 52%,rgba(125,34,38,.9));z-index:-2}body:not(.page-home):not(.seo-report-page) main::after{content:"";position:absolute;left:0;right:0;top:0;height:300px;background:radial-gradient(circle at 18% 18%,rgba(242,198,109,.18),transparent 30%),radial-gradient(circle at 86% 60%,rgba(255,248,236,.08),transparent 28%),linear-gradient(90deg,rgba(255,248,236,.04) 1px,transparent 1px),linear-gradient(0deg,rgba(255,248,236,.035) 1px,transparent 1px);background-size:auto,auto,54px 54px,54px 54px;z-index:-1;pointer-events:none}body:not(.page-home):not(.seo-report-page) .page-hero{position:relative;color:#fff8ec;padding-top:54px;padding-bottom:44px;margin-bottom:56px}body:not(.page-home):not(.seo-report-page) .page-hero::after{content:"十二生肖";position:absolute;right:clamp(18px,5vw,70px);top:34px;color:rgba(255,248,236,.08);font-family:Georgia,serif;font-size:clamp(54px,8vw,104px);font-weight:900;letter-spacing:.12em;line-height:1;pointer-events:none}body:not(.page-home):not(.seo-report-page) .page-hero>div{position:relative;z-index:1;max-width:900px}body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero h1{max-width:920px;color:#fff8ec;font-size:clamp(28px,2.25vw,34px);line-height:1.16;text-shadow:0 10px 28px rgba(0,0,0,.22)}body.page-guides .page-hero h1{color:#fff8ec;text-shadow:0 16px 38px rgba(0,0,0,.24)}body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero .intro,body.page-guides .page-hero .intro{color:#ead8bf;max-width:820px}body:not(.page-home):not(.seo-report-page) .page-hero .eyebrow{background:rgba(242,198,109,.13);border-color:rgba(242,198,109,.36);color:#f2c66d}body:not(.page-home):not(.seo-report-page) .page-hero+.tool-page,body:not(.page-home):not(.seo-report-page) .page-hero+.content-section,body:not(.page-home):not(.seo-report-page) .page-hero+.article-shell{margin-top:0}.content-section:not(.split),.tool-panel,.sidebar-card,.guide-card,.pair-card,.year-link-card,.faq-answer-card,.faq-category,.score-grid div,.fact-grid div,.step-grid div,.element-grid div{border-color:rgba(185,148,85,.28);background:linear-gradient(180deg,#fffefa,#fff8ee);box-shadow:0 14px 34px rgba(60,45,26,.075)}.content-section:not(.split){position:relative;overflow:hidden}.content-section:not(.split)::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--red),var(--gold),var(--jade));opacity:.86}.content-section:not(.split)>*{position:relative;z-index:1}.split>div{border-color:rgba(185,148,85,.28);background:linear-gradient(180deg,#fffefa,#fff8ee);box-shadow:0 14px 34px rgba(60,45,26,.075)}.tool-panel{border-top-color:var(--gold);border-left:4px solid var(--red)}.article-search{background:linear-gradient(135deg,#fffefa,#f7ead7)!important;border-color:rgba(185,148,85,.34)!important}.site-search-form{background:rgba(255,250,243,.82);box-shadow:inset 0 0 0 1px rgba(185,148,85,.12)}.article-sidebar .sidebar-card:first-child{border-top:4px solid var(--gold)}.article-sidebar .sidebar-card.compact{border-top:4px solid var(--red)}.sidebar-link-list a:hover strong,.sidebar-link-list a:hover span{color:var(--red)}.table-wrap{border:1px solid rgba(185,148,85,.22);border-radius:8px;background:#fffefa}.content-section th{background:linear-gradient(180deg,#3b1717,#281211);color:#fff3d6;border-bottom-color:rgba(242,198,109,.22)}.content-section td{background:rgba(255,253,248,.78)}.content-section tr:nth-child(even) td{background:#fff8ee}.guide-card,.year-link-card,.pair-card{isolation:isolate}.guide-card::after,.year-link-card::after{content:"";position:absolute;right:-42px;bottom:-48px;width:108px;height:108px;border-radius:50%;background:rgba(185,148,85,.07);z-index:-1}.guide-card,.year-link-card{position:relative;overflow:hidden}.guide-filter-nav button{background:#fff8ee;border-color:rgba(185,148,85,.34)}.guide-filter-nav button:hover,.guide-filter-nav button.is-active{background:#3b1717;border-color:#3b1717;color:#fff3d6}.faq-sidebar{background:rgba(255,253,248,.64);border:1px solid rgba(185,148,85,.22);border-radius:8px;padding:12px}.faq-menu-head{border-radius:6px}.faq-menu-group.is-open .faq-menu-head{background:#3b1717;color:#fff3d6}.faq-menu-group.is-open .faq-arrow{background:rgba(242,198,109,.16);color:#f2c66d}.ad-slot{background:linear-gradient(135deg,#fffaf1,#f7ead7);border-color:rgba(185,148,85,.42);color:#8a5f2c}.site-footer{margin-top:60px;border-top:1px solid rgba(242,198,109,.18);background:radial-gradient(circle at 10% 0,rgba(242,198,109,.12),transparent 28%),linear-gradient(135deg,#211312,#321515)}@media(max-width:980px){body:not(.page-home):not(.seo-report-page) main::before,body:not(.page-home):not(.seo-report-page) main::after{height:330px}body:not(.page-home):not(.seo-report-page) .page-hero{padding-top:42px;padding-bottom:36px;margin-bottom:44px}.faq-sidebar{padding:10px}}@media(max-width:640px){body:not(.page-home):not(.seo-report-page) .page-hero::after{font-size:52px;top:28px;right:12px}.content-section:not(.split),.tool-panel,.sidebar-card{border-radius:8px}}`;
}

function heroSpacingFixCss() {
  return `body:not(.page-home):not(.seo-report-page) main::before,body:not(.page-home):not(.seo-report-page) main::after{display:none}body:not(.page-home):not(.seo-report-page) .page-hero{isolation:isolate;overflow:hidden;padding-top:54px;padding-bottom:50px;margin-top:16px;margin-bottom:34px}body:not(.page-home):not(.seo-report-page) .page-hero::before{content:"";position:absolute;inset:0 50%;width:100vw;transform:translateX(-50%);background:linear-gradient(135deg,rgba(33,15,15,.98),rgba(74,20,25,.95) 52%,rgba(125,34,38,.9)),radial-gradient(circle at 18% 18%,rgba(242,198,109,.18),transparent 30%),radial-gradient(circle at 86% 60%,rgba(255,248,236,.08),transparent 28%),linear-gradient(90deg,rgba(255,248,236,.04) 1px,transparent 1px),linear-gradient(0deg,rgba(255,248,236,.035) 1px,transparent 1px);background-size:auto,auto,auto,54px 54px,54px 54px;z-index:-2;pointer-events:none}body:not(.page-home):not(.seo-report-page) .page-hero+.tool-page,body:not(.page-home):not(.seo-report-page) .page-hero+.content-section,body:not(.page-home):not(.seo-report-page) .page-hero+.article-shell{margin-top:0}.page-guides .article-search{margin-top:0}.tool-page .tool-panel,.article-search,.content-section:not(.split){scroll-margin-top:96px}@media(max-width:980px){body:not(.page-home):not(.seo-report-page) .page-hero{padding-top:42px;padding-bottom:44px;margin-top:12px;margin-bottom:30px}}@media(max-width:640px){body:not(.page-home):not(.seo-report-page) .page-hero{padding-bottom:36px;margin-top:8px;margin-bottom:26px}}`;
}

function contentWidthBalanceCss() {
  return `body:not(.page-home):not(.seo-report-page) .page-hero{max-width:1240px}body:not(.page-home):not(.page-guides):not(.seo-report-page) .tool-page,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search{max-width:1120px}body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-shell{max-width:1220px}.page-guides .article-search,.page-guides .content-section{max-width:1120px}.page-guides .article-search{padding-left:34px!important;padding-right:34px!important}.tool-page .tool-panel{max-width:none}.content-section:not(.split){padding-left:clamp(22px,4vw,52px);padding-right:clamp(22px,4vw,52px)}@media(max-width:1180px){body:not(.page-home):not(.seo-report-page) .page-hero,body:not(.page-home):not(.page-guides):not(.seo-report-page) .tool-page,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search,.page-guides .article-search,.page-guides .content-section{max-width:calc(100% - 32px)}}@media(max-width:640px){body:not(.page-home):not(.seo-report-page) .page-hero,body:not(.page-home):not(.page-guides):not(.seo-report-page) .tool-page,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search,.page-guides .article-search,.page-guides .content-section{max-width:calc(100% - 20px)}.page-guides .article-search{padding-left:20px!important;padding-right:20px!important}}`;
}






