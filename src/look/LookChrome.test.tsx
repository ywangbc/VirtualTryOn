import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LookChrome } from "./LookChrome";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("LookChrome", () => {
  it("asks for a look when none is saved", () => {
    render(<LookChrome look={null} />);
    expect(screen.getByRole("button", { name: "Add your look" })).toBeTruthy();
  });

  it("shows the saved look", () => {
    render(
      <LookChrome
        look={{
          id: "look-1",
          photoUrl: "/api/looks/look-1/photo",
          videoUrl: null,
        }}
      />,
    );
    expect(screen.getByRole("img", { name: "Your look" })).toBeTruthy();
    expect(screen.getByText("You")).toBeTruthy();
  });

  it("opens capture from the add control", async () => {
    const user = userEvent.setup();
    render(<LookChrome look={null} />);
    await user.click(screen.getByRole("button", { name: "Add your look" }));
    expect(screen.getByRole("dialog", { name: "Your look" })).toBeTruthy();
    expect(screen.getByLabelText("Full-body photo")).toBeTruthy();
    expect(screen.getByText("Choose photo")).toBeTruthy();
    expect(screen.getByText("Choose video")).toBeTruthy();
  });
});
