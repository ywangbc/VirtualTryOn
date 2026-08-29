import path from "node:path";
import { createFsLookStore } from "./look-store";

export const lookStore = createFsLookStore(path.join(process.cwd(), "data", "looks"));
