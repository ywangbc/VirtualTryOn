import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { feedMedia } from "./feed-media";

const garment = garmentFixture();
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

  it("uses the look photo when there is no look video", () => {
    expect(feedMedia(look, garment)).toEqual({
      kind: "image",
      src: "/api/looks/look-1/photo",
    });
  });

  it("uses the look video when present", () => {
    expect(
      feedMedia({ ...look, videoUrl: "/api/looks/look-1/video" }, garment),
    ).toEqual({
      kind: "video",
      src: "/api/looks/look-1/video",
      poster: "/api/looks/look-1/photo",
    });
  });

  it("uses a ready try-on still over the look media", () => {
    expect(
      feedMedia(look, garment, "/api/tryon/result?look=look-1&garment=g1"),
    ).toEqual({
      kind: "image",
      src: "/api/tryon/result?look=look-1&garment=g1",
    });
  });
});
