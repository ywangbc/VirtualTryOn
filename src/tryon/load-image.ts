import { readFile } from "node:fs/promises";
import path from "node:path";
import type { LookBlob } from "@/look/look-store";

export type LoadImageOptions = {
  publicRoot: string;
  fetch?: typeof fetch;
};

function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") {
    return "image/png";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg";
  }
  throw new Error(`Unsupported image type: ${ext}`);
}

function resolvePublicPath(url: string, publicRoot: string): string {
  const relative = url.replace(/^\/+/, "");
  const resolved = path.resolve(publicRoot, relative);
  const rel = path.relative(publicRoot, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Image path is outside public");
  }
  return resolved;
}

export async function loadImage(
  url: string,
  options: LoadImageOptions,
): Promise<LookBlob> {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const fetchImpl = options.fetch ?? fetch;
    const response = await fetchImpl(url);
    if (!response.ok) {
      throw new Error(`Could not load garment image: ${response.status}`);
    }
    const mimeType = response.headers.get("content-type") ?? mimeFromPath(url);
    return { mimeType, bytes: new Uint8Array(await response.arrayBuffer()) };
  }
  if (!url.startsWith("/")) {
    throw new Error(`Unsupported image URL: ${url}`);
  }
  const filePath = resolvePublicPath(url, options.publicRoot);
  const bytes = new Uint8Array(await readFile(filePath));
  return { mimeType: mimeFromPath(filePath), bytes };
}
