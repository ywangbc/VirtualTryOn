import { fal } from "@fal-ai/client";
import type { LookBlob } from "@/look/look-store";
import type { TryOnProvider } from "./tryon-provider";

export const FAL_TRYON_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";

function toFile(blob: LookBlob, name: string): File {
  return new File([new Uint8Array(blob.bytes)], name, { type: blob.mimeType });
}

function fileName(kind: string, mimeType: string): string {
  if (mimeType === "image/png") {
    return `${kind}.png`;
  }
  if (mimeType === "image/webp") {
    return `${kind}.webp`;
  }
  return `${kind}.jpg`;
}

export function createFalProvider(credentials: string | undefined): TryOnProvider {
  if (!credentials) {
    return {
      async generate() {
        throw new Error("FAL_KEY is not set");
      },
    };
  }

  return {
    async generate(input) {
      fal.config({ credentials });
      const human_image_url = await fal.storage.upload(
        toFile(input.person, fileName("person", input.person.mimeType)),
      );
      const garment_image_url = await fal.storage.upload(
        toFile(input.garment, fileName("garment", input.garment.mimeType)),
      );
      const result = await fal.subscribe(FAL_TRYON_MODEL, {
        input: {
          human_image_url,
          garment_image_url,
        },
      });
      const image = (result.data as { image?: { url?: string; content_type?: string } })
        .image;
      if (!image?.url) {
        throw new Error("Try-on returned no image");
      }
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error("Could not download try-on image");
      }
      return {
        mimeType:
          image.content_type ?? response.headers.get("content-type") ?? "image/png",
        bytes: new Uint8Array(await response.arrayBuffer()),
      };
    },
  };
}
