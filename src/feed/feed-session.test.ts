import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import {
  activateIndex,
  closeProduct,
  createFeedState,
  openGarment,
  selectedGarment,
  toggleProduct,
} from "./feed-session";

const garments = [
  garmentFixture({ id: "coat" }),
  garmentFixture({ id: "jacket", name: "Jacket" }),
];

describe("createFeedState", () => {
  it("starts on the first garment with the product sheet closed", () => {
    expect(createFeedState(garments.length)).toEqual({
      activeIndex: 0,
      openGarmentId: null,
    });
  });

  it("starts with no active item when the feed is empty", () => {
    expect(createFeedState(0)).toEqual({
      activeIndex: null,
      openGarmentId: null,
    });
  });
});

describe("activateIndex", () => {
  it("moves the active item and closes the product sheet", () => {
    const open = openGarment(createFeedState(garments.length), garments, "coat");
    expect(activateIndex(open, 1, garments.length)).toEqual({
      activeIndex: 1,
      openGarmentId: null,
    });
  });

  it("rejects an out-of-range index", () => {
    expect(() => activateIndex(createFeedState(2), 2, 2)).toThrow(
      "activeIndex out of range: 2",
    );
  });
});

describe("product sheet", () => {
  it("opens a known garment", () => {
    const state = openGarment(createFeedState(garments.length), garments, "jacket");
    expect(state.openGarmentId).toBe("jacket");
    expect(selectedGarment(garments, state)).toEqual(garments[1]);
  });

  it("rejects an unknown garment", () => {
    expect(() =>
      openGarment(createFeedState(garments.length), garments, "missing"),
    ).toThrow("Unknown garment: missing");
  });

  it("closes the sheet", () => {
    const open = openGarment(createFeedState(garments.length), garments, "coat");
    expect(closeProduct(open)).toEqual({
      activeIndex: 0,
      openGarmentId: null,
    });
  });

  it("toggles the same garment closed", () => {
    const open = openGarment(createFeedState(garments.length), garments, "coat");
    expect(toggleProduct(open, garments, "coat").openGarmentId).toBeNull();
  });

  it("toggles a different garment open", () => {
    const open = openGarment(createFeedState(garments.length), garments, "coat");
    expect(toggleProduct(open, garments, "jacket").openGarmentId).toBe("jacket");
  });

  it("returns undefined when no product is open", () => {
    expect(selectedGarment(garments, createFeedState(garments.length))).toBeUndefined();
  });
});
