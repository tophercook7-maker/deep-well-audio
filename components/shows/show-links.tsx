import { ExternalLink } from "lucide-react";

type Props = {
  officialUrl?: string | null;
  rssUrl?: string | null;
  youtubeChannelUrl?: string | null;
  appleUrl?: string | null;
  spotifyUrl?: string | null;
};

export function ShowOutboundLinks({
  officialUrl,
  rssUrl,
  youtubeChannelUrl,
  appleUrl,
  spotifyUrl,
}: Props) {
  const links = [
    { href: officialUrl, label: "Official site" },
    { href: rssUrl, label: "RSS feed" },
    { href: youtubeChannelUrl, label: "YouTube channel" },
    { href: appleUrl, label: "Apple Podcasts" },
    { href: spotifyUrl, label: "Spotify" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {links.map(({ href, label }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2 text-sm text-muted transition hover:border-accent/40 hover:text-white"
        >
          {label}
          <ExternalLink className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
