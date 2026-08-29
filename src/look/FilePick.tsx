"use client";

import { useState } from "react";
import { pressableClassName } from "@/ui/pressable";

type FilePickProps = {
  name: string;
  accept: string;
  label: string;
  buttonLabel: string;
  required?: boolean;
};

export function FilePick({
  name,
  accept,
  label,
  buttonLabel,
  required,
}: FilePickProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="mt-5">
      <p className="text-sm font-medium text-zinc-200">{label}</p>
      <label className={`${pressableClassName} mt-2 inline-flex items-center px-4 py-2.5`}>
        <input
          required={required}
          className="sr-only"
          type="file"
          name={name}
          accept={accept}
          aria-label={label}
          onChange={(event) => {
            setFileName(event.target.files?.[0]?.name ?? null);
          }}
        />
        {fileName ?? buttonLabel}
      </label>
    </div>
  );
}
