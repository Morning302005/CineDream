import { MovieCard } from "./MovieCard";
import type { TmdbMovie } from "@/lib/api";

export function MovieRow({ title, movies }: { title: string; movies: TmdbMovie[] }) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl font-bold mb-6 px-1">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {movies.slice(0, 12).map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}
