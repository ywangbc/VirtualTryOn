import type { LookBlob } from "@/look/look-store";

export type TryOnProvider = {
  generate(input: { person: LookBlob; garment: LookBlob }): Promise<LookBlob>;
};
