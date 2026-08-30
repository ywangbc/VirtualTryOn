import { describe, expect, it, vi } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { createMemoryStillCache, tryOnPairHash } from "./still-cache";
import { beginTryOn, runTryOn } from "./run-tryon";
import { createMemoryTryOnStore } from "./tryon-store";

const person = { mimeType: "image/png", bytes: png1x1 };
const garment = { mimeType: "image/jpeg", bytes: png1x1 };
const still = { mimeType: "image/png", bytes: png1x1 };

describe("runTryOn", () => {
  it("returns an existing ready job without calling the provider", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    await store.markReady("look-1", "g1", still);
    const generate = vi.fn();
    const job = await runTryOn(
      {
        store,
        stills: createMemoryStillCache(),
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    expect(job.status).toBe("ready");
    expect(generate).not.toHaveBeenCalled();
  });

  it("reuses a cached still for the same person and garment id", async () => {
    const stills = createMemoryStillCache();
    await stills.put(tryOnPairHash(person, "g1", garment), still);
    const generate = vi.fn();
    const store = createMemoryTryOnStore();
    const job = await runTryOn(
      {
        store,
        stills,
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-2",
      "g1",
    );
    expect(job).toEqual({
      lookId: "look-2",
      garmentId: "g1",
      status: "ready",
      resultUrl: "/api/tryon/result?look=look-2&garment=g1",
    });
    expect(generate).not.toHaveBeenCalled();
    await expect(store.getResult("look-2", "g1")).resolves.toEqual(still);
  });

  it("generates again for a different garment id with the same product image", async () => {
    const stills = createMemoryStillCache();
    const generate = vi.fn(async () => still);
    await runTryOn(
      {
        store: createMemoryTryOnStore(),
        stills,
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    await runTryOn(
      {
        store: createMemoryTryOnStore(),
        stills,
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g2",
    );
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("stores a generated still so a later pair skips the provider", async () => {
    const stills = createMemoryStillCache();
    const generate = vi.fn(async () => still);
    const first = await runTryOn(
      {
        store: createMemoryTryOnStore(),
        stills,
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    expect(first.status).toBe("ready");
    const second = await runTryOn(
      {
        store: createMemoryTryOnStore(),
        stills,
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-2",
      "g1",
    );
    expect(second.status).toBe("ready");
    expect(generate).toHaveBeenCalledOnce();
  });

  it("generates a still and marks the job ready", async () => {
    const job = await runTryOn(
      {
        store: createMemoryTryOnStore(),
        stills: createMemoryStillCache(),
        provider: {
          generate: async () => still,
        },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    expect(job).toEqual({
      lookId: "look-1",
      garmentId: "g1",
      status: "ready",
      resultUrl: "/api/tryon/result?look=look-1&garment=g1",
    });
  });

  it("generates when the job is already queued", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    const generate = vi.fn(async () => still);
    const job = await runTryOn(
      {
        store,
        stills: createMemoryStillCache(),
        provider: { generate },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    expect(job.status).toBe("ready");
    expect(generate).toHaveBeenCalledOnce();
  });

  it("marks the job failed when the provider throws", async () => {
    const store = createMemoryTryOnStore();
    const job = await runTryOn(
      {
        store,
        stills: createMemoryStillCache(),
        provider: {
          generate: async () => {
            throw new Error("FAL_KEY is not set");
          },
        },
        person,
        garmentImage: garment,
      },
      "look-1",
      "g1",
    );
    expect(job).toEqual({
      lookId: "look-1",
      garmentId: "g1",
      status: "failed",
      error: "FAL_KEY is not set",
    });
  });
});

describe("beginTryOn", () => {
  it("queues a missing job when the pair is not cached", async () => {
    const store = createMemoryTryOnStore();
    await expect(
      beginTryOn(
        {
          store,
          stills: createMemoryStillCache(),
          person,
          garmentImage: garment,
        },
        "look-1",
        "g1",
      ),
    ).resolves.toEqual({
      job: { lookId: "look-1", garmentId: "g1", status: "queued" },
      started: true,
    });
  });

  it("returns a cached still without starting generate", async () => {
    const store = createMemoryTryOnStore();
    const stills = createMemoryStillCache();
    await stills.put(tryOnPairHash(person, "g1", garment), still);
    await expect(
      beginTryOn(
        { store, stills, person, garmentImage: garment },
        "look-1",
        "g1",
      ),
    ).resolves.toMatchObject({
      started: false,
      job: { status: "ready", lookId: "look-1", garmentId: "g1" },
    });
  });

  it("does not start a second generate for a queued or ready job", async () => {
    const store = createMemoryTryOnStore();
    const input = {
      store,
      stills: createMemoryStillCache(),
      person,
      garmentImage: garment,
    };
    await store.markQueued("look-1", "g1");
    await expect(beginTryOn(input, "look-1", "g1")).resolves.toMatchObject({
      started: false,
      job: { status: "queued" },
    });
    await store.markReady("look-1", "g1", person);
    await expect(beginTryOn(input, "look-1", "g1")).resolves.toMatchObject({
      started: false,
      job: { status: "ready" },
    });
  });
});
