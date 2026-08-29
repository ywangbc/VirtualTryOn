import { NextResponse } from "next/server";
import { importCatalogCsv } from "@/catalog/load-catalog";

export async function POST(request: Request) {
  const form = await request.formData();
  const shops = form.get("shops");
  const garments = form.get("garments");
  if (!(shops instanceof File) || !(garments instanceof File)) {
    return NextResponse.json({ error: "shops and garments CSV files are required" }, { status: 400 });
  }
  try {
    const catalog = await importCatalogCsv(await shops.text(), await garments.text());
    return NextResponse.json({
      shopCount: catalog.shops().length,
      garmentCount: catalog.list().length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid catalog";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
