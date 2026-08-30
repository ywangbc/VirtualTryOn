import type { LookBlob } from "@/look/look-store";
import { tryOnPairHash, type StillCache } from "./still-cache";
import type { TryOnJob } from "./tryon";
import type { TryOnProvider } from "./tryon-provider";
import type { TryOnStore } from "./tryon-store";

type TryOnDeps = {
  store: TryOnStore;
  stills: StillCache;
  provider: TryOnProvider;
  person: LookBlob;
  garmentImage: LookBlob;
};

export async function beginTryOn(
  deps: {
    store: TryOnStore;
    stills: StillCache;
    person: LookBlob;
    garmentImage: LookBlob;
  },
  lookId: string,
  garmentId: string,
): Promise<{ job: TryOnJob; started: boolean }> {
  const existing = await deps.store.get(lookId, garmentId);
  if (existing?.status === "ready" || existing?.status === "queued") {
    return { job: existing, started: false };
  }
  const cached = await deps.stills.get(tryOnPairHash(deps.person, deps.garmentImage));
  if (cached) {
    return { job: await deps.store.markReady(lookId, garmentId, cached), started: false };
  }
  return { job: await deps.store.markQueued(lookId, garmentId), started: true };
}

export async function runTryOn(
  deps: TryOnDeps,
  lookId: string,
  garmentId: string,
): Promise<TryOnJob> {
  const existing = await deps.store.get(lookId, garmentId);
  if (existing?.status === "ready") {
    return existing;
  }
  const pairHash = tryOnPairHash(deps.person, deps.garmentImage);
  const cached = await deps.stills.get(pairHash);
  if (cached) {
    return await deps.store.markReady(lookId, garmentId, cached);
  }
  if (existing?.status !== "queued") {
    await deps.store.markQueued(lookId, garmentId);
  }
  try {
    const result = await deps.stills.remember(pairHash, () =>
      deps.provider.generate({
        person: deps.person,
        garment: deps.garmentImage,
      }),
    );
    return await deps.store.markReady(lookId, garmentId, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Try-on failed";
    return await deps.store.markFailed(lookId, garmentId, message);
  }
}
