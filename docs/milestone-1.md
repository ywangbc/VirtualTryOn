# Milestone 1

Vertical video feed with snap scrolling and a static product sheet. No accounts, camera, or generated try-on.

## In scope

- Full-screen clips that snap one viewport at a time
- Only the on-screen clip plays
- Tap a clip to open product copy (brand, name, price, description)
- Seed catalog of mock garments and clips in `public/clips/`

## Out of scope

- User identity capture
- Shop admin, payments, and partner integrations
- Try-on generation

## Done when

Opening the site and scrolling feels like a fashion TikTok, and tapping a clip shows that garment’s product sheet.

Authoritative behavior is in `src/feed/feed-session.ts` and `src/feed/Feed.tsx`.
