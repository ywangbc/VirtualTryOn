import type { Money } from "./money";

export type Garment = {
  id: string;
  shopId: string;
  sku: string;
  brand: string;
  name: string;
  price: Money;
  sizes: readonly string[];
  description: string;
  productImageUrl: string;
  videoUrl: string;
  posterUrl: string;
};
