"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { pressableClassName } from "@/ui/pressable";
import type { Look } from "./look";
import { FilePick } from "./FilePick";

type LookChromeProps = {
  look: Look | null;
};

export function LookChrome({ look }: LookChromeProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(form: HTMLFormElement) {
    setSaving(true);
    setError(null);
    const response = await fetch("/api/look", {
      method: "POST",
      body: new FormData(form),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      setError(body.error ?? "Could not save your look");
      setSaving(false);
      return;
    }
    setOpen(false);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 p-4">
      <button
        type="button"
        className={`${pressableClassName} pointer-events-auto flex items-center gap-3 py-1 pr-4 pl-1`}
        onClick={() => setOpen(true)}
        aria-label={look ? "Change your look" : "Add your look"}
      >
        {look ? (
          <img
            src={look.photoUrl}
            alt="Your look"
            className="h-11 w-11 rounded-full object-cover ring-2 ring-black/10"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg text-white">
            +
          </span>
        )}
        <span className="pr-1">
          <span className="block text-sm font-semibold leading-5">
            {look ? "You" : "Add your look"}
          </span>
          <span className="block text-xs font-medium text-zinc-600">
            {look ? "Tap to change" : "Tap to add a photo"}
          </span>
        </span>
      </button>
      {open ? (
        <div className="pointer-events-auto fixed inset-0 z-20">
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <form
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-zinc-950 px-5 pb-8 pt-5 text-white"
            onSubmit={(event) => {
              event.preventDefault();
              void save(event.currentTarget);
            }}
          >
            <div role="dialog" aria-modal="true" aria-labelledby="look-title">
              <div className="flex items-start justify-between gap-4">
                <h2 id="look-title" className="text-2xl font-semibold">
                  Your look
                </h2>
                <button
                  type="button"
                  className={`${pressableClassName} px-4 py-2`}
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                A full-body photo. Optional short video of you moving.
              </p>
              <FilePick
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                label="Full-body photo"
                buttonLabel="Choose photo"
                required
              />
              <FilePick
                name="video"
                accept="video/mp4,video/webm"
                label="Short video (optional)"
                buttonLabel="Choose video"
              />
              {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
              <button
                type="submit"
                disabled={saving}
                className={`${pressableClassName} mt-6 px-5 py-2.5 disabled:opacity-50`}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
