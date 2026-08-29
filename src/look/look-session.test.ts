import { describe, expect, it } from "vitest";
import { LOOK_COOKIE, lookIdFromCookie } from "./look-session";

describe("look-session", () => {
  it("uses a single cookie name", () => {
    expect(LOOK_COOKIE).toBe("vto_look");
  });

  it("reads the look id from the cookie value", () => {
    expect(lookIdFromCookie("look-1")).toBe("look-1");
    expect(lookIdFromCookie(undefined)).toBeUndefined();
    expect(lookIdFromCookie("")).toBeUndefined();
  });
});
