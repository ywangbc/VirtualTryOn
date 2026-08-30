import path from "node:path";
import { createFsTryOnStore } from "./tryon-store";

export const tryOnStore = createFsTryOnStore(
  path.join(process.cwd(), "data", "tryon"),
);
