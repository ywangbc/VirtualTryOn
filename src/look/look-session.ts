export const LOOK_COOKIE = "vto_look";

export function lookIdFromCookie(value: string | undefined): string | undefined {
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  return value;
}
