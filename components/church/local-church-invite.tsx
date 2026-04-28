import { Clock, ExternalLink, MapPin, PlayCircle } from "lucide-react";

const GRACE_CHURCH_YOUTUBE_URL = "https://youtube.com/@gracechurchhotsprings";
const GRACE_CHURCH_WEBSITE_URL = "https://gracechurchhs.com/";
const GRACE_CHURCH_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=307%20H-2%20Carpenter%20Dam%20Road%20Hot%20Springs%20AR%2071901";

const linkClass =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line/75 bg-[rgba(12,16,24,0.45)] px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:border-accent/35 hover:text-white";

export function LocalChurchInvite() {
  return (
    <section className="border-t border-line/40 bg-[rgba(7,10,16,0.34)] py-14 sm:py-16" aria-labelledby="local-church-heading">
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-2xl border border-line/55 bg-[rgba(10,14,20,0.46)] px-5 py-6 shadow-[0_18px_48px_-36px_rgba(212,175,55,0.2)] backdrop-blur-md sm:px-7 sm:py-7">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,55,0.08),transparent_38%)]"
            aria-hidden
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Local church connection</p>
              <h2 id="local-church-heading" className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                A church in Hot Springs
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-400/95 sm:text-base">
                Grace Church is a local church in Hot Springs, Arkansas where the Word is preached clearly and simply. If
                you&apos;re ever in the area, you&apos;re welcome to come worship, hear Scripture taught, and meet people
                who would be glad to welcome you.
              </p>
            </div>

            <div className="rounded-2xl border border-line/45 bg-[rgba(7,10,16,0.38)] px-4 py-4 text-sm leading-relaxed text-slate-300/95 sm:px-5">
              <p className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" aria-hidden />
                <span>Sunday mornings at 9:30 AM</span>
              </p>
              <p className="mt-3 flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" aria-hidden />
                <span>
                  307 H-2 Carpenter Dam Road
                  <br />
                  Hot Springs, AR 71901
                </span>
              </p>
            </div>
          </div>

          <div className="relative mt-7 flex flex-wrap gap-3">
            <a href={GRACE_CHURCH_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <PlayCircle className="h-4 w-4" aria-hidden />
              Watch sermons
            </a>
            <a href={GRACE_CHURCH_WEBSITE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              Visit website
            </a>
            <a href={GRACE_CHURCH_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <MapPin className="h-4 w-4" aria-hidden />
              Get directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
