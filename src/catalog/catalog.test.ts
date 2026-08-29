import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { shopFixture } from "@/testing/shop-fixture";
import { createCatalog } from "./catalog";

const atlas = shopFixture();
const coat = garmentFixture();

describe("createCatalog", () => {
  it("lists garments in insertion order", () => {
    const jacket = garmentFixture({
      id: "atlas:ATL-JKT",
      sku: "ATL-JKT",
      name: "Jacket",
    });
    const catalog = createCatalog([atlas], [coat, jacket]);
    expect(catalog.list()).toEqual([coat, jacket]);
  });

  it("returns a garment by id", () => {
    const catalog = createCatalog([atlas], [coat]);
    expect(catalog.get(coat.id)).toBe(coat);
  });

  it("returns a shop by id", () => {
    const catalog = createCatalog([atlas], [coat]);
    expect(catalog.shop("atlas")).toEqual(atlas);
  });

  it("returns undefined for an unknown garment", () => {
    const catalog = createCatalog([atlas], [coat]);
    expect(catalog.get("missing")).toBeUndefined();
  });

  it("rejects a garment for an unknown shop", () => {
    expect(() => createCatalog([atlas], [garmentFixture({ shopId: "missing" })])).toThrow(
      "Unknown shop: missing",
    );
  });

  it("rejects duplicate garment ids", () => {
    expect(() => createCatalog([atlas], [coat, garmentFixture({ sku: "OTHER" })])).toThrow(
      `Duplicate garment id: ${coat.id}`,
    );
  });

  it("rejects duplicate sku in the same shop", () => {
    expect(() =>
      createCatalog(
        [atlas],
        [
          coat,
          garmentFixture({
            id: "atlas:ATL-COAT-2",
            sku: "ATL-COAT",
            name: "Other coat",
          }),
        ],
      ),
    ).toThrow("Duplicate sku ATL-COAT in shop atlas");
  });

  it("rejects an empty id", () => {
    expect(() => createCatalog([atlas], [garmentFixture({ id: "" })])).toThrow(
      "Garment id is empty",
    );
  });

  it("rejects a non-integer price", () => {
    expect(() =>
      createCatalog([atlas], [garmentFixture({ price: { amountCents: 10.5, currency: "USD" } })]),
    ).toThrow(`Invalid price for garment ${coat.id}`);
  });

  it("rejects a negative price", () => {
    expect(() =>
      createCatalog([atlas], [garmentFixture({ price: { amountCents: -1, currency: "USD" } })]),
    ).toThrow(`Invalid price for garment ${coat.id}`);
  });
});
