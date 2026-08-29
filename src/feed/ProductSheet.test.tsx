import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { garmentFixture } from "@/testing/garment-fixture";
import { shopFixture } from "@/testing/shop-fixture";
import { ProductSheet } from "./ProductSheet";

describe("ProductSheet", () => {
  it("shows shop, sku, sizes, price, and description", () => {
    render(
      <ProductSheet
        garment={garmentFixture()}
        shop={shopFixture()}
        onClose={() => undefined}
      />,
    );

    const dialog = screen.getByRole("dialog", { name: "Boxy Wool Overcoat" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Atlas Studio")).toBeTruthy();
    expect(screen.getByText("Atlas Studio · ATL-COAT")).toBeTruthy();
    expect(screen.getByText("$248.00")).toBeTruthy();
    expect(screen.getByText("Sizes S · M · L")).toBeTruthy();
    expect(
      screen.getByText("A structured wool overcoat with a clean shoulder."),
    ).toBeTruthy();
  });

  it("closes from the close control", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ProductSheet
        garment={garmentFixture()}
        shop={shopFixture()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
