# Chinese Zodiac Finder

Static Chinese zodiac guide and calculator site for `www.chinesezodiacfinder.com`.

## Content update workflow

This site is generated from source files, not edited directly in `dist/`.

- Update fixed knowledge data in `data/*.json`.
- Update page templates, tools, navigation, and SEO layout in `scripts/generate.mjs`.
- Run `npm run build` to regenerate `dist/`.
- Commit and push to `main`.
- Cloudflare deploys the latest GitHub commit automatically.

Do not manually edit files inside `dist/`; they are rebuilt every time.

## Commands

```bash
npm run build
npm run dev
```

Cloudflare build settings:

- Build command: `npm run build`
- Build output directory: `dist`
