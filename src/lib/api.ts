import { OMDB_API_KEY, TMDB_API_KEY } from "@/config/apiKeys";

const TMDB = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p";
export const POSTER_FALLBACK = "NO_POSTER";

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

async function tget<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
  const res = await fetch(`${TMDB}${path}?${qs}`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  if (!query.trim()) return [];
  const data = await tget<{ results: TmdbMovie[] }>("/search/movie", { query, include_adult: "false" });
  return data.results;
}

// Unified item with media_type for mixed search results
export interface TmdbItem {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

interface MultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
}

export async function searchMulti(query: string): Promise<TmdbItem[]> {
  if (!query.trim()) return [];
  const data = await tget<{ results: MultiResult[] }>("/search/multi", { query, include_adult: "false" });
  return data.results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => ({
      id: r.id,
      media_type: r.media_type as "movie" | "tv",
      title: (r.title || r.name) ?? "Untitled",
      poster_path: r.poster_path,
      release_date: (r.release_date || r.first_air_date) ?? "",
      vote_average: r.vote_average ?? 0,
      overview: r.overview ?? "",
    }));
}

export async function upcomingMovies(): Promise<TmdbMovie[]> {
  const data = await tget<{ results: TmdbMovie[] }>("/movie/upcoming");
  return data.results;
}

export async function topRatedMovies(): Promise<TmdbMovie[]> {
  const data = await tget<{ results: TmdbMovie[] }>("/movie/top_rated");
  return data.results;
}

export async function nowPlayingMovies(): Promise<TmdbMovie[]> {
  const data = await tget<{ results: TmdbMovie[] }>("/movie/now_playing");
  return data.results;
}

export interface Genre { id: number; name: string }
export async function movieGenres(): Promise<Genre[]> {
  const data = await tget<{ genres: Genre[] }>("/genre/movie/list");
  return data.genres;
}

export async function discoverByGenre(genreId: number): Promise<TmdbMovie[]> {
  const data = await tget<{ results: TmdbMovie[] }>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
    include_adult: "false",
  });
  return data.results;
}

// Anime = Animation (16) + originating from Japan
export async function discoverAnime(): Promise<TmdbMovie[]> {
  const data = await tget<{ results: TmdbMovie[] }>("/discover/movie", {
    with_genres: "16",
    with_original_language: "ja",
    sort_by: "popularity.desc",
    include_adult: "false",
  });
  return data.results;
}

export interface MovieDetail {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  original_language: string;
  overview: string;
  vote_average: number;
  production_companies: { name: string }[];
  imdb_id: string | null;
}

export interface CreditPerson {
  id: number;
  name: string;
  job?: string;
  character?: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CreditPerson[];
  crew: CreditPerson[];
}

export interface VideoItem {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

export interface ProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}
export interface ProvidersForRegion {
  link?: string;
  flatrate?: ProviderItem[];
  rent?: ProviderItem[];
  buy?: ProviderItem[];
  free?: ProviderItem[];
  ads?: ProviderItem[];
}
export interface WatchProviders {
  results: Record<string, ProvidersForRegion>;
}

export async function movieDetail(id: string) {
  const [detail, credits, videos, providers, recommendations, similar] = await Promise.all([
    tget<MovieDetail>(`/movie/${id}`),
    tget<Credits>(`/movie/${id}/credits`),
    tget<{ results: VideoItem[] }>(`/movie/${id}/videos`),
    tget<WatchProviders>(`/movie/${id}/watch/providers`),
    tget<{ results: TmdbMovie[] }>(`/movie/${id}/recommendations`),
    tget<{ results: TmdbMovie[] }>(`/movie/${id}/similar`),
  ]);
  let omdb: any = null;
  if (detail.imdb_id) {
    try {
      const r = await fetch(`https://www.omdbapi.com/?i=${detail.imdb_id}&apikey=${OMDB_API_KEY}`);
      if (r.ok) omdb = await r.json();
    } catch {}
  }
  // Merge: recommendations first, fill with similar (dedup by id, exclude self)
  const seen = new Set<number>([Number(id)]);
  const combined: TmdbMovie[] = [];
  for (const m of [...recommendations.results, ...similar.results]) {
    if (!seen.has(m.id)) { seen.add(m.id); combined.push(m); }
  }
  return { detail, credits, videos: videos.results, omdb, providers: providers.results, recommendations: combined };
}

export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
}
export interface PersonCredits {
  cast: { id: number; title: string; character: string; release_date: string; poster_path: string | null }[];
}

export async function personFilmography(id: number) {
  const [person, credits] = await Promise.all([
    tget<PersonDetail>(`/person/${id}`),
    tget<PersonCredits>(`/person/${id}/movie_credits`),
  ]);
  return { person, credits };
}

export interface ITrack {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
}
export async function searchSoundtrack(movieTitle: string): Promise<ITrack[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(movieTitle + " soundtrack")}&media=music&limit=12`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const d = await r.json();
  return (d.results || []).filter((t: ITrack) => t.previewUrl);
}

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "original" = "w342") {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

// ============= TV / Web Series =============
export interface TvSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}
export interface TvDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  last_air_date: string | null;
  original_language: string;
  number_of_seasons: number;
  number_of_episodes: number;
  vote_average: number;
  status: string;
  tagline: string;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  production_companies: { name: string }[];
  created_by: { id: number; name: string }[];
  external_ids?: { imdb_id: string | null };
  seasons: TvSeasonSummary[];
}
export interface TvEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  runtime: number | null;
}
export interface TvSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episodes: TvEpisode[];
}

export async function tvDetail(id: string) {
  const [detail, credits, videos, providers] = await Promise.all([
    tget<TvDetail>(`/tv/${id}`, { append_to_response: "external_ids" }),
    tget<Credits>(`/tv/${id}/credits`),
    tget<{ results: VideoItem[] }>(`/tv/${id}/videos`),
    tget<WatchProviders>(`/tv/${id}/watch/providers`),
  ]);
  let omdb: any = null;
  const imdbId = detail.external_ids?.imdb_id;
  if (imdbId) {
    try {
      const r = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
      if (r.ok) omdb = await r.json();
    } catch {}
  }
  return { detail, credits, videos: videos.results, providers: providers.results, omdb };
}

export async function tvSeason(tvId: string, seasonNumber: number): Promise<TvSeasonDetail> {
  return tget<TvSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
}
