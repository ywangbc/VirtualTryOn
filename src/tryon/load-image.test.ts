import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { loadImage } from "./load-image";

describe("loadImage", () => {
  it("reads a file under the public root", async () => {
    const publicRoot = await mkdtemp(path.join(os.tmpdir(), "vto-public-"));
    try {
      await mkdir(path.join(publicRoot, "clips"), { recursive: true });
      await writeFile(path.join(publicRoot, "clips", "coat.png"), png1x1);
      await expect(loadImage("/clips/coat.png", { publicRoot })).resolves.toEqual({
        mimeType: "image/png",
        bytes: png1x1,
      });
    } finally {
      await rm(publicRoot, { recursive: true, force: true });
    }
  });

  it("rejects a path outside the public root", async () => {
    const publicRoot = await mkdtemp(path.join(os.tmpdir(), "vto-public-"));
    try {
      await expect(loadImage("/../secret.png", { publicRoot })).rejects.toThrow(
        "Image path is outside public",
      );
    } finally {
      await rm(publicRoot, { recursive: true, force: true });
    }
  });

  it("fetches a remote image", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: { get: () => "image/jpeg" },
      arrayBuffer: async () => Uint8Array.from(png1x1).buffer,
    }));
    await expect(
      loadImage("https://cdn.example/coat.jpg", {
        publicRoot: os.tmpdir(),
        fetch: fetchMock as unknown as typeof fetch,
      }),
    ).resolves.toEqual({ mimeType: "image/jpeg", bytes: png1x1 });
  });
});
