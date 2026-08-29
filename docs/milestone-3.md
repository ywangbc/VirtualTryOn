# Milestone 3

Shop-shaped catalog. Outfits are products a shop could drop in as CSV.

## In scope

- Shops and garments with SKU, sizes, price, and product image
- Seed catalog in `src/catalog/seed/`
- Import replacement CSVs at `/admin`

## Out of scope

- Real retailer integrations
- Payments

## Done when

A shop CSV import shows those products in the feed and product sheet.

Authoritative catalog: `src/catalog/catalog.ts`, `src/catalog/catalog-csv.ts`, `src/catalog/load-catalog.ts`.
Seed files: `src/catalog/seed/shops.csv`, `src/catalog/seed/garments.csv`.
