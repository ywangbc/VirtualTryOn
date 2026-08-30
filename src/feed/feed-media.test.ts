import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { feedMedia } from "./feed-media";

const garment = garmentFixture({
  productImageUrl: "/garments/ATL-COAT-01.jpg",
});
const look = {
  id: "look-1",
  photoUrl: "/api/looks/look-1/photo",
  videoUrl: null as string | null,
};

describe("feedMedia", () => {
  it("uses the garment clip when there is no look", () => {
    expect(feedMedia(null, garment)).toEqual({
      kind: "video",
      src: garment.videoUrl,
      poster: garment.posterUrl,
    });
  });

  it("uses the garment product photo when a look is saved and there is no still", () => {
    expect(feedMedia(look, garment)).toEqual({
      kind: "image",
      src: "/garments/ATL-COAT-01.jpg",
    });
  });

  it("uses the garment product photo instead of the look video when there is no still", () => {
    expect(
      feedMedia({ ...look, videoUrl: "/api/looks/look-1/video" }, garment),
    ).toEqual({
      kind: "image",
      src: "/garments/ATL-COAT-01.jpg",
    });
  });

  it("uses a ready try-on still over the garment photo", () => {
    expect(
      feedMedia(look, garment, "/api/tryon/result?look=look-1&garment=g1"),
    ).toEqual({
      kind: "image",
      src: "/api/tryon/result?look=look-1&garment=g1",
    });
  });
});
