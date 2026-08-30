import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { createFsTryOnStore, createMemoryTryOnStore } from "./tryon-store";

const photo = { mimeType: "image/png", bytes: png1x1 };

describe("createMemoryTryOnStore", () => {
  it("starts unknown jobs as missing", async () => {
    const store = createMemoryTryOnStore();
    expect(await store.get("look-1", "g1")).toBeUndefined();
  });

  it("records a queued job then a ready still", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    expect(await store.get("look-1", "g1")).toEqual({
      lookId: "look-1",
      garmentId: "g1",
      status: "queued",
    });
    await store.markReady("look-1", "g1", photo);
    expect(await store.get("look-1", "g1")).toEqual({
      lookId: "look-1",
      garmentId: "g1",
      status: "ready",
      resultUrl: "/api/tryon/result?look=look-1&garment=g1",
    });
    await expect(store.getResult("look-1", "g1")).resolves.toEqual(photo);
  });

  it("lists jobs for a look", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    await store.markQueued("look-2", "g2");
    await expect(store.list("look-1")).resolves.toEqual([
      { lookId: "look-1", garmentId: "g1", status: "queued" },
    ]);
  });

  it("records a failure", async () => {
    const store = createMemoryTryOnStore();
    await store.markQueued("look-1", "g1");
    await store.markFailed("look-1", "g1", "FAL_KEY is not set");
    expect(await store.get("look-1", "g1")).toEqual({
      lookId: "look-1",
      garmentId: "g1",
      status: "failed",
      error: "FAL_KEY is not set",
    });
  });
});

describe("createFsTryOnStore", () => {
  it("persists a still when the garment id contains a colon", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "vto-tryon-"));
    try {
      const store = createFsTryOnStore(root);
      await store.markQueued("look-1", "atlas:ATL-COAT-01");
      await store.markReady("look-1", "atlas:ATL-COAT-01", photo);
      await expect(store.get("look-1", "atlas:ATL-COAT-01")).resolves.toEqual({
        lookId: "look-1",
        garmentId: "atlas:ATL-COAT-01",
        status: "ready",
        resultUrl: "/api/tryon/result?look=look-1&garment=atlas%3AATL-COAT-01",
      });
      await expect(store.getResult("look-1", "atlas:ATL-COAT-01")).resolves.toEqual(photo);
      await expect(store.list("look-1")).resolves.toEqual([
        {
          lookId: "look-1",
          garmentId: "atlas:ATL-COAT-01",
          status: "ready",
          resultUrl: "/api/tryon/result?look=look-1&garment=atlas%3AATL-COAT-01",
        },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
