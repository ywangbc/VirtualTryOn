# Milestone 4

Still try-on: the saved look photo plus a garment product image become a cached still of you in that product.

## In scope

- Person photo + garment `productImageUrl` → still, via Fal
- Jobs: queued, ready, failed
- Cache by person photo bytes and garment image bytes; Fal is skipped on a hit
- Active feed item generates; swipe shows a ready still instantly

## Out of scope

- Video try-on
- Live camera
- Generating every catalog item up front

## Done when

A saved look on a catalog garment shows a try-on still when the job is ready, and a new CSV garment can use the same path.

Requires `FAL_KEY` in `.env.local`. Missing key fails the job; it does not fake a still.

Stills are reused for the same person photo bytes and garment image bytes, including a new look or another SKU that uses the same product image. Fal is not called on a hit.

Authoritative job flow: `src/tryon/run-tryon.ts`, `src/tryon/tryon-store.ts`.
Pair cache: `src/tryon/still-cache.ts`.
Provider: `src/tryon/fal-provider.ts`.
Feed wiring: `src/feed/Feed.tsx`, `src/feed/feed-media.ts`.
Generate API: `src/app/api/tryon/route.ts`.
