import path from "node:path";
import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loadCatalog } from "@/catalog/load-catalog";
import { LOOK_COOKIE, lookIdFromCookie } from "@/look/look-session";
import { lookStore } from "@/look/server-store";
import { createFalProvider } from "@/tryon/fal-provider";
import { loadImage } from "@/tryon/load-image";
import { beginTryOn, runTryOn } from "@/tryon/run-tryon";
import { tryOnStore } from "@/tryon/server";

export const maxDuration = 120;

async function lookIdFromRequest(): Promise<string | undefined> {
  const jar = await cookies();
  return lookIdFromCookie(jar.get(LOOK_COOKIE)?.value);
}

export async function GET(request: Request) {
  const lookId = await lookIdFromRequest();
  if (!lookId) {
    return NextResponse.json({ error: "Add your look first" }, { status: 401 });
  }
  const garmentId = new URL(request.url).searchParams.get("garment");
  if (!garmentId) {
    return NextResponse.json({ jobs: await tryOnStore.list(lookId) });
  }
  const job = await tryOnStore.get(lookId, garmentId);
  if (!job) {
    return NextResponse.json(null, { status: 404 });
  }
  return NextResponse.json(job);
}

export async function POST(request: Request) {
  const lookId = await lookIdFromRequest();
  if (!lookId) {
    return NextResponse.json({ error: "Add your look first" }, { status: 401 });
  }
  const look = await lookStore.get(lookId);
  if (!look) {
    return NextResponse.json({ error: "Look not found" }, { status: 404 });
  }
  let garmentId: string;
  try {
    const body = (await request.json()) as { garmentId?: unknown };
    if (typeof body.garmentId !== "string" || body.garmentId.length === 0) {
      return NextResponse.json({ error: "garmentId is required" }, { status: 400 });
    }
    garmentId = body.garmentId;
  } catch {
    return NextResponse.json({ error: "garmentId is required" }, { status: 400 });
  }
  const catalog = await loadCatalog();
  const garment = catalog.get(garmentId);
  if (!garment) {
    return NextResponse.json({ error: "Unknown garment" }, { status: 404 });
  }
  const { job, started } = await beginTryOn(tryOnStore, lookId, garmentId);
  if (started) {
    after(async () => {
      try {
        const person = await lookStore.getPhoto(lookId);
        if (!person) {
          throw new Error("Look photo is missing");
        }
        const garmentImage = await loadImage(garment.productImageUrl, {
          publicRoot: path.join(process.cwd(), "public"),
        });
        await runTryOn(
          {
            store: tryOnStore,
            provider: createFalProvider(process.env.FAL_KEY),
            person,
            garmentImage,
          },
          lookId,
          garmentId,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Try-on failed";
        await tryOnStore.markFailed(lookId, garmentId, message);
      }
    });
  }
  return NextResponse.json(job);
}
