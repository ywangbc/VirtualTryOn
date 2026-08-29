import type { Garment } from "@/domain/garment";

export type FeedState = {
  activeIndex: number | null;
  openGarmentId: string | null;
};

export function createFeedState(garmentCount: number): FeedState {
  return {
    activeIndex: garmentCount === 0 ? null : 0,
    openGarmentId: null,
  };
}

export function activateIndex(
  state: FeedState,
  index: number,
  garmentCount: number,
): FeedState {
  if (index < 0 || index >= garmentCount) {
    throw new Error(`activeIndex out of range: ${index}`);
  }
  return { activeIndex: index, openGarmentId: null };
}

export function openGarment(
  state: FeedState,
  garments: readonly Garment[],
  garmentId: string,
): FeedState {
  if (!garments.some((garment) => garment.id === garmentId)) {
    throw new Error(`Unknown garment: ${garmentId}`);
  }
  return { ...state, openGarmentId: garmentId };
}

export function closeProduct(state: FeedState): FeedState {
  return { ...state, openGarmentId: null };
}

export function toggleProduct(
  state: FeedState,
  garments: readonly Garment[],
  garmentId: string,
): FeedState {
  if (state.openGarmentId === garmentId) {
    return closeProduct(state);
  }
  return openGarment(state, garments, garmentId);
}

export function selectedGarment(
  garments: readonly Garment[],
  state: FeedState,
): Garment | undefined {
  if (state.openGarmentId === null) {
    return undefined;
  }
  return garments.find((garment) => garment.id === state.openGarmentId);
}
