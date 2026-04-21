import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MovieRow } from "@/components/MovieRow";
import { MovieCard } from "@/components/MovieCard";
import {
  upcomingMovies, topRatedMovies, nowPlayingMovies,
  movieGenres, discoverByGenre, discoverAnime,
} from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineVault — Discover Movies" },
      { name: "description", content: "Search, explore now playing, upcoming, top-rated movies and filter by genre." },
    ],
  }),
  component: Index,
});

function Index() {
  const nowPlaying = useQuery({ queryKey: ["nowPlaying"], queryFn: nowPlayingMovies });
  const upcoming = useQuery({ queryKey: ["upcoming"], queryFn: upcomingMovies });
  const top = useQuery({ queryKey: ["topRated"], queryFn: topRatedMovies });
  const genres = useQuery({ queryKey: ["genres"], queryFn: movieGenres });

  type Selection = number | "anime" | null;
  const [selection, setSelection] = useState<Selection>(null);
  const byGenre = useQuery({
    queryKey: ["selection", selection],
    queryFn: () =>
      selection === "anime" ? discoverAnime() : discoverByGenre(selection as number),
    enabled: selection !== null,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <section className="pt-16 pb-10 text-center">
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">
          Every story. <span className="text-primary">One vault.</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Search movies, explore casts, watch trailers, hear the soundtrack.
        </p>
        <div className="mt-10">
          <SearchBar />
        </div>
      </section>

      {/* Genre filter chips */}
      {genres.data && (
        <section className="mt-6">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <button
              onClick={() => setSelection(null)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                selection === null
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelection("anime")}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                selection === "anime"
                  ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                  : "bg-card border-border hover:border-primary"
              }`}
            >
              Anime
            </button>
            {genres.data.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelection(g.id)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                  selection === g.id
                    ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]"
                    : "bg-card border-border hover:border-primary"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filtered view */}
      {selection !== null ? (
        <section className="mt-12">
          <h2 className="font-display text-3xl font-bold mb-6">
            {selection === "anime"
              ? "Anime"
              : genres.data?.find((g) => g.id === selection)?.name}{" "}
            Movies
          </h2>
          {byGenre.isLoading ? (
            <SkeletonGrid />
          ) : byGenre.data && byGenre.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {byGenre.data.slice(0, 18).map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          ) : (
            <p className="text-muted-foreground">No movies found.</p>
          )}
        </section>
      ) : (
        <>
          {nowPlaying.isLoading ? <SkeletonRow title="Now Playing" /> :
            nowPlaying.data && <MovieRow title="Now Playing" movies={nowPlaying.data} />}

          {upcoming.isLoading ? <SkeletonRow title="Upcoming Movies" /> :
            upcoming.data && <MovieRow title="Upcoming Movies" movies={upcoming.data} />}

          {top.isLoading ? <SkeletonRow title="Top Rated" /> :
            top.data && <MovieRow title="Top Rated" movies={top.data} />}
        </>
      )}

      {(upcoming.isError || top.isError || nowPlaying.isError) && (
        <p className="mt-10 text-center text-destructive">
          Failed to load movies. Check your TMDB API key in <code className="px-1 bg-muted rounded">src/config/apiKeys.ts</code>.
        </p>
      )}
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonRow({ title }: { title: string }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl font-bold mb-6">{title}</h2>
      <SkeletonGrid />
    </section>
  );
}
