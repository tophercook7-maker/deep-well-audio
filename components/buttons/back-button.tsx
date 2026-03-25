"use client";

import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

type Props = {
  fallbackHref: string;
  label?: string;
  className?: string;
};

export function BackButton({ fallbackHref, label = "Back", className }: Props) {
  const router = useRouter();

  const base =
    "inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-sm font-medium text-amber-200 transition hover:text-white";

  return (
    <button
      type="button"
      className={className ? `${base} ${className}` : base}
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref as Route);
        }
      }}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
