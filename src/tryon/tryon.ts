export type TryOnStatus = "queued" | "ready" | "failed";

export type TryOnJob = {
  lookId: string;
  garmentId: string;
  status: TryOnStatus;
  resultUrl?: string;
  error?: string;
};

export function tryOnResultUrl(lookId: string, garmentId: string): string {
  const look = encodeURIComponent(lookId);
  const garment = encodeURIComponent(garmentId);
  return `/api/tryon/result?look=${look}&garment=${garment}`;
}
