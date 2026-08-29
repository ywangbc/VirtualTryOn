import { lookStore } from "@/look/server-store";

type VideoContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: VideoContext) {
  const { id } = await context.params;
  const video = await lookStore.getVideo(id);
  if (!video) {
    return new Response(null, { status: 404 });
  }
  return new Response(Buffer.from(video.bytes), {
    headers: {
      "Content-Type": video.mimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
