import { describe, expect, it } from "vitest";
import { png1x1 } from "@/testing/media-fixture";
import { createFalProvider, falErrorMessage } from "./fal-provider";

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

describe("falErrorMessage", () => {
  it("explains a locked Fal account", () => {
    expect(falErrorMessage({ status: 403, message: "Forbidden" })).toBe(
      "Fal account is locked. Add credits at fal.ai, then retry.",
    );
  });

  it("explains a rejected key", () => {
    expect(falErrorMessage({ status: 401, message: "Unauthorized" })).toBe(
      "FAL_KEY was rejected",
    );
  });
});
