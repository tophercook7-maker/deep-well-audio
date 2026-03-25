type Props = {
  src: string;
  title: string;
};

export function SimpleAudioPlayer({ src, title }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-line bg-soft/30 p-3">
      <p className="mb-2 text-xs uppercase tracking-wide text-amber-100/70">Listen in browser</p>
      <audio controls className="h-10 w-full" src={src} preload="metadata" title={title} />
    </div>
  );
}
