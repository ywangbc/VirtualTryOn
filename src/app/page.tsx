import { cookies } from "next/headers";
import { createCatalog } from "@/catalog/catalog";
import { mockGarments } from "@/catalog/mock-garments";
import { Feed } from "@/feed/Feed";
import { LookChrome } from "@/look/LookChrome";
import { LOOK_COOKIE, lookIdFromCookie } from "@/look/look-session";
import { lookStore } from "@/look/server-store";

const catalog = createCatalog(mockGarments);

export default async function Home() {
  const jar = await cookies();
  const id = lookIdFromCookie(jar.get(LOOK_COOKIE)?.value);
  const look = id ? ((await lookStore.get(id)) ?? null) : null;

  return (
    <>
      <Feed garments={catalog.list()} look={look} />
      <LookChrome look={look} />
    </>
  );
}
