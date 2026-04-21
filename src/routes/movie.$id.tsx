import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { movieDetail, posterUrl, searchSoundtrack } from "@/lib/api";
import { CastCard } from "@/components/CastCard";
import { SoundtrackTrack } from "@/components/SoundtrackTrack";
import { WhereToWatch } from "@/components/WhereToWatch";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/movie/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Movie · CineVault` },
      { name: "description", content: `Movie details, cast, trailer & soundtrack on CineVault (id ${params.id}).` },
    ],
  }),
  component: MoviePage,
});

function MoviePage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => movieDetail(id),
  });

  const title = data?.detail.title || "";
  const soundtrack = useQuery({
    queryKey: ["soundtrack", title],
    queryFn: () => searchSoundtrack(title),
    enabled: !!title,
  });

  if (isLoading) {
    return <div className="max-w-7xl mx-auto p-10 text-muted-foreground">Loading…</div>;
  }
  if (isError || !data) {
    return (
      <div className="max-w-7xl mx-auto p-10">
        <p className="text-destructive">Failed to load. Check API keys.</p>
        <Link to="/" className="text-primary underline">← Back home</Link>
      </div>
    );
  }

  const { detail, credits, videos, omdb, providers, recommendations } = data;
  const trailer = videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official)
    || videos.find((v) => v.site === "YouTube" && v.type === "Trailer")
    || videos.find((v) => v.site === "YouTube");

  const director = credits.crew.find((c) => c.job === "Director")?.name || "—";
  const music = credits.crew.find((c) => ["Original Music Composer", "Music"].includes(c.job || ""))?.name || "—";
  const production = detail.production_companies.map((p) => p.name).join(", ") || "—";
  const poster = posterUrl(detail.poster_path, "w500");
  const rt = omdb?.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes")?.Value || "—";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Top: info + poster */}
      <section className="grid lg:grid-cols-[1fr_auto] gap-10">
        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight">{detail.title}</h1>
          <InfoRow label="Rating" value={`★ ${detail.vote_average?.toFixed(1) ?? "—"} / 10`} accent />
          <InfoRow label="Release Year" value={detail.release_date?.slice(0, 4) || "—"} />
          <InfoRow label="Language" value={detail.original_language?.toUpperCase() || "—"} />
          <InfoRow label="Director" value={director} />
          <InfoRow label="Production" value={production} />
          <InfoRow label="Music" value={music} />
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
              <img src={poster} alt={detail.title} className="w-full h-full object-cover" />
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

      {/* Cast */}
      <section className="mt-16">
        <h2 className="font-display text-3xl font-bold mb-5">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {credits.cast.slice(0, 12).map((c) => (
            <CastCard
              key={c.id}
              id={c.id}
              name={c.name}
              character={c.character || ""}
              profile={c.profile_path}
            />
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

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl font-bold mb-5">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {recommendations.slice(0, 12).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
    </main>
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
