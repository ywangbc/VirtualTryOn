# Virtual Try-On

Index of project documentation. Implementation details live in code; these pages own process and product scope only.

- [AI development rules](./ai-development-rules.md)
- [Milestone 1 scope](./milestone-1.md)
- [Milestone 2 scope](./milestone-2.md)
- [Milestone 3 scope](./milestone-3.md)
- [Milestone 4 scope](./milestone-4.md)
- Feed session logic: `src/feed/feed-session.ts`
- Catalog: `src/catalog/catalog.ts`, `src/catalog/catalog-csv.ts`, `src/catalog/load-catalog.ts`
- Seed catalog: `src/catalog/seed/shops.csv`, `src/catalog/seed/garments.csv`
- Mock clips: `public/clips/`
- Feed UI: `src/feed/Feed.tsx`
- Feed media choice: `src/feed/feed-media.ts`
- Look identity: `src/look/look.ts`, `src/look/look-store.ts`, `src/look/LookChrome.tsx`
- Try-on: `src/tryon/run-tryon.ts`, `src/tryon/tryon-store.ts`, `src/tryon/still-cache.ts`, `src/tryon/fal-provider.ts`
- App entry: `src/app/page.tsx`
- Catalog import: `src/app/admin/page.tsx`
