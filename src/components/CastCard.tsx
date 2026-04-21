import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { personFilmography, posterUrl } from "@/lib/api";

export function CastCard({
  id, name, character, profile,
}: { id: number; name: string; character: string; profile: string | null }) {
  const [open, setOpen] = useState(false);
  const photo = posterUrl(profile, "w185");

  const { data } = useQuery({
    queryKey: ["person", id],
    queryFn: () => personFilmography(id),
    enabled: open,
  });

  return (
    <div
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-muted border border-border group-hover:border-primary group-hover:shadow-[var(--shadow-glow)] transition-all">
        {photo ? (
          <img src={photo} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">no photo</div>
        )}
      </div>
      <div className="mt-2 px-1">
        <p className="text-sm font-semibold line-clamp-1">{name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">as {character || "—"}</p>
      </div>

      {open && (
        <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-72 rounded-xl bg-popover border border-border shadow-[var(--shadow-poster)] p-4 text-popover-foreground pointer-events-none">
          {!data && <p className="text-xs text-muted-foreground">Loading filmography…</p>}
          {data && (
            <>
              <p className="font-display text-lg font-bold">{data.person.name}</p>
              {data.person.birthday && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Born {data.person.birthday}{data.person.place_of_birth ? ` · ${data.person.place_of_birth}` : ""}
                </p>
              )}
              {data.person.biography && (
                <p className="text-xs mt-2 line-clamp-3 text-muted-foreground">{data.person.biography}</p>
              )}
              <p className="text-xs font-semibold mt-3 text-primary">Notable films</p>
              <ul className="mt-1 space-y-0.5 max-h-40 overflow-hidden">
                {data.credits.cast
                  .slice()
                  .sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""))
                  .slice(0, 8)
                  .map((c) => (
                    <li key={c.id} className="text-xs flex justify-between gap-2">
                      <span className="line-clamp-1">{c.title}</span>
                      <span className="text-muted-foreground shrink-0">{(c.release_date || "").slice(0, 4)}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
