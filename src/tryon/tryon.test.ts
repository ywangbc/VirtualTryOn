import { describe, expect, it } from "vitest";
import { tryOnResultUrl } from "./tryon";

describe("tryOnResultUrl", () => {
  it("encodes a garment id that contains a colon", () => {
    expect(tryOnResultUrl("look-1", "atlas:ATL-COAT-01")).toBe(
      "/api/tryon/result?look=look-1&garment=atlas%3AATL-COAT-01",
    );
  });
});
