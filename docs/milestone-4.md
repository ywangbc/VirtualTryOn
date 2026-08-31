# Milestone 4

Still try-on: the saved look photo plus a garment product image become a cached still of you in that product.

## In scope

- Person photo + garment `productImageUrl` → still, via Fal
- Jobs: queued, ready, failed
- Cache by person photo and garment id; Fal is skipped on a hit
- The on-screen card and the next card generate; a queued job is started again if generate did not finish
- Snap scroll position picks the active card
- Until a still is ready, a saved look shows that garment’s product photo

## Out of scope

- Video try-on
- Live camera
- Generating every catalog item up front

## Done when

A saved look on a catalog garment shows that product’s photo until the try-on still is ready, then the still. A new CSV garment can use the same path.

Requires `FAL_KEY` in `.env.local`. Missing key fails the job; it does not fake a still.

Stills are reused for the same person photo and the same garment id. A different SKU generates even if it shares a product image file.

Authoritative job flow: `src/tryon/run-tryon.ts`, `src/tryon/tryon-store.ts`.
Pair cache: `src/tryon/still-cache.ts`.
Provider: `src/tryon/fal-provider.ts`.
Feed wiring: `src/feed/Feed.tsx`, `src/feed/feed-media.ts`.
Generate API: `src/app/api/tryon/route.ts`.
