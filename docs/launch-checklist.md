# Launch Checklist

Use this checklist before considering the site ready for replication to new projects.

## 1. Local Build

```bash
npm run build
node scripts/audit-links.mjs
```

Required result:

- Build exits with code 0.
- Link audit reports no missing internal links.
- `/admin/seo-report/` shows `Fix = 0`.

## 2. Core Tool Tests

Test these pages on desktop and mobile:

| Page | Test |
|---|---|
| `/chinese-zodiac-calculator/` | Enter a normal date and an early-year date before Lunar New Year |
| `/chinese-zodiac-years/` | Search 2026 and 1990 |
| `/chinese-zodiac-compatibility/` | Compare Dragon + Rat and Horse + Rat |
| `/guides/` | Search Horse, Dragon, 2026, compatibility |
| `/chinese-zodiac-faq/` | Open and close FAQ groups |

## 3. Indexing Checks

- Sitemap exists at `/sitemap.xml`.
- Robots exists at `/robots.txt`.
- GSC sitemap submitted.
- Bing Webmaster Tools sitemap submitted if available.
- Important pages can be requested for indexing:
  - `/`
  - `/chinese-zodiac-calculator/`
  - `/chinese-zodiac-years/`
  - `/chinese-zodiac-compatibility/`
  - `/guides/what-chinese-zodiac-sign-am-i/`
  - `/guides/dragon-chinese-zodiac/`

## 4. Google Analytics

This site reads Google Analytics from the build environment variable:

```text
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Cloudflare Pages setup:

1. Open the Pages project.
2. Go to Settings -> Environment variables.
3. Add `GA_MEASUREMENT_ID`.
4. Redeploy the site.
5. Check GA Realtime after visiting the live site.

Do not hard-code GA IDs into shared templates unless the site is already final.

## 5. Ahrefs

Preferred setup:

1. Add the project in Ahrefs.
2. Verify through GSC import when possible.
3. Confirm domain is `https://www.chinesezodiacfinder.com/`.
4. Import GSC data for diagnosis.
5. Check Site Audit after the first crawl.

Do not add random Ahrefs verification files until Ahrefs provides the exact file or meta tag.

## 6. Security Checks

Before pushing:

```bash
rg -n "api_key|apikey|secret|token|password|stripe|paypal|dataforseo|openai|ahrefs|semrush|GA_MEASUREMENT_ID" .
```

Rules:

- GitHub repository should stay private.
- `.env` must not be committed.
- API secrets stay in local `.env` or Cloudflare environment variables.
- Stripe/PayPal secret keys must never be exposed in frontend JavaScript.
- Frontend can only use public client IDs or publishable keys.
- Webhook secrets require a backend or serverless function.

## 7. Replication Decision

The site is ready to replicate when:

- Tools work.
- No internal 404.
- Two article pages publish cleanly.
- GA is receiving visits.
- GSC sitemap is submitted.
- Ahrefs project is connected.
- Security scan has no committed secrets.
