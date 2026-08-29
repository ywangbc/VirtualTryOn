import { parse } from "csv-parse/sync";
import type { Currency } from "@/domain/money";
import type { Garment } from "@/domain/garment";
import type { Shop } from "@/domain/shop";
import { garmentId } from "./catalog";

type ShopRow = {
  id: string;
  name: string;
};

type GarmentRow = {
  shop_id: string;
  sku: string;
  brand: string;
  name: string;
  price_cents: string;
  currency: string;
  sizes: string;
  description: string;
  product_image_url: string;
  video_url: string;
  poster_url: string;
};

function rows<T>(csv: string): T[] {
  return parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as T[];
}

export function parseShopsCsv(csv: string): Shop[] {
  return rows<ShopRow>(csv).map((row) => {
    if (row.id.length === 0) {
      throw new Error("Shop id is empty");
    }
    if (row.name.length === 0) {
      throw new Error(`Shop name is empty: ${row.id}`);
    }
    return { id: row.id, name: row.name };
  });
}

export function parseGarmentsCsv(csv: string): Garment[] {
  return rows<GarmentRow>(csv).map((row) => {
    if (row.sku.length === 0) {
      throw new Error("Garment sku is empty");
    }
    if (row.shop_id.length === 0) {
      throw new Error(`Shop id is empty for sku ${row.sku}`);
    }
    const amountCents = Number(row.price_cents);
    if (!Number.isInteger(amountCents)) {
      throw new Error(`Invalid price_cents for sku ${row.sku}`);
    }
    if (row.currency !== "USD") {
      throw new Error(`Unsupported currency for sku ${row.sku}: ${row.currency}`);
    }
    const sizes = row.sizes.split("|").filter((size) => size.length > 0);
    if (sizes.length === 0) {
      throw new Error(`Sizes are empty for sku ${row.sku}`);
    }
    return {
      id: garmentId(row.shop_id, row.sku),
      shopId: row.shop_id,
      sku: row.sku,
      brand: row.brand,
      name: row.name,
      price: { amountCents, currency: row.currency as Currency },
      sizes,
      description: row.description,
      productImageUrl: row.product_image_url,
      videoUrl: row.video_url,
      posterUrl: row.poster_url,
    };
  });
}
