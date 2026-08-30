import type { Garment } from "@/domain/garment";
import type { TryOnJob } from "@/tryon/tryon";
import { pressableClassName } from "@/ui/pressable";
import { ClipPlayer } from "./ClipPlayer";
import type { FeedMedia } from "./feed-media";

type FeedItemProps = {
  garment: Garment;
  media: FeedMedia;
  index: number;
  playing: boolean;
  tryOn?: TryOnJob;
  onRetry?: () => void;
  onSelect: () => void;
};

export function FeedItem({
  garment,
  media,
  index,
  playing,
  tryOn,
  onRetry,
  onSelect,
}: FeedItemProps) {
  return (
    <section
      data-feed-index={index}
      className="relative h-dvh w-full snap-start snap-always"
    >
      {media.kind === "image" ? (
        <img
          src={media.src}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <ClipPlayer
          src={media.src}
          poster={media.poster}
          playing={playing}
        />
      )}
      <button
        type="button"
        aria-label={`View ${garment.name}`}
        className="absolute inset-0"
        onClick={onSelect}
      />
      {tryOn?.status === "queued" ? (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="rounded-full bg-black/70 px-4 py-2 text-lg font-medium text-white">
            Trying on…
          </span>
        </p>
      ) : null}
      {tryOn?.status === "failed" ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="rounded-full bg-black/70 px-4 py-2 text-sm text-white">
            {tryOn.error ?? "Try-on failed"}
          </p>
          {onRetry ? (
            <button
              type="button"
              aria-label="Retry try-on"
              className={`${pressableClassName} pointer-events-auto px-4 py-2`}
              onClick={(event) => {
                event.stopPropagation();
                onRetry();
              }}
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-10 pt-24 text-white">
        <p className="text-sm font-medium text-white/80">{garment.brand}</p>
        <p className="text-xl font-semibold">{garment.name}</p>
        <p className="mt-2 text-sm text-white/70">Tap for details</p>
      </div>
    </section>
  );
}
