import { tryOnStore } from "@/tryon/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lookId = url.searchParams.get("look");
  const garmentId = url.searchParams.get("garment");
  if (!lookId || !garmentId) {
    return new Response(null, { status: 400 });
  }
  const result = await tryOnStore.getResult(lookId, garmentId);
  if (!result) {
    return new Response(null, { status: 404 });
  }
  return new Response(Buffer.from(result.bytes), {
    headers: {
      "Content-Type": result.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
