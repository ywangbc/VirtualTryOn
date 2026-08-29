import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats zero", () => {
    expect(formatMoney({ amountCents: 0, currency: "USD" })).toBe("$0.00");
  });

  it("formats dollars and cents", () => {
    expect(formatMoney({ amountCents: 1999, currency: "USD" })).toBe("$19.99");
  });

  it("formats whole dollars", () => {
    expect(formatMoney({ amountCents: 24800, currency: "USD" })).toBe("$248.00");
  });
});
