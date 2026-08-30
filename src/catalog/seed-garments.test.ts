import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseGarmentsCsv } from "./catalog-csv";

const seedCsv = path.join(process.cwd(), "src", "catalog", "seed", "garments.csv");
const publicRoot = path.join(process.cwd(), "public");

describe("seed garments", () => {
  it("gives every garment its own product image file", () => {
    const garments = parseGarmentsCsv(readFileSync(seedCsv, "utf8"));
    const urls = garments.map((garment) => garment.productImageUrl);
    expect(urls.length).toBeGreaterThan(1);
    expect(new Set(urls).size).toBe(urls.length);

    const hashes = garments.map((garment) => {
      const relative = garment.productImageUrl.replace(/^\/+/, "");
      const bytes = readFileSync(path.join(publicRoot, relative));
      expect(bytes.byteLength).toBeGreaterThan(20_000);
      return createHash("sha256").update(bytes).digest("hex");
    });
    expect(new Set(hashes).size).toBe(hashes.length);
  });
});
