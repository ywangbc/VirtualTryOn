import { describe, expect, it } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { createFalProvider } from "./fal-provider";

describe("createFalProvider", () => {
  it("fails when FAL_KEY is missing", async () => {
    const provider = createFalProvider(undefined);
    await expect(
      provider.generate({
        person: { mimeType: "image/png", bytes: png1x1 },
        garment: { mimeType: "image/png", bytes: png1x1 },
      }),
    ).rejects.toThrow("FAL_KEY is not set");
  });
});
