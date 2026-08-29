import type { Money } from "./money";

export type Garment = {
  id: string;
  brand: string;
  name: string;
  price: Money;
  description: string;
  videoUrl: string;
  posterUrl: string;
};
