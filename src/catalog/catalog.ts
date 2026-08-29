import type { Garment } from "@/domain/garment";
import type { Shop } from "@/domain/shop";

export type Catalog = {
  list(): readonly Garment[];
  get(id: string): Garment | undefined;
  shops(): readonly Shop[];
  shop(id: string): Shop | undefined;
};

export function createCatalog(
  shops: readonly Shop[],
  garments: readonly Garment[],
): Catalog {
  const shopsById = new Map<string, Shop>();
  for (const shop of shops) {
    if (shop.id.length === 0) {
      throw new Error("Shop id is empty");
    }
    if (shopsById.has(shop.id)) {
      throw new Error(`Duplicate shop id: ${shop.id}`);
    }
    shopsById.set(shop.id, shop);
  }

  const byId = new Map<string, Garment>();
  const skuByShop = new Set<string>();
  for (const garment of garments) {
    if (garment.id.length === 0) {
      throw new Error("Garment id is empty");
    }
    if (!shopsById.has(garment.shopId)) {
      throw new Error(`Unknown shop: ${garment.shopId}`);
    }
    if (!Number.isInteger(garment.price.amountCents) || garment.price.amountCents < 0) {
      throw new Error(`Invalid price for garment ${garment.id}`);
    }
    if (byId.has(garment.id)) {
      throw new Error(`Duplicate garment id: ${garment.id}`);
    }
    const skuKey = `${garment.shopId}:${garment.sku}`;
    if (skuByShop.has(skuKey)) {
      throw new Error(`Duplicate sku ${garment.sku} in shop ${garment.shopId}`);
    }
    skuByShop.add(skuKey);
    byId.set(garment.id, garment);
  }

  return {
    list: () => garments,
    get: (id) => byId.get(id),
    shops: () => shops,
    shop: (id) => shopsById.get(id),
  };
}

export function garmentId(shopId: string, sku: string): string {
  return `${shopId}:${sku}`;
}
