"use client";

import { useEffect, useRef, useState } from "react";
import type { Garment } from "@/domain/garment";
import type { Look } from "@/look/look";
import type { Shop } from "@/domain/shop";
import type { TryOnJob } from "@/tryon/tryon";
import {
  activateIndex,
  activeIndexFromScroll,
  closeProduct,
  createFeedState,
  selectedGarment,
  toggleProduct,
  tryOnTargetIds,
} from "./feed-session";
import { feedMedia } from "./feed-media";
import { FeedItem } from "./FeedItem";
import { ProductSheet } from "./ProductSheet";

type FeedProps = {
  garments: readonly Garment[];
  shops: readonly Shop[];
  look: Look | null;
  tryOnJobs?: readonly TryOnJob[];
};

export function Feed({ garments, shops, look, tryOnJobs = [] }: FeedProps) {
  const [state, setState] = useState(() => createFeedState(garments.length));
  const [jobs, setJobs] = useState(() =>
    Object.fromEntries(tryOnJobs.map((job) => [job.garmentId, job])),
  );
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const inflightRef = useRef(new Set<string>());
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lookId = look?.id;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) {
      return;
    }

    const syncActive = () => {
      const index = activeIndexFromScroll(
        root.scrollTop,
        root.clientHeight,
        garments.length,
      );
      setState((current) => {
        if (index === null || current.activeIndex === index) {
          return current;
        }
        return activateIndex(current, index, garments.length);
      });
    };

    root.addEventListener("scroll", syncActive, { passive: true });
    syncActive();
    return () => root.removeEventListener("scroll", syncActive);
  }, [garments.length]);

  useEffect(() => {
    if (!lookId) {
      return;
    }
    for (const garmentId of tryOnTargetIds(garments, state.activeIndex)) {
      const existing = jobsRef.current[garmentId];
      if (existing?.status === "ready" || existing?.status === "failed") {
        continue;
      }
      if (inflightRef.current.has(garmentId)) {
        continue;
      }
      inflightRef.current.add(garmentId);
      void syncTryOn(lookId, garmentId, setJobs).finally(() => {
        inflightRef.current.delete(garmentId);
      });
    }
  }, [lookId, state.activeIndex, garments]);

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
            media={feedMedia(look, garment, jobs[garment.id]?.resultUrl)}
            index={index}
            playing={state.activeIndex === index}
            tryOn={look ? jobs[garment.id] : undefined}
            onRetry={
              look
                ? () => {
                    void syncTryOn(look.id, garment.id, setJobs);
                  }
                : undefined
            }
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

async function syncTryOn(
  lookId: string,
  garmentId: string,
  setJobs: (update: (current: Record<string, TryOnJob>) => Record<string, TryOnJob>) => void,
): Promise<void> {
  const post = await fetch("/api/tryon", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ garmentId }),
  });
  if (!post.ok) {
    const body = (await post.json()) as { error?: string };
    setJobs((current) => ({
      ...current,
      [garmentId]: {
        lookId,
        garmentId,
        status: "failed",
        error: body.error ?? "Try-on failed",
      },
    }));
    return;
  }
  let job = (await post.json()) as TryOnJob;
  setJobs((current) => ({ ...current, [garmentId]: job }));
  while (job.status === "queued") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const get = await fetch(`/api/tryon?garment=${encodeURIComponent(garmentId)}`);
    if (!get.ok) {
      return;
    }
    job = (await get.json()) as TryOnJob;
    setJobs((current) => ({ ...current, [garmentId]: job }));
  }
}
