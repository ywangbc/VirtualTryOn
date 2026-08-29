import { lookStore } from "@/look/server-store";

type PhotoContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: PhotoContext) {
  const { id } = await context.params;
  const photo = await lookStore.getPhoto(id);
  if (!photo) {
    return new Response(null, { status: 404 });
  }
  return new Response(Buffer.from(photo.bytes), {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
