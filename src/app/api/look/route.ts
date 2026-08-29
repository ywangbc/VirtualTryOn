import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { LookMedia } from "@/look/look";
import { LOOK_COOKIE, lookIdFromCookie } from "@/look/look-session";
import { lookStore } from "@/look/server-store";

async function mediaFromFile(file: File): Promise<LookMedia> {
  return {
    mimeType: file.type,
    bytes: new Uint8Array(await file.arrayBuffer()),
  };
}

export async function GET() {
  const jar = await cookies();
  const id = lookIdFromCookie(jar.get(LOOK_COOKIE)?.value);
  if (!id) {
    return NextResponse.json(null, { status: 404 });
  }
  const look = await lookStore.get(id);
  if (!look) {
    const response = NextResponse.json(null, { status: 404 });
    response.cookies.delete(LOOK_COOKIE);
    return response;
  }
  return NextResponse.json(look);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const photo = form.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Photo is required" }, { status: 400 });
  }
  const video = form.get("video");
  try {
    const look = await lookStore.create({
      photo: await mediaFromFile(photo),
      video:
        video instanceof File && video.size > 0
          ? await mediaFromFile(video)
          : undefined,
    });
    const response = NextResponse.json(look);
    response.cookies.set(LOOK_COOKIE, look.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid look";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
