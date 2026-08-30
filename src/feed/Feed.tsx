"use client";

import { useEffect, useRef, useState } from "react";
import type { Garment } from "@/domain/garment";
import type { Look } from "@/look/look";
import type { Shop } from "@/domain/shop";
import type { TryOnJob } from "@/tryon/tryon";
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
  tryOnJobs?: readonly TryOnJob[];
};

export function Feed({ garments, shops, look, tryOnJobs = [] }: FeedProps) {
  const [state, setState] = useState(() => createFeedState(garments.length));
  const [jobs, setJobs] = useState(() =>
    Object.fromEntries(tryOnJobs.map((job) => [job.garmentId, job])),
  );
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lookId = look?.id;

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

  useEffect(() => {
    if (!lookId || state.activeIndex === null) {
      return;
    }
    const garment = garments[state.activeIndex];
    if (!garment) {
      return;
    }
    const existing = jobsRef.current[garment.id];
    if (existing?.status === "ready" || existing?.status === "failed") {
      return;
    }
    const signal = { cancelled: false };
    void syncTryOn(lookId, garment.id, signal, setJobs);
    return () => {
      signal.cancelled = true;
    };
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
                    void syncTryOn(look.id, garment.id, { cancelled: false }, setJobs);
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
  signal: { cancelled: boolean },
  setJobs: (update: (current: Record<string, TryOnJob>) => Record<string, TryOnJob>) => void,
): Promise<void> {
  const post = await fetch("/api/tryon", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ garmentId }),
  });
  if (signal.cancelled) {
    return;
  }
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
  while (!signal.cancelled && job.status === "queued") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (signal.cancelled) {
      return;
    }
    const get = await fetch(`/api/tryon?garment=${encodeURIComponent(garmentId)}`);
    if (!get.ok) {
      return;
    }
    job = (await get.json()) as TryOnJob;
    setJobs((current) => ({ ...current, [garmentId]: job }));
  }
}
