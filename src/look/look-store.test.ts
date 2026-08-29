import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { createFsLookStore, createMemoryLookStore } from "./look-store";

const photo = { mimeType: "image/png" as const, bytes: png1x1 };

describe("createMemoryLookStore", () => {
  it("creates a look with a derived photo url", async () => {
    const store = createMemoryLookStore({ createId: () => "look-1" });
    const look = await store.create({ photo });

    expect(look).toEqual({
      id: "look-1",
      photoUrl: "/api/looks/look-1/photo",
      videoUrl: null,
    });
  });

  it("returns a look by id", async () => {
    const store = createMemoryLookStore({ createId: () => "look-1" });
    const created = await store.create({ photo });

    expect(await store.get("look-1")).toEqual(created);
  });

  it("returns undefined for an unknown id", async () => {
    const store = createMemoryLookStore();
    expect(await store.get("missing")).toBeUndefined();
  });

  it("rejects empty photo bytes", async () => {
    const store = createMemoryLookStore();
    await expect(
      store.create({ photo: { mimeType: "image/png", bytes: new Uint8Array() } }),
    ).rejects.toThrow("Photo is empty");
  });

  it("rejects an unsupported photo type", async () => {
    const store = createMemoryLookStore();
    await expect(
      store.create({ photo: { mimeType: "image/gif", bytes: png1x1 } }),
    ).rejects.toThrow("Unsupported photo type: image/gif");
  });

  it("stores an optional video", async () => {
    const store = createMemoryLookStore({ createId: () => "look-1" });
    const look = await store.create({
      photo,
      video: { mimeType: "video/mp4", bytes: new Uint8Array([0, 1, 2]) },
    });

    expect(look.videoUrl).toBe("/api/looks/look-1/video");
    await expect(store.getVideo("look-1")).resolves.toEqual({
      mimeType: "video/mp4",
      bytes: new Uint8Array([0, 1, 2]),
    });
  });

  it("returns photo bytes", async () => {
    const store = createMemoryLookStore({ createId: () => "look-1" });
    await store.create({ photo });

    await expect(store.getPhoto("look-1")).resolves.toEqual({
      mimeType: "image/png",
      bytes: png1x1,
    });
  });
});

describe("createFsLookStore", () => {
  let root: string;

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("persists a look across store instances", async () => {
    root = await mkdtemp(path.join(tmpdir(), "looks-"));
    const first = createFsLookStore(root, { createId: () => "look-1" });
    await first.create({ photo });

    const second = createFsLookStore(root);
    expect(await second.get("look-1")).toEqual({
      id: "look-1",
      photoUrl: "/api/looks/look-1/photo",
      videoUrl: null,
    });
    await expect(second.getPhoto("look-1")).resolves.toEqual({
      mimeType: "image/png",
      bytes: png1x1,
    });
  });
});
