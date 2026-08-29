import { cookies } from "next/headers";
import Link from "next/link";
import { loadCatalog } from "@/catalog/load-catalog";
import { Feed } from "@/feed/Feed";
import { LookChrome } from "@/look/LookChrome";
import { LOOK_COOKIE, lookIdFromCookie } from "@/look/look-session";
import { lookStore } from "@/look/server-store";
import { pressableClassName } from "@/ui/pressable";

export default async function Home() {
  const catalog = await loadCatalog();
  const jar = await cookies();
  const id = lookIdFromCookie(jar.get(LOOK_COOKIE)?.value);
  const look = id ? ((await lookStore.get(id)) ?? null) : null;

  return (
    <>
      <Feed garments={catalog.list()} shops={catalog.shops()} look={look} />
      <LookChrome look={look} />
      <div className="pointer-events-none fixed top-0 right-0 z-10 p-4">
        <Link
          href="/admin"
          className={`${pressableClassName} pointer-events-auto inline-flex px-4 py-2.5`}
        >
          Catalog
        </Link>
      </div>
    </>
  );
}
