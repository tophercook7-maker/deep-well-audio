/** Resolve a canonical YouTube thumbnail URL when `watchUrl` is a YouTube link. */
export function extractYoutubeVideoId(watchUrl: string): string | null {
  try {
    const u = new URL(watchUrl);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com" || u.hostname === "m.youtube.com") {
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      }
      const embed = u.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return null;
  }
  return null;
}

export function curatedTeachingThumbnailUrl(watchUrl: string, override?: string): string | null {
  if (override) return override;
  const id = extractYoutubeVideoId(watchUrl);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
