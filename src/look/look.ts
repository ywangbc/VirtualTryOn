export type LookMediaType = "image/jpeg" | "image/png" | "image/webp";
export type LookVideoType = "video/mp4" | "video/webm";

export type LookMedia = {
  mimeType: string;
  bytes: Uint8Array;
};

export type Look = {
  id: string;
  photoUrl: string;
  videoUrl: string | null;
};

export function lookPhotoUrl(id: string): string {
  return `/api/looks/${id}/photo`;
}

export function lookVideoUrl(id: string): string {
  return `/api/looks/${id}/video`;
}

export function isLookPhotoType(mimeType: string): mimeType is LookMediaType {
  return mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp";
}

export function isLookVideoType(mimeType: string): mimeType is LookVideoType {
  return mimeType === "video/mp4" || mimeType === "video/webm";
}
