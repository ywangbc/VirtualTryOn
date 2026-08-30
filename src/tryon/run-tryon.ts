import type { LookBlob } from "@/look/look-store";
import type { TryOnJob } from "./tryon";
import type { TryOnProvider } from "./tryon-provider";
import type { TryOnStore } from "./tryon-store";

export async function beginTryOn(
  store: TryOnStore,
  lookId: string,
  garmentId: string,
): Promise<{ job: TryOnJob; started: boolean }> {
  const existing = await store.get(lookId, garmentId);
  if (existing?.status === "ready" || existing?.status === "queued") {
    return { job: existing, started: false };
  }
  return { job: await store.markQueued(lookId, garmentId), started: true };
}

export async function runTryOn(
  deps: {
    store: TryOnStore;
    provider: TryOnProvider;
    person: LookBlob;
    garmentImage: LookBlob;
  },
  lookId: string,
  garmentId: string,
): Promise<TryOnJob> {
  const existing = await deps.store.get(lookId, garmentId);
  if (existing?.status === "ready") {
    return existing;
  }
  if (existing?.status !== "queued") {
    await deps.store.markQueued(lookId, garmentId);
  }
  try {
    const result = await deps.provider.generate({
      person: deps.person,
      garment: deps.garmentImage,
    });
    return await deps.store.markReady(lookId, garmentId, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Try-on failed";
    return await deps.store.markFailed(lookId, garmentId, message);
  }
}
