import type { Garment } from "@/domain/garment";
import type { Look } from "@/look/look";

export type FeedMedia =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string; poster: string };

export function feedMedia(
  look: Look | null,
  garment: Garment,
  tryOnResultUrl?: string,
): FeedMedia {
  if (tryOnResultUrl) {
    return { kind: "image", src: tryOnResultUrl };
  }
  if (look?.videoUrl) {
    return { kind: "video", src: look.videoUrl, poster: look.photoUrl };
  }
  if (look) {
    return { kind: "image", src: look.photoUrl };
  }
  return { kind: "video", src: garment.videoUrl, poster: garment.posterUrl };
}
