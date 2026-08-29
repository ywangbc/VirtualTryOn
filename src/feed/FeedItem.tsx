import type { Garment } from "@/domain/garment";
import { ClipPlayer } from "./ClipPlayer";

type FeedItemProps = {
  garment: Garment;
  index: number;
  playing: boolean;
  onSelect: () => void;
};

export function FeedItem({ garment, index, playing, onSelect }: FeedItemProps) {
  return (
    <section
      data-feed-index={index}
      className="relative h-dvh w-full snap-start snap-always"
    >
      <ClipPlayer src={garment.videoUrl} poster={garment.posterUrl} playing={playing} />
      <button
        type="button"
        aria-label={`View ${garment.name}`}
        className="absolute inset-0"
        onClick={onSelect}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-10 pt-24 text-white">
        <p className="text-sm font-medium text-white/80">{garment.brand}</p>
        <p className="text-xl font-semibold">{garment.name}</p>
        <p className="mt-2 text-sm text-white/70">Tap for details</p>
      </div>
    </section>
  );
}
