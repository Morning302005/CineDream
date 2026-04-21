import { useEffect, useState } from "react";
import { TMDB_IMG, type ProvidersForRegion } from "@/lib/api";

const REGION_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", IN: "India", CA: "Canada",
  AU: "Australia", DE: "Germany", FR: "France", JP: "Japan", BR: "Brazil",
  ES: "Spain", IT: "Italy", MX: "Mexico", NL: "Netherlands", SE: "Sweden",
};

export function WhereToWatch({ providers }: { providers: Record<string, ProvidersForRegion> }) {
  const available = Object.keys(providers).sort();
  const guess = (typeof navigator !== "undefined" ? navigator.language.split("-")[1]?.toUpperCase() : "") || "US";
  const initial = available.includes(guess) ? guess : (available.includes("US") ? "US" : available[0]);
  const [region, setRegion] = useState<string | undefined>(initial);

  useEffect(() => {
    if (!region && available.length) setRegion(available[0]);
  }, [available, region]);

  if (available.length === 0) {
    return <p className="text-muted-foreground">Streaming info not available for this title.</p>;
  }

  const data = region ? providers[region] : undefined;
  const sections: { label: string; items?: ProvidersForRegion["flatrate"] }[] = data ? [
    { label: "Stream", items: data.flatrate },
    { label: "Free", items: data.free },
    { label: "Free with ads", items: data.ads },
    { label: "Rent", items: data.rent },
    { label: "Buy", items: data.buy },
  ] : [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="text-sm text-muted-foreground">Region:</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="px-3 py-2 rounded-lg bg-card border border-border focus:border-primary focus:outline-none text-sm"
        >
          {available.map((r) => (
            <option key={r} value={r}>{REGION_NAMES[r] || r}</option>
          ))}
        </select>
        {data?.link && (
          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-primary hover:underline"
          >
            View on JustWatch ↗
          </a>
        )}
      </div>

      {data && sections.every((s) => !s.items?.length) && (
        <p className="text-muted-foreground text-sm">No providers listed for this region.</p>
      )}

      <div className="space-y-5">
        {sections.map((s) =>
          s.items && s.items.length > 0 ? (
            <div key={s.label}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{s.label}</p>
              <div className="flex flex-wrap gap-3">
                {s.items.map((p) => (
                  <div
                    key={p.provider_id}
                    title={p.provider_name}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary hover:shadow-[var(--shadow-glow)] transition-all"
                  >
                    <img
                      src={`${TMDB_IMG}/w92${p.logo_path}`}
                      alt={p.provider_name}
                      className="w-8 h-8 rounded-md object-cover"
                    />
                    <span className="text-sm font-medium pr-1">{p.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Streaming data by JustWatch via TMDB.
      </p>
    </div>
  );
}
