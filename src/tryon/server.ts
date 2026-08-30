import path from "node:path";
import { createFsStillCache } from "./still-cache";
import { createFsTryOnStore } from "./tryon-store";

export const tryOnStore = createFsTryOnStore(
  path.join(process.cwd(), "data", "tryon"),
);

export const tryOnStills = createFsStillCache(
  path.join(process.cwd(), "data", "tryon-stills"),
);

