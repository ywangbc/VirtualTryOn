import { describe, expect, it, vi } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { beginTryOn, runTryOn } from "./run-tryon";
import { createMemoryTryOnStore } from "./tryon-store";

const person = { mimeType: "image/png", bytes: png1x1 };
const garment = { mimeType: "image/jpeg", bytes: png1x1 };

describe("runTryOn", () => {
  it("returns an existing ready job without calling the provider", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    await store.markReady("look-1", "g1", person);
    const generate = vi.fn();
    const job = await runTryOn(
      { store, provider: { generate }, person, garmentImage: garment },
      "look-1",
      "g1",
    );
    expect(job.status).toBe("ready");
    expect(generate).not.toHaveBeenCalled();
  });

  it("generates a still and marks the job ready", async () => {
    const store = createMemoryTryOnStore();
    const job = await runTryOn(
      {
        store,
        provider: {
          generate: async () => ({ mimeType: "image/png", bytes: png1x1 }),
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
    const generate = vi.fn(async () => ({ mimeType: "image/png", bytes: png1x1 }));
    const job = await runTryOn(
      { store, provider: { generate }, person, garmentImage: garment },
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
  it("queues a missing job", async () => {
    const store = createMemoryTryOnStore();
    await expect(beginTryOn(store, "look-1", "g1")).resolves.toEqual({
      job: { lookId: "look-1", garmentId: "g1", status: "queued" },
      started: true,
    });
  });

  it("does not start a second generate for a queued or ready job", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    await expect(beginTryOn(store, "look-1", "g1")).resolves.toMatchObject({
      started: false,
      job: { status: "queued" },
    });
    await store.markReady("look-1", "g1", person);
    await expect(beginTryOn(store, "look-1", "g1")).resolves.toMatchObject({
      started: false,
      job: { status: "ready" },
    });
  });
});
