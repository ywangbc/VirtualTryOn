import type { Garment } from "@/domain/garment";

export type Catalog = {
  list(): readonly Garment[];
  get(id: string): Garment | undefined;
};

export function createCatalog(garments: readonly Garment[]): Catalog {
  const byId = new Map<string, Garment>();
  for (const garment of garments) {
    if (garment.id.length === 0) {
      throw new Error("Garment id is empty");
    }
    if (!Number.isInteger(garment.price.amountCents) || garment.price.amountCents < 0) {
      throw new Error(`Invalid price for garment ${garment.id}`);
    }
    if (byId.has(garment.id)) {
      throw new Error(`Duplicate garment id: ${garment.id}`);
    }
    byId.set(garment.id, garment);
  }

  return {
    list: () => garments,
    get: (id) => byId.get(id),
  };
}
