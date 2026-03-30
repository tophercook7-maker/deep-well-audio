import Image from "next/image";

/** Canonical raster logo — always `object-contain` + `w-auto` to preserve aspect ratio. */
const LOGO_SRC = "/logo.png";

type Props = {
  className?: string;
  /**
   * Sizing presets (height-driven, responsive; all use `object-contain` + `w-auto`):
   * - `header` — ~64–80px: main nav (h-16 → sm:h-[4.5rem] → md:h-20)
   * - `inline` — ~44–56px: footer, auth, explore card, etc. (h-11 → sm:h-12 → md:h-14)
   * - `compact` — ~36–44px: PWA strip (h-9 → sm:h-10 → md:h-11)
   */
  variant?: "header" | "inline" | "compact";
  priority?: boolean;
};

const VARIANT_CLASSES: Record<NonNullable<Props["variant"]>, string> = {
  header:
    "h-16 w-auto max-w-[min(400px,88vw)] shrink-0 object-contain object-left sm:h-[4.5rem] sm:max-w-[min(440px,48vw)] md:h-20 md:max-w-[min(480px,42vw)]",
  inline:
    "h-11 w-auto max-w-[min(340px,90vw)] shrink-0 object-contain object-left sm:h-12 md:h-14 md:max-w-[380px]",
  compact:
    "h-9 w-auto max-w-[min(280px,78vw)] shrink-0 object-contain object-left sm:h-10 md:h-11 md:max-w-[300px]",
};

/**
 * Primary brand mark (raster). Intrinsic dimensions match `public/logo.png` for sharp Next/Image scaling.
 */
export function DeepWellLogo({ className, variant = "header", priority = false }: Props) {
  const base = VARIANT_CLASSES[variant];
  return (
    <Image
      src={LOGO_SRC}
      alt="Deep Well Audio"
      width={1024}
      height={682}
      className={`${base} ${className ?? ""}`.trim()}
      priority={priority}
      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 440px, 480px"
    />
  );
}
