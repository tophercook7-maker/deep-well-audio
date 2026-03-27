import Image from "next/image";

/** Canonical raster logo — keep aspect ratio; `object-contain` on dark UI. */
const LOGO_SRC = "/logo.png";

type Props = {
  className?: string;
  /** Header home link: balanced max width and height. */
  variant?: "header" | "inline";
  priority?: boolean;
};

/**
 * Primary brand mark (raster). Intrinsic size matches `public/logo.png` for correct aspect ratio + sharp scaling.
 */
export function DeepWellLogo({ className, variant = "header", priority = false }: Props) {
  const defaultClass =
    variant === "header"
      ? "h-9 w-auto max-w-[min(280px,88vw)] shrink-0 object-contain object-left sm:h-10 sm:max-w-[300px] md:max-w-[320px]"
      : "h-8 w-auto max-w-[220px] shrink-0 object-contain object-left sm:h-9 sm:max-w-[260px]";

  return (
    <Image
      src={LOGO_SRC}
      alt="Deep Well Audio"
      width={1024}
      height={682}
      className={`${defaultClass} ${className ?? ""}`.trim()}
      priority={priority}
      sizes="(max-width: 640px) 88vw, 320px"
    />
  );
}
