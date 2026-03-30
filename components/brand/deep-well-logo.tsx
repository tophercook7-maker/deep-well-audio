import Image from "next/image";

/** Canonical raster logo — always `object-contain` + `w-auto` to preserve aspect ratio. */
const LOGO_SRC = "/logo.png";

type Props = {
  className?: string;
  /** Wraps image + wordmark; applies when `showWordmark` is true. */
  brandClassName?: string;
  /** Merged after built-in wordmark styles (e.g. responsive type scale in the header). */
  wordmarkClassName?: string;
  /**
   * Sizing presets (height-driven, responsive; all use `object-contain` + `w-auto`):
   * - `header` — ~64–80px: main nav (h-16 → sm:h-[4.5rem] → md:h-20)
   * - `inline` — ~44–56px: footer, auth, explore card, etc. (h-11 → sm:h-12 → md:h-14)
   * - `compact` — ~36–44px: PWA strip (h-9 → sm:h-10 → md:h-11)
   */
  variant?: "header" | "inline" | "compact";
  priority?: boolean;
  /** Real “Deep Well Audio” type under the wave (`true` by default). Crops bottom of raster so baked-in type doesn’t duplicate. */
  showWordmark?: boolean;
};

const VARIANT_CLASSES: Record<NonNullable<Props["variant"]>, string> = {
  header:
    "h-[4.25rem] w-auto max-w-[min(400px,88vw)] shrink-0 object-contain object-left sm:h-20 sm:max-w-[min(440px,48vw)] md:h-[5.25rem] md:max-w-[min(520px,46vw)]",
  inline:
    "h-11 w-auto max-w-[min(340px,90vw)] shrink-0 object-contain object-left sm:h-12 md:h-14 md:max-w-[380px]",
  compact:
    "h-9 w-auto max-w-[min(280px,78vw)] shrink-0 object-contain object-left sm:h-10 md:h-11 md:max-w-[300px]",
};

/** Clip bottom of hero PNG (~wordmark band) so only the waveform shows above real HTML type. Tune if artboard changes. */
const RASTER_WORDMARK_CLIP = "[clip-path:inset(0_0_36%_0)]";

/** Shared column width so the wave scales to the same line length as “Deep Well Audio” (header scale). */
const HEADER_WORDMARK_SHELL =
  "inline-flex w-[min(92vw,19.75rem)] flex-col items-center gap-1.5 sm:w-[min(92vw,22rem)] sm:gap-2 md:w-[min(92vw,24.5rem)]";

/** Wave only: fills shell width; taller caps so the hero mark reads clearly above the wordmark. */
const HEADER_WITH_WORDMARK_IMG =
  "block h-auto w-full max-h-16 object-contain object-center sm:max-h-20 md:max-h-[5.35rem]";

/** Inline / footer / auth: slightly narrower shell. */
const INLINE_WORDMARK_SHELL =
  "inline-flex w-[min(92vw,14.5rem)] flex-col items-center gap-1 sm:w-[min(92vw,15.75rem)] md:w-[min(92vw,17.25rem)]";

const INLINE_WITH_WORDMARK_IMG =
  "block h-auto w-full max-h-10 object-contain object-center sm:max-h-11 md:max-h-12";

const COMPACT_WORDMARK_SHELL = "inline-flex max-w-[min(100%,280px)] flex-col items-center gap-1";

const COMPACT_WITH_WORDMARK_IMG =
  "block h-auto w-full max-h-9 object-contain object-center sm:max-h-10";

/**
 * Primary brand mark (raster). Intrinsic dimensions match `public/logo.png` for sharp Next/Image scaling.
 */
export function DeepWellLogo({
  className,
  brandClassName,
  wordmarkClassName,
  variant = "header",
  priority = false,
  showWordmark = true,
}: Props) {
  const clipRaster = showWordmark ? RASTER_WORDMARK_CLIP : "";
  const base = VARIANT_CLASSES[variant];

  /** Full class strings here (not dynamic object lookup) so Tailwind’s scanner always emits utilities. */
  const wordmarkClass =
    variant === "compact"
      ? "block w-full text-center text-sm font-semibold leading-tight tracking-tight text-white sm:text-base"
      : "block w-full whitespace-nowrap text-center text-xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-[2.625rem]";

  if (!showWordmark) {
    return (
      <Image
        src={LOGO_SRC}
        alt="Deep Well Audio"
        width={1024}
        height={682}
        className={`${base} ${className ?? ""}`.trim()}
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 480px, 560px"
      />
    );
  }

  let shellClass: string;
  let imgClass: string;
  if (variant === "header") {
    shellClass = `${HEADER_WORDMARK_SHELL} ${brandClassName ?? ""}`.trim();
    imgClass = `${HEADER_WITH_WORDMARK_IMG} ${clipRaster} ${className ?? ""}`.trim();
  } else if (variant === "inline") {
    shellClass = `${INLINE_WORDMARK_SHELL} ${brandClassName ?? ""}`.trim();
    imgClass = `${INLINE_WITH_WORDMARK_IMG} ${clipRaster} ${className ?? ""}`.trim();
  } else {
    shellClass = `${COMPACT_WORDMARK_SHELL} ${brandClassName ?? ""}`.trim();
    imgClass = `${COMPACT_WITH_WORDMARK_IMG} ${clipRaster} ${className ?? ""}`.trim();
  }

  return (
    <span className={shellClass}>
      <Image
        src={LOGO_SRC}
        alt=""
        width={1024}
        height={682}
        className={imgClass}
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 480px, 560px"
        aria-hidden
      />
      <span className={`${wordmarkClass} ${wordmarkClassName ?? ""}`.trim()}>Deep Well Audio</span>
    </span>
  );
}
