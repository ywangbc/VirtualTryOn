import { formatMoney } from "@/domain/money";
import type { Garment } from "@/domain/garment";
import type { Shop } from "@/domain/shop";
import { pressableClassName } from "@/ui/pressable";

type ProductSheetProps = {
  garment: Garment;
  shop: Shop;
  onClose: () => void;
};

export function ProductSheet({ garment, shop, onClose }: ProductSheetProps) {
  return (
    <div className="fixed inset-0 z-20">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-zinc-950 px-5 pb-8 pt-5 text-white shadow-[0_-12px_40px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium tracking-wide text-zinc-400">{shop.name}</p>
          <button
            type="button"
            className={`${pressableClassName} px-4 py-2`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <h2 id="product-title" className="mt-1 text-2xl font-semibold">
          {garment.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          {garment.brand} · {garment.sku}
        </p>
        <p className="mt-2 text-lg text-zinc-100">{formatMoney(garment.price)}</p>
        <p className="mt-2 text-sm text-zinc-300">Sizes {garment.sizes.join(" · ")}</p>
        <img
          src={garment.productImageUrl}
          alt=""
          className="mt-4 h-28 w-20 rounded-lg object-cover"
        />
        <p className="mt-3 text-base leading-6 text-zinc-300">{garment.description}</p>
      </div>
    </div>
  );
}
