import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { tvDetail, tvSeason, posterUrl, searchSoundtrack, TMDB_IMG } from "@/lib/api";
import { CastCard } from "@/components/CastCard";
import { SoundtrackTrack } from "@/components/SoundtrackTrack";
import { WhereToWatch } from "@/components/WhereToWatch";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/tv/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Web Series · CineVault` },
      { name: "description", content: `Web series details, seasons, episodes, cast and trailer (id ${params.id}).` },
    ],
  }),
  component: TvPage,
});

function TvPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tv", id],
    queryFn: () => tvDetail(id),
  });

  const title = data?.detail.name || "";
  const soundtrack = useQuery({
    queryKey: ["soundtrack", title],
    queryFn: () => searchSoundtrack(title),
    enabled: !!title,
  });

  if (isLoading) return <div className="max-w-7xl mx-auto p-10 text-muted-foreground">Loading…</div>;
  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        <p className="text-destructive">Failed to load.</p>
        <Link to="/" className="text-primary underline">← Back home</Link>
      </div>
    );
  }

  const { detail, credits, videos, providers, omdb } = data;
  const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official)
    || videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
    || videos.find((v) => v.site === "YouTube");

  const creators = detail.created_by.map((c) => c.name).join(", ") || "—";
  const networks = detail.networks.map((n) => n.name).join(", ") || "—";
  const production = detail.production_companies.map((p) => p.name).join(", ") || "—";
  const genres = detail.genres.map((g) => g.name).join(", ") || "—";
  const poster = posterUrl(detail.poster_path, "w500");
  const rt = omdb?.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes")?.Value || "—";
  const realSeasons = detail.seasons.filter((s) => s.season_number > 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <section className="grid lg:grid-cols-[1fr_auto] gap-10">
        <div className="space-y-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-3">
              Web Series
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">{detail.name}</h1>
            {detail.tagline && <p className="text-muted-foreground italic mt-2">"{detail.tagline}"</p>}
          </div>
          <InfoRow label="Rating" value={`★ ${detail.vote_average?.toFixed(1) ?? "—"} / 10`} accent />
          <InfoRow label="First Aired" value={detail.first_air_date?.slice(0, 4) || "—"} />
          <InfoRow label="Status" value={detail.status} />
          <InfoRow label="Seasons" value={String(detail.number_of_seasons)} />
          <InfoRow label="Episodes" value={String(detail.number_of_episodes)} />
          <InfoRow label="Language" value={detail.original_language?.toUpperCase() || "—"} />
          <InfoRow label="Genre" value={genres} />
          <InfoRow label="Created By" value={creators} />
          <InfoRow label="Network" value={networks} />
          <InfoRow label="Production" value={production} />
          <InfoRow label="Rotten Tomatoes" value={rt} />
          <InfoRow label="Awards" value={omdb?.Awards || "—"} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Storyline</p>
            <p className="mt-2 text-base leading-relaxed">{detail.overview || "—"}</p>
          </div>
        </div>

        <div className="lg:w-80 shrink-0 mx-auto lg:mx-0">
          <div className="aspect-[2/3] w-72 sm:w-80 rounded-2xl overflow-hidden bg-muted border border-border shadow-[var(--shadow-poster)]">
            {poster ? (
              <img src={poster} alt={detail.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">no poster found</div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Trailer</h2>
        {trailer ? (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-border bg-black shadow-[var(--shadow-poster)]">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <p className="text-muted-foreground">No trailer available.</p>
        )}
      </section>

      {/* Where to Watch */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Where to Watch</h2>
        <WhereToWatch providers={providers} />
      </section>

      {/* Seasons & Episodes */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Seasons & Episodes</h2>
        <div className="space-y-3">
          {realSeasons.map((s) => (
            <SeasonAccordion key={s.id} tvId={id} season={s} />
          ))}
          {realSeasons.length === 0 && (
            <p className="text-muted-foreground">No season info available.</p>
          )}
        </div>
      </section>

      {/* Cast */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {credits.cast.slice(0, 12).map((c) => (
            <CastCard key={c.id} id={c.id} name={c.name} character={c.character || ""} profile={c.profile_path} />
          ))}
        </div>
      </section>

      {/* Soundtrack */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Soundtrack</h2>
        {soundtrack.isLoading && <p className="text-muted-foreground">Searching iTunes…</p>}
        {soundtrack.data && soundtrack.data.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {soundtrack.data.map((t) => <SoundtrackTrack key={t.trackId} track={t} />)}
          </div>
        ) : soundtrack.data && (
          <p className="text-muted-foreground">No soundtrack found on iTunes.</p>
        )}
      </section>
    </main>
  );
}

function SeasonAccordion({
  tvId,
  season,
}: {
  tvId: string;
  season: { id: number; season_number: number; name: string; overview: string; episode_count: number; air_date: string | null; poster_path: string | null };
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["season", tvId, season.season_number],
    queryFn: () => tvSeason(tvId, season.season_number),
    enabled: open,
  });

  const poster = season.poster_path ? `${TMDB_IMG}/w185${season.poster_path}` : null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary transition-colors"
      >
        {poster ? (
          <img src={poster} alt="" className="w-14 h-20 rounded-md object-cover shrink-0" />
        ) : (
          <div className="w-14 h-20 rounded-md bg-muted shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-bold">{season.name}</p>
          <p className="text-sm text-muted-foreground">
            {season.episode_count} episode{season.episode_count !== 1 ? "s" : ""}
            {season.air_date ? ` · ${season.air_date.slice(0, 4)}` : ""}
          </p>
          {season.overview && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{season.overview}</p>}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-2 bg-background/40">
          {isLoading && <p className="text-sm text-muted-foreground">Loading episodes…</p>}
          {data?.episodes.map((ep) => (
            <div key={ep.id} className="flex gap-3 p-3 rounded-lg hover:bg-secondary/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                {ep.episode_number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-sm">{ep.name}</p>
                  {ep.air_date && (
                    <span className="text-xs text-muted-foreground shrink-0">{ep.air_date}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {ep.overview || "No description available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex gap-3 items-baseline border-b border-border pb-2">
      <span className="text-xs uppercase tracking-wider text-muted-foreground w-36 shrink-0">{label}</span>
      <span className={`text-sm ${accent ? "text-primary font-bold text-base" : ""}`}>{value}</span>
    </div>
  );
}
