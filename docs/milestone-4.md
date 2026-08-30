# Milestone 4

Still try-on: the saved look photo plus a garment product image become a cached still of you in that product.

## In scope

- Person photo + garment `productImageUrl` → still, via Fal
- Jobs: queued, ready, failed
- Cache by look and garment so a CSV import try-on needs no code change
- Active feed item generates; swipe shows a ready still instantly

## Out of scope

- Video try-on
- Live camera
- Generating every catalog item up front

## Done when

A saved look on a catalog garment shows a try-on still when the job is ready, and a new CSV garment can use the same path.

Requires `FAL_KEY` in `.env.local`. Missing key fails the job; it does not fake a still.

Authoritative job flow: `src/tryon/run-tryon.ts`, `src/tryon/tryon-store.ts`.
Provider: `src/tryon/fal-provider.ts`.
Feed wiring: `src/feed/Feed.tsx`, `src/feed/feed-media.ts`.
Generate API: `src/app/api/tryon/route.ts`.
