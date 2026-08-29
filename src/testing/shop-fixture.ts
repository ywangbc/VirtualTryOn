import type { Shop } from "@/domain/shop";

export function shopFixture(overrides: Partial<Shop> = {}): Shop {
  return {
    id: "atlas",
    name: "Atlas Studio",
    ...overrides,
  };
}
