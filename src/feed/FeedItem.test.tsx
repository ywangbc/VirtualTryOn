import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { FeedItem } from "./FeedItem";

const garment = garmentFixture();
const media = { kind: "image" as const, src: "/api/looks/look-1/photo" };

describe("FeedItem", () => {
  it("shows a trying-on state", () => {
    render(
      <FeedItem
        garment={garment}
        media={media}
        index={0}
        playing
        onSelect={() => undefined}
        tryOn={{ lookId: "look-1", garmentId: garment.id, status: "queued" }}
      />,
    );
    expect(screen.getByText("Trying on…")).toBeTruthy();
  });

  it("shows a failed try-on and retries", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <FeedItem
        garment={garment}
        media={media}
        index={0}
        playing
        onSelect={() => undefined}
        tryOn={{
          lookId: "look-1",
          garmentId: garment.id,
          status: "failed",
          error: "FAL_KEY is not set",
        }}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("FAL_KEY is not set")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Retry try-on" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
