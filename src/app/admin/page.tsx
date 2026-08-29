import Link from "next/link";
import { CatalogImport } from "@/catalog/CatalogImport";
import { pressableClassName } from "@/ui/pressable";

export default function AdminPage() {
  return (
    <main className="min-h-dvh bg-black px-5 py-10 text-white">
      <Link href="/" className={`${pressableClassName} inline-flex px-4 py-2.5`}>
        Back to feed
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Catalog</h1>
      <p className="mt-2 max-w-xl text-zinc-300">
        Drop in shops.csv and garments.csv from a shop. The feed will use that catalog.
      </p>
      <CatalogImport />
    </main>
  );
}
