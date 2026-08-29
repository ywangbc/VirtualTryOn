"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FilePick } from "@/look/FilePick";
import { pressableClassName } from "@/ui/pressable";

export function CatalogImport() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="mt-8 max-w-lg"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        setSaving(true);
        setError(null);
        void fetch("/api/catalog/import", {
          method: "POST",
          body: new FormData(form),
        }).then(async (response) => {
          if (!response.ok) {
            const body = (await response.json()) as { error?: string };
            setError(body.error ?? "Could not import catalog");
            setSaving(false);
            return;
          }
          setSaving(false);
          router.push("/");
          router.refresh();
        });
      }}
    >
      <FilePick
        name="shops"
        accept=".csv,text/csv"
        label="shops.csv"
        buttonLabel="Choose shops CSV"
        required
      />
      <FilePick
        name="garments"
        accept=".csv,text/csv"
        label="garments.csv"
        buttonLabel="Choose garments CSV"
        required
      />
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className={`${pressableClassName} mt-6 px-5 py-2.5 disabled:opacity-50`}
      >
        Import
      </button>
    </form>
  );
}
