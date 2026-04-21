import { Link } from "@tanstack/react-router";
import { posterUrl, type TmdbItem, type TmdbMovie } from "@/lib/api";

type CardItem = TmdbItem | (TmdbMovie & { media_type?: "movie" | "tv" });

export function MovieCard({ movie }: { movie: CardItem }) {
  const poster = posterUrl(movie.poster_path, "w342");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const mediaType = (movie as TmdbItem).media_type || "movie";

  const linkProps =
    mediaType === "tv"
      ? ({ to: "/tv/$id", params: { id: String(movie.id) } } as const)
      : ({ to: "/movie/$id", params: { id: String(movie.id) } } as const);

  return (
    <Link {...linkProps} className="group relative block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary border border-border transition-all duration-300 group-hover:scale-[1.04] group-hover:shadow-[var(--shadow-poster)] group-hover:border-primary">
        {poster ? (
          <img src={poster} alt={movie.title} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-3 text-xs text-muted-foreground bg-muted">
            no poster found
          </div>
        )}
        {mediaType === "tv" && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground">
            Series
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-sm font-semibold line-clamp-2">{movie.title}</p>
          <p className="text-white/80 text-xs mt-1">{year}</p>
          {movie.vote_average > 0 && (
            <p className="text-[var(--gold)] text-xs mt-1">★ {movie.vote_average.toFixed(1)}</p>
          )}
        </div>
      </div>
      <div className="mt-2 px-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.title}</p>
        <p className="text-xs text-muted-foreground">{year}{mediaType === "tv" ? " · Series" : ""}</p>
      </div>
    </Link>
  );
}
