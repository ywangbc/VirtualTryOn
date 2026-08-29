import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createCatalog, type Catalog } from "./catalog";
import { parseGarmentsCsv, parseShopsCsv } from "./catalog-csv";

const seedDir = path.join(process.cwd(), "src", "catalog", "seed");
const overrideDir = path.join(process.cwd(), "data", "catalog");

function catalogDir(): string {
  return existsSync(path.join(overrideDir, "garments.csv")) ? overrideDir : seedDir;
}

export async function loadCatalog(): Promise<Catalog> {
  const dir = catalogDir();
  const shops = parseShopsCsv(await readFile(path.join(dir, "shops.csv"), "utf8"));
  const garments = parseGarmentsCsv(await readFile(path.join(dir, "garments.csv"), "utf8"));
  return createCatalog(shops, garments);
}

export async function importCatalogCsv(shopsCsv: string, garmentsCsv: string): Promise<Catalog> {
  const catalog = createCatalog(parseShopsCsv(shopsCsv), parseGarmentsCsv(garmentsCsv));
  await mkdir(overrideDir, { recursive: true });
  await writeFile(path.join(overrideDir, "shops.csv"), shopsCsv);
  await writeFile(path.join(overrideDir, "garments.csv"), garmentsCsv);
  return catalog;
}
