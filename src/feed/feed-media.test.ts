import { describe, expect, it } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { feedMedia } from "./feed-media";

const garment = garmentFixture();

describe("feedMedia", () => {
  it("uses the garment clip when there is no look", () => {
    expect(feedMedia(null, garment)).toEqual({
      kind: "video",
      src: garment.videoUrl,
      poster: garment.posterUrl,
    });
  });

  it("uses the look photo when there is no look video", () => {
    expect(
      feedMedia(
        { id: "look-1", photoUrl: "/api/looks/look-1/photo", videoUrl: null },
        garment,
      ),
    ).toEqual({
      kind: "image",
      src: "/api/looks/look-1/photo",
    });
  });

  it("uses the look video when present", () => {
    expect(
      feedMedia(
        {
          id: "look-1",
          photoUrl: "/api/looks/look-1/photo",
          videoUrl: "/api/looks/look-1/video",
        },
        garment,
      ),
    ).toEqual({
      kind: "video",
      src: "/api/looks/look-1/video",
      poster: "/api/looks/look-1/photo",
    });
  });
});
