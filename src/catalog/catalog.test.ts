import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { createCatalog } from "./catalog";

describe("createCatalog", () => {
  it("lists garments in insertion order", () => {
    const coat = garmentFixture({ id: "coat" });
    const jacket = garmentFixture({ id: "jacket", name: "Jacket" });
    const catalog = createCatalog([coat, jacket]);

    expect(catalog.list()).toEqual([coat, jacket]);
  });

  it("returns a garment by id", () => {
    const coat = garmentFixture({ id: "coat" });
    const catalog = createCatalog([coat]);

    expect(catalog.get("coat")).toBe(coat);
  });

  it("returns undefined for an unknown id", () => {
    const catalog = createCatalog([garmentFixture()]);

    expect(catalog.get("missing")).toBeUndefined();
  });

  it("rejects duplicate ids", () => {
    expect(() =>
      createCatalog([garmentFixture({ id: "coat" }), garmentFixture({ id: "coat" })]),
    ).toThrow("Duplicate garment id: coat");
  });

  it("rejects an empty id", () => {
    expect(() => createCatalog([garmentFixture({ id: "" })])).toThrow(
      "Garment id is empty",
    );
  });

  it("rejects a non-integer price", () => {
    expect(() =>
      createCatalog([garmentFixture({ price: { amountCents: 10.5, currency: "USD" } })]),
    ).toThrow("Invalid price for garment g1");
  });

  it("rejects a negative price", () => {
    expect(() =>
      createCatalog([garmentFixture({ price: { amountCents: -1, currency: "USD" } })]),
    ).toThrow("Invalid price for garment g1");
  });
});
