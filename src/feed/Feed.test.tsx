import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { shopFixture } from "@/testing/shop-fixture";
import { Feed } from "./Feed";

const look = {
  id: "look-1",
  photoUrl: "/api/looks/look-1/photo",
  videoUrl: null,
};

describe("Feed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts a try-on for the active garment and the next one", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = typeof init?.body === "string" ? JSON.parse(init.body as string) : {};
      const garmentId =
        typeof body.garmentId === "string" ? body.garmentId : "unknown";
      return {
        ok: true,
        json: async () => ({
          lookId: "look-1",
          garmentId,
          status: "ready",
          resultUrl: `/api/tryon/result?look=look-1&garment=${encodeURIComponent(garmentId)}`,
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    const coat = garmentFixture();
    const blazer = garmentFixture({
      id: "atlas:ATL-BLZ",
      sku: "ATL-BLZ",
      name: "Blazer",
    });
    render(
      <Feed
        garments={[coat, blazer]}
        shops={[shopFixture()]}
        look={look}
        tryOnJobs={[]}
      />,
    );
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    const bodies = fetchMock.mock.calls.map(([, init]) => (init as RequestInit).body);
    expect(bodies).toEqual([
      JSON.stringify({ garmentId: "atlas:ATL-COAT" }),
      JSON.stringify({ garmentId: "atlas:ATL-BLZ" }),
    ]);
  });

  it("shows each garment product photo until a still is ready", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );
    const coat = garmentFixture({ productImageUrl: "/garments/ATL-COAT-01.jpg" });
    const blazer = garmentFixture({
      id: "atlas:ATL-BLZ",
      sku: "ATL-BLZ",
      name: "Blazer",
      productImageUrl: "/garments/ATL-BLZ-02.jpg",
    });
    const { container } = render(
      <Feed
        garments={[coat, blazer]}
        shops={[shopFixture()]}
        look={look}
        tryOnJobs={[]}
      />,
    );
    const srcs = [...container.querySelectorAll("section img")].map((img) =>
      img.getAttribute("src"),
    );
    expect(srcs).toEqual([
      "/garments/ATL-COAT-01.jpg",
      "/garments/ATL-BLZ-02.jpg",
    ]);
  });

  it("does not generate without a look", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(
      <Feed
        garments={[garmentFixture()]}
        shops={[shopFixture()]}
        look={null}
        tryOnJobs={[]}
      />,
    );
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
