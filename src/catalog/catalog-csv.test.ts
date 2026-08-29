import { describe, expect, it } from "vitest";
import { parseGarmentsCsv, parseShopsCsv } from "./catalog-csv";

const shopsCsv = `id,name
atlas,Atlas Studio
northline,Northline Collective
`;

const garmentsCsv = `shop_id,sku,brand,name,price_cents,currency,sizes,description,product_image_url,video_url,poster_url
atlas,ATL-COAT,Atlas Studio,Boxy Wool Overcoat,24800,USD,S|M|L,"A structured wool overcoat, long line.",/clips/atlas-overcoat.jpg,/clips/atlas-overcoat.mp4,/clips/atlas-overcoat.jpg
`;

describe("parseShopsCsv", () => {
  it("parses shops", () => {
    expect(parseShopsCsv(shopsCsv)).toEqual([
      { id: "atlas", name: "Atlas Studio" },
      { id: "northline", name: "Northline Collective" },
    ]);
  });

  it("rejects an empty shop id", () => {
    expect(() => parseShopsCsv("id,name\n,Atlas\n")).toThrow("Shop id is empty");
  });
});

describe("parseGarmentsCsv", () => {
  it("parses garments with derived ids and sizes", () => {
    expect(parseGarmentsCsv(garmentsCsv)).toEqual([
      {
        id: "atlas:ATL-COAT",
        shopId: "atlas",
        sku: "ATL-COAT",
        brand: "Atlas Studio",
        name: "Boxy Wool Overcoat",
        price: { amountCents: 24800, currency: "USD" },
        sizes: ["S", "M", "L"],
        description: "A structured wool overcoat, long line.",
        productImageUrl: "/clips/atlas-overcoat.jpg",
        videoUrl: "/clips/atlas-overcoat.mp4",
        posterUrl: "/clips/atlas-overcoat.jpg",
      },
    ]);
  });

  it("rejects a missing sku", () => {
    expect(() =>
      parseGarmentsCsv(
        `shop_id,sku,brand,name,price_cents,currency,sizes,description,product_image_url,video_url,poster_url
atlas,,Atlas Studio,Coat,100,USD,M,Desc,/a.jpg,/a.mp4,/a.jpg
`,
      ),
    ).toThrow("Garment sku is empty");
  });
});
