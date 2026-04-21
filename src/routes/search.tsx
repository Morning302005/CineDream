import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { searchMulti } from "@/lib/api";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: ({ match }) => ({
    meta: [
      { title: `Search: ${match.search.q || ""} — CineVault` },
      { name: "description", content: `Movie & web series search results for ${match.search.q}` },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["multi", q],
    queryFn: () => searchMulti(q),
    enabled: !!q,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <SearchBar initial={q} />
      <h1 className="font-display text-3xl font-bold mt-10 mb-6">
        {q ? <>Results for <span className="text-primary">"{q}"</span></> : "Type something to begin"}
      </h1>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {isError && <p className="text-destructive">Search failed. Check your TMDB API key.</p>}

      {data && data.length === 0 && q && (
        <p className="text-muted-foreground">No movies or web series found.</p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {data.map((m) => <MovieCard key={`${m.media_type}-${m.id}`} movie={m} />)}
        </div>
      )}
    </main>
  );
}
