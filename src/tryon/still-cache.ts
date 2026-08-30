import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LookBlob } from "@/look/look-store";

export type StillCache = {
  get(pairHash: string): Promise<LookBlob | undefined>;
  put(pairHash: string, still: LookBlob): Promise<void>;
  remember(pairHash: string, produce: () => Promise<LookBlob>): Promise<LookBlob>;
};

export function tryOnPairHash(person: LookBlob, garment: LookBlob): string {
  const hash = createHash("sha256");
  hash.update(person.mimeType);
  hash.update(person.bytes);
  hash.update(new Uint8Array([0]));
  hash.update(garment.mimeType);
  hash.update(garment.bytes);
  return hash.digest("hex");
}

function withRemember(
  get: StillCache["get"],
  put: StillCache["put"],
): StillCache["remember"] {
  const inflight = new Map<string, Promise<LookBlob>>();
  return async (pairHash, produce) => {
    const pending = inflight.get(pairHash);
    if (pending) {
      return pending;
    }
    const work = (async () => {
      const hit = await get(pairHash);
      if (hit) {
        return hit;
      }
      const still = await produce();
      await put(pairHash, still);
      return still;
    })().finally(() => {
      inflight.delete(pairHash);
    });
    inflight.set(pairHash, work);
    return work;
  };
}

export function createMemoryStillCache(): StillCache {
  const stills = new Map<string, LookBlob>();
  async function get(pairHash: string) {
    return stills.get(pairHash);
  }
  async function put(pairHash: string, still: LookBlob) {
    stills.set(pairHash, still);
  }
  return { get, put, remember: withRemember(get, put) };
}

export function createFsStillCache(root: string): StillCache {
  function dir(pairHash: string): string {
    return path.join(root, pairHash);
  }

  async function get(pairHash: string) {
    try {
      const record = JSON.parse(
        await readFile(path.join(dir(pairHash), "meta.json"), "utf8"),
      ) as { mimeType: string };
      const bytes = new Uint8Array(await readFile(path.join(dir(pairHash), "result")));
      return { mimeType: record.mimeType, bytes };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return undefined;
      }
      throw error;
    }
  }

  async function put(pairHash: string, still: LookBlob) {
    const target = dir(pairHash);
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, "meta.json"), JSON.stringify({ mimeType: still.mimeType }));
    await writeFile(path.join(target, "result"), still.bytes);
  }

  return { get, put, remember: withRemember(get, put) };
}
