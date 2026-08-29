"use client";

import { useEffect, useRef, useState } from "react";
import type { Garment } from "@/domain/garment";
import type { Look } from "@/look/look";
import type { Shop } from "@/domain/shop";
import {
  activateIndex,
  closeProduct,
  createFeedState,
  selectedGarment,
  toggleProduct,
} from "./feed-session";
import { feedMedia } from "./feed-media";
import { FeedItem } from "./FeedItem";
import { ProductSheet } from "./ProductSheet";

type FeedProps = {
  garments: readonly Garment[];
  shops: readonly Shop[];
  look: Look | null;
};

export function Feed({ garments, shops, look }: FeedProps) {
  const [state, setState] = useState(() => createFeedState(garments.length));
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) {
          return;
        }
        const index = Number((visible.target as HTMLElement).dataset.feedIndex);
        setState((current) => {
          if (current.activeIndex === index) {
            return current;
          }
          return activateIndex(current, index, garments.length);
        });
      },
      { root, threshold: 0.6 },
    );

    for (const node of root.querySelectorAll("[data-feed-index]")) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [garments]);

  const open = selectedGarment(garments, state);
  const openShop = open
    ? shops.find((shop) => shop.id === open.shopId)
    : undefined;
  if (open && !openShop) {
    throw new Error(`Unknown shop: ${open.shopId}`);
  }

  if (garments.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-black text-white">
        No garments yet
      </div>
    );
  }

  return (
    <div className="relative h-dvh bg-black">
      <div
        ref={scrollerRef}
        className="h-dvh overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {garments.map((garment, index) => (
          <FeedItem
            key={garment.id}
            garment={garment}
            media={feedMedia(look, garment)}
            index={index}
            playing={state.activeIndex === index}
            onSelect={() =>
              setState((current) => toggleProduct(current, garments, garment.id))
            }
          />
        ))}
      </div>
      {open && openShop ? (
        <ProductSheet
          garment={open}
          shop={openShop}
          onClose={() => setState((current) => closeProduct(current))}
        />
      ) : null}
    </div>
  );
}
