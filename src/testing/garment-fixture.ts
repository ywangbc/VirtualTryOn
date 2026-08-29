import type { Garment } from "@/domain/garment";

export function garmentFixture(overrides: Partial<Garment> = {}): Garment {
  return {
    id: "g1",
    brand: "Atlas Studio",
    name: "Boxy Wool Overcoat",
    price: { amountCents: 24800, currency: "USD" },
    description: "A structured wool overcoat with a clean shoulder.",
    videoUrl: "https://example.com/coat.mp4",
    posterUrl: "https://example.com/coat.jpg",
    ...overrides,
  };
}
