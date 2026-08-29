# Milestone 2

Session identity so the feed shows you, with the same mock outfits as labels. No try-on pixels.

## In scope

- Full-body photo (required) and optional short video
- Cookie-scoped look so two browsers get different identity
- After a look is saved, the feed visual is that photo (or video). Outfit names stay mock.

## Out of scope

- Magic-link accounts
- Generating new outfit pixels (clothes composited onto the body)
- Shop, payments, and partner integrations

## Done when

Two sessions can scroll the same catalog and see themselves in the feed, with different identity chrome, without generated try-on.

Authoritative media choice: `src/feed/feed-media.ts`.
Look storage: `src/look/look-store.ts`.
UI: `src/look/LookChrome.tsx`, `src/feed/Feed.tsx`.
