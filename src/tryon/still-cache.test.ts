import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import {
  createFsStillCache,
  createMemoryStillCache,
  tryOnPairHash,
} from "./still-cache";

const person = { mimeType: "image/png", bytes: png1x1 };
const garment = { mimeType: "image/jpeg", bytes: png1x1 };
const otherGarment = {
  mimeType: "image/jpeg",
  bytes: Uint8Array.from(png1x1, (byte, index) => (index === 0 ? byte ^ 1 : byte)),
};

describe("tryOnPairHash", () => {
  it("is stable for the same person, garment id, and image", () => {
    expect(tryOnPairHash(person, "g1", garment)).toBe(
      tryOnPairHash(person, "g1", garment),
    );
  });

  it("changes when the garment id changes even if the image is the same", () => {
    expect(tryOnPairHash(person, "g1", garment)).not.toBe(
      tryOnPairHash(person, "g2", garment),
    );
  });

  it("changes when the garment image changes", () => {
    expect(tryOnPairHash(person, "g1", garment)).not.toBe(
      tryOnPairHash(person, "g1", otherGarment),
    );
  });
});

describe("createMemoryStillCache", () => {
  it("returns a stored still for the same pair", async () => {
    const stills = createMemoryStillCache();
    const still = { mimeType: "image/png", bytes: png1x1 };
    await stills.put(tryOnPairHash(person, "g1", garment), still);
    await expect(stills.get(tryOnPairHash(person, "g1", garment))).resolves.toEqual(
      still,
    );
    await expect(stills.get(tryOnPairHash(person, "g2", garment))).resolves.toBeUndefined();
  });

  it("runs produce once for concurrent remember calls", async () => {
    const stills = createMemoryStillCache();
    const still = { mimeType: "image/png", bytes: png1x1 };
    let calls = 0;
    const hash = tryOnPairHash(person, "g1", garment);
    const produce = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return still;
    };
    const [first, second] = await Promise.all([
      stills.remember(hash, produce),
      stills.remember(hash, produce),
    ]);
    expect(first).toEqual(still);
    expect(second).toEqual(still);
    expect(calls).toBe(1);
  });
});

describe("createFsStillCache", () => {
  it("persists a still across store instances", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "vto-stills-"));
    try {
      const still = { mimeType: "image/png", bytes: png1x1 };
      const hash = tryOnPairHash(person, "g1", garment);
      await createFsStillCache(root).put(hash, still);
      await expect(createFsStillCache(root).get(hash)).resolves.toEqual(still);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
